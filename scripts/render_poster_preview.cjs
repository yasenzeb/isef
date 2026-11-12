const { execSync } = require('child_process');
const edgePath = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
const htmlPath = 'C:/Users/youss/OneDrive/Desktop/poster.html';
const pdfPath = 'C:/Users/youss/OneDrive/Desktop/poster.pdf';
const pngPath = 'C:/Users/youss/.gemini/antigravity/brain/a27444ae-f5af-4666-8b46-4c5f2db680cf/poster_preview.png';

console.log('Printing PDF...');
execSync(`"${edgePath}" --headless=new --disable-gpu --run-all-compositor-stages-before-draw --print-to-pdf="${pdfPath}" --print-to-pdf-no-header "file:///${htmlPath}"`);

console.log('Capturing Screenshot...');
execSync(`"${edgePath}" --headless=new --disable-gpu --window-size=1587,1122 --screenshot="${pngPath}" "file:///${htmlPath}"`);

console.log('Done rendering!');
