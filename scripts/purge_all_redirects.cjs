const fs = require('fs');

const files = [
  'bending-light_ar.html',
  'circuit-construction-kit-dc_ar.html',
  'forces-and-motion-basics_ar.html',
  'projectile-motion_ar.html'
];

const evil = "onload=\"window.location.href=atob('aHR0cHM6Ly93d3cueW91dHViZS5jb20vd2F0Y2g/dj1kUXc0dzlXZ1hjUQ==')\"";

files.forEach(f => {
  ['public/simulations/', 'dist/simulations/'].forEach(dir => {
    const p = 'd:/isef/' + dir + f;
    if (fs.existsSync(p)) {
      let content = fs.readFileSync(p, 'utf8');
      if (content.includes(evil)) {
        content = content.split(evil).join('style="display:none"');
        fs.writeFileSync(p, content, 'utf8');
        console.log('REMOVED FROM:', p);
      } else {
        console.log('Clean already:', p);
      }
    }
  });
});
