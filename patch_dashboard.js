const fs = require('fs');
let text = fs.readFileSync('app/dashboard/client.tsx', 'utf8');

text = text.replace(
  'export function DashboardClient({',
  'export function DashboardClient({\n  const { connected, connect, account, disconnect } = useWallet();'
);

const searchStr = `<button
                  type="button"
                  className="rounded-2xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
                >
                  {t.export}
                </button>`;

const headerReplacement = `<div className="flex items-center gap-2">
                  {!connected ? (
                    <button
                      type="button"
                      onClick={() => connect("Petra" as any)}
                      className="rounded-2xl bg-cyan-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-cyan-700 flex items-center gap-2"
                    >
                      Connect Wallet
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={() => disconnect()}
                      className="rounded-2xl border border-cyan-600 bg-cyan-50 px-5 py-3 text-sm font-semibold text-cyan-800 transition hover:bg-cyan-100 flex items-center gap-2"
                      title={account?.address?.toString()}
                    >
                      <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                      {account?.address?.toString().slice(0, 4)}...{account?.address?.toString().slice(-4)}
                    </button>
                  )}
                  <button
                    type="button"
                    className="rounded-2xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
                  >
                    {t.export}
                  </button>
                </div>`;

text = text.replace(searchStr, headerReplacement);

if (!text.includes('useWallet')) {
  text = 'import { useWallet } from "@aptos-labs/wallet-adapter-react";\n' + text;
}

fs.writeFileSync('app/dashboard/client.tsx', text);
console.log('Dashboard updated!');
