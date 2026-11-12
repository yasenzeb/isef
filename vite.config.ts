import { defineConfig, Plugin } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

/**
 * Custom Vite Plugin to handle Darwin / Fish Audio tool webhooks
 * Resolves HTTP 405 Method Not Allowed and returns active lab telemetry
 */
function viteLabStatusApiPlugin(): Plugin {
  let activeContext: any = {
    status: 'success',
    code: 200,
    current_lab: 'anatomy',
    lab_name_ar: 'أطلس التشريح الطبي ثلاثي الأبعاد (3D Anatomy Atlas)',
    selected_part: 'عظم لوح الكتف (Scapula)',
    name_ar: 'عظم لوح الكتف',
    name_en: 'Scapula',
    system_layer: 'الهيكل العظمي (Skeletal System)',
    description_ar: 'عظم مثلث مسطح يقع في الجزء الخلفي العلوي للقفص الصدري، يربط عظم العضد بالترقوة ويوفر ارتكازاً رئيسياً لعضلات الكفة المدورة وعضلات الظهر.',
    clinical_note_ar: 'يرتبط بمتلازمة انحشار الكتف والتهاب أوتار الكفة المدورة، وتثبيته محوري لرفع وتدوير الذراع بحرية.',
    physics: {
      voltage: 9,
      resistance: 10,
      current: 0.9,
      switchClosed: true,
      isShortCircuit: false,
    },
    chemistry: {
      selectedReagents: ['خارصين (Zn)', 'حمض الهيدروكلوريك (HCl)'],
      reactionEquation: 'Zn + 2HCl → ZnCl₂ + H₂↑',
      reactionNameAr: 'تفاعل إحلال بسيط وتصاعد غاز الهيدروجين',
    },
    summary_ar: 'العضو المحدد حالياً في معمل التشريح هو عظم لوح الكتف (Scapula). عظم مثلث مسطح يربط العضد بالترقوة ويثبت عضلات حركة الذراع والكتف.',
  };

  const handleReq = (req: any, res: any) => {
    // CORS Headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, DELETE');
    res.setHeader('Access-Control-Allow-Headers', '*');
    res.setHeader('Content-Type', 'application/json; charset=utf-8');

    if (req.method === 'OPTIONS') {
      res.statusCode = 200;
      res.end();
      return;
    }

    if (req.method === 'POST') {
      let body = '';
      req.on('data', (chunk: any) => {
        body += chunk;
      });
      req.on('end', () => {
        try {
          if (body) {
            const parsed = JSON.parse(body);
            activeContext = { ...activeContext, ...parsed };
          }
        } catch {}
        res.statusCode = 200;
        res.end(JSON.stringify(activeContext));
      });
      return;
    }

    res.statusCode = 200;
    res.end(JSON.stringify(activeContext));
  };

  return {
    name: 'vite-lab-status-api',
    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        const url = req.url || '';
        if (
          url.startsWith('/api') ||
          url.includes('lab-status') ||
          url.includes('lab-data') ||
          url.includes('get_current_lab_status') ||
          url.includes('context')
        ) {
          handleReq(req, res);
        } else {
          next();
        }
      });
    },
    configurePreviewServer(server) {
      server.middlewares.use((req, res, next) => {
        const url = req.url || '';
        if (
          url.startsWith('/api') ||
          url.includes('lab-status') ||
          url.includes('lab-data') ||
          url.includes('get_current_lab_status') ||
          url.includes('context')
        ) {
          handleReq(req, res);
        } else {
          next();
        }
      });
    },
  };
}

export default defineConfig({
  plugins: [react(), tailwindcss(), viteLabStatusApiPlugin()],
  server: {
    port: 5173,
    host: true,
  },
  build: {
    target: 'esnext',
    chunkSizeWarningLimit: 1200,
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules/three') || id.includes('node_modules/three-stdlib')) {
            return 'vendor-three';
          }
          if (id.includes('node_modules/lucide-react')) {
            return 'vendor-icons';
          }
          if (id.includes('node_modules/react') || id.includes('node_modules/react-dom')) {
            return 'vendor-react';
          }
          if (id.includes('skeletalBoneDictionary.json')) {
            return 'data-bone-dictionary';
          }
          if (id.includes('chemicalReactionsData')) {
            return 'data-chemical-reactions';
          }
        },
      },
    },
  },
});
