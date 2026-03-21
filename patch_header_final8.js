const fs = require('fs');
let text = fs.readFileSync('app/dashboard/client.tsx', 'utf8');

if (!text.includes('useWallet')) {
    text = text.replace('"use client";', '"use client";\nimport { useWallet } from "@aptos-labs/wallet-adapter-react";\n');
}

text = text.replace(
  'export default function DashboardClient({',
  'export default function DashboardClient({\n  const { connected, connect, account, disconnect } = useWallet();'
);

const searchBlock = `              <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                <input
                  type="text"
                  placeholder={t.search}
                  className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-cyan-500 focus:ring-4 focus:ring-cyan-100 sm:w-80"
                />

                <div className="grid grid-cols-3 rounded-2xl bg-slate-100 p-1">
                  <button
                    type="button"
                    onClick={() => setLanguage("en")}
                    className={\`rounded-xl px-4 py-2 text-sm font-semibold transition \${
                      language === "en" ? "bg-slate-900 text-white shadow" : "text-slate-600 hover:bg-white"
                    }\`}
                  >
                    EN
                  </button>
                  <button
                    type="button"
                    onClick={() => setLanguage("vi")}
                    className={\`rounded-xl px-4 py-2 text-sm font-semibold transition \${
                      language === "vi" ? "bg-slate-900 text-white shadow" : "text-slate-600 hover:bg-white"
                    }\`}
                  >
                    VI
                  </button>
                  <button
                    type="button"
                    onClick={() => setLanguage("zh")}
                    className={\`rounded-xl px-4 py-2 text-sm font-semibold transition \${
                      language === "zh" ? "bg-slate-900 text-white shadow" : "text-slate-600 hover:bg-white"
                    }\`}
                  >
                    中文
                  </button>
                </div>

                <button
                  type="button"
                  className="rounded-2xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
                >
                  {t.export}
                </button>
              </div>`;

const replaceBlock = `              <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                <input
                  type="text"
                  placeholder={t.search}
                  className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-cyan-500 focus:ring-4 focus:ring-cyan-100 sm:w-80"
                />

                <div className="grid grid-cols-3 rounded-2xl bg-slate-100 p-1">
                  <button
                    type="button"
                    onClick={() => setLanguage("en")}
                    className={\`rounded-xl px-4 py-2 text-sm font-semibold transition \${
                      language === "en" ? "bg-slate-900 text-white shadow" : "text-slate-600 hover:bg-white"
                    }\`}
                  >
                    EN
                  </button>
                  <button
                    type="button"
                    onClick={() => setLanguage("vi")}
                    className={\`rounded-xl px-4 py-2 text-sm font-semibold transition \${
                      language === "vi" ? "bg-slate-900 text-white shadow" : "text-slate-600 hover:bg-white"
                    }\`}
                  >
                    VI
                  </button>
                  <button
                    type="button"
                    onClick={() => setLanguage("zh")}
                    className={\`rounded-xl px-4 py-2 text-sm font-semibold transition \${
                      language === "zh" ? "bg-slate-900 text-white shadow" : "text-slate-600 hover:bg-white"
                    }\`}
                  >
                    中文
                  </button>
                </div>

                <div className="flex items-center gap-2 z-[100]">
                  {!connected ? (
                    <button
                      type="button"
                      onClick={() => connect("Petra" as any)}
                      className="rounded-2xl bg-cyan-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-cyan-700 flex items-center gap-2 shadow-sm"
                    >
                      Lien k?t vi Petra
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={() => disconnect()}
                      className="rounded-2xl border border-cyan-600 bg-cyan-50 px-5 py-3 text-sm font-semibold text-cyan-800 transition hover:bg-cyan-100 flex items-center gap-2 group relative shadow-sm"
                    >
                      <span className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.8)] animate-pulse"></span>
                      {account?.address?.toString().slice(0, 4)}...{account?.address?.toString().slice(-4)}
                      <span className="absolute -bottom-10 left-1/2 -translate-x-1/2 rounded bg-slate-800 px-2 py-1 text-[10px] text-white opacity-0 transition group-hover:opacity-100 whitespace-nowrap z-[100]">Thoat lien k?t vi</span>
                    </button>
                  )}
                </div>
              </div>`;

text = text.replace(searchBlock, replaceBlock);

fs.writeFileSync('app/dashboard/client.tsx', text);
console.log('Saved safely again without export button');
