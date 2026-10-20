const fs = require('fs');

let html = fs.readFileSync('d:/isef/scinexa_engineering_logbook.html', 'utf8');
const lines = html.split('\n');
console.log('Line 670:', lines[669]);
lines[669] = '        <span class="log-date">التاريخ: 5 أكتوبر 2026</span>';
fs.writeFileSync('d:/isef/scinexa_engineering_logbook.html', lines.join('\n'), 'utf8');
console.log('Line 670 updated to 5 October 2026');
