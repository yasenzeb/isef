import React, { useState, useEffect } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { EGYPT_GOVERNORATES, GovernorateData } from '../data/egyptLocationData';
import { MapPin, X, Check, Info } from 'lucide-react';

interface EgyptLocationModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const EgyptLocationModal: React.FC<EgyptLocationModalProps> = ({ isOpen, onClose }) => {
  const { t, isRTL } = useLanguage();
  
  const [selectedGovId, setSelectedGovId] = useState<string>(() => {
    return localStorage.getItem('scinexa_gov_id') || localStorage.getItem('isef_gov_id') || 'cairo';
  });

  const [selectedAdminId, setSelectedAdminId] = useState<string>(() => {
    return localStorage.getItem('scinexa_admin_id') || localStorage.getItem('isef_admin_id') || 'cairo-east-nasr';
  });

  const [savedSuccess, setSavedSuccess] = useState(false);

  const currentGov = EGYPT_GOVERNORATES.find(g => g.id === selectedGovId) || EGYPT_GOVERNORATES[0];

  useEffect(() => {
    // When gov changes, ensure admin is valid
    if (!currentGov.administrations.some(a => a.id === selectedAdminId)) {
      setSelectedAdminId(currentGov.administrations[0]?.id || '');
    }
  }, [selectedGovId, currentGov, selectedAdminId]);

  if (!isOpen) return null;

  const handleSave = () => {
    localStorage.setItem('scinexa_gov_id', selectedGovId);
    localStorage.setItem('scinexa_admin_id', selectedAdminId);
    setSavedSuccess(true);
    setTimeout(() => {
      setSavedSuccess(false);
      onClose();
    }, 800);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-lg w-full p-6 shadow-2xl relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center space-x-3 mb-4">
          <div className="p-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
            <MapPin className="w-6 h-6" />
          </div>
          <div className={isRTL ? "mr-3 text-right" : ""}>
            <h3 className="text-lg font-bold text-white">{t.egyptLocation.title}</h3>
            <p className="text-xs text-slate-400">{t.egyptLocation.detectedGovernorate}</p>
          </div>
        </div>

        <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-3.5 mb-5 flex items-start space-x-2 text-xs text-slate-300">
          <Info className="w-4 h-4 text-sky-400 shrink-0 mt-0.5" />
          <p className={isRTL ? "mr-2 text-right" : ""}>{t.egyptLocation.note}</p>
        </div>

        <div className="space-y-4">
          {/* Governorate Selection */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
              {t.egyptLocation.detectedGovernorate} (المحافظة)
            </label>
            <select
              value={selectedGovId}
              onChange={(e) => setSelectedGovId(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-indigo-500"
            >
              {EGYPT_GOVERNORATES.map((g) => (
                <option key={g.id} value={g.id}>
                  {g.nameEn} — {g.nameAr} ({g.region})
                </option>
              ))}
            </select>
          </div>

          {/* Educational Administration Selection */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
              {t.egyptLocation.selectAdministration}
            </label>
            <select
              value={selectedAdminId}
              onChange={(e) => setSelectedAdminId(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-indigo-500"
            >
              {currentGov.administrations.map((a) => (
                <option key={a.id} value={a.id}>
                  {a.nameAr} ({a.nameEn})
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="mt-6 flex items-center justify-end space-x-3 pt-4 border-t border-slate-800">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-sm font-medium text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={savedSuccess}
            className="flex items-center space-x-2 px-5 py-2 rounded-xl text-sm font-semibold bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-600/20 transition-all"
          >
            {savedSuccess ? (
              <>
                <Check className="w-4 h-4" />
                <span>Saved!</span>
              </>
            ) : (
              <span>{t.egyptLocation.save}</span>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
