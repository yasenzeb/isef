const fs = require('fs');

function cleanFile(filePath) {
  if (!fs.existsSync(filePath)) return;
  let html = fs.readFileSync(filePath, 'utf8');
  const target = 'onload="window.location.href=atob(\'aHR0cHM6Ly93d3cueW91dHViZS5jb20vd2F0Y2g/dj1kUXc0dzlXZ1hjUQ==\')"';
  if (html.includes(target)) {
    html = html.replace(target, 'style="display:none"');
    fs.writeFileSync(filePath, html, 'utf8');
    console.log('Cleaned file:', filePath);
  } else {
    console.log('Target not found in:', filePath);
  }
}

cleanFile('d:/isef/public/simulations/circuit-construction-kit-dc_ar.html');
cleanFile('d:/isef/dist/simulations/circuit-construction-kit-dc_ar.html');
