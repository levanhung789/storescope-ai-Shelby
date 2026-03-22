#!/usr/bin/env node

/**
 * Script để kiểm tra transaction hash từ Aptos chain
 * 
 * Usage:
 * node scripts/check-transaction.js <transaction_hash>
 */

const { AptosClient } = require("aptos");

// Cấu hình
const NODE_URL = process.env.APTOS_NODE_URL || "https://fullnode.devnet.aptoslabs.com";
const client = new AptosClient(NODE_URL);

async function checkTransaction(txHash) {
  try {
    console.log(`Kiểm tra transaction: ${txHash}`);
    
    // Lấy thông tin transaction
    const transaction = await client.getTransactionByHash(txHash);
    
    console.log("Thông tin transaction:");
    console.log("- Status:", transaction.success ? "Thành công" : "Thất bại");
    console.log("- Gas used:", transaction.gas_used);
    console.log("- Version:", transaction.version);
    console.log("- Thời gian:", new Date(parseInt(transaction.timestamp) / 1000).toLocaleString());
    
    if (transaction.success) {
      console.log("- Transaction đã xác nhận trên chain");
    } else {
      console.log("- Lỗi:", transaction.vm_status);
    }
    
    // Hiển thị liên kết explorer
    console.log(`\nXem chi tiết trên Aptos Explorer: https://explorer.aptoslabs.com/txn/${txHash}?network=testnet`);
    
  } catch (error) {
    console.error("Lỗi khi kiểm tra transaction:", error.message);
    
    if (error.status === 404) {
      console.log("Transaction không tồn tại hoặc chưa được xác nhận.");
    }
  }
}

// Chạy script
if (require.main === module) {
  const args = process.argv.slice(2);
  
  if (args.length === 0) {
    console.log("Sử dụng: node scripts/check-transaction.js <transaction_hash>");
    console.log("Ví dụ: node scripts/check-transaction.js 0x1234567890abcdef...");
    process.exit(1);
  }
  
  const txHash = args[0];
  checkTransaction(txHash);
}

module.exports = { checkTransaction };