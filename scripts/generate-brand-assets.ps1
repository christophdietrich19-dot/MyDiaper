param(
  [string]$ProjectRoot = (Split-Path -Parent $PSScriptRoot)
)

$ErrorActionPreference = 'Stop'
Add-Type -AssemblyName System.Drawing

$elephantPath = Join-Path $ProjectRoot 'assets\images\elephant.png'
if (-not (Test-Path -LiteralPath $elephantPath)) {
  throw "Elefantenmotiv fehlt: $elephantPath"
}

$elephant = [System.Drawing.Image]::FromFile($elephantPath)
$quality = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic

function Save-Bitmap([System.Drawing.Bitmap]$bitmap, [string]$path) {
  $directory = Split-Path -Parent $path
  [System.IO.Directory]::CreateDirectory($directory) | Out-Null
  $temporaryPath = Join-Path ([System.IO.Path]::GetTempPath()) "$([System.Guid]::NewGuid().ToString('N')).png"
  $bitmap.Save($temporaryPath, [System.Drawing.Imaging.ImageFormat]::Png)
  $bitmap.Dispose()
  [System.IO.File]::Copy($temporaryPath, $path, $true)
  [System.IO.File]::Delete($temporaryPath)
}

function Add-Gradient([System.Drawing.Graphics]$graphics, [int]$width, [int]$height) {
  $rect = [System.Drawing.Rectangle]::new(0, 0, $width, $height)
  $brush = [System.Drawing.Drawing2D.LinearGradientBrush]::new(
    $rect,
    [System.Drawing.ColorTranslator]::FromHtml('#EFFBF7'),
    [System.Drawing.ColorTranslator]::FromHtml('#DCEEFF'),
    42
  )
  $graphics.FillRectangle($brush, $rect)
  $brush.Dispose()
}

function New-AppIcon([int]$size, [string]$path, [switch]$ForegroundOnly) {
  $bitmap = [System.Drawing.Bitmap]::new($size, $size, [System.Drawing.Imaging.PixelFormat]::Format32bppArgb)
  $graphics = [System.Drawing.Graphics]::FromImage($bitmap)
  $graphics.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::HighQuality
  $graphics.InterpolationMode = $quality
  $graphics.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::HighQuality
  $graphics.Clear([System.Drawing.Color]::Transparent)

  if (-not $ForegroundOnly) {
    Add-Gradient $graphics $size $size
    $halo = [System.Drawing.SolidBrush]::new([System.Drawing.Color]::FromArgb(205, 255, 255, 255))
    $margin = [int]($size * 0.075)
    $graphics.FillEllipse($halo, $margin, $margin, $size - (2 * $margin), $size - (2 * $margin))
    $halo.Dispose()
    $artSize = [int]($size * 0.76)
  } else {
    $artSize = [int]($size * 0.69)
  }

  $artX = [int](($size - $artSize) / 2)
  $artY = [int](($size - $artSize) / 2 + ($size * 0.015))
  $graphics.DrawImage($elephant, $artX, $artY, $artSize, $artSize)
  $graphics.Dispose()
  Save-Bitmap $bitmap $path
}

