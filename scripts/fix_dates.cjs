const fs = require('fs');

let html = fs.readFileSync('d:/isef/scinexa_engineering_logbook.html', 'utf8');
html = html.replace(/<span class="log-date">التاريخ: 16 أكتوبر 2026<\/span>\s*<span class="log-phase">محاكاة دورات التكافؤ/, '<span class="log-date">التاريخ: 5 أكتوبر 2026</span>\n        <span class="log-phase">محاكاة دورات التكافؤ');
html = html.replace('التاريخ: 11 – 20 أكتوبر 2026', 'التاريخ: 17 – 18 أكتوبر 2026');
fs.writeFileSync('d:/isef/scinexa_engineering_logbook.html', html, 'utf8');
console.log('Fixed phase dates');
