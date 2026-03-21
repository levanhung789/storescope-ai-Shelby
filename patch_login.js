const fs = require('fs');
let text = fs.readFileSync('app/login/page.tsx', 'utf8');

text = text.replace('export default function LoginPage() {', 'export default function LoginPage() {\n  const { connected, account, connect, signMessage } = useWallet();');

text = text.replace('const handleSubmit = (event: FormEvent<HTMLFormElement>) => {\n    event.preventDefault();', 
`const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (connected && account) {
      try {
        const payload = {
          message: "Sign in to Storescope AI with Petra Wallet",
          nonce: Math.random().toString(36).substring(7),
        };
        const response = await signMessage(payload);
        if (response) {
          setIsError(false);
          setMessage(t.success);
          setTimeout(() => {
            router.push("/dashboard");
          }, 500);
          return;
        }
      } catch (error) {
        setIsError(true);
        setMessage("Wallet signing failed or was rejected.");
        return;
      }
    }`);

text = text.replace('}: AuthCardProps) {', '}: AuthCardProps) {\n  const { connected, connect, account } = useWallet();');

const formPattern = /<form className="space-y-5" onSubmit=\{onSubmit\}>[\s\S]*?<\/form>/;
const newForm = `<form className="space-y-5" onSubmit={onSubmit}>
          {!connected ? (
            <div className="space-y-5">
              <button
                type="button"
                onClick={() => connect("Petra" as any)}
                className="w-full rounded-2xl bg-cyan-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-cyan-700 flex items-center justify-center gap-2"
              >
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="5" width="20" height="14" rx="2" ry="2"></rect><line x1="2" y1="10" x2="22" y2="10"></line></svg>
                Connect Petra Wallet
              </button>
              
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-slate-200"></div>
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-white px-2 text-slate-400">Or use demo account</span>
                </div>
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">{t.username}</label>
                <input
                  type="text"
                  value={username}
                  onChange={(event) => setUsername(event.target.value)}
                  placeholder={t.usernamePlaceholder}
                  className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-slate-900 outline-none transition focus:border-cyan-500 focus:ring-4 focus:ring-cyan-100"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">{t.password}</label>
                <input
                  type="password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  placeholder={t.passwordPlaceholder}
                  className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-slate-900 outline-none transition focus:border-cyan-500 focus:ring-4 focus:ring-cyan-100"
                />
              </div>
            </div>
          ) : (
            <div className="space-y-5">
              <div className="rounded-2xl border border-cyan-200 bg-cyan-50 p-4">
                <p className="text-sm font-medium text-cyan-800 mb-1">Wallet Connected</p>
                <p className="text-xs text-cyan-600 font-mono truncate">{account?.address}</p>
              </div>
              
              <div className="text-sm text-slate-500 text-center px-4">
                To continue, you must sign a message to prove ownership of this wallet.
              </div>
            </div>
          )}

          {message && <MessageBanner text={message} isError={isError} />}

          {!connected && (
            <div className="flex items-center justify-between text-sm">
              <label className="flex items-center gap-2 text-slate-600">
                <input type="checkbox" className="rounded" />
                {t.remember}
              </label>
              <a href="#" className="font-medium text-cyan-600 hover:text-cyan-700">
                {t.forgot}
              </a>
            </div>
          )}

          <button
            type="submit"
            className="w-full rounded-2xl bg-slate-900 px-4 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
          >
            {connected ? "Sign Message to Login" : t.button}
          </button>
        </form>`;

text = text.replace(formPattern, newForm);

if(!text.includes('useWallet')) {
  console.log('Error: useWallet not imported in the original code, doing it now.');
}

fs.writeFileSync('app/login/page.tsx', text);
console.log('Done!');