function New-Splash([int]$width, [int]$height, [string]$path) {
  $bitmap = [System.Drawing.Bitmap]::new($width, $height, [System.Drawing.Imaging.PixelFormat]::Format32bppArgb)
  $graphics = [System.Drawing.Graphics]::FromImage($bitmap)
  $graphics.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::HighQuality
  $graphics.InterpolationMode = $quality
  $graphics.TextRenderingHint = [System.Drawing.Text.TextRenderingHint]::AntiAliasGridFit
  Add-Gradient $graphics $width $height

  $short = [Math]::Min($width, $height)
  $artSize = [int]($short * 0.36)
  $artX = [int](($width - $artSize) / 2)
  $artY = [int](($height - $artSize) / 2 - ($short * 0.09))
  $graphics.DrawImage($elephant, $artX, $artY, $artSize, $artSize)

  $fontSize = [Math]::Max(18, [int]($short * 0.07))
  $font = [System.Drawing.Font]::new('Segoe UI', $fontSize, [System.Drawing.FontStyle]::Bold, [System.Drawing.GraphicsUnit]::Pixel)
  $myBrush = [System.Drawing.SolidBrush]::new([System.Drawing.ColorTranslator]::FromHtml('#2F5F9F'))
  $diaperBrush = [System.Drawing.SolidBrush]::new([System.Drawing.ColorTranslator]::FromHtml('#37B7A6'))
  $mySize = $graphics.MeasureString('My', $font)
  $diaperSize = $graphics.MeasureString('Diaper', $font)
  $totalWidth = $mySize.Width + $diaperSize.Width - ($fontSize * 0.08)
  $textX = [single](($width - $totalWidth) / 2)
  $textY = [single]($artY + $artSize + ($short * 0.015))
  $graphics.DrawString('My', $font, $myBrush, $textX, $textY)
  $graphics.DrawString('Diaper', $font, $diaperBrush, $textX + $mySize.Width - ($fontSize * 0.08), $textY)

  $font.Dispose()
  $myBrush.Dispose()
  $diaperBrush.Dispose()
  $graphics.Dispose()
  Save-Bitmap $bitmap $path
}

New-AppIcon 192 (Join-Path $ProjectRoot 'assets\icons\icon-192.png')
New-AppIcon 512 (Join-Path $ProjectRoot 'assets\icons\icon-512.png')
New-AppIcon 1024 (Join-Path $ProjectRoot 'ios\App\App\Assets.xcassets\AppIcon.appiconset\AppIcon-512@2x.png')

$androidIcons = @(
  @{ Density = 'mdpi'; Icon = 48; Foreground = 108 },
  @{ Density = 'hdpi'; Icon = 72; Foreground = 162 },
  @{ Density = 'xhdpi'; Icon = 96; Foreground = 216 },
  @{ Density = 'xxhdpi'; Icon = 144; Foreground = 324 },
  @{ Density = 'xxxhdpi'; Icon = 192; Foreground = 432 }
)
foreach ($item in $androidIcons) {
  $folder = Join-Path $ProjectRoot "android\app\src\main\res\mipmap-$($item.Density)"
  New-AppIcon $item.Icon (Join-Path $folder 'ic_launcher.png')
  New-AppIcon $item.Icon (Join-Path $folder 'ic_launcher_round.png')
  New-AppIcon $item.Foreground (Join-Path $folder 'ic_launcher_foreground.png') -ForegroundOnly
}

$androidSplashes = @(
  @{ Path = 'drawable\splash.png'; Width = 480; Height = 320 },
  @{ Path = 'drawable-land-mdpi\splash.png'; Width = 480; Height = 320 },
  @{ Path = 'drawable-land-hdpi\splash.png'; Width = 800; Height = 480 },
  @{ Path = 'drawable-land-xhdpi\splash.png'; Width = 1280; Height = 720 },
  @{ Path = 'drawable-land-xxhdpi\splash.png'; Width = 1600; Height = 960 },
  @{ Path = 'drawable-land-xxxhdpi\splash.png'; Width = 1920; Height = 1280 },
  @{ Path = 'drawable-port-mdpi\splash.png'; Width = 320; Height = 480 },
  @{ Path = 'drawable-port-hdpi\splash.png'; Width = 480; Height = 800 },
  @{ Path = 'drawable-port-xhdpi\splash.png'; Width = 720; Height = 1280 },
  @{ Path = 'drawable-port-xxhdpi\splash.png'; Width = 960; Height = 1600 },
  @{ Path = 'drawable-port-xxxhdpi\splash.png'; Width = 1280; Height = 1920 }
)
foreach ($item in $androidSplashes) {
  New-Splash $item.Width $item.Height (Join-Path $ProjectRoot "android\app\src\main\res\$($item.Path)")
}

$iosSplashFolder = Join-Path $ProjectRoot 'ios\App\App\Assets.xcassets\Splash.imageset'
foreach ($name in @('splash-2732x2732.png', 'splash-2732x2732-1.png', 'splash-2732x2732-2.png')) {
  New-Splash 2732 2732 (Join-Path $iosSplashFolder $name)
}

$elephant.Dispose()
Write-Output 'MyDiaper Marken-Icons und Splashscreens wurden erzeugt.'
