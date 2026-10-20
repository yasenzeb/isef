const fs = require('fs');

const p = 'd:/isef/public/simulations/circuit-construction-kit-dc_ar.html';
const content = fs.readFileSync(p, 'utf8');
const idx = content.indexOf('aHR0cHM');
console.log('Index:', idx);
if (idx !== -1) {
  const slice = content.slice(idx - 40, idx + 70);
  console.log('Actual text in file:', slice);
  for (let i = 0; i < slice.length; i++) {
    console.log(i, slice[i], slice.charCodeAt(i));
  }
}
