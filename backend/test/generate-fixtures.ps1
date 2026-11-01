Add-Type -AssemblyName System.Drawing
[Console]::OutputEncoding = [System.Text.Encoding]::UTF8

$dir = Join-Path $PSScriptRoot "fixtures"
if (-not (Test-Path $dir)) {
    New-Item -ItemType Directory -Path $dir | Out-Null
}

function Create-TextImage($text, $filename, $fontName = "Nirmala UI", $fontSize = 32) {
    $bmp = New-Object System.Drawing.Bitmap 700, 140
    $g = [System.Drawing.Graphics]::FromImage($bmp)
    $g.Clear([System.Drawing.Color]::White)
    $g.TextRenderingHint = [System.Drawing.Text.TextRenderingHint]::AntiAliasGridFit
    
    $font = New-Object System.Drawing.Font($fontName, [float]$fontSize, [System.Drawing.FontStyle]::Bold)
    $brush = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::Black)
    $point = New-Object System.Drawing.PointF(30.0, 35.0)
    
    $g.DrawString($text, $font, $brush, $point)
    
    $dest = Join-Path $dir $filename
    $bmp.Save($dest, [System.Drawing.Imaging.ImageFormat]::Png)
    
    $brush.Dispose()
    $font.Dispose()
    $g.Dispose()
    $bmp.Dispose()
    Write-Host "Created: $dest"
}

# 1. Clear Kannada printed text
Create-TextImage "ಕನ್ನಡ ಸಾಹಿತ್ಯ ಸಮ್ಮೇಳನ" "clear_kannada.png"

# 2. English text
Create-TextImage "Karnataka Heritage 2026" "english_text.png" "Arial"

# 3. Blank image (no text)
$blankBmp = New-Object System.Drawing.Bitmap 400, 150
$blankG = [System.Drawing.Graphics]::FromImage($blankBmp)
$blankG.Clear([System.Drawing.Color]::White)
$blankDest = Join-Path $dir "blank_image.png"
$blankBmp.Save($blankDest, [System.Drawing.Imaging.ImageFormat]::Png)
$blankG.Dispose()
$blankBmp.Dispose()
Write-Host "Created: $blankDest"
