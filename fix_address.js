const fs = require('fs');
const file = 'app/login/page.tsx';
let text = fs.readFileSync(file, 'utf8');

text = text.replace('{account?.address}', '{account?.address?.toString()}');

fs.writeFileSync(file, text);
console.log('Fixed address render error!');
