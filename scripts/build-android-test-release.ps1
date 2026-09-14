[CmdletBinding()]
param()

Set-StrictMode -Version Latest
$ErrorActionPreference = 'Stop'
Add-Type -AssemblyName System.Security

$projectRoot = Split-Path -Parent $PSScriptRoot
$signingDirectory = Join-Path $env:LOCALAPPDATA 'MyDiaper\signing'
$secretPath = Join-Path $signingDirectory 'password.dpapi'
$metadataPath = Join-Path $signingDirectory 'metadata.json'

if (-not (Test-Path -LiteralPath $secretPath) -or -not (Test-Path -LiteralPath $metadataPath)) {
    throw 'Die Release-Signierung fehlt. Zuerst npm run android:signing:init ausführen.'
}

$metadata = Get-Content -LiteralPath $metadataPath -Raw | ConvertFrom-Json
if (-not (Test-Path -LiteralPath $metadata.keyStorePath)) {
    throw "Der konfigurierte Release-Schlüssel fehlt: $($metadata.keyStorePath)"
}

$encryptedPassword = (Get-Content -LiteralPath $secretPath -Raw).Trim()
$protectedPassword = [Convert]::FromBase64String($encryptedPassword)
$passwordBytes = [System.Security.Cryptography.ProtectedData]::Unprotect(
    $protectedPassword,
    $null,
    [System.Security.Cryptography.DataProtectionScope]::CurrentUser
)
$plainPassword = [System.Text.Encoding]::UTF8.GetString($passwordBytes)

$javaHome = $env:JAVA_HOME
if (-not $javaHome) {
    $javaHome = [Environment]::GetEnvironmentVariable('JAVA_HOME', 'User')
}
if ($javaHome) {
    $env:JAVA_HOME = $javaHome
}
$androidHome = $env:ANDROID_HOME
if (-not $androidHome) {
    $androidHome = [Environment]::GetEnvironmentVariable('ANDROID_HOME', 'User')
}
if ($androidHome) {
    $env:ANDROID_HOME = $androidHome
    $env:ANDROID_SDK_ROOT = $androidHome
}

$env:MYDIAPER_KEYSTORE_FILE = [string]$metadata.keyStorePath
$env:MYDIAPER_KEYSTORE_PASSWORD = $plainPassword
$env:MYDIAPER_KEY_ALIAS = [string]$metadata.keyAlias
$env:MYDIAPER_KEY_PASSWORD = $plainPassword

try {
    Push-Location $projectRoot
    try {
        & npm.cmd run build:web
        if ($LASTEXITCODE -ne 0) { throw 'Web-Build fehlgeschlagen.' }
        & npx.cmd cap sync android
        if ($LASTEXITCODE -ne 0) { throw 'Capacitor-Android-Sync fehlgeschlagen.' }

        Push-Location (Join-Path $projectRoot 'android')
        try {
            & .\gradlew.bat --no-daemon assembleRelease
            if ($LASTEXITCODE -ne 0) { throw 'Android-Release-Build fehlgeschlagen.' }
        } finally {
            Pop-Location
        }

        $sourceApk = Join-Path $projectRoot 'android\app\build\outputs\apk\release\app-release.apk'
        if (-not (Test-Path -LiteralPath $sourceApk)) {
            throw "Release-APK wurde nicht gefunden: $sourceApk"
        }

        $package = Get-Content -LiteralPath (Join-Path $projectRoot 'package.json') -Raw | ConvertFrom-Json
        $safeVersion = (([string]$package.version) -replace '-test$', '') -replace '[^0-9A-Za-z._-]', '-'
        $artifactDirectory = Join-Path $projectRoot 'artifacts\android'
        New-Item -ItemType Directory -Path $artifactDirectory -Force | Out-Null
        $destinationApk = Join-Path $artifactDirectory "MyDiaper-Testversion-$safeVersion.apk"
        Copy-Item -LiteralPath $sourceApk -Destination $destinationApk -Force

        if (-not $androidHome) {
            throw 'ANDROID_HOME ist nicht gesetzt; die APK-Signatur kann nicht abschließend geprüft werden.'
        }
        $apksigner = Get-ChildItem -LiteralPath (Join-Path $androidHome 'build-tools') -Filter 'apksigner.bat' -Recurse -File |
            Sort-Object { [version]$_.Directory.Name } -Descending | Select-Object -First 1
        if (-not $apksigner) { throw 'apksigner.bat wurde im Android SDK nicht gefunden.' }
        & $apksigner.FullName verify --verbose --print-certs $destinationApk
        if ($LASTEXITCODE -ne 0) { throw 'Die Signaturprüfung der Release-APK ist fehlgeschlagen.' }

        $sha256 = [System.Security.Cryptography.SHA256]::Create()
        try {
            $apkStream = [System.IO.File]::OpenRead($destinationApk)
            try {
                $checksum = ([BitConverter]::ToString($sha256.ComputeHash($apkStream)) -replace '-', '').ToLowerInvariant()
            } finally {
                $apkStream.Dispose()
            }
        } finally {
            $sha256.Dispose()
        }
        $checksumPath = "$destinationApk.sha256"
        [System.IO.File]::WriteAllText($checksumPath, "$checksum *$(Split-Path -Leaf $destinationApk)`r`n")

        Write-Host "Gehärtete MyDiaper-Test-APK erstellt: $destinationApk"
        Write-Host "SHA-256-Prüfsumme: $checksum"
    } finally {
        Pop-Location
    }
} finally {
    Remove-Item Env:MYDIAPER_KEYSTORE_FILE -ErrorAction SilentlyContinue
    Remove-Item Env:MYDIAPER_KEYSTORE_PASSWORD -ErrorAction SilentlyContinue
    Remove-Item Env:MYDIAPER_KEY_ALIAS -ErrorAction SilentlyContinue
    Remove-Item Env:MYDIAPER_KEY_PASSWORD -ErrorAction SilentlyContinue
    [Array]::Clear($passwordBytes, 0, $passwordBytes.Length)
    $encryptedPassword = $null
    $plainPassword = $null
}
