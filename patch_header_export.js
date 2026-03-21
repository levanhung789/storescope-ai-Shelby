const fs = require('fs');
let text = fs.readFileSync('app/dashboard/client.tsx', 'utf8');

const regex = /<button\s+type="button"\s+className="rounded-2xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"\s*>\s*\{t\.export\}\s*<\/button>/g;

const replacement = `<div className="flex items-center gap-2 z-[100]">
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
                </div>`;

if(regex.test(text)) {
  text = text.replace(regex, replacement);
  fs.writeFileSync('app/dashboard/client.tsx', text);
  console.log('Regex matched and replaced export button');
} else {
  console.log('Regex did not match t.export');
}
