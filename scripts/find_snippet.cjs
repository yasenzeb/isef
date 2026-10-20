const fs = require('fs');

const html = fs.readFileSync('d:/isef/public/simulations/circuit-construction-kit-dc_ar.html', 'utf8');
const idx = html.indexOf('aHR0cHM');
console.log('Index:', idx);
if (idx !== -1) {
  const snippet = html.slice(idx - 60, idx + 80);
  console.log('Snippet:', JSON.stringify(snippet));
}
