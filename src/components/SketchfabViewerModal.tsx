import React, { useEffect } from 'react';
import { X, ExternalLink, Sparkles, BookOpen, Layers } from 'lucide-react';
import { AnatomyAtlasModel } from '../data/sketchfabAnatomyData';

interface SketchfabViewerModalProps {
  model: AnatomyAtlasModel | null;
  onClose: () => void;
  language: string;
}

export const SketchfabViewerModal: React.FC<SketchfabViewerModalProps> = ({
  model,
  onClose,
  language,
}) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  if (!model) return null;

  const isAr = language === 'ar';
  const embedUrl = `https://sketchfab.com/models/${model.sketchfabUid}/embed?autostart=1&ui_controls=1&ui_infos=0&ui_watermark=0&ui_help=0&ui_settings=0&ui_inspector=1&ui_stop=0`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/85 backdrop-blur-md animate-fade-in">
      <div className="bg-slate-900 border border-sky-500/30 rounded-2xl max-w-5xl w-full h-[90vh] flex flex-col shadow-2xl overflow-hidden relative">
        
        {/* Top Header */}
        <div className="bg-slate-950/90 px-5 py-3.5 border-b border-sky-500/20 flex items-center justify-between z-10 shrink-0">
          <div className="flex items-center space-x-3">
            <span className="sci-badge flex items-center space-x-1">
              <Sparkles className="w-3.5 h-3.5 text-sky-400" />
              <span>{isAr ? 'عرض تشريحي فائق الدقة 3D' : 'High-Fidelity 3D Specimen'}</span>
            </span>
            <div className="border-l border-slate-700 pl-3">
              <h2 className="text-base sm:text-lg font-bold text-white leading-tight">
                {isAr ? model.titleAr : model.titleEn}
              </h2>
              <span className="text-xs text-sky-400 block font-serif italic">
                {isAr ? model.systemAr : model.system}
              </span>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <a
              href={`https://sketchfab.com/3d-models/${model.slug}`}
              target="_blank"
              rel="noopener noreferrer"
              className="hidden sm:flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold sci-surface hover:bg-slate-800 text-slate-300 transition-colors"
            >
              <span>{isAr ? 'المصدر الأصلي' : 'Original Model'}</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
              aria-label="Close"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* 3D Viewport Frame */}
        <div className="flex-1 bg-black relative">
          <iframe
            title={model.titleEn}
            className="w-full h-full border-0"
            src={embedUrl}
            allow="autoplay; fullscreen; xr-spatial-tracking"
            allowFullScreen
          />
        </div>

        {/* Bottom Details Footer */}
        <div className="bg-slate-950/95 px-5 py-3 border-t border-sky-500/15 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs shrink-0">
          <div className="flex items-start space-x-2 max-w-3xl">
            <BookOpen className="w-4 h-4 text-sky-400 shrink-0 mt-0.5" />
            <p className="text-slate-300 leading-relaxed">
              {isAr ? model.descriptionAr : model.descriptionEn}
            </p>
          </div>

          <div className="flex items-center space-x-2 shrink-0 text-slate-400 text-[11px]">
            <Layers className="w-3.5 h-3.5 text-slate-500" />
            <span>{isAr ? 'النموذج من:' : 'Curated from:'} <strong className="text-slate-200">{model.author}</strong></span>
          </div>
        </div>

      </div>
    </div>
  );
};
