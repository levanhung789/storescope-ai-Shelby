# PowerShell script to test direct image upload to ShelbyNet

Write-Host "Creating test image..." -ForegroundColor Green

# Create a simple test image (1x1 pixel PNG as base64)
$testImageBase64 = "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8/5+hHgAHggJ/PchI7wAAAABJRU5ErkJggg=="
$testImagePath = "scripts/test-image.png"

# Convert base64 to bytes and write to file
$imageBytes = [Convert]::FromBase64String($testImageBase64)
[System.IO.File]::WriteAllBytes($testImagePath, $imageBytes)

Write-Host "Test image created at: $testImagePath" -ForegroundColor Blue
Write-Host "To test direct upload, run:" -ForegroundColor Yellow
Write-Host "npm run move:upload-images:win" -ForegroundColor Cyan

# Clean up test image after 10 seconds
Start-Sleep -Seconds 10
if (Test-Path $testImagePath) {
    Remove-Item $testImagePath
    Write-Host "Test image cleaned up." -ForegroundColor Green
}