import React, { useState } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { Dna, Activity, Sun, Layers, Info, Check, RefreshCw } from 'lucide-react';

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
    roleEn: 'Repository of genetic material (DNA); coordinates gene transcription and cellular replication.',
    roleAr: 'مستودع المادة الوراثية (DNA)؛ تدير نسخ الجينات وانقسام وتكاثر الخلية.',
    foundIn: 'both',
    sizeNm: '5,000 - 10,000 nm',
  },
  {
    id: 'mitochondria',
    nameEn: 'Mitochondrion',
    nameAr: 'الميتوكوندريا',
    roleEn: 'Powerhouse of the cell; produces ATP via oxidative phosphorylation and the Krebs cycle.',
    roleAr: 'محطة توليد الطاقة في الخلية؛ تنتج جزيئات ATP عبر الفسفرة التأكسدية ودورة كريبس.',
    foundIn: 'both',
    sizeNm: '500 - 1,000 nm',
  },
  {
    id: 'chloroplast',
    nameEn: 'Chloroplast',
    nameAr: 'البلاستيدات الخضراء',
    roleEn: 'Site of photosynthesis; harnesses solar photons via chlorophyll pigments to synthesize glucose.',
    roleAr: 'مقر عملية البناء الضوئي؛ تحول الطاقة الضوئية للكلوروفيل إلى طاقة كيميائية في الجلوكوز.',
    foundIn: 'plant',
    sizeNm: '2,000 - 5,000 nm',
  },
  {
    id: 'ribosome',
    nameEn: 'Ribosome',
    nameAr: 'الريبوسوم',
    roleEn: 'Molecular factory translating messenger RNA transcripts into polypeptide amino acid chains.',
    roleAr: 'المصنع الجزيئي الذي يترجم شفرة mRNA إلى سلاسل ببتيدية وبروتينات وظيفية.',
    foundIn: 'both',
    sizeNm: '20 - 30 nm',
  },
  {
    id: 'endoplasmic_reticulum',
    nameEn: 'Endoplasmic Reticulum (Rough & Smooth)',
    nameAr: 'الشبكة الإندوبلازمية (الخشنة والملساء)',
    roleEn: 'Protein folding (rough ER with ribosomes) and lipid biosynthesis / detoxification (smooth ER).',
    roleAr: 'طي البروتينات (الخشنة المحتوية على ريبوسومات) وتخليق الدهون وإزالة السموم (الملساء).',
    foundIn: 'both',
    sizeNm: 'Variable membranous tubules',
  },
  {
    id: 'golgi',
    nameEn: 'Golgi Apparatus',
    nameAr: 'جهاز جولجي',
    roleEn: 'Post-translational modification, packaging, and vesicular sorting of cellular macromolecules.',
    roleAr: 'تعديل البروتينات بعد الترجمة، وتعبئتها في حويصلات إفرازية وتوزيعها داخل الخلية وخارجها.',
    foundIn: 'both',
    sizeNm: '1,000 - 2,000 nm',
  },
  {
    id: 'cell_wall',
    nameEn: 'Cellulose Cell Wall',
    nameAr: 'الجدار الخلوي السليولوزي',
    roleEn: 'Rigid outer layer offering structural tensile strength and resisting turgor osmotic pressure.',
    roleAr: 'طبقة خارجية صلبة توفر دعامة ميكانيكية قوية وتقاوم ضغط الامتلاء الإسموزي الداخلي.',
    foundIn: 'plant',
    sizeNm: '100 - 1,000 nm thick',
  },
];

export const BiologyLab: React.FC = () => {
  const { t, language, isRTL } = useLanguage();
  const [cellType, setCellType] = useState<'plant' | 'animal'>('plant');
  const [selectedOrganelle, setSelectedOrganelle] = useState<Organelle>(ORGANELLES[0]);

  // Filter organelles by cell type
  const availableOrganelles = ORGANELLES.filter(o => o.foundIn === 'both' || o.foundIn === cellType);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16 space-y-6">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-slate-800 pb-5">
        <div>
          <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-teal-500/10 text-teal-400 border border-teal-500/30">
            Interactive Cytology & Physiology
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

      {/* Main Cytology Workspace */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Visual Cell Map (2 cols) */}
        <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-2xl flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4 border-b border-slate-800 pb-3">
            <div>
              <h3 className="text-base font-bold text-white">
                {cellType === 'plant' ? 'Plant Cell Cytological Model' : 'Animal Cell Cytological Model'}
              </h3>
              <span className="text-xs text-slate-400">Click any organelle below to inspect ultrastructure</span>
            </div>

            <span className="px-3 py-1 rounded-full text-[11px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              Eukaryotic
            </span>
          </div>

          {/* Interactive Organelle Diagram Blocks */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 my-4">
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

        {/* Organelle Inspector (1 col) */}
        <div className="space-y-6">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
            <div className="border-b border-slate-800 pb-3">
              <span className="text-xs text-slate-400 block uppercase tracking-wider">{t.biology.organelleDetails}</span>
              <h3 className="text-xl font-black text-white mt-1">
                {language === 'ar' ? selectedOrganelle.nameAr : selectedOrganelle.nameEn}
              </h3>
              <span className="text-xs text-emerald-400 font-serif italic block mt-0.5">
                {selectedOrganelle.nameEn}
              </span>
            </div>

            <div>
              <span className="text-xs font-semibold text-slate-400 block mb-1">{t.biology.function}</span>
              <p className="text-xs text-slate-200 leading-relaxed bg-slate-950/60 p-3.5 rounded-xl border border-slate-800">
                {language === 'ar' ? selectedOrganelle.roleAr : selectedOrganelle.roleEn}
              </p>
            </div>

            <div className="space-y-2 text-xs">
              <div className="flex justify-between py-1.5 border-b border-slate-800">
                <span className="text-slate-400">Dimensions</span>
                <span className="font-mono text-white">{selectedOrganelle.sizeNm}</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-slate-800">
                <span className="text-slate-400">Distribution</span>
                <span className="font-mono text-white capitalize">{selectedOrganelle.foundIn} Eukaryotes</span>
              </div>
            </div>
          </div>
        </div>

      </div>

    </div>
  );
};
