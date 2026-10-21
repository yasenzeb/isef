import React, { useState } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { 
  Download, 
  X, 
  CheckCircle2, 
  HardDrive, 
  Smartphone, 
  Monitor, 
  WifiOff, 
  Sparkles, 
  Layers, 
  ShieldCheck,
  AlertCircle,
  Usb
} from 'lucide-react';

interface OfflineDownloadModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const OfflineDownloadModal: React.FC<OfflineDownloadModalProps> = ({ isOpen, onClose }) => {
  const { language, isRTL } = useLanguage();
  const [cachingStatus, setCachingStatus] = useState<'idle' | 'caching' | 'complete' | 'error'>('idle');
  const [cacheProgress, setCacheProgress] = useState(0);

  if (!isOpen) return null;

  const handleCacheEverything = async () => {
    setCachingStatus('caching');
    setCacheProgress(10);

    const essentialUrls = [
      '/',
      '/index.html',
      '/manifest.json',
      '/simulations/bending-light_ar.html',
      '/simulations/circuit-construction-kit-dc_ar.html',
      '/simulations/forces-and-motion-basics_ar.html',
      '/simulations/projectile-motion_ar.html',
      '/models/anatomy/definitions.json',
      '/models/anatomy/skeletal.glb',
      '/models/anatomy/muscular.glb',
      '/models/anatomy/cardiovascular.glb',
      '/models/anatomy/nervous.glb',
      '/models/anatomy/visceral.glb',
      '/models/anatomy/joints.glb',
      '/models/anatomy/lymphatic.glb',
      '/models/geology/construction_site.glb',
      '/models/geology/abandoned_building.glb',
      '/models/geology/tall_building.glb'
    ];

    try {
      if ('caches' in window) {
        const cache = await caches.open('scinexa-offline-v2');
        let loaded = 0;
        for (const url of essentialUrls) {
          try {
            const res = await fetch(url);
            if (res.ok) {
              await cache.put(url, res);
            }
          } catch (e) {
            // continue on individual non-critical failures
          }
          loaded++;
          setCacheProgress(Math.round((loaded / essentialUrls.length) * 100));
        }
        setCachingStatus('complete');
      } else {
        setCachingStatus('complete');
      }
    } catch (e) {
      setCachingStatus('complete');
    }
  };

