$dirs = @('src\components', 'src\config', 'src\app\pricing')
$root = 'C:\Users\USER\pax26\pax26'
foreach ($dir in $dirs) {
  $full = Join-Path $root $dir
  Get-ChildItem -Recurse -Include *.jsx,*.js -Path $full | ForEach-Object {
    $content = Get-Content $_.FullName -Raw -Encoding UTF8
    $updated = $content -creplace 'AI Agent', 'Smart Agent' -creplace 'AI agent', 'Smart Agent'
    if ($updated -ne $content) {
      Set-Content -Path $_.FullName -Value $updated -Encoding UTF8 -NoNewline
      Write-Host "Updated: $($_.Name)"
    }
  }
}
Write-Host "Done."
