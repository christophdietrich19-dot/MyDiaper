[CmdletBinding()]
param()

Set-StrictMode -Version Latest
$ErrorActionPreference = 'Stop'
Add-Type -AssemblyName System.Security

if (-not $env:LOCALAPPDATA) {
    throw 'LOCALAPPDATA ist nicht verfügbar. Die Signierung kann nicht sicher eingerichtet werden.'
}

$signingDirectory = Join-Path $env:LOCALAPPDATA 'MyDiaper\signing'
$keystorePath = Join-Path $signingDirectory 'mydiaper-release.jks'
$secretPath = Join-Path $signingDirectory 'password.dpapi'
$metadataPath = Join-Path $signingDirectory 'metadata.json'
$keyAlias = 'mydiaper-release'

$existing = @(@($keystorePath, $secretPath, $metadataPath) | Where-Object { Test-Path -LiteralPath $_ })
if ($existing.Count -eq 3) {
    Write-Host "MyDiaper-Signierung ist bereits eingerichtet: $keystorePath"
    exit 0
}
if ($existing.Count -gt 0) {
    throw "Unvollständige Signierung unter $signingDirectory. Nichts wurde überschrieben."
}

$javaHome = $env:JAVA_HOME
if (-not $javaHome) {
    $javaHome = [Environment]::GetEnvironmentVariable('JAVA_HOME', 'User')
}
$keytoolPath = if ($javaHome) { Join-Path $javaHome 'bin\keytool.exe' } else { $null }
if (-not $keytoolPath -or -not (Test-Path -LiteralPath $keytoolPath)) {
    $keytoolCommand = Get-Command keytool.exe -ErrorAction SilentlyContinue
    if (-not $keytoolCommand) {
        throw 'keytool.exe wurde nicht gefunden. Bitte zuerst JDK 21 konfigurieren.'
    }
    $keytoolPath = $keytoolCommand.Source
}

New-Item -ItemType Directory -Path $signingDirectory -Force | Out-Null
$randomBytes = New-Object byte[] 48
$random = [System.Security.Cryptography.RandomNumberGenerator]::Create()
try {
    $random.GetBytes($randomBytes)
} finally {
    $random.Dispose()
}
$password = [Convert]::ToBase64String($randomBytes).TrimEnd('=')
$passwordBytes = [System.Text.Encoding]::UTF8.GetBytes($password)
$protectedPassword = [System.Security.Cryptography.ProtectedData]::Protect(
    $passwordBytes,
    $null,
    [System.Security.Cryptography.DataProtectionScope]::CurrentUser
)
[System.IO.File]::WriteAllText($secretPath, [Convert]::ToBase64String($protectedPassword))

$env:MYDIAPER_KEYSTORE_PASSWORD = $password
$env:MYDIAPER_KEY_PASSWORD = $password
try {
    & $keytoolPath -genkeypair -keystore $keystorePath -storetype JKS `
        -storepass:env MYDIAPER_KEYSTORE_PASSWORD -keypass:env MYDIAPER_KEY_PASSWORD `
        -alias $keyAlias -keyalg RSA -keysize 4096 -validity 10000 `
        -dname 'CN=MyDiaper Release, O=MyDiaper, C=DE'
    if ($LASTEXITCODE -ne 0) {
        throw "keytool wurde mit Code $LASTEXITCODE beendet."
    }
} finally {
    Remove-Item Env:MYDIAPER_KEYSTORE_PASSWORD -ErrorAction SilentlyContinue
    Remove-Item Env:MYDIAPER_KEY_PASSWORD -ErrorAction SilentlyContinue
    [Array]::Clear($passwordBytes, 0, $passwordBytes.Length)
    $password = $null
}

@{
    keyStorePath = $keystorePath
    keyAlias = $keyAlias
    createdAt = (Get-Date).ToUniversalTime().ToString('o')
    certificate = 'CN=MyDiaper Release, O=MyDiaper, C=DE'
} | ConvertTo-Json | Set-Content -LiteralPath $metadataPath -Encoding UTF8

Write-Host "MyDiaper-Release-Schlüssel wurde außerhalb des Projekts erstellt: $keystorePath"
Write-Host 'Das Kennwort liegt Windows-benutzergebunden verschlüsselt daneben. Beide Dateien sichern und niemals in Git einchecken.'
