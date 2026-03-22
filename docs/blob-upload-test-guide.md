# Hướng dẫn Test Blob Upload

Hướng dẫn chi tiết cách test chức năng upload blob lên Aptos chain sử dụng hợp đồng ShelbyBlobStore.

## Yêu cầu

1. Đã cài đặt Aptos CLI
2. Đã deploy hợp đồng ShelbyBlobStore lên mạng (devnet/testnet)
3. Có tài khoản với số dư đủ để thanh toán gas fees

## Cách sử dụng

### 1. Sử dụng script Node.js

```bash
# Test blob upload
npm run move:test-blob

# Kiểm tra transaction
npm run move:check-tx <transaction_hash>
```

Script `move:test-blob` sẽ:
- Tạo tài khoản test mới
- Cấp tiền cho tài khoản từ faucet
- Upload một blob test lên chain

Script `move:check-tx` sẽ:
- Kiểm tra thông tin của một transaction hash cụ thể
- Hiển thị trạng thái, gas sử dụng và thời gian

### 2. Sử dụng script PowerShell (Windows)

```bash
# Test blob upload
npm run move:test-blob:win

# Kiểm tra transaction
npm run move:check-tx:win
```

Script `move:test-blob:win` sẽ:
- Kiểm tra Aptos CLI đã được cài đặt
- Tạo tài khoản test
- Cấp tiền cho tài khoản
- Hiển thị hướng dẫn chạy lệnh upload blob thủ công

Script `move:check-tx:win` sẽ:
- Yêu cầu nhập transaction hash
- Kiểm tra thông tin transaction từ chain
- Hiển thị kết quả chi tiết

## Các bước test

### Bước 1: Compile và deploy contract

```bash
# Linux/Mac
npm run move:deploy

# Windows
npm run move:deploy:win
```

### Bước 2: Test blob upload

```bash
# Sử dụng Node.js script
npm run move:test-blob

# Sử dụng PowerShell script (Windows)
npm run move:test-blob:win
```

### Bước 3: Kiểm tra kết quả

Sau khi upload blob thành công, bạn sẽ nhận được một transaction hash. Bạn có thể:

1. Kiểm tra transaction trên Aptos Explorer: `https://explorer.aptos.dev/txn/<transaction_hash>`
2. Query dữ liệu blob đã upload bằng Aptos CLI hoặc SDK

## Cấu trúc dữ liệu blob

Mỗi blob bao gồm:
- `blob_id`: ID duy nhất của blob (chuỗi)
- `asset_id`: ID của asset (chuỗi)
- `data`: Dữ liệu blob (vector<u8>)
- `mime_type`: Loại MIME của dữ liệu (chuỗi)

## Xử lý lỗi

### Lỗi "Account does not exist"

Nguyên nhân: Tài khoản chưa được tạo hoặc chưa có số dư.

Giải pháp:
1. Đảm bảo đã cấp tiền cho tài khoản từ faucet
2. Kiểm tra lại địa chỉ tài khoản

### Lỗi "Move abort"

Nguyên nhân: Lỗi khi thực thi hợp đồng Move, có thể do:
- Blob với blob_id đã tồn tại
- Dữ liệu không đúng định dạng

Giải pháp:
- Sử dụng blob_id khác
- Kiểm tra lại định dạng dữ liệu

## Kiểm tra dữ liệu blob

Sau khi upload blob, bạn có thể kiểm tra bằng cách query trực tiếp từ chain:

```bash
aptos move view --function-id "<contract_address>::blob_store::get_blob" --args "string:<blob_id>"
```

Hoặc kiểm tra số lượng blob đã upload:

```bash
aptos move view --function-id "<contract_address>::blob_store::get_total_blobs"
```