#!/usr/bin/env node

/**
 * Script test để ghi blob lên Aptos chain sử dụng hợp đồng ShelbyBlobStore
 * 
 * Hướng dẫn sử dụng:
 * 1. Đảm bảo đã cài đặt Aptos CLI
 * 2. Đảm bảo contract đã được deploy
 * 3. Chạy script: node scripts/test-blob-upload.js
 */

const { AptosClient, AptosAccount, FaucetClient, TxnBuilderTypes, BCS } = require("aptos");

// Cấu hình
const NODE_URL = process.env.APTOS_NODE_URL || "https://fullnode.devnet.aptoslabs.com";
const FAUCET_URL = process.env.APTOS_FAUCET_URL || "https://faucet.devnet.aptoslabs.com";

// Địa chỉ contract (sẽ được cập nhật sau khi deploy)
const CONTRACT_ADDRESS = process.env.CONTRACT_ADDRESS || "0x1"; // Thay bằng địa chỉ thực tế

async function main() {
  // Tạo client
  const client = new AptosClient(NODE_URL);
  const faucetClient = new FaucetClient(NODE_URL, FAUCET_URL);
  
  // Tạo tài khoản test
  const account = new AptosAccount();
  console.log("Tài khoản test:", account.address());
  
  // Cấp tiền cho tài khoản test
  try {
    await faucetClient.fundAccount(account.address(), 100_000_000);
    console.log("Đã cấp 100_000_000 Octas cho tài khoản test");
  } catch (error) {
    console.error("Lỗi khi cấp tiền:", error);
    return;
  }
  
  // Kiểm tra số dư
  try {
    const balance = await client.getAccountBalance(account.address());
    console.log("Số dư tài khoản:", balance);
  } catch (error) {
    console.error("Lỗi khi kiểm tra số dư:", error);
    return;
  }
  
  // Kiểm tra nếu contract đã được deploy
  try {
    const resources = await client.getAccountResources(account.address());
    console.log("Tài nguyên tài khoản:", resources.length);
  } catch (error) {
    console.error("Lỗi khi kiểm tra tài nguyên:", error);
    // Không trả về vì đây có thể là lỗi do contract chưa được deploy
  }
  
  // Tạo dữ liệu blob test
  const blobData = {
    blob_id: "test-blob-" + Date.now(),
    asset_id: "asset-" + Date.now(),
    data: "Đây là dữ liệu test cho blob", // Trong thực tế sẽ là bytes
    mime_type: "text/plain"
  };
  
  console.log("Dữ liệu blob test:", blobData);
  
  // Ghi blob lên chain (cần contract đã được deploy)
  try {
    // Payload cho transaction
    const payload = {
      type: "entry_function_payload",
      function: `${CONTRACT_ADDRESS}::blob_store::upload_blob`,
      type_arguments: [],
      arguments: [
        blobData.blob_id,
        blobData.asset_id,
        Array.from(new TextEncoder().encode(blobData.data)), // Chuyển chuỗi thành bytes
        blobData.mime_type
      ]
    };
    
    // Tạo transaction
    const transaction = await client.generateTransaction(account.address(), payload);
    
    // Ký transaction
    const signedTxn = await client.signTransaction(account, transaction);
    
    // Submit transaction
    const transactionRes = await client.submitTransaction(signedTxn);
    
    // Chờ transaction được xác nhận
    await client.waitForTransaction(transactionRes.hash);
    
    console.log("Blob đã được upload thành công!");
    console.log("Transaction hash:", transactionRes.hash);
    
    // Hiển thị liên kết để xem trên explorer
    console.log(`Xem trên Aptos Explorer: https://explorer.aptoslabs.com/txn/${transactionRes.hash}?network=testnet`);
    
    // Hiển thị liên kết để xem trên Shelby explorer
    console.log(`Xem trên Shelby Explorer: https://explorer.shelby.xyz/testnet/account/${account.address()}`);
    
  } catch (error) {
    console.error("Lỗi khi upload blob:", error.message);
    console.log("Lưu ý: Đảm bảo contract đã được deploy trước khi chạy script này.");
  }
}

// Chạy script
if (require.main === module) {
  main().catch(console.error);
}

module.exports = { main };