import React, { useState } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { REAL_SCIENTISTS } from '../data/scientistsData';
import { Dna, Activity, Sun, Layers, Info, Check, Award } from 'lucide-react';

interface Organelle {
  id: string;
  nameEn: string;
  nameAr: string;
  roleEn: string;
  roleAr: string;
  foundIn: 'both' | 'plant' | 'animal';
  sizeNm: string;
}

const ORGANELLES: Organelle[] = [
  {
    id: 'nucleus',
    nameEn: 'Nucleus',
    nameAr: 'النواة',
    roleEn: 'Repository of genomic DNA; coordinates transcription, mRNA splicing, and chromosome replication.',
    roleAr: 'مستودع المادة الوراثية (DNA)؛ تدير نسخ الجينات وانقسام وتكاثر الخلية.',
    foundIn: 'both',
    sizeNm: '5,000 - 10,000 nm',
  },
  {
    id: 'mitochondria',
    nameEn: 'Mitochondrion',
    nameAr: 'الميتوكوندريا',
    roleEn: 'ATP synthesis via oxidative phosphorylation, electron transport chain, and citric acid cycle.',
    roleAr: 'محطة توليد الطاقة في الخلية؛ تنتج جزيئات ATP عبر الفسفرة التأكسدية ودورة كريبس.',
    foundIn: 'both',
    sizeNm: '500 - 1,000 nm',
  },
  {
    id: 'chloroplast',
    nameEn: 'Chloroplast',
    nameAr: 'البلاستيدات الخضراء',
    roleEn: 'Photosynthesis site; converts light energy into ATP and NADPH, synthesizing hexose sugars in the Calvin cycle.',
    roleAr: 'مقر عملية البناء الضوئي؛ تحول الطاقة الضوئية للكلوروفيل إلى طاقة كيميائية في الجلوكوز.',
    foundIn: 'plant',
    sizeNm: '2,000 - 5,000 nm',
  },
  {
    id: 'ribosome',
    nameEn: 'Ribosome',
    nameAr: 'الريبوسوم',
    roleEn: 'Translates mRNA transcripts into polypeptide chains using tRNA adapters (peptidyl transferase activity).',
    roleAr: 'المصنع الجزيئي الذي يترجم شفرة mRNA إلى سلاسل ببتيدية وبروتينات وظيفية.',
    foundIn: 'both',
    sizeNm: '20 - 30 nm',
  },
  {
    id: 'cell_wall',
    nameEn: 'Cellulose Cell Wall',
    nameAr: 'الجدار الخلوي السليولوزي',
    roleEn: 'Rigid outer matrix composed of cellulose microfibrils that resists internal turgor osmotic pressure.',
    roleAr: 'طبقة خارجية صلبة توفر دعامة ميكانيكية قوية وتقاوم ضغط الامتلاء الإسموزي الداخلي.',
    foundIn: 'plant',
    sizeNm: '100 - 1,000 nm thick',
  },
];

