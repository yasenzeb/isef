import React, { useState } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { getFullPeriodicElements, ChemicalElement } from '../data/periodicTableData';
import { Search, Filter, Info, Sparkles, Atom } from 'lucide-react';

export const ChemistryLab: React.FC = () => {
  const { t, language, isRTL } = useLanguage();
  const elements = getFullPeriodicElements();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedElement, setSelectedElement] = useState<ChemicalElement>(elements[0]);

  // Filtering
  const filteredElements = elements.filter(el => {
    const matchesCategory = selectedCategory === 'all' || el.category === selectedCategory;
    const matchesSearch = 
      el.nameEn.toLowerCase().includes(searchQuery.toLowerCase()) ||
      el.nameAr.includes(searchQuery) ||
      el.symbol.toLowerCase().includes(searchQuery.toLowerCase()) ||
      el.number.toString() === searchQuery.trim();
    return matchesCategory && matchesSearch;
  });

  const categoryColors: Record<ChemicalElement['category'], { bg: string; text: string; border: string }> = {
    'alkali-metal': { bg: 'bg-rose-500/20', text: 'text-rose-300', border: 'border-rose-500/40' },
    'alkaline-earth': { bg: 'bg-orange-500/20', text: 'text-orange-300', border: 'border-orange-500/40' },
    'transition-metal': { bg: 'bg-amber-500/20', text: 'text-amber-300', border: 'border-amber-500/40' },
    'post-transition': { bg: 'bg-emerald-500/20', text: 'text-emerald-300', border: 'border-emerald-500/40' },
    'metalloid': { bg: 'bg-teal-500/20', text: 'text-teal-300', border: 'border-teal-500/40' },
    'nonmetal': { bg: 'bg-sky-500/20', text: 'text-sky-300', border: 'border-sky-500/40' },
    'noble-gas': { bg: 'bg-purple-500/20', text: 'text-purple-300', border: 'border-purple-500/40' },
    'lanthanide': { bg: 'bg-pink-500/20', text: 'text-pink-300', border: 'border-pink-500/40' },
    'actinide': { bg: 'bg-fuchsia-500/20', text: 'text-fuchsia-300', border: 'border-fuchsia-500/40' },
  };

  const getLocalizedName = (el: ChemicalElement) => {
    if (language === 'ar') return el.nameAr;
    if (language === 'fr') return el.nameFr;
    if (language === 'de') return el.nameDe;
    return el.nameEn;
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16 space-y-6">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-slate-800 pb-5">
        <div>
          <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
            All 118 Elements
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white mt-1">{t.chemistry.title}</h1>
          <p className="text-xs text-slate-400 mt-0.5">{t.chemistry.subtitle}</p>
        </div>

        {/* Search & Category Filter */}
        <div className="flex flex-wrap items-center gap-2">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={t.chemistry.searchPlaceholder}
              className={`bg-slate-900 border border-slate-700 rounded-xl py-2 text-xs text-white focus:outline-none focus:border-emerald-500 ${
                isRTL ? "pr-8 text-right" : "pl-9"
              }`}
            />
          </div>

          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none"
          >
            <option value="all">{t.chemistry.allCategories}</option>
            <option value="alkali-metal">{t.chemistry.alkaliMetal}</option>
            <option value="alkaline-earth">{t.chemistry.alkalineEarth}</option>
            <option value="transition-metal">{t.chemistry.transitionMetal}</option>
            <option value="post-transition">{t.chemistry.postTransition}</option>
            <option value="metalloid">{t.chemistry.metalloid}</option>
            <option value="nonmetal">{t.chemistry.nonmetal}</option>
            <option value="noble-gas">{t.chemistry.nobleGas}</option>
            <option value="lanthanide">{t.chemistry.lanthanide}</option>
            <option value="actinide">{t.chemistry.actinide}</option>
          </select>
        </div>
      </div>

      {/* Main View: Grid + Element Detail Inspector */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Periodic Table Grid (2 cols) */}
        <div className="lg:col-span-2 bg-slate-900/60 border border-slate-800 rounded-2xl p-4 shadow-2xl overflow-x-auto">
          <div className="grid grid-cols-6 sm:grid-cols-9 md:grid-cols-12 gap-1.5 min-w-[500px]">
            {filteredElements.map((el) => {
              const cat = categoryColors[el.category];
              const isSelected = selectedElement.number === el.number;
              return (
                <button
                  key={el.number}
                  onClick={() => setSelectedElement(el)}
                  className={`flex flex-col items-center justify-center p-2 rounded-xl border transition-all text-center relative ${
                    cat.bg
                  } ${cat.border} ${
                    isSelected ? 'ring-2 ring-emerald-400 scale-105 z-10 shadow-lg' : 'hover:scale-102 hover:border-slate-400'
                  }`}
                >
                  <span className="text-[9px] font-mono text-slate-400 absolute top-1 left-1.5">{el.number}</span>
                  <span className={`text-base font-black ${cat.text} mt-2`}>{el.symbol}</span>
                  <span className="text-[10px] text-slate-200 truncate max-w-full font-medium">
                    {getLocalizedName(el)}
                  </span>
                  <span className="text-[8px] font-mono text-slate-400 mt-0.5">{el.atomicMass}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Selected Element Detail Inspector (1 col) */}
        <div className="space-y-6">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-5">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div>
                <span className="text-3xl font-black text-white">{selectedElement.symbol}</span>
                <h3 className="text-lg font-bold text-emerald-400">{getLocalizedName(selectedElement)}</h3>
              </div>
              <div className="text-right">
                <span className="text-xs text-slate-400 block">{t.chemistry.atomicNumber}</span>
                <span className="text-2xl font-mono font-bold text-white">#{selectedElement.number}</span>
              </div>
            </div>

            {/* Properties table */}
            <div className="space-y-2.5 text-xs">
              <div className="flex justify-between py-1 border-b border-slate-800/60">
                <span className="text-slate-400">{t.chemistry.atomicMass}</span>
                <span className="font-mono text-white">{selectedElement.atomicMass} u</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-800/60">
                <span className="text-slate-400">{t.chemistry.electronConfig}</span>
                <span className="font-mono text-emerald-400">{selectedElement.electronConfig}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-800/60">
                <span className="text-slate-400">{t.chemistry.electronegativity}</span>
                <span className="font-mono text-white">{selectedElement.electronegativity ?? 'N/A'}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-800/60">
                <span className="text-slate-400">{t.chemistry.group} / {t.chemistry.period}</span>
                <span className="font-mono text-white">Group {selectedElement.group}, Period {selectedElement.period}</span>
              </div>
            </div>

            {/* Scientific Overview */}
            <div className="space-y-2">
              <span className="text-xs font-bold text-slate-300 uppercase tracking-wider block">{t.chemistry.summary}</span>
              <p className="text-xs text-slate-300 leading-relaxed bg-slate-950/60 p-3 rounded-xl border border-slate-800">
                {language === 'ar' ? selectedElement.summaryAr : selectedElement.summaryEn}
              </p>
            </div>

            {/* Occurrence and Uses */}
            <div className="space-y-2">
              <span className="text-xs font-bold text-slate-300 uppercase tracking-wider block">Common Uses & Applications</span>
              <p className="text-xs text-slate-300 leading-relaxed bg-slate-950/60 p-3 rounded-xl border border-slate-800">
                {language === 'ar' ? selectedElement.commonUsesAr : selectedElement.commonUsesEn}
              </p>
            </div>

            {/* Educational Disclaimer */}
            <div className="flex items-start space-x-2 text-[11px] text-slate-400 bg-slate-950/80 p-3 rounded-xl border border-slate-800/60">
              <Info className="w-4 h-4 text-sky-400 shrink-0 mt-0.5" />
              <p className={isRTL ? "mr-2 text-right" : ""}>{t.chemistry.modelDisclaimer}</p>
            </div>
          </div>
        </div>

      </div>

    </div>
  );
};
