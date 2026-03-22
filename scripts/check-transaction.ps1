# Script PowerShell để kiểm tra transaction hash trên Aptos chain

param(
    [Parameter(Mandatory=$false)]
    [string]$TransactionHash
)

Write-Host "Script kiểm tra transaction hash trên Aptos chain" -ForegroundColor Green
Write-Host "================================================" -ForegroundColor Green

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

# Nếu không có transaction hash được cung cấp, yêu cầu người dùng nhập
if (-not $TransactionHash) {
    Write-Host "Vui lòng nhập transaction hash để kiểm tra:" -ForegroundColor Cyan
    $TransactionHash = Read-Host "Transaction hash"
}

# Kiểm tra transaction hash hợp lệ
if (-not $TransactionHash.StartsWith("0x")) {
    Write-Host "Lỗi: Transaction hash phải bắt đầu bằng '0x'" -ForegroundColor Red
    exit 1
}

Write-Host "Đang kiểm tra transaction: $TransactionHash" -ForegroundColor Cyan

try {
    # Kiểm tra transaction
    $result = aptos node show-transaction --hash $TransactionHash 2>$null
    $jsonResult = $result | ConvertFrom-Json
    
    Write-Host "Thông tin transaction:" -ForegroundColor Green
    Write-Host "- Hash: $TransactionHash" -ForegroundColor White
    Write-Host "- Trạng thái: $(if ($jsonResult.success) { 'Thành công' } else { 'Thất bại' })" -ForegroundColor White
    Write-Host "- Gas sử dụng: $($jsonResult.gas_used)" -ForegroundColor White
    Write-Host "- Version: $($jsonResult.version)" -ForegroundColor White
    
    # Hiển thị thời gian nếu có
    if ($jsonResult.timestamp) {
        $timestamp = [DateTimeOffset]::FromUnixTimeSeconds($jsonResult.timestamp / 1000000).DateTime
        Write-Host "- Thời gian: $timestamp" -ForegroundColor White
    }
    
    # Hiển thị lỗi nếu có
    if (-not $jsonResult.success) {
        Write-Host "- Lỗi: $($jsonResult.vm_status)" -ForegroundColor Yellow
    }
    
    Write-Host ""
    Write-Host "Xem chi tiết trên Aptos Explorer: https://explorer.aptos.dev/txn/$TransactionHash" -ForegroundColor Cyan
    
} catch {
    Write-Host "Lỗi khi kiểm tra transaction: $($_.Exception.Message)" -ForegroundColor Red
    
    # Kiểm tra nếu là lỗi 404
    if ($_ -match "404") {
        Write-Host "Transaction không tồn tại hoặc chưa được xác nhận." -ForegroundColor Yellow
    }
}

Write-Host ""
Write-Host "Kiểm tra hoàn tất!" -ForegroundColor Green