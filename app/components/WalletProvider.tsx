"use client";

import { AptosWalletAdapterProvider } from "@aptos-labs/wallet-adapter-react";
import { ReactNode } from "react";

export function AppWalletProvider({ children }: { children: ReactNode }) {
  return (
    <AptosWalletAdapterProvider
      optInWallets={["Petra"]}
      autoConnect={true}
    >
      {children}
    </AptosWalletAdapterProvider>
  );
}
