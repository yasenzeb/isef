const fs = require('fs');
const path = require('path');

const targetFile = path.resolve(__dirname, '../public/simulations/circuit-construction-kit-dc_ar.html');
let content = fs.readFileSync(targetFile, 'utf8');

const hook = `<script>
// SciNexa Circuit Workspace Auto-Save Hook
(function() {
  var lastSaveTime = 0;
  function checkAndSave() {
    try {
      var sim = window.phet && window.phet.joist && window.phet.joist.sim;
      if (!sim) return;
      var screens = sim.simScreens || sim.screens;
      if (!screens || !screens.length) return;
      var screen = (sim.selectedScreenProperty && sim.selectedScreenProperty.value) || screens[0];
      var circuit = screen && screen.model && screen.model.circuit;
      if (!circuit || !circuit.circuitElements) return;

      var elements = circuit.circuitElements;
      var count = (elements.length !== undefined) ? elements.length : (elements.count ? elements.count : 0);
      
      var wires = 0, batteries = 0, lightBulbs = 0, resistors = 0, switches = 0;
      var hasCurrent = false;

      for (var i = 0; i < count; i++) {
        var el = elements.get ? elements.get(i) : elements[i];
        if (!el) continue;
        var t = el.type || '';
        if (t === 'wire') wires++;
        else if (t === 'battery') batteries++;
        else if (t === 'lightBulb') lightBulbs++;
        else if (t === 'resistor') resistors++;
        else if (t === 'switch') switches++;
        if (el.currentProperty && Math.abs(el.currentProperty.value || 0) > 0.001) {
          hasCurrent = true;
        }
      }

      if (count > 0) {
        var now = Date.now();
        if (now - lastSaveTime > 2500) {
          lastSaveTime = now;
          var screenshot = null;
          try {
            if (window.phet.joist.ScreenshotGenerator) {
              screenshot = window.phet.joist.ScreenshotGenerator.generateScreenshot(sim, 'image/jpeg');
            }
          } catch(err) {}

          var data = {
            count: count,
            wires: wires,
            batteries: batteries,
            lightBulbs: lightBulbs,
            resistors: resistors,
            switches: switches,
            hasCurrent: hasCurrent,
            screenshot: screenshot,
            timestamp: now
          };

          try {
            localStorage.setItem('scinexa_v2_saved_circuit', JSON.stringify(data));
          } catch(e) {}

          try {
            if (window.parent && window.parent !== window) {
              window.parent.postMessage({ type: 'SCINEXA_CIRCUIT_AUTOSAVE', payload: data }, '*');
            }
          } catch(e) {}
        }
      }
    } catch(e) {}
  }

  setInterval(checkAndSave, 1500);
  window.addEventListener('beforeunload', function() {
    checkAndSave();
  });
})();
</script>`;

const lastBodyIdx = content.lastIndexOf('</body>');
if (lastBodyIdx !== -1) {
  content = content.replace(/<script>\s*\/\/ SciNexa Circuit Workspace Auto-Save Hook[\s\S]*?<\/script>\s*/g, '');
  const finalBodyIdx = content.lastIndexOf('</body>');
  content = content.substring(0, finalBodyIdx) + hook + '\n' + content.substring(finalBodyIdx);
  fs.writeFileSync(targetFile, content, 'utf8');
  console.log('Successfully injected SciNexa circuit auto-save hook at the true end of HTML.');
} else {
  console.error('Could not find </body> in file');
}
