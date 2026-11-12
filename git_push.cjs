const { execSync } = require('child_process');

console.log('Staging files...');
execSync('git add -A', { cwd: __dirname, stdio: 'inherit' });

console.log('Committing...');
execSync('git commit -m "feat: integrate full algebra quadratic heron and statistics panels into math lab"', { cwd: __dirname, stdio: 'inherit' });

console.log('Pushing to GitHub...');
execSync('git push origin main', { cwd: __dirname, stdio: 'inherit' });

console.log('Done!');