export const BiologyLab: React.FC = () => {
  const { t, language, isRTL } = useLanguage();
  const [cellType, setCellType] = useState<'plant' | 'animal'>('plant');
  const [selectedOrganelle, setSelectedOrganelle] = useState<Organelle>(ORGANELLES[0]);

  // Rosalind Franklin scientist
  const franklin = REAL_SCIENTISTS.find(s => s.id === 'franklin');
  const availableOrganelles = ORGANELLES.filter(o => o.foundIn === 'both' || o.foundIn === cellType);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16 space-y-6">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-slate-800 pb-5">
        <div>
          <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-teal-500/10 text-teal-400 border border-teal-500/30">
            Interactive Cytology & Molecular Genetics
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white mt-1">{t.biology.title}</h1>
          <p className="text-xs text-slate-400 mt-0.5">{t.biology.subtitle}</p>
        </div>

        {/* Plant vs Animal switcher */}
        <div className="flex items-center space-x-2 bg-slate-900 p-1.5 rounded-xl border border-slate-800">
          <button
            onClick={() => setCellType('plant')}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${
              cellType === 'plant' ? 'bg-emerald-600 text-white shadow' : 'text-slate-400 hover:text-white'
            }`}
          >
            {t.biology.plantCell}
          </button>
          <button
            onClick={() => setCellType('animal')}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${
              cellType === 'animal' ? 'bg-indigo-600 text-white shadow' : 'text-slate-400 hover:text-white'
            }`}
          >
            {t.biology.animalCell}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Interactive Cytological Block Grid (2 cols) */}
        <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-2xl flex flex-col justify-between space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div>
              <h3 className="text-base font-bold text-white">
                {cellType === 'plant' ? 'Plant Cell Cytological Model' : 'Animal Cell Cytological Model'}
              </h3>
              <span className="text-xs text-slate-400">Click any organelle to examine function and dimensions</span>
            </div>
            <span className="px-3 py-1 rounded-full text-[11px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              Eukaryotic
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {availableOrganelles.map((organelle) => {
              const isSelected = selectedOrganelle.id === organelle.id;
              return (
                <button
                  key={organelle.id}
                  onClick={() => setSelectedOrganelle(organelle)}
                  className={`p-4 rounded-xl border text-left transition-all flex flex-col justify-between ${
                    isSelected
                      ? 'bg-emerald-600/20 border-emerald-500 text-white shadow-lg'
                      : 'bg-slate-950 border-slate-800 text-slate-300 hover:bg-slate-800/60'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold">
                      {language === 'ar' ? organelle.nameAr : organelle.nameEn}
                    </span>
                    {isSelected && <Check className="w-3.5 h-3.5 text-emerald-400" />}
                  </div>
                  <span className="text-[10px] text-slate-400 font-mono">{organelle.sizeNm}</span>
                </button>
              );
            })}
          </div>

          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-300 flex items-center justify-between">
            <span>Cell Membrane Potential: -70 mV</span>
            <span className="text-emerald-400 font-mono">ATP Concentration: ~5 mM</span>
          </div>
        </div>

        {/* Organelle Inspector & Rosalind Franklin Card (1 col) */}
        <div className="space-y-6">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
            <div className="border-b border-slate-800 pb-3">
              <span className="text-xs text-slate-400 block uppercase tracking-wider">Organelle Details</span>
              <h3 className="text-xl font-black text-white mt-1">
                {language === 'ar' ? selectedOrganelle.nameAr : selectedOrganelle.nameEn}
              </h3>
            </div>

            <div>
              <span className="text-xs font-semibold text-slate-400 block mb-1">Biological Function</span>
              <p className="text-xs text-slate-200 leading-relaxed bg-slate-950/60 p-3.5 rounded-xl border border-slate-800">
                {language === 'ar' ? selectedOrganelle.roleAr : selectedOrganelle.roleEn}
              </p>
            </div>

            <div className="space-y-2 text-xs">
              <div className="flex justify-between py-1.5 border-b border-slate-800">
                <span className="text-slate-400">Scale Dimensions</span>
                <span className="font-mono text-white">{selectedOrganelle.sizeNm}</span>
              </div>
            </div>
          </div>

          {/* Rosalind Franklin Card */}
          {franklin && (
            <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-3">
              <div className="flex items-center space-x-2 text-teal-400">
                <Award className="w-4 h-4" />
                <h4 className="text-xs font-bold uppercase tracking-wider">Scientific Pioneer</h4>
              </div>
              <div>
                <span className="text-sm font-bold text-white block">{franklin.name}</span>
                <span className="text-[11px] text-slate-400">{franklin.dates} • {franklin.field}</span>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                {language === 'ar' ? franklin.contributionsAr : franklin.contributionsEn}
              </p>
              <span className="text-[10px] text-slate-500 font-mono block">
                {franklin.citation}
              </span>
            </div>
          )}
        </div>

      </div>

    </div>
  );
};
