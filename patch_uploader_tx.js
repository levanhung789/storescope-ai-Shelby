const fs = require('fs');
let text = fs.readFileSync('C:/Users/Admin/.openclaw/workspace/storescope-ai-Shelby/app/dashboard/_components/ShelbyUploader.tsx', 'utf8');

// 1. Add txHash state
text = text.replace(
  'const [assetId, setAssetId] = useState<string | null>(null);',
  'const [assetId, setAssetId] = useState<string | null>(null);\n  const [txHash, setTxHash] = useState<string | null>(null);'
);

// 2. Reset txHash state
text = text.replace(
  'setAssetId(null);',
  'setAssetId(null);\n    setTxHash(null);'
);

// 3. Set txHash state after transaction
text = text.replace(
  'console.log("Thanh toan thanh cong. Tx Hash:", response.hash);',
  'console.log("Thanh toan thanh cong. Tx Hash:", response.hash);\n      setTxHash(response.hash);'
);

// 4. Add txHash to the success UI
const successDivOld = `<div className="pl-7 text-emerald-700/80 font-normal">
            Phi ?a tr?: 0.5 shelbyUSD <br/>
            Ma l?u tr?: <span className="font-mono">{assetId}</span>
          </div>`;

const successDivNew = `<div className="pl-7 text-emerald-700/80 font-normal">
            Phi ?a tr?: 0.5 shelbyUSD <br/>
            Ma l?u tr?: <span className="font-mono">{assetId}</span><br/>
            Ma giao d?ch: <a href={\`https://explorer.aptoslabs.com/txn/\${txHash}?network=shelbynet\`} target="_blank" rel="noopener noreferrer" className="font-mono text-cyan-600 hover:underline hover:text-cyan-800">
              {txHash ? \`\${txHash.slice(0, 8)}...\${txHash.slice(-6)}\` : ""}
            </a>
          </div>`;

text = text.replace(successDivOld, successDivNew);

fs.writeFileSync('C:/Users/Admin/.openclaw/workspace/storescope-ai-Shelby/app/dashboard/_components/ShelbyUploader.tsx', text);
console.log('ShelbyUploader updated with Tx Hash!');
