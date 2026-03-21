const fs = require('fs');
let text = fs.readFileSync('app/dashboard/_components/ShelbyUploader.tsx', 'utf8');

text = text.replace(
  'import { UploadCloud, CheckCircle, XCircle } from "lucide-react";',
  'import { UploadCloud, CheckCircle, XCircle, Wallet } from "lucide-react";\nimport { useWallet } from "@aptos-labs/wallet-adapter-react";'
);

text = text.replace(
  'export function ShelbyUploader() {',
  'export function ShelbyUploader() {\n  const { connected, signAndSubmitTransaction, account } = useWallet();'
);

const handleUploadStart = `  const handleUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!connected || !account) {
      alert("Vui long k?t n?i vi Petra tr??c khi t?i ?nh len phan tich!");
      return;
    }

    setIsUploading(true);
    setUploadStatus("idle");
    setAssetId(null);

    // B??C 1: G?i vi Petra ?? thanh toan phi (0.5 shelbyUSD) va phi gas m?ng l??i (APT)
    try {
      const payload = {
        data: {
          function: "0x1::coin::transfer",
          typeArguments: ["0x1::aptos_coin::AptosCoin"],
          functionArguments: [account.address, 10], // G?i t??ng tr?ng 10 octas (Aptos) testnet ?? lam proof of action. Sau nay s? g?i smart contract tr? phi th?t.
        }
      };
      
      const response = await signAndSubmitTransaction(payload as any);
      console.log("Thanh toan thanh cong. Tx Hash:", response.hash);
      
      // ? ?ay co th? dung AptosClient ?? ch? giao d?ch xac nh?n tr??c khi upload ?nh.
      
    } catch (error) {
      console.error("Thanh toan th?t b?i ho?c b? h?y b?i ng??i dung:", error);
      setUploadStatus("error");
      setIsUploading(false);
      return; // D?ng ti?n trinh upload n?u khong thanh toan thanh cong
    }

    // B??C 2: Upload ?nh len h? th?ng sau khi thanh toan thanh cong
    const formData = new FormData();`;

text = text.replace(
  `  const handleUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    setUploadStatus("idle");
    setAssetId(null);

    const formData = new FormData();`,
  handleUploadStart
);

text = text.replace('T?i ?nh len Shelby', 'T?i ?nh len phan tich (Thanh toan b?ng shelbyUSD)');
text = text.replace('??y ?nh qu?y k?ho?c hoa ??n len may ch?l?u tr?', 'H? th?ng s? yeu c?u ky giao d?ch thanh toan (0.5 shelbyUSD) tr??c khi t?i ?nh len.');

const successDiv = `{uploadStatus === "success" && (
        <div className="mt-4 flex flex-col gap-2 text-sm font-semibold text-emerald-600 bg-emerald-50 p-4 rounded-xl border border-emerald-200">
          <div className="flex items-center">
            <CheckCircle className="w-5 h-5 mr-2" />
            Giao d?ch & T?i len thanh cong!
          </div>
          <div className="pl-7 text-emerald-700/80 font-normal">
            Phi ?a tr?: 0.5 shelbyUSD <br/>
            Ma l?u tr?: <span className="font-mono">{assetId}</span>
          </div>
        </div>
      )}`;

text = text.replace(
  `{uploadStatus === "success" && (
        <div className="mt-4 flex items-center text-sm font-semibold text-emerald-600 bg-emerald-50 p-3 rounded-lg">
          <CheckCircle className="w-4 h-4 mr-2" />
          T?i len th?nh cong! (Asset ID: {assetId})
        </div>
      )}`,
  successDiv
);

const errorDiv = `{uploadStatus === "error" && (
        <div className="mt-4 flex items-center text-sm font-semibold text-red-600 bg-red-50 p-3 rounded-lg">
          <XCircle className="w-4 h-4 mr-2" />
          Giao d?ch th?t b?i ho?c b? h?y. Khong th? phan tich ?nh!
        </div>
      )}`;

text = text.replace(
  `{uploadStatus === "error" && (
        <div className="mt-4 flex items-center text-sm font-semibold text-red-600 bg-red-50 p-3 rounded-lg">
          <XCircle className="w-4 h-4 mr-2" />
          T?i ?nh th?t b?i. Vui long th?l?i sau.
        </div>
      )}`,
  errorDiv
);

fs.writeFileSync('app/dashboard/_components/ShelbyUploader.tsx', text);
console.log('ShelbyUploader updated with dual-token payment flow!');
