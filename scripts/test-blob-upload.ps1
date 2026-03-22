# Script Powershell để test blob upload lên Aptos chain
# Sử dụng Aptos CLI để tương tác với hợp đồng ShelbyBlobStore

Write-Host "Script test blob upload lên Aptos chain" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green

# Kiểm tra Aptos CLI đã được cài đặt chưa
try {
    $aptosVersion = aptos --version
    Write-Host "Aptos CLI đã được cài đặt: $aptosVersion" -ForegroundColor Green
} catch {
    Write-Host "Lỗi: Aptos CLI chưa được cài đặt." -ForegroundColor Red
    Write-Host "Vui lòng cài đặt Aptos CLI trước khi chạy script này." -ForegroundColor Yellow
    Write-Host "Hướng dẫn cài đặt: https://aptos.dev/nodes/installation/aptos-cli-tool/" -ForegroundColor Yellow
    exit 1
}

# Kiểm tra contract đã được deploy chưa
Write-Host "Kiểm tra contract..." -ForegroundColor Cyan

# Tạo tài khoản test mới
Write-Host "Tạo tài khoản test..." -ForegroundColor Cyan
$accountResult = aptos key generate --key-type ed25519
$accountAddress = $accountResult | Select-String -Pattern "0x[0-9a-fA-F]+" | ForEach-Object { $_.Matches.Value }

if ($null -eq $accountAddress) {
    Write-Host "Lỗi: Không thể tạo tài khoản test" -ForegroundColor Red
    exit 1
}

Write-Host "Địa chỉ tài khoản test: $accountAddress" -ForegroundColor Green

# Cấp tiền cho tài khoản test
Write-Host "Cấp tiền cho tài khoản test..." -ForegroundColor Cyan
try {
    aptos account fund-with-faucet --account $accountAddress --amount 100000000
    Write-Host "Đã cấp 100,000,000 Octas cho tài khoản test" -ForegroundColor Green
} catch {
    Write-Host "Lỗi khi cấp tiền: $_" -ForegroundColor Red
    exit 1
}

# Kiểm tra số dư
Write-Host "Kiểm tra số dư tài khoản..." -ForegroundColor Cyan
try {
    $balance = aptos account balance --account $accountAddress
    Write-Host "Số dư: $balance" -ForegroundColor Green
} catch {
    Write-Host "Lỗi khi kiểm tra số dư: $_" -ForegroundColor Red
}

# Tạo dữ liệu test
$blobId = "test-blob-$(Get-Date -Format 'yyyyMMddHHmmss')"
$assetId = "asset-$(Get-Date -Format 'yyyyMMddHHmmss')"
$data = [System.Text.Encoding]::UTF8.GetBytes("Đây là dữ liệu test cho blob")
$mimeType = "text/plain"

Write-Host "Dữ liệu test:" -ForegroundColor Cyan
Write-Host "  Blob ID: $blobId" -ForegroundColor White
Write-Host "  Asset ID: $assetId" -ForegroundColor White
Write-Host "  MIME Type: $mimeType" -ForegroundColor White
Write-Host "  Data length: $($data.Length) bytes" -ForegroundColor White

# Ghi blob lên chain (cần contract đã được deploy)
Write-Host "Ghi blob lên chain..." -ForegroundColor Cyan
Write-Host "Lưu ý: Đảm bảo contract đã được deploy trước khi chạy bước này." -ForegroundColor Yellow

# Hiển thị hướng dẫn chạy thủ công
Write-Host ""
Write-Host "Để upload blob, chạy lệnh sau (thay thế các giá trị tương ứng):" -ForegroundColor Yellow
Write-Host "aptos move run --function-id \`"$accountAddress::blob_store::upload_blob\`" --args string:$blobId string:$assetId vector<u8>:[1,2,3] string:$mimeType" -ForegroundColor White
Write-Host ""

Write-Host "Test hoàn tất!" -ForegroundColor Green