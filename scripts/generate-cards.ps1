$ErrorActionPreference = 'Stop'
Add-Type -AssemblyName System.Drawing
$projectRoot = Split-Path $PSScriptRoot -Parent
$profiles = Get-Content -LiteralPath (Join-Path $projectRoot 'src/content/personality-types.json') -Raw -Encoding UTF8 | ConvertFrom-Json
$outputDirectory = Join-Path $projectRoot 'public/results'
New-Item -ItemType Directory -Path $outputDirectory -Force | Out-Null
function New-Brush([string]$hex) { return [System.Drawing.SolidBrush]::new([System.Drawing.ColorTranslator]::FromHtml($hex)) }
function Draw-Text($graphics, [string]$text, [float]$size, [float]$x, [float]$y, [float]$width, [float]$height, [string]$color, [bool]$bold = $false) {
  $style = [System.Drawing.FontStyle]::Regular
  if ($bold) { $style = [System.Drawing.FontStyle]::Bold }
  $font = [System.Drawing.Font]::new('Malgun Gothic', $size, $style, [System.Drawing.GraphicsUnit]::Pixel)
  $brush = New-Brush $color
  $graphics.DrawString($text, $font, $brush, [System.Drawing.RectangleF]::new($x, $y, $width, $height))
  $font.Dispose()
  $brush.Dispose()
}
foreach ($profile in $profiles) {
  $bitmap = [System.Drawing.Bitmap]::new(1080,1350)
  $graphics = [System.Drawing.Graphics]::FromImage($bitmap)
  $graphics.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias
  $graphics.TextRenderingHint = [System.Drawing.Text.TextRenderingHint]::AntiAliasGridFit
  $graphics.Clear([System.Drawing.ColorTranslator]::FromHtml('#2455ed'))
  Draw-Text $graphics '나를 발견하는 열두 가지 질문' 29 80 73 850 60 '#D6E2FF'
  Draw-Text $graphics '결.' 53 883 61 130 90 '#FFFFFF' $true
  Draw-Text $graphics $profile.type 215 65 210 1000 300 '#FFFFFF' $true
  Draw-Text $graphics $profile.name 55 80 530 920 110 '#FFFFFF' $true
  Draw-Text $graphics $profile.summary 34 80 660 900 145 '#E4ECFF'
  $panel = New-Brush '#1D47CD'
  $graphics.FillRectangle($panel,80,860,920,250)
  $panel.Dispose()
  Draw-Text $graphics '나의 강점' 25 115 885 800 45 '#C7D6FF'
  $offset = 940
  foreach ($strength in $profile.strengths) {
    Draw-Text $graphics ('+  ' + $strength) 31 115 $offset 820 52 '#FFFFFF'
    $offset += 52
  }
  $pen = [System.Drawing.Pen]::new([System.Drawing.ColorTranslator]::FromHtml('#6B8BF4'),1)
  $graphics.DrawLine($pen,80,1180,1000,1180)
  $pen.Dispose()
  Draw-Text $graphics '16가지 모습, 모두 다른 매력.' 30 80 1210 900 60 '#FFFFFF'
  Draw-Text $graphics '12문항 간이 성향 검사 · 공식 MBTI 검사가 아닙니다.' 22 80 1280 920 50 '#D6E2FF'
  $bitmap.Save((Join-Path $outputDirectory ($profile.type + '.png')), [System.Drawing.Imaging.ImageFormat]::Png)
  $graphics.Dispose()
  $bitmap.Dispose()
}
Write-Output '16개 결과 카드 생성 완료'
