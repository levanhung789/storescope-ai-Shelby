const fs = require('fs');
let text = fs.readFileSync('app/dashboard/_components/ShelbyUploader.tsx', 'utf8');

const successOld = `<div className="pl-7 text-emerald-700/80 font-normal">
            Phi ?a tr?: <strong>0.5 shelbyUSD</strong><br/>
            Ma l?u tr?: <span className="font-mono bg-emerald-100 px-1 rounded">{assetId}</span><br/>
            Ma giao d?ch (Tx):{" "}
            <a 
              href={\`https://explorer.aptoslabs.com/txn/\${txHash}?network=testnet\`} 
              target="_blank" 
              rel="noopener noreferrer" 
              className="font-mono text-cyan-600 hover:text-cyan-800 underline"
            >
              {txHash ? \`\${txHash.slice(0, 10)}...\${txHash.slice(-8)}\` : "Khong xac ??nh"}
            </a>
          </div>`;

const successNew = `<div className="pl-7 text-emerald-700/80 font-normal">
            Phi ?a tr?: <strong>0.5 shelbyUSD</strong><br/>
            Ma l?u tr?: <span className="font-mono bg-emerald-100 px-1 rounded">{assetId}</span><br/>
            Giao d?ch m?ng (Aptos):{" "}
            <a 
              href={\`https://explorer.aptoslabs.com/txn/\${txHash}?network=testnet\`} 
              target="_blank" 
              rel="noopener noreferrer" 
              className="font-mono text-cyan-600 hover:text-cyan-800 underline"
            >
              {txHash ? \`\${txHash.slice(0, 10)}...\${txHash.slice(-8)}\` : "Khong xac ??nh"}
            </a>
            <br/>
            L?u tr? tren Shelby:{" "}
            <a 
              href={\`https://explorer.shelby.xyz/testnet/account/\${account?.address}\`} 
              target="_blank" 
              rel="noopener noreferrer" 
              className="font-mono text-cyan-600 hover:text-cyan-800 underline"
            >
              Xem t?p tren Shelby Explorer
            </a>
          </div>`;

text = text.replace(successOld, successNew);

fs.writeFileSync('app/dashboard/_components/ShelbyUploader.tsx', text);
console.log('UI updated with Shelby Explorer');
