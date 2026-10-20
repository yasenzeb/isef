const fs = require('fs');

let code = fs.readFileSync('d:/isef/src/components/AnatomyViewer.tsx', 'utf8');
const startTag = '{/* Launch Detailed 3D Organ Dissection Button */}';
const endTag = '})()}';

const startIdx = code.indexOf(startTag);
const endIdx = code.indexOf(endTag, startIdx);

console.log('startIdx:', startIdx, 'endIdx:', endIdx);

if (startIdx !== -1 && endIdx !== -1) {
  const replacement = `            {/* Focus & Specimen Isolation Button (Zero network lag, 100% offline & lightweight) */}
            <button
              onClick={toggleIsolate}
              className={\`w-full mt-2 py-2.5 px-4 rounded-xl border font-bold text-xs flex items-center justify-center space-x-2 transition-all cursor-pointer shadow-lg \${
                isIsolated
                  ? 'bg-gradient-to-r from-amber-500 to-orange-600 border-amber-400 text-white'
                  : 'bg-gradient-to-r from-indigo-600 via-cyan-600 to-emerald-600 border-cyan-400/40 text-white hover:opacity-95'
              }\`}
            >
              <Eye className="w-4 h-4" />
              <span>
                {isIsolated 
                  ? (language === 'ar' ? 'إلغاء العزل وإظهار كامل الجسم' : 'Exit Focus / Show Full Body')
                  : (language === 'ar' ? 'فحص وتقريب الجزء بمفرده (عزل 3D)' : 'Focus & Isolate Specimen Only')}
              </span>
            </button>`;

  code = code.slice(0, startIdx) + replacement + code.slice(endIdx + endTag.length);
  fs.writeFileSync('d:/isef/src/components/AnatomyViewer.tsx', code, 'utf8');
  console.log('Successfully updated AnatomyViewer.tsx');
}
