"use client";

import { useState, useRef } from "react";
import { UploadCloud, CheckCircle, XCircle, Wallet } from "lucide-react";
import { useWallet } from "@aptos-labs/wallet-adapter-react"; // Import from Lucide

export function ShelbyUploader() {
  const { connected, signAndSubmitTransaction, account } = useWallet();
  const [isUploading, setIsUploading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState<"idle" | "success" | "error">("idle");
  const [assetId, setAssetId] = useState<string | null>(null);
  const [txHash, setTxHash] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!connected || !account) {
      alert("Vui long k?t n?i vi Petra tr??c khi t?i ?nh len phan tich!");
      return;
    }

    setIsUploading(true);
    setUploadStatus("idle");
    setAssetId(null);
    setTxHash(null);

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
      setTxHash(response.hash);
      
      // ? ?ay co th? dung AptosClient ?? ch? giao d?ch xac nh?n tr??c khi upload ?nh.
      
    } catch (error) {
      console.error("Thanh toan th?t b?i ho?c b? h?y b?i ng??i dung:", error);
      setUploadStatus("error");
      setIsUploading(false);
      return; // D?ng ti?n trinh upload n?u khong thanh toan thanh cong
    }

    // B??C 2: Upload ?nh len h? th?ng sau khi thanh toan thanh cong
    const formData = new FormData();
    formData.append("file", file);
    formData.append("metadata", JSON.stringify({ source: "dashboard", uploader: "admin" }));

    try {
      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      if (res.ok) {
        setUploadStatus("success");
        setAssetId(data.data.id);
      } else {
        throw new Error(data.error || "Upload failed");
      }
    } catch (error) {
      console.error(error);
      setUploadStatus("error");
    } finally {
      setIsUploading(false);
      // Optional: Clear the input after processing
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  return (
    <div className="w-full rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200 mt-6">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-lg font-bold text-slate-900">Tải ảnh lên Shelby</h2>
          <p className="text-sm text-slate-500">Đẩy ảnh quầy kệ hoặc hóa đơn lên máy chủ lưu trữ.</p>
        </div>
      </div>

      <div className="relative flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-slate-300 bg-slate-50 p-6 hover:bg-slate-100 transition-colors">
        <input
          type="file"
          accept="image/*"
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          onChange={handleUpload}
          disabled={isUploading}
          ref={fileInputRef}
        />
        
        <div className="flex flex-col items-center text-slate-500">
          <UploadCloud className={`w-8 h-8 mb-2 ${isUploading ? 'animate-bounce text-cyan-500' : 'text-slate-400'}`} />
          <p className="text-sm font-semibold">{isUploading ? "Đang tải lên..." : "Kéo thả file ảnh hoặc nhấp để chọn"}</p>
        </div>
      </div>

      {uploadStatus === "success" && (
        <div className="mt-4 flex flex-col text-sm font-semibold text-emerald-600 bg-emerald-50 p-3 rounded-lg">
          <div className="flex items-center">
            <CheckCircle className="w-4 h-4 mr-2" />
            Tải lên thành công! (Asset ID: {assetId})
          </div>
          {txHash && (
            <div className="mt-2 text-xs">
              <span className="font-medium">Transaction Hash:</span>
              <div className="font-mono text-emerald-800 truncate">{txHash}</div>
              <a 
                href={`https://explorer.aptos.dev/txn/${txHash}`} 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-emerald-700 hover:text-emerald-900 underline mt-1 inline-block"
              >
                View on Aptos Explorer
              </a>
            </div>
          )}
        </div>
      )}

      {uploadStatus === "error" && (
        <div className="mt-4 flex items-center text-sm font-semibold text-red-600 bg-red-50 p-3 rounded-lg">
          <XCircle className="w-4 h-4 mr-2" />
          Tải ảnh thất bại. Vui lòng thử lại sau.
        </div>
      )}
    </div>
  );
}