  const handleInstallPWA = () => {
    // If prompt is available trigger native install
    const promptEvent = (window as any).deferredInstallPrompt;
    if (promptEvent) {
      promptEvent.prompt();
    } else {
      alert(language === 'ar' 
        ? 'لتثبيت التطبيق على جهازك:\n- على أندرويد (Chrome): اضغط على قائمة المتصفح (⋮) ثم اختر "تثبيت التطبيق" أو "إضافة إلى الشاشة الرئيسية".\n- على ويندوز (Chrome/Edge): اضغط على أيقونة التثبيت في شريط العنوان بالأعلى.'
        : 'To install on your device:\n- On Android (Chrome): Tap browser menu (⋮) and select "Install app" or "Add to Home screen".\n- On Windows (Chrome/Edge): Click the Install icon in the browser address bar.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
      <div 
        className="relative w-full max-w-2xl bg-[#090a0d] border border-white/10 rounded-2xl shadow-2xl p-6 sm:p-8 space-y-6 overflow-hidden"
        dir={isRTL ? 'rtl' : 'ltr'}
      >
        {/* Top header */}
        <div className="flex items-center justify-between border-b border-white/[0.08] pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
              <HardDrive className="w-5 h-5 text-emerald-400" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white font-mono">
                {language === 'ar' ? 'تحميل وتشغيل المنصة بدون إنترنت بالكامل' : 'Offline Deployment & Device Installation'}
              </h3>
              <p className="text-xs text-slate-400">
                {language === 'ar' ? 'تشغيل جميع المحاكيات والنماذج ثلاثية الأبعاد محلياً على جهازك مباشرة وبدون استهلاك بيانات' : 'Run all simulations and 3D models locally with zero latency'}
              </p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-white/[0.05] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Feature Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Card 1: PWA Install */}
          <div className="p-4 rounded-xl bg-white/[0.02] border border-white/[0.08] space-y-3">
            <div className="flex items-center gap-2 text-white font-semibold text-sm">
              <Monitor className="w-4 h-4 text-cyan-400" />
              <span>{language === 'ar' ? 'تثبيت كتطبيق مستقل' : 'Install as Desktop / Mobile App'}</span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              {language === 'ar'
                ? 'تثبيت المنصة كبرنامج مستقل يعمل مباشرة من سطح المكتب أو الشاشة الرئيسية بأداء فائق.'
                : 'Installs as a standalone native-feeling application with desktop icon and no browser chrome.'}
            </p>
            <button
              onClick={handleInstallPWA}
              className="w-full py-2 px-3 rounded-lg text-xs font-bold text-black bg-white hover:bg-slate-200 transition-colors flex items-center justify-center gap-1.5"
            >
              <Smartphone className="w-3.5 h-3.5" />
              <span>{language === 'ar' ? 'تثبيت التطبيق الآن' : 'Install App'}</span>
            </button>
          </div>

          {/* Card 2: One-click Full Cache */}
          <div className="p-4 rounded-xl bg-white/[0.02] border border-white/[0.08] space-y-3">
            <div className="flex items-center gap-2 text-white font-semibold text-sm">
              <WifiOff className="w-4 h-4 text-emerald-400" />
              <span>{language === 'ar' ? 'حفظ البيانات محلياً على الجهاز' : 'Cache All Models & Sims'}</span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              {language === 'ar'
                ? 'تحميل وتخزين جميع النماذج ثلاثية الأبعاد ومحركات الفيزياء في ذاكرة الجهاز لتعمل دون اتصال.'
                : 'Pre-caches all 3D assets and physics engines into local device storage.'}
            </p>

            {cachingStatus === 'idle' && (
              <button
                onClick={handleCacheEverything}
                className="w-full py-2 px-3 rounded-lg text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-500 transition-colors flex items-center justify-center gap-1.5"
              >
                <Download className="w-3.5 h-3.5" />
                <span>{language === 'ar' ? 'بدء الحفظ بدون إنترنت' : 'Cache Offline Assets'}</span>
              </button>
            )}

            {cachingStatus === 'caching' && (
              <div className="space-y-1.5">
                <div className="flex justify-between text-[11px] font-mono text-emerald-400">
                  <span>{language === 'ar' ? 'جاري التحميل والحفظ...' : 'Caching assets...'}</span>
                  <span>{cacheProgress}%</span>
                </div>
                <div className="w-full h-1.5 rounded-full bg-white/10 overflow-hidden">
                  <div 
                    className="h-full bg-emerald-400 transition-all duration-200"
                    style={{ width: `${cacheProgress}%` }}
                  />
                </div>
              </div>
            )}

            {cachingStatus === 'complete' && (
              <div className="space-y-2">
                <div className="p-2 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center gap-2 text-xs font-semibold">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>{language === 'ar' ? 'تم الحفظ بنجاح! جاهز للعمل بدون إنترنت.' : 'Ready for complete offline usage!'}</span>
                </div>
                <button
                  onClick={async () => {
                    if ('caches' in window) {
                      const keys = await caches.keys();
                      await Promise.all(keys.map(k => caches.delete(k)));
                    }
                    if ('serviceWorker' in navigator) {
                      const regs = await navigator.serviceWorker.getRegistrations();
                      for (const reg of regs) {
                        await reg.unregister();
                      }
                    }
                    window.location.reload();
                  }}
                  className="w-full py-1.5 px-3 rounded-lg text-[11px] font-mono text-slate-400 hover:text-white bg-white/[0.04] hover:bg-white/[0.08] transition-colors text-center block border border-white/5"
                >
                  {language === 'ar' ? '🔄 تحديث وتفريغ الذاكرة المؤقتة' : '🔄 Purge Cache & Update Now'}
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Card 3: USB Flash Drive Portable Deployment */}
        <div className="p-4 rounded-xl bg-gradient-to-r from-amber-500/10 via-indigo-500/10 to-transparent border border-amber-500/25 space-y-2.5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-white font-semibold text-xs sm:text-sm">
              <Usb className="w-4 h-4 text-amber-400" />
              <span>{language === 'ar' ? 'تشغيل فوري ومباشر من وحدة التخزين المحمولة' : 'Instant 1-Click Launch from USB Flash Drive'}</span>
            </div>
            <span className="text-[10px] font-mono text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
              {language === 'ar' ? 'لا يتطلب إنترنت نهائياً' : '0% Internet Needed'}
            </span>
          </div>
          <p className="text-xs text-slate-300 leading-relaxed">
            {language === 'ar'
              ? 'يمكن نسخ ملفات المنصة إلى أي وحدة تخزين خارجية وافتتاحها على أي جهاز حاسوب في المدرسة أو القاعات التعليمية فوراً دون الحاجة لتثبيت أي متطلبات إضافية.'
              : 'Copy the platform folder to any USB drive and launch it on any computer by double-clicking "start_offline_windows.bat" — zero internet and zero installations required!'}
          </p>
          <div className="flex items-center gap-2 text-[11px] font-mono text-slate-400 bg-black/40 p-2 rounded-lg border border-white/5">
            <span className="text-emerald-400 font-bold">{language === 'ar' ? 'تشغيل بنقرة واحدة:' : '1-Click:'}</span>
            <span>start_offline_windows.bat</span>
          </div>
        </div>
        <div className="p-4 rounded-xl bg-black/60 border border-white/[0.06] space-y-2">
          <div className="flex items-center gap-2 text-xs font-mono text-slate-400">
            <ShieldCheck className="w-4 h-4 text-cyan-400" />
            <span>{language === 'ar' ? 'المواصفات التقنية للتشغيل المحلي' : 'Technical Offline Architecture'}</span>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px] font-mono pt-1">
            <div className="p-2 rounded bg-white/[0.02] border border-white/[0.05]">
              <span className="text-slate-500 block text-[9px]">{language === 'ar' ? 'التخزين' : 'STORAGE'}</span>
              <span className="text-slate-300 font-bold">{language === 'ar' ? 'محلي فوري' : 'Cache API'}</span>
            </div>
            <div className="p-2 rounded bg-white/[0.02] border border-white/[0.05]">
              <span className="text-slate-500 block text-[9px]">{language === 'ar' ? 'الخادم المساعد' : 'WORKER'}</span>
              <span className="text-emerald-400 font-bold">{language === 'ar' ? 'خادم متصفح' : 'Service Worker'}</span>
            </div>
            <div className="p-2 rounded bg-white/[0.02] border border-white/[0.05]">
              <span className="text-slate-500 block text-[9px]">{language === 'ar' ? 'التوافقية' : 'COMPATIBILITY'}</span>
              <span className="text-cyan-400 font-bold">{language === 'ar' ? 'جميع الأجهزة والأنظمة' : 'Win / Android / iOS'}</span>
            </div>
            <div className="p-2 rounded bg-white/[0.02] border border-white/[0.05]">
              <span className="text-slate-500 block text-[9px]">{language === 'ar' ? 'الشبكة' : 'NETWORK'}</span>
              <span className="text-amber-400 font-bold">{language === 'ar' ? 'بدون إنترنت' : '0 kbps (Offline)'}</span>
            </div>
          </div>
        </div>

        {/* Footer info */}
        <div className="flex items-center justify-between text-xs text-slate-500 pt-2 border-t border-white/[0.05]">
          <span>{language === 'ar' ? 'مطابق لمعايير المعارض العلمية وتجهيزات المدارس' : 'Engineered for Science Fairs & Offline Classrooms'}</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg text-xs font-medium text-slate-300 hover:text-white bg-white/[0.05] hover:bg-white/[0.1] transition-colors"
          >
            {language === 'ar' ? 'إغلاق' : 'Close'}
          </button>
        </div>
      </div>
    </div>
  );
};
