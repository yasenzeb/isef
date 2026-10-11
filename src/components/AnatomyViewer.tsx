import React, { useState } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { 
  Play, 
  RotateCcw, 
  Search, 
  Layers, 
  Eye, 
  HelpCircle, 
  Download, 
  Check, 
  Compass, 
  Sparkles,
  Maximize2
} from 'lucide-react';

interface AnatomyViewerProps {
  isPresentationMode?: boolean;
}

export const AnatomyViewer: React.FC<AnatomyViewerProps> = ({ isPresentationMode = false }) => {
  const { t, isRTL } = useLanguage();
  const [activeTab, setActiveTab] = useState<'atlas' | 'quiz'>('atlas');
  const [searchFilter, setSearchFilter] = useState('');
  const [selectedStructure, setSelectedStructure] = useState<{
    name: string;
    system: string;
    fma: string;
    latin: string;
    desc: string;
  } | null>({
    name: 'Femur (Left)',
    system: 'Skeletal System',
    fma: 'FMA24474',
    latin: 'Os femoris',
    desc: 'The longest and strongest bone in the human body. Extends from the hip joint to the knee, transmitting weight from the axial skeleton to the lower extremity.',
  });

  const [activeLayers, setActiveLayers] = useState({
    skeletal: true,
    muscular: true,
    cardiovascular: true,
    visceral: true,
    nervous: true,
  });

  // Quiz state
  const [quizIndex, setQuizIndex] = useState(0);
  const [quizScore, setQuizScore] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);

  const quizQuestions = [
    {
      question: 'Which bone is the longest and strongest in the human skeleton?',
      options: ['Femur', 'Humerus', 'Tibia', 'Fibula'],
      correct: 0,
      explanation: 'The femur (thigh bone) is the longest and strongest bone, supporting high biomechanical loads.',
    },
    {
      question: 'Which major organ of the circulatory system pumps deoxygenated blood to the lungs?',
      options: ['Left Atrium', 'Right Ventricle', 'Left Ventricle', 'Aorta'],
      correct: 1,
      explanation: 'The right ventricle pumps oxygen-depleted blood into the pulmonary artery toward the pulmonary capillary bed.',
    },
    {
      question: 'What is the primary anatomical muscle responsible for inspiration during resting breathing?',
      options: ['Pectoralis Major', 'Diaphragm', 'Rectus Abdominis', 'Trapezius'],
      correct: 1,
      explanation: 'The diaphragm contracts and flattens downward, creating negative intrathoracic pressure for lung expansion.',
    },
    {
      question: 'Which lobe of the human cerebrum is primarily responsible for processing visual input?',
      options: ['Frontal Lobe', 'Temporal Lobe', 'Parietal Lobe', 'Occipital Lobe'],
      correct: 3,
      explanation: 'The occipital lobe contains the primary visual cortex (Brodmann area 17/V1).',
    },
  ];

  const handleAnswer = (optionIdx: number) => {
    if (selectedAnswer !== null) return;
    setSelectedAnswer(optionIdx);
    if (optionIdx === quizQuestions[quizIndex].correct) {
      setQuizScore(prev => prev + 1);
    }
  };

  const handleNextQuiz = () => {
    setSelectedAnswer(null);
    if (quizIndex < quizQuestions.length - 1) {
      setQuizIndex(prev => prev + 1);
    } else {
      setQuizIndex(0);
      setQuizScore(0);
    }
  };

  return (
    <div className={`space-y-6 ${isPresentationMode ? 'p-2' : 'max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16'}`}>
      
      {/* Header Info */}
      {!isPresentationMode && (
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-slate-800 pb-5">
          <div>
            <div className="flex items-center space-x-2">
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-rose-500/10 text-rose-400 border border-rose-500/30">
                {t.anatomy.badge}
              </span>
              <span className="text-xs text-slate-400">10,364,730 Triangles • 2,821 Meshes</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white mt-1">{t.anatomy.title}</h1>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={() => setActiveTab('atlas')}
              className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
                activeTab === 'atlas' ? 'bg-indigo-600 text-white shadow-lg' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
              }`}
            >
              3D Interactive Atlas
            </button>
            <button
              onClick={() => setActiveTab('quiz')}
              className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all flex items-center space-x-1.5 ${
                activeTab === 'quiz' ? 'bg-indigo-600 text-white shadow-lg' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
              }`}
            >
              <HelpCircle className="w-4 h-4 text-amber-400" />
              <span>{t.anatomy.quizMode}</span>
            </button>
          </div>
        </div>
      )}

      {/* Main View Area */}
      {activeTab === 'atlas' ? (
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          
          {/* 3D Atlas Frame (Takes 3 columns) */}
          <div className="lg:col-span-3 bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl flex flex-col h-[650px] relative">
            
            {/* Top Toolbar */}
            <div className="bg-slate-950/80 backdrop-blur-md px-4 py-3 border-b border-slate-800 flex items-center justify-between z-10">
              <div className="flex items-center space-x-2">
                <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">{t.anatomy.viewAngle}:</span>
                <span className="px-2 py-1 rounded bg-slate-800 text-[11px] text-slate-300 font-mono">Front / Lateral / Posterior</span>
              </div>

              <div className="flex items-center space-x-2">
                <a
                  href="/anatomy-site/index.html"
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center space-x-1 px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-xs font-semibold text-white shadow transition-colors"
                  title="Open full-screen unbundled atlas in separate tab"
                >
                  <Maximize2 className="w-3.5 h-3.5" />
                  <span>Full Canvas Window</span>
                </a>
              </div>
            </div>

            {/* Embedded Atlas WebGL Canvas Engine */}
            <iframe
              src="/anatomy-site/index.html"
              title="Open Anatomy Atlas High-Fidelity 3D Viewer"
              className="w-full flex-1 border-none bg-slate-950"
              allow="accelerometer; camera; gyroscope; web-share"
            />
          </div>

          {/* Side Inspection Panel (Takes 1 column) */}
          <div className="space-y-6">
            
            {/* Specimen Detail Card */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl">
              <div className="flex items-center justify-between mb-3 border-b border-slate-800 pb-2">
                <h3 className="text-sm font-bold text-white uppercase tracking-wider">{t.anatomy.organDetails}</h3>
                <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-indigo-500/10 text-indigo-400 border border-indigo-500/30">
                  {selectedStructure?.fma}
                </span>
              </div>

              {selectedStructure && (
                <div className="space-y-3 text-sm">
                  <div>
                    <span className="text-xs text-slate-400 block">{t.anatomy.structuresList}</span>
                    <span className="text-base font-bold text-white">{selectedStructure.name}</span>
                  </div>

                  <div>
                    <span className="text-xs text-slate-400 block">{t.anatomy.latinName}</span>
                    <span className="italic text-slate-300 font-serif">{selectedStructure.latin}</span>
                  </div>

                  <div>
                    <span className="text-xs text-slate-400 block">{t.anatomy.system}</span>
                    <span className="text-xs font-semibold text-emerald-400">{selectedStructure.system}</span>
                  </div>

                  <div>
                    <span className="text-xs text-slate-400 block mb-1">{t.anatomy.description}</span>
                    <p className="text-xs text-slate-300 leading-relaxed bg-slate-950/60 p-3 rounded-xl border border-slate-800">
                      {selectedStructure.desc}
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* System Visibility Filters */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-3">
              <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-2">{t.anatomy.layers}</h3>
              
              <div className="space-y-2">
                {[
                  { key: 'skeletal', label: t.anatomy.bones, color: 'text-amber-200' },
                  { key: 'muscular', label: t.anatomy.muscles, color: 'text-rose-400' },
                  { key: 'cardiovascular', label: t.anatomy.vessels, color: 'text-red-400' },
                  { key: 'visceral', label: t.anatomy.organs, color: 'text-purple-400' },
                  { key: 'nervous', label: t.anatomy.nerves, color: 'text-yellow-400' },
                ].map((layer) => (
                  <label key={layer.key} className="flex items-center justify-between p-2 rounded-xl bg-slate-950/40 hover:bg-slate-800/60 cursor-pointer border border-slate-800/80 transition-colors">
                    <span className={`text-xs font-medium ${layer.color}`}>{layer.label}</span>
                    <input
                      type="checkbox"
                      checked={activeLayers[layer.key as keyof typeof activeLayers]}
                      onChange={() => setActiveLayers(prev => ({
                        ...prev,
                        [layer.key]: !prev[layer.key as keyof typeof activeLayers]
                      }))}
                      className="rounded bg-slate-800 border-slate-700 text-indigo-600 focus:ring-0"
                    />
                  </label>
                ))}
              </div>
            </div>

          </div>

        </div>
      ) : (
        /* Quiz Mode */
        <div className="max-w-3xl mx-auto bg-slate-900 border border-slate-800 rounded-3xl p-8 shadow-2xl space-y-6">
          <div className="flex items-center justify-between border-b border-slate-800 pb-4">
            <div className="flex items-center space-x-3">
              <div className="p-2.5 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
                <HelpCircle className="w-6 h-6" />
              </div>
              <div className={isRTL ? "mr-3 text-right" : ""}>
                <h3 className="text-lg font-bold text-white">{t.anatomy.quizMode}</h3>
                <span className="text-xs text-slate-400">
                  {t.quiz.question} {quizIndex + 1} of {quizQuestions.length}
                </span>
              </div>
            </div>

            <div className="text-right">
              <span className="text-xs text-slate-400 block">{t.anatomy.score}</span>
              <span className="text-xl font-bold text-emerald-400">{quizScore} / {quizQuestions.length}</span>
            </div>
          </div>

          <div className="space-y-4">
            <h4 className="text-base font-semibold text-white leading-relaxed">
              {quizQuestions[quizIndex].question}
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
              {quizQuestions[quizIndex].options.map((option, idx) => {
                const isSelected = selectedAnswer === idx;
                const isCorrect = idx === quizQuestions[quizIndex].correct;
                
                let btnStyle = "bg-slate-800 border-slate-700 text-slate-200 hover:bg-slate-700/80";
                if (selectedAnswer !== null) {
                  if (isCorrect) btnStyle = "bg-emerald-600 border-emerald-500 text-white";
                  else if (isSelected) btnStyle = "bg-rose-600 border-rose-500 text-white";
                }

                return (
                  <button
                    key={idx}
                    onClick={() => handleAnswer(idx)}
                    disabled={selectedAnswer !== null}
                    className={`p-4 rounded-xl border text-sm font-semibold text-left transition-all ${btnStyle}`}
                  >
                    <div className="flex items-center justify-between">
                      <span>{option}</span>
                      {selectedAnswer !== null && isCorrect && <Check className="w-4 h-4 text-white" />}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {selectedAnswer !== null && (
            <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-3 animate-fade-in">
              <div className="flex items-center space-x-2">
                <span className={`text-xs font-bold uppercase tracking-wider ${
                  selectedAnswer === quizQuestions[quizIndex].correct ? "text-emerald-400" : "text-rose-400"
                }`}>
                  {selectedAnswer === quizQuestions[quizIndex].correct ? t.quiz.correct : t.quiz.incorrect}
                </span>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                {quizQuestions[quizIndex].explanation}
              </p>
              <button
                onClick={handleNextQuiz}
                className="w-full py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition-colors"
              >
                {quizIndex < quizQuestions.length - 1 ? t.quiz.nextQuestion : t.quiz.restart}
              </button>
            </div>
          )}
        </div>
      )}

    </div>
  );
};
