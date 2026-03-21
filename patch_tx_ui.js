const fs = require('fs');
let text = fs.readFileSync('app/dashboard/_components/ShelbyUploader.tsx', 'utf8');

text = text.replace('T?i ?nh len Shelby', 'T?i ?nh len h? th?ng (0.5 shelbyUSD)');
text = text.replace('??y ?nh qu?y k?ho?c hoa ??n len may ch?l?u tr?', 'Ky giao d?ch qua vi Petra ?? thanh toan phi phan tich AI b?ng shelbyUSD.');

const successOld = `{uploadStatus === "success" && (
        <div className="mt-4 flex items-center text-sm font-semibold text-emerald-600 bg-emerald-50 p-3 rounded-lg">
          <CheckCircle className="w-4 h-4 mr-2" />
          T?i len th?nh cong! (Asset ID: {assetId})
        </div>
      )}`;

const successNew = `{uploadStatus === "success" && (
        <div className="mt-4 flex flex-col gap-2 text-sm font-semibold text-emerald-600 bg-emerald-50 p-4 rounded-xl border border-emerald-200">
          <div className="flex items-center">
            <CheckCircle className="w-5 h-5 mr-2" />
            Thanh toan & T?i ?nh thanh cong!
          </div>
          <div className="pl-7 text-emerald-700/80 font-normal">
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
          </div>
        </div>
      )}`;

text = text.replace(successOld, successNew);

const errorOld = `{uploadStatus === "error" && (
        <div className="mt-4 flex items-center text-sm font-semibold text-red-600 bg-red-50 p-3 rounded-lg">
          <XCircle className="w-4 h-4 mr-2" />
          T?i ?nh th?t b?i. Vui long th?l?i sau.
        </div>
      )}`;

const errorNew = `{uploadStatus === "error" && (
        <div className="mt-4 flex items-center text-sm font-semibold text-red-600 bg-red-50 p-3 rounded-xl border border-red-200">
          <XCircle className="w-5 h-5 mr-2" />
          Giao d?ch th?t b?i ho?c b? h?y. Khong th? t?i ?nh.
        </div>
      )}`;

text = text.replace(errorOld, errorNew);

fs.writeFileSync('app/dashboard/_components/ShelbyUploader.tsx', text);
console.log('UI updated with txHash');
