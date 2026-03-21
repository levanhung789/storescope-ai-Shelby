const fs = require('fs');
const file = 'app/login/page.tsx';
let text = fs.readFileSync(file, 'utf8');

if (!text.includes('import { useWallet } from')) {
    text = text.replace(
        'import { useRouter } from "next/navigation";',
        'import { useRouter } from "next/navigation";\nimport { useWallet } from "@aptos-labs/wallet-adapter-react";'
    );
    fs.writeFileSync(file, text);
    console.log('Import added!');
} else {
    console.log('Import already exists.');
}
