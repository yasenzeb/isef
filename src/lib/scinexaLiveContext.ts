/**
 * scinexaLiveContext.ts — مجمّع السياق الحي اللحظي لمنصة ساينكسا
 * يربط معمل الفيزياء، الكيمياء، والتشريح بداروين (Fish Audio) لحظياً
 *
 * © Islam & Yaseen — SciNexa ISEF 2026
 */

import { getRegisteredStudentInfo } from './userStorage';

export interface PhysicsLiveState {
  activeModule: 'circuits' | 'forces' | 'projectiles' | 'optics' | 'waves';
  voltage?: number;
  resistance?: number;
  current?: number;
  switchClosed?: boolean;
  hasCurrent?: boolean;
  isShortCircuit?: boolean;
  componentCount?: number;
}

export interface ChemistryLiveState {
  selectedReagents: string[];
  reagentNamesAr: string[];
  reactionEquation?: string;
  reactionNameAr?: string;
  flameActive?: boolean;
  temperature?: number;
  isReacting?: boolean;
  reactionCompleted?: boolean;
  selectedElement?: {
    symbol: string;
    nameAr: string;
    nameEn: string;
    number: number;
    atomicMass: number;
    category: string;
  };
}

export interface AnatomyLiveState {
  selectedPartId?: string;
  nameAr?: string;
  nameEn?: string;
  systemLayer?: string;
  descriptionAr?: string;
  clinicalNoteAr?: string;
}

export interface ScinexaGlobalLiveContext {
  currentLab: 'physics' | 'chemistry' | 'anatomy' | 'astronomy' | 'geology' | 'biology' | 'math' | 'classroom' | 'dashboard' | 'other';
  physics: PhysicsLiveState;
  chemistry: ChemistryLiveState;
  anatomy: AnatomyLiveState;
  lastUpdated: number;
}

const globalContext: ScinexaGlobalLiveContext = {
  currentLab: 'dashboard',
  physics: {
    activeModule: 'circuits',
    voltage: 9,
    resistance: 10,
    current: 0.9,
    switchClosed: true,
    hasCurrent: true,
    isShortCircuit: false,
    componentCount: 3,
  },
  chemistry: {
    selectedReagents: ['Zn', 'HCl'],
    reagentNamesAr: ['خارصين (Zn)', 'حمض الهيدروكلوريك (HCl)'],
    reactionEquation: 'Zn + 2HCl → ZnCl₂ + H₂↑',
    reactionNameAr: 'تفاعل إحلال بسيط وتصاعد غاز الهيدروجين',
    flameActive: false,
    temperature: 25,
    isReacting: false,
    reactionCompleted: false,
  },
  anatomy: {
    selectedPartId: 'femur',
    nameAr: 'عظم الفخذ (Femur)',
    nameEn: 'Femur',
    systemLayer: 'skeletal',
    descriptionAr: 'أطول وأثقل وأقوى عظم في جسم الإنسان، ينقل وزن الجسم بين مفصلي الورك والركبة.',
  },
  lastUpdated: Date.now(),
};

// Expose on window for live browser inspection
if (typeof window !== 'undefined') {
  (window as any).__SCINEXA_LIVE_CONTEXT__ = globalContext;
}

export function updateCurrentLab(lab: ScinexaGlobalLiveContext['currentLab']) {
  globalContext.currentLab = lab;
  globalContext.lastUpdated = Date.now();
  dispatchUpdate();
}

export function updatePhysicsState(partial: Partial<PhysicsLiveState>) {
  globalContext.physics = { ...globalContext.physics, ...partial };
  globalContext.currentLab = 'physics';
  globalContext.lastUpdated = Date.now();
  dispatchUpdate();
}

export function updateChemistryState(partial: Partial<ChemistryLiveState>) {
  globalContext.chemistry = { ...globalContext.chemistry, ...partial };
  globalContext.currentLab = 'chemistry';
  globalContext.lastUpdated = Date.now();
  dispatchUpdate();
}

export function updateAnatomyState(partial: Partial<AnatomyLiveState>) {
  globalContext.anatomy = { ...globalContext.anatomy, ...partial };
  globalContext.currentLab = 'anatomy';
  globalContext.lastUpdated = Date.now();
  dispatchUpdate();
}

