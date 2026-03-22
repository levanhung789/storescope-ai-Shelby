const fs = require('fs');
let text = fs.readFileSync('C:/Users/Admin/.openclaw/workspace/storescope-ai-Shelby/app/dashboard/_components/ShelbyUploader.tsx', 'utf8');

const successOld = `<div className="pl-7 text-emerald-700/80 font-normal">
            Phí giao dịch: <strong>0.5 shelbyUSD</strong><br/>
            Mã lưu trữ: <span className="font-mono bg-emerald-100 px-1 rounded">{assetId}</span><br/>
            Mã giao dịch (Tx):{" "}
            <a 
              href={\`https://explorer.aptoslabs.com/txn/\${txHash}?network=shelbynet\`} 
              target="_blank" 
              rel="noopener noreferrer" 
              className="font-mono text-cyan-600 hover:text-cyan-800 underline"
            >
              {txHash ? \`\${txHash.slice(0, 10)}...\${txHash.slice(-8)}\` : "Không xác định"}
            </a>
          </div>`;

const successNew = `<div className="pl-7 text-emerald-700/80 font-normal">
            Phí giao dịch: <strong>0.5 shelbyUSD</strong><br/>
            Mã lưu trữ: <span className="font-mono bg-emerald-100 px-1 rounded">{assetId}</span><br/>
            Giao dịch mạng (Aptos):{" "}
            <a 
              href={\`https://explorer.aptoslabs.com/txn/\${txHash}?network=shelbynet\`} 
              target="_blank" 
              rel="noopener noreferrer" 
              className="font-mono text-cyan-600 hover:text-cyan-800 underline"
            >
              {txHash ? \`\${txHash.slice(0, 10)}...\${txHash.slice(-8)}\` : "Không xác định"}
            </a>
            <br/>
            Lưu trữ trên Shelby:{" "}
            <a 
              href={\`https://explorer.shelby.xyz/testnet/account/\${account?.address}\`} 
              target="_blank" 
              rel="noopener noreferrer" 
              className="font-mono text-cyan-600 hover:text-cyan-800 underline"
            >
              Xem tập tin trên Shelby Explorer
            </a>
          </div>`;

text = text.replace(successOld, successNew);

fs.writeFileSync('C:/Users/Admin/.openclaw/workspace/storescope-ai-Shelby/app/dashboard/_components/ShelbyUploader.tsx', text);
console.log('UI updated with Shelby Explorer');
