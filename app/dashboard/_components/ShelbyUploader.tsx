"use client";

import { useState, useRef } from "react";
import { UploadCloud, CheckCircle, XCircle, Wallet } from "lucide-react";
import { useWallet } from "@aptos-labs/wallet-adapter-react";

export function ShelbyUploader() {
  const { connected, signAndSubmitTransaction, account } = useWallet();
  const [isUploading, setIsUploading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState<"idle" | "success" | "error">("idle");
  const [assetId, setAssetId] = useState<string | null>(null);
  const [txHash, setTxHash] = useState<string | null>(null);
  const [originalFileName, setOriginalFileName] = useState<string | null>(null); // State to store original filename
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setOriginalFileName(file.name); // Store the original file name

    if (!connected || !account) {
      alert("Please connect Petra wallet before uploading images for analysis!");
      return;
    }

    setIsUploading(true);
    setUploadStatus("idle");
    setAssetId(null);
    setTxHash(null);

    // STEP 1: Send Petra wallet to pay fee (0.5 shelbyUSD) and network gas (APT)
    try {
      const payload = {
        data: {
          function: "0x1::coin::transfer",
          typeArguments: ["0x1::aptos_coin::AptosCoin"],
          functionArguments: [account.address, 10], // Send 10 octas (Aptos) testnet as proof of action. Later will call smart contract to pay real fee.
        }
      };

      const response = await signAndSubmitTransaction(payload as any);
      console.log("Payment successful. Tx Hash:", response.hash);
      setTxHash(response.hash);

      // Here you can use AptosClient to wait for transaction confirmation before uploading image.

    } catch (error) {
      console.error("Payment failed or canceled by user:", error);
      setUploadStatus("error");
      setIsUploading(false);
      return; // Stop upload process if payment not successful
    }

    // STEP 2: Upload image to system after successful payment
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
        setAssetId(data.data.id); // assetId might be derived differently, or could be related to filename
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
          <h2 className="text-lg font-bold text-slate-900">Upload Image to Shelby</h2>
          <p className="text-sm text-slate-500">Push shelf images or receipts to the storage server.</p>
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
          <p className="text-sm font-semibold">{isUploading ? "Uploading..." : "Drag and drop image files or click to select"}</p>
        </div>
      </div>

      {uploadStatus === "success" && (
        <div className="mt-4 flex flex-col text-sm font-semibold text-emerald-600 bg-emerald-50 p-3 rounded-lg">
          <div className="flex items-center">
            <CheckCircle className="w-4 h-4 mr-2" />
            Upload successful! (Asset ID: {assetId})
          </div>

          {assetId && account && originalFileName && (
            <div className="mt-2 text-xs">
              <span className="font-medium">Asset ID:</span>
              <div className="font-mono text-emerald-800 truncate">{assetId}</div>
              <a
                href={`https://api.shelbynet.shelby.xyz/shelby/v1/blobs/${account?.address}/${originalFileName.replace(/\.[^/.]+$/, "")}.webp`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-emerald-700 hover:text-emerald-900 underline mt-1 inline-block"
              >
                View Blob on Shelby
              </a>
            </div>
          )}

          {txHash && account && originalFileName && (
            <div className="mt-2 text-xs">
              <span className="font-medium">Transaction Hash:</span>
              <div className="font-mono text-emerald-800 truncate">{txHash}</div>
              <a
                href={`https://explorer.aptoslabs.com/txn/${txHash}?network=shelbynet`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-emerald-700 hover:text-emerald-900 underline mt-1 inline-block"
              >
                View on Aptos Explorer
              </a>
              <a
                href={`https://explorer.shelby.xyz/shelbynet/account/${account?.address}/blobs?name=${originalFileName.replace(/\.[^/.]+$/, "")}.webp`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-emerald-700 hover:text-emerald-900 underline mt-1 inline-block ml-4"
              >
                View Blobs on Shelby
              </a>
            </div>
          )}
        </div>
      )}

      {uploadStatus === "error" && (
        <div className="mt-4 flex items-center text-sm font-semibold text-red-600 bg-red-50 p-3 rounded-lg">
          <XCircle className="w-4 h-4 mr-2" />
          Image upload failed. Please try again later.
        </div>
      )}
    </div>
  );
}