function dispatchUpdate() {
  if (typeof window !== 'undefined') {
    // 1. Sync dynamic-variables to Fish Audio agent widget
    try {
      const agent = document.querySelector('fish-agent');
      if (agent) {
        let selectedItem = '';
        let itemDetails = '';
        let currentLabName = '';

        if (globalContext.currentLab === 'chemistry') {
          currentLabName = 'معمل الكيمياء والتفاعلات';
          selectedItem = globalContext.chemistry.reagentNamesAr.join(' + ') || 'دورق التفاعلات';
          itemDetails = `${globalContext.chemistry.reactionNameAr || ''} - ${globalContext.chemistry.reactionEquation || ''} (حرارة: ${globalContext.chemistry.temperature || 25}°C)`;
        } else if (globalContext.currentLab === 'physics') {
          currentLabName = 'مختبر الفيزياء والدوائر';
          selectedItem = globalContext.physics.switchClosed ? 'دائرة مغلقة نشطة' : 'دائرة مفتوحة';
          itemDetails = `الجهد: ${globalContext.physics.voltage}V، المقاومة: ${globalContext.physics.resistance}Ω، التيار: ${globalContext.physics.current}A، شورت سيركت: ${globalContext.physics.isShortCircuit ? 'نعم خطر' : 'لا مستقرة'}`;
        } else if (globalContext.currentLab === 'anatomy') {
          currentLabName = 'أطلس التشريح الطبي 3D';
          selectedItem = globalContext.anatomy.nameAr || 'عظم الفخذ';
          itemDetails = globalContext.anatomy.descriptionAr || '';
        }

        const studentInfo = getRegisteredStudentInfo();
        const vars = {
          current_lab: currentLabName,
          selected_item: selectedItem,
          item_details: itemDetails,
          student_name: studentInfo.realName,
          student_grade: studentInfo.gradeArabic,
          student_greeting: studentInfo.greetingPhraseAr,
        };
        agent.setAttribute('dynamic-variables', JSON.stringify(vars));
      }
    } catch {}

    // 2. Synchronize to local/remote lab-status API endpoint to prevent HTTP 405 on Fish Audio tool calls
    try {
      const studentInfo = getRegisteredStudentInfo();
      const payload = {
        current_lab: globalContext.currentLab,
        selected_part: globalContext.anatomy.nameAr || 'عظم لوح الكتف (Scapula)',
        name_ar: globalContext.anatomy.nameAr || 'عظم لوح الكتف',
        name_en: globalContext.anatomy.nameEn || 'Scapula',
        system_layer: globalContext.anatomy.systemLayer || 'الهيكل العظمي',
        description_ar: globalContext.anatomy.descriptionAr || '',
        clinical_note_ar: globalContext.anatomy.clinicalNoteAr || '',
        student_name: studentInfo.realName,
        student_grade: studentInfo.gradeArabic,
        greeting: studentInfo.greetingPhraseAr,
        physics: globalContext.physics,
        chemistry: globalContext.chemistry,
      };
      void fetch('/api/lab-status', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      }).catch(() => {});
    } catch {}

    window.dispatchEvent(
      new CustomEvent('scinexa:live_context_changed', { detail: globalContext })
    );
  }
}

export function getGlobalLiveContext(): ScinexaGlobalLiveContext {
  return globalContext;
}

/**
 * Returns a natural, accurate scientific Arabic summary of the active simulation
 */
export function getFormattedLiveContextArabic(): string {
  const c = globalContext;
  const path = typeof window !== 'undefined' ? window.location.pathname : '';

  if (path.includes('/labs/physics') || c.currentLab === 'physics') {
    const p = c.physics;
    if (p.isShortCircuit) {
      return `تنبيه فيزيائي عاجل: الدائرة الكهربائية الحالية بها قفلة (Short Circuit) لانعدام المقاومة، مما يسبب سريان تيار لانهائي وخطر احتراق المكونات!`;
    }
    const switchText = p.switchClosed ? 'المفتاح مغلق والتيار يسري' : 'المفتاح مفتوح والدائرة متوقفة';
    const v = p.voltage ?? 9;
    const r = p.resistance ?? 10;
    const i = (p.current ?? (v / (r || 1))).toFixed(2);
    return `فحص مختبر الفيزياء (الدوائر الكهربائية): ${switchText}. فرق الجهد: ${v} فولت، المقاومة: ${r} أوم، شدة التيار المحسوبة طبقاً لقانون أوم (I = V/R): ${i} أمبير. القدرة المستهلكة (P = V × I): ${(v * parseFloat(i)).toFixed(2)} واط. الدائرة مستقرة وآمنة.`;
  }

  if (path.includes('/labs/chemistry') || c.currentLab === 'chemistry') {
    const ch = c.chemistry;
    const reagents = ch.reagentNamesAr.length > 0 ? ch.reagentNamesAr.join(' مع ') : 'دورق فارغ';
    const flame = ch.flameActive ? 'موقد بنزن مشتعل' : 'الموقد مطفأ (درجة حرارة الغرفة)';
    const eq = ch.reactionEquation ? `المعادلة الكيميائية: ${ch.reactionEquation}.` : '';
    const name = ch.reactionNameAr ? `نوع التفاعل: ${ch.reactionNameAr}.` : '';
    return `فحص معمل الكيمياء والتفاعلات: محتويات الدورق حالياً تتضمن [${reagents}]. حالة اللهب: ${flame} (درجة الحرارة: ${ch.temperature || 25}°C). ${name} ${eq}`;
  }

  if (path.includes('/labs/anatomy') || c.currentLab === 'anatomy') {
    const a = c.anatomy;
    const part = a.nameAr || 'عظم الفخذ';
    const desc = a.descriptionAr || '';
    return `فحص أطلس التشريح الطبي 3D: العضو أو العظمة المحددة حالياً على الشاشة هي [${part}]. الوصف التشريحي والوظيفي: ${desc}`;
  }


  if (path.includes('/labs/math') || c.currentLab === 'math') {
    return `فحص معمل الرياضيات والهندسة: المستوى الإحداثي التفاعلي، جداول الدوال، قوانين الميل، وبراهين فيثاغورس وإقليدس جاهزة للتطبيق والحساب المباشر بالخطوات.`;
  }
  return `المنصة تعمل حالياً في وضع الاستكشاف العام. افتح أي معمل لاختبار التفاعلات والدوائر والأعضاء وسأقوم بفحصها لك لحظة بلحظة!`;
}
