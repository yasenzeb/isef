const https = require('https');

function fetchUrl(url) {
  https.get(url, (res) => {
    if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
      const next = res.headers.location.startsWith('http') ? res.headers.location : 'https://unpkg.com' + res.headers.location;
      return fetchUrl(next);
    }
    let data = '';
    res.on('data', chunk => data += chunk);
    res.on('end', () => {
      // Look for open / expand / toggle / click methods in the class
      const openMatches = data.match(/open|expand|toggle|trigger|click/gi);
      console.log('Matches:', openMatches ? openMatches.length : 0);
      
      // Look for customEvents or addEventListener in the script
      const events = data.match(/addEventListener\(['"][^'"]+['"]/g);
      console.log('Events listened to:', [...new Set(events)]);

      // Look for dispatchEvent
      const dispatched = data.match(/dispatchEvent\(new CustomEvent\(['"][^'"]+['"]/g);
      console.log('Dispatched events:', [...new Set(dispatched)]);

      // Look for methods on the HTMLElement class
      const classDef = data.match(/class extends HTMLElement\{[\s\S]*?\}/);
      if (classDef) {
        console.log('class preview:', classDef[0].slice(0, 500));
      }
    });
  });
}

fetchUrl('https://unpkg.com/@fishaudio/agent-widget-embed');
