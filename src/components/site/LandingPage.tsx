import { LanguageSelector } from '../ui/LanguageSelector';
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useLanguage } from '../../context/LanguageContext';
import { useSession } from '../../context/SessionContext';
import { LAB_MODULES, type LabModule } from '../../data/labs';
import {
  Activity,
  Atom,
  FlaskConical,
  Dna,
  Globe2,
  Sparkles,
  ArrowRight,
  ArrowUpRight,
  BookOpen,
  Users,
  ShieldCheck,
  WifiOff,
  Check,
  Play,
  GraduationCap,
  Presentation,
} from 'lucide-react';
import { BrandMark, Wordmark } from '../ui/Brand';

const ICONS: Record<string, React.ComponentType<{ size?: number; strokeWidth?: number; className?: string }>> = {
  anatomy: Activity,
  physics: Atom,
  chemistry: FlaskConical,
  biology: Dna,
  geology: Globe2,
  astronomy: Sparkles,
};

const SectionLabel: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <span className="sn-eyebrow">{children}</span>
);

interface NavLinkItem {
  href: string;
  en: string;
  ar: string;
  fr: string;
  de: string;
  ja: string;
}

const NAV_LINKS: NavLinkItem[] = [
  { href: '#labs', en: 'Labs', ar: 'المعامل', fr: 'Laboratoires', de: 'Labore', ja: '実験室' },
  { href: '#curriculum', en: 'Curriculum', ar: 'المناهج', fr: 'Programmes', de: 'Lehrplan', ja: 'カリキュラム' },
  { href: '#roles', en: 'For schools', ar: 'للمدارس', fr: 'Pour les écoles', de: 'Für Schulen', ja: '学校・教育機関' },
  { href: '#offline', en: 'Offline', ar: 'بدون إنترنت', fr: 'Hors ligne', de: 'Offline', ja: 'オフライン' },
];

const LandingHeader: React.FC<{ signedIn: boolean }> = ({ signedIn }) => {
  const { language } = useLanguage();
  const [open, setOpen] = useState(false);
  const ar = language === 'ar';

  const getLinkText = (l: NavLinkItem) => {
    if (language === 'ja') return l.ja;
    if (language === 'fr') return l.fr;
    if (language === 'de') return l.de;
    if (language === 'ar') return l.ar;
    return l.en;
  };

  const signInText =
    language === 'ja'
      ? 'ログイン'
      : language === 'fr'
        ? 'Connexion'
        : language === 'de'
          ? 'Anmelden'
          : ar
            ? 'تسجيل الدخول'
            : 'Sign in';

  const actionText = signedIn
    ? language === 'ja'
      ? 'ダッシュボード'
      : language === 'fr'
        ? 'Tableau de bord'
        : language === 'de'
          ? 'Dashboard'
          : ar
            ? 'لوحة التحكم'
            : 'Dashboard'
    : language === 'ja'
      ? '無料で始める'
      : language === 'fr'
        ? 'Commencer'
        : language === 'de'
          ? 'Kostenlos starten'
          : ar
            ? 'ابدأ مجانًا'
            : 'Start free';

  return (
    <header className="sticky top-0 z-40 border-b border-[#e5e5e5] bg-white/85 backdrop-blur-xl">
      <div className="sn-shell flex h-16 items-center justify-between gap-4">
        <Link to="/" aria-label="SciNexa home">
          <Wordmark compact />
        </Link>

        <nav className="hidden items-center gap-7 md:flex" aria-label={ar ? 'التنقل الرئيسي' : 'Main navigation'}>
          {NAV_LINKS.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="text-[13px] font-medium text-[#737373] transition-colors hover:text-[#0a0a0a]"
            >
              {getLinkText(link)}
            </a>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <LanguageSelector compact />
          {!signedIn && (
            <Link to="/sign-in" className="hidden sn-btn sn-btn-ghost sn-btn-sm sm:inline-flex">
              {signInText}
            </Link>
          )}
          <Link to={signedIn ? '/app' : '/sign-up'} className="sn-btn sn-btn-primary sn-btn-sm">
            {actionText}
          </Link>
          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            className="sn-btn sn-btn-quiet sn-btn-sm md:hidden"
            aria-label={ar ? 'القائمة' : 'Menu'}
            aria-expanded={open}
          >
            <span className="flex flex-col gap-[3px]">
              <span className="h-[1.5px] w-4 bg-current" />
              <span className="h-[1.5px] w-4 bg-current" />
              <span className="h-[1.5px] w-4 bg-current" />
            </span>
          </button>
        </div>
      </div>
      {open && (
        <div className="border-t border-[#e5e5e5] bg-white md:hidden">
          <nav className="sn-shell flex flex-col py-2" aria-label={ar ? 'قائمة الجوال' : 'Mobile navigation'}>
            {NAV_LINKS.map((link) => (
              <a
                key={link.href}
                href={link.href}
                onClick={() => setOpen(false)}
                className="rounded-[10px] px-3 py-2.5 text-sm font-medium text-[#171717] hover:bg-[#f5f5f5]"
              >
                {getLinkText(link)}
              </a>
            ))}
            <Link to="/sign-in" className="rounded-[10px] px-3 py-2.5 text-sm font-medium text-[#171717] hover:bg-[#f5f5f5]">
              {signInText}
            </Link>
          </nav>
        </div>
      )}
    </header>
  );
};

const InteractiveLabsShowcase: React.FC<{ onOpenLab: (id: string) => void }> = ({ onOpenLab }) => {
  const { language } = useLanguage();
  const ar = language === 'ar';

  const badgeText =
    language === 'ja'
      ? '6実験室が稼働中'
      : language === 'fr'
        ? '6 LABOS EN DIRECT'
        : language === 'de'
          ? '6 LABORE LIVE'
          : ar
            ? '٦ معامل مباشرة'
            : '6 LABS LIVE';

  const assistantNotice =
    language === 'ja'
      ? 'Darwin AI 音声アシスタント（Fish Audio）がサポートします'
      : language === 'fr'
        ? 'Assistant vocal Darwin AI (Fish Audio) disponible'
        : language === 'de'
          ? 'Darwin AI Sprachassistent (Fish Audio) einsatzbereit'
          : ar
            ? 'مرشد داروين الصوتي (Fish Audio) متاح للمساعدة'
            : 'Darwin AI Voice Assistant available';

  const LAB_SHOWCASE_ITEMS = [
    { id: 'anatomy', nameAr: 'أطلس التشريح 3D', nameEn: '3D Anatomy', nameJa: '3D人体解剖学', count: '2,821', unitAr: 'بنية طبية', unitEn: 'structures', unitJa: '解剖構造', accent: '#e11d48' },
    { id: 'physics', nameAr: 'الفيزياء والدوائر', nameEn: 'Physics & Waves', nameJa: '物理と回路', count: '60 FPS', unitAr: 'محاكاة حية', unitEn: 'simulations', unitJa: 'リアルタイム', accent: '#2563eb' },
    { id: 'chemistry', nameAr: 'الكيمياء والتفاعلات', nameEn: 'Chemistry Lab', nameJa: '化学反応ラボ', count: '118', unitAr: 'عنصر وتفاعل', unitEn: 'elements', unitJa: '元素と反応', accent: '#d97706' },
    { id: 'biology', nameAr: 'الأحياء والخلية', nameEn: 'Biology & Cells', nameJa: '細胞生物学', count: '4K', unitAr: 'مجاهر رقمية', unitEn: 'microscopy', unitJa: 'デジタル顕微鏡', accent: '#059669' },
    { id: 'geology', nameAr: 'الزلازل وعلوم الأرض', nameEn: 'Earth & Seismic', nameJa: '地球と耐震工学', count: 'M9.0', unitAr: 'محاكي انهيار', unitEn: 'seismograph', unitJa: '免震シミュレータ', accent: '#7c3aed' },
    { id: 'astronomy', nameAr: 'الفلك ومدارات كبلر', nameEn: 'Kepler Orbits', nameJa: 'ケプラー軌道と天文学', count: '8', unitAr: 'كواكب وفضاء', unitEn: 'orbits', unitJa: '惑星軌道', accent: '#0284c7' },
  ];

  return (
    <div className="relative min-w-0">
      <div className="absolute -inset-4 -z-10 rounded-[32px] bg-[radial-gradient(circle_at_60%_30%,rgba(37,99,235,0.08)_0,transparent_65%)]" />

      <div className="rounded-[24px] border border-[#e5e5e5] bg-white p-5 sm:p-6 shadow-[0_24px_70px_-20px_rgba(10,10,10,0.12)]">
        {/* Top Browser Bar */}
        <div className="flex items-center justify-between border-b border-[#f0f0f0] pb-3.5 mb-4">
          <div className="flex items-center gap-2">
            <span className="h-3 w-3 rounded-full bg-[#ef4444]" />
            <span className="h-3 w-3 rounded-full bg-[#f59e0b]" />
            <span className="h-3 w-3 rounded-full bg-[#10b981]" />
            <span className="ms-2 inline-flex items-center gap-1.5 rounded-md bg-[#f5f5f5] px-2.5 py-0.5 font-mono text-[10px] text-[#737373]">
              app.scinexa.school
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-[#047857] animate-pulse" />
            <span className="font-mono text-[10px] text-[#047857] font-semibold tracking-wide">
              {badgeText}
            </span>
          </div>
        </div>

        {/* Grid of 6 Labs */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
          {LAB_SHOWCASE_ITEMS.map((item) => {
            const labTitle = language === 'ja' ? item.nameJa : ar ? item.nameAr : item.nameEn;
            const unitTitle = language === 'ja' ? item.unitJa : ar ? item.unitAr : item.unitEn;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => onOpenLab(item.id)}
                className="flex flex-col items-start p-3 rounded-xl border border-[#e5e5e5] bg-[#fafafa] hover:bg-white hover:border-[#0a0a0a] transition-all text-start group cursor-pointer active:scale-95 shadow-xs hover:shadow"
              >
                <div className="w-2.5 h-2.5 rounded-full mb-2 group-hover:scale-125 transition-transform" style={{ backgroundColor: item.accent }} />
                <span className="text-[12px] font-semibold text-[#0a0a0a] group-hover:text-[#1d4ed8] transition-colors line-clamp-1">
                  {labTitle}
                </span>
                <div className="mt-1 flex items-baseline gap-1 text-[10px] text-[#737373]">
                  <span className="font-mono font-bold text-[#0a0a0a]">{item.count}</span>
                  <span>{unitTitle}</span>
                </div>
              </button>
            );
          })}
        </div>

        {/* Quick Audio Darwin Bar */}
        <div className="mt-4 pt-3.5 border-t border-[#f0f0f0] flex items-center justify-between text-[11px] text-[#737373]">
          <div className="flex items-center gap-2">
            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-[#eff6ff] text-[#1d4ed8]">
              <Sparkles size={12} />
            </span>
            <span className="text-[#171717] font-medium text-[11px]">
              {assistantNotice}
            </span>
          </div>
          <span className="text-[10px] font-mono text-[#1d4ed8] font-bold">ISEF 2026</span>
        </div>
      </div>
    </div>
  );
};

const LabCard: React.FC<{ lab: LabModule; onOpen: () => void }> = ({ lab, onOpen }) => {
  const { language } = useLanguage();
  const ar = language === 'ar';
  const Icon = ICONS[lab.id] || FlaskConical;

  return (
    <button
      type="button"
      onClick={onOpen}
      className={`sn-${lab.accent} sn-card sn-card-hover group flex flex-col p-5 text-start`}
    >
      <div className="mb-5 flex items-start justify-between">
        <span className="sn-icon-tile">
          <Icon size={18} strokeWidth={1.6} />
        </span>
        <span className="font-mono text-[10px] tracking-[0.16em] text-[#a3a3a3]">{lab.index}</span>
      </div>
      <div className="sn-eyebrow mb-1 !text-[10px]">{ar ? lab.categoryAr : lab.categoryEn}</div>
      <h3 className="sn-h3 mb-1.5">{ar ? lab.nameAr : lab.nameEn}</h3>
      <p className="mb-4 text-[13px] leading-relaxed text-[#737373]">{ar ? lab.taglineAr : lab.taglineEn}</p>
      <div className="mt-auto flex items-end justify-between border-t border-[#f0f0f0] pt-4">
        <div>
          <div className="sn-number text-[20px] font-semibold leading-none tracking-[-0.04em]">
            {lab.statValue}
          </div>
          <div className="mt-1 text-[10px] text-[#737373]">{ar ? lab.statLabelAr : lab.statLabelEn}</div>
        </div>
        <span className="flex h-8 w-8 items-center justify-center rounded-full border border-[#e5e5e5] text-[#737373] transition-all group-hover:border-[#0a0a0a] group-hover:bg-[#0a0a0a] group-hover:text-white">
          <ArrowUpRight size={15} strokeWidth={1.8} />
        </span>
      </div>
    </button>
  );
};

export const LandingPage: React.FC = () => {
  const { language } = useLanguage();
  const { isSignedIn } = useSession();
  const navigate = useNavigate();
  const ar = language === 'ar';

  const openLab = (id: string) => navigate(isSignedIn ? `/app/labs/${id}` : '/sign-in');

  // Full 5-language dictionary
  const getCopy = () => {
    switch (language) {
      case 'ja':
        return {
          eyebrow: 'ISEF 2026 · エジプト・カイロ',
          platformSubtitle: '次世代型対話型3D理科実験プラットフォーム',
          title: 'ブラウザに広がる、高精度な科学実験室。',
          subtitle:
            'エジプト教育省公式カリキュラムに準拠した6つの対話型3Dバーチャル実験室。解剖学、物理学、化学、細胞生物学、地球科学、天文学を一つの高精度な環境で。',
          start: '無料で始める',
          explore: '実験室を体験する',
          noCard: 'クレジットカード不要',
          guest: 'ゲスト利用可能',
          curriculum: '公式シラバス準拠',
          stats: [
            { v: '6', l: '専門バーチャル実験室' },
            { v: '2,821', l: '精密解剖学3D構造' },
            { v: '118', l: '元素と化学反応' },
            { v: '100%', l: '文部省シラバス準拠' },
          ],
          labsEyebrow: '実験室',
          labsTitle: '6つの没入型科学実験空間。',
          labsSub: '各実験室は科学的な問いに基づいて設計され、高精度な測定ツールとリアルタイムのシミュレーション結果を提供します。',
          curriculumEyebrow: '公式シラバス',
          curriculumTitle: 'すべての授業に実験を。すべての実験に確かな証拠を。',
          curriculumSub:
            '学年を選択し、教科書単元に沿って3D実験・検証済み解説動画・週間確認テストを受講できます。',
          curriculumBullets: [
            '教科書の単元に正確に対応した学習ロードマップ。',
            'すべての授業に連動した対話型3D実験室。',
            '検証済み解説動画と週間評価テストを一つに集約。',
          ],
          browseCurriculum: 'カリキュラム一覧を見る',
          rolesEyebrow: '役割と権限',
          rolesTitle: '生徒、教員、学校のために設計。',
          roles: [
            { icon: GraduationCap, t: '生徒', d: '明確なロードマップ、自動保存される学習進捗、即座に起動する3D実験室。', b: ['経験値とレベル進捗', '週間確認テスト', '進捗の自動同期'] },
            { icon: Presentation, t: '教員', d: 'スマート対話型黒板、クラス管理、課題配信、プレゼン用学習分析レポート。', b: ['対話型黒板モード', 'クラス・生徒管理', '課題配信とレポート'] },
            { icon: ShieldCheck, t: '管理者', d: '学校全体の学習利用状況、アクセス権限、セキュリティの一元管理。', b: ['教育機関全体の管理', 'リアルタイム分析', '高度な権限設定'] },
          ],
          offlineTitle: 'ネットワーク切断時でも完全動作。',
          offlineSub: 'USBまたは校内LAN上の完全なオフライン版をサポートし、ネット復帰時に自動同期。',
          ctaTitle: '1分で最初の実験室を開始。',
          ctaSub: '学校アカウントを作成するかゲストとして入場。追加のインストールは不要です。',
          footerTag: '次世代対話型科学シミュレーションプラットフォーム',
          getStartedNow: '今すぐ始める',
        };
      case 'fr':
        return {
          eyebrow: 'ISEF 2026 · Le Caire, Égypte',
          platformSubtitle: 'Plateforme scientifique 3D interactive de nouvelle génération',
          title: 'Le laboratoire de sciences qui tient dans un navigateur.',
          subtitle:
            'Six laboratoires 3D interactifs, alignés sur les programmes scolaires officiels. Anatomie, physique, chimie, biologie, géologie et astronomie — dans un environnement précis et intuitif.',
          start: 'Commencer gratuitement',
          explore: 'Explorer les laboratoires',
          noCard: 'Sans carte bancaire',
          guest: 'Mode invité disponible',
          curriculum: 'Aligné sur les programmes',
          stats: [
            { v: '6', l: 'laboratoires spécialisés' },
            { v: '2 821', l: 'structures anatomiques' },
            { v: '118', l: 'éléments chimiques' },
            { v: '100%', l: 'conformes aux programmes' },
          ],
          labsEyebrow: 'Laboratoires',
          labsTitle: 'Six espaces de découverte, sans encombre.',
          labsSub: 'Chaque laboratoire est conçu autour d’une question scientifique, avec des instruments de mesure réels et des résultats immédiats.',
          curriculumEyebrow: 'Programmes scolaires',
          curriculumTitle: 'À chaque leçon son expérience. À chaque expérience ses preuves.',
          curriculumSub:
            'Choisissez votre niveau, suivez les chapitres officiels avec une expérience 3D, une vidéo validée et une évaluation hebdomadaire.',
          curriculumBullets: [
            'Unités officielles du manuel scolaire.',
            'Une expérience 3D interactive liée à chaque leçon.',
            'Vidéo vérifiée et évaluation hebdomadaire intégrées.',
          ],
          browseCurriculum: 'Parcourir les programmes',
          rolesEyebrow: 'Profils',
          rolesTitle: 'Conçu pour l’élève, l’enseignant et l’établissement.',
          roles: [
            { icon: GraduationCap, t: 'Élève', d: 'Un parcours clair, progression sauvegardée et labos instantanés.', b: ['Points XP et niveaux', 'Évaluations hebdomadaires', 'Reprise automatique'] },
            { icon: Presentation, t: 'Enseignant', d: 'Tableau interactif, gestion des classes, devoirs et rapports prêts.', b: ['Mode tableau interactif', 'Gestion des classes', 'Rapports d’élèves'] },
            { icon: ShieldCheck, t: 'Administration', d: 'Vue d’ensemble sur l’établissement, utilisation et accès sécurisés.', b: ['Gestion de l’établissement', 'Analytique en direct', 'Droits d’accès'] },
          ],
          offlineTitle: 'Fonctionne même sans connexion internet.',
          offlineSub: 'Version autonome complète sur clé USB ou réseau local, synchronisation automatique dès le retour en ligne.',
          ctaTitle: 'Ouvrez votre premier laboratoire en une minute.',
          ctaSub: 'Créez un compte d’établissement ou entrez en invité. Aucune installation requise.',
          footerTag: 'Plateforme interactive de laboratoires scientifiques',
          getStartedNow: 'Commencer dès maintenant',
        };
      case 'de':
        return {
          eyebrow: 'ISEF 2026 · Kairo, Ägypten',
          platformSubtitle: 'Die interaktive 3D-Wissenschaftsplattform der nächsten Generation',
          title: 'Das wissenschaftliche Labor direkt im Browser.',
          subtitle:
            'Sechs interaktive 3D-Labore, abgestimmt auf den offiziellen Lehrplan. Anatomie, Physik, Chemie, Biologie, Geowissenschaften und Astronomie — in einer ruhigen, präzisen Umgebung.',
          start: 'Kostenlos starten',
          explore: 'Labore erkunden',
          noCard: 'Keine Kreditkarte nötig',
          guest: 'Gastmodus verfügbar',
          curriculum: 'Lehrplankonform',
          stats: [
            { v: '6', l: 'Fachlabore' },
            { v: '2.821', l: 'anatomische Strukturen' },
            { v: '118', l: 'chemische Elemente' },
            { v: '100%', l: 'lehrplankonform' },
          ],
          labsEyebrow: 'Die Labore',
          labsTitle: 'Sechs Räume für Entdeckungen. Klar und präzise.',
          labsSub: 'Jedes Labor widmet sich einer wissenschaftlichen Kernfrage mit echten Messinstrumenten und Live-Ergebnissen.',
          curriculumEyebrow: 'Lehrplan',
          curriculumTitle: 'Zu jeder Lektion ein Experiment. Zu jedem Experiment ein Beweis.',
          curriculumSub:
            'Wählen Sie die Klassenstufe, folgen Sie den offiziellen Einheiten mit verknüpftem 3D-Labor, geprüften Lehrvideos und wöchentlichen Tests.',
          curriculumBullets: [
            'Offizielle Einheiten des Schulbuchs.',
            'Ein verknüpftes 3D-Experiment für jede Lektion.',
            'Geprüftes Video und wöchentliche Lernkontrolle an einem Ort.',
          ],
          browseCurriculum: 'Lehrplan durchsuchen',
          rolesEyebrow: 'Rollen',
          rolesTitle: 'Entwickelt für Schüler, Lehrkräfte und Schulen.',
          roles: [
            { icon: GraduationCap, t: 'Schüler', d: 'Klarer Lernpfad, gespeicherter Fortschritt und sofort startende Labore.', b: ['XP & Level-System', 'Wöchentliche Tests', 'Automatische Synchronisierung'] },
            { icon: Presentation, t: 'Lehrkraft', d: 'Interaktive Tafel, Klassenverwaltung, Aufgaben und Berichte.', b: ['Tafelmodus', 'Klassenverwaltung', 'Schülerberichte'] },
            { icon: ShieldCheck, t: 'Schulleitung', d: 'Überblick über die Schule, Nutzung und rollenbasierte Rechte.', b: ['Schulverwaltung', 'Live-Analysen', 'Rechteverwaltung'] },
          ],
          offlineTitle: 'Funktioniert auch ohne Internetverbindung.',
          offlineSub: 'Vollständiges Offline-Paket für USB oder lokales Schulnetzwerk mit automatischer Synchronisierung.',
          ctaTitle: 'Starten Sie Ihr erstes Labor in nur einer Minute.',
          ctaSub: 'Erstellen Sie ein Schulkonto oder starten Sie als Gast. Keine Installation nötig.',
          footerTag: 'Interaktive Wissenschafts- und Laborplattform',
          getStartedNow: 'Jetzt loslegen',
        };
      case 'ar':
        return {
          eyebrow: 'آيسف ٢٠٢٦ · القاهرة، مصر',
          platformSubtitle: 'المنصة العلمية التفاعلية والمختبرات ثلاثية الأبعاد',
          title: 'مختبر العلوم الذي يتّسع داخل المتصفح.',
          subtitle:
            'ستة معامل تفاعلية ثلاثية الأبعاد، مرتبطة بمناهج وزارة التربية والتعليم المصرية. التشريح، الفيزياء، الكيمياء، الأحياء، الأرض، والفلك — في بيئة واحدة هادئة ودقيقة.',
          start: 'ابدأ مجانًا',
          explore: 'استكشف المعامل',
          noCard: 'بدون بطاقة بنكية',
          guest: 'وضع الزائر متاح',
          curriculum: 'مطابق للمنهج',
          stats: [
            { v: '٦', l: 'معامل تخصصية' },
            { v: '٢٬٨٢١', l: 'بنية تشريحية' },
            { v: '١١٨', l: 'عنصرًا كيميائيًا' },
            { v: '١٠٠٪', l: 'مطابقة للمنهج' },
          ],
          labsEyebrow: 'المعامل',
          labsTitle: 'ستّ مساحات للاكتشاف، بلا فوضى.',
          labsSub: 'كل معمل مصمم حول سؤال علمي واحد، مع أدوات قياس حقيقية ونتائج مباشرة.',
          curriculumEyebrow: 'المناهج',
          curriculumTitle: 'كل درس له تجربة. كل تجربة لها دليل.',
          curriculumSub:
            'اختر صفك، وتابع وحدات كتاب الوزارة، مع تجربة ثلاثية الأبعاد وفيديو موثّق وتقييم أسبوعي لكل درس.',
          curriculumBullets: [
            'وحدات كتاب الوزارة، لا قائمة دروس عشوائية.',
            'تجربة ثلاثية الأبعاد مرتبطة بكل درس.',
            'فيديو موثّق وتقييم أسبوعي في نفس المكان.',
          ],
          browseCurriculum: 'استعرض المسار الدراسي',
          rolesEyebrow: 'الأدوار',
          rolesTitle: 'مصمّم للطالب، والمعلم، والمدرسة.',
          roles: [
            { icon: GraduationCap, t: 'الطالب', d: 'مسار واضح، تقدّم محفوظ، ومعامل تُفتح بلا انتظار.', b: ['نقاط ومستويات', 'تقييمات أسبوعية', 'متابعة تلقائية'] },
            { icon: Presentation, t: 'المعلم', d: 'سبورة تفاعلية، فصول، واجبات، وتقارير جاهزة للعرض.', b: ['وضع السبورة', 'إدارة الفصول', 'تقارير الطلاب'] },
            { icon: ShieldCheck, t: 'الإدارة', d: 'نظرة على المدرسة، الاستخدام، والوصول حسب الدور.', b: ['إدارة المؤسسة', 'تحليلات', 'صلاحيات'] },
          ],
          offlineTitle: 'يعمل حين تنقطع الشبكة.',
          offlineSub: 'نسخة محلية كاملة على USB أو شبكة المدرسة، مع تحديث تلقائي عند العودة للإنترنت.',
          ctaTitle: 'افتح أول معمل خلال دقيقة.',
          ctaSub: 'أنشئ حسابًا مدرسيًا أو ادخل كزائر. لا تحتاج إلى تثبيت أي شيء.',
          footerTag: 'منصة المختبرات العلمية التفاعلية',
          getStartedNow: 'ابدأ الآن',
        };
      default:
        return {
          eyebrow: 'ISEF 2026 · Cairo, Egypt',
          platformSubtitle: 'The Next-Generation Interactive 3D Science Platform',
          title: 'The science lab that fits in a browser.',
          subtitle:
            'Six interactive 3D laboratories, mapped to the Egyptian Ministry of Education curriculum. Anatomy, physics, chemistry, biology, earth and space — in one calm, precise environment.',
          start: 'Start free',
          explore: 'Explore the labs',
          noCard: 'No credit card',
          guest: 'Guest mode available',
          curriculum: 'Curriculum-mapped',
          stats: [
            { v: '6', l: 'specialist labs' },
            { v: '2,821', l: 'anatomical structures' },
            { v: '118', l: 'chemical elements' },
            { v: '100%', l: 'curriculum-mapped' },
          ],
          labsEyebrow: 'The laboratories',
          labsTitle: 'Six rooms for discovery. No clutter.',
          labsSub: 'Each lab is built around one scientific question, with real measurement tools and immediate results.',
          curriculumEyebrow: 'Curriculum',
          curriculumTitle: 'Every lesson has an experiment. Every experiment has evidence.',
          curriculumSub:
            'Choose a grade, follow the Ministry textbook units, and get a linked 3D experiment, a verified video and a weekly assessment for every lesson.',
          curriculumBullets: [
            'Ministry textbook units, not a random lesson list.',
            'A 3D experiment linked to every lesson.',
            'A verified video and weekly assessment in one place.',
          ],
          browseCurriculum: 'Browse the curriculum path',
          rolesEyebrow: 'Roles',
          rolesTitle: 'Designed for the student, the teacher and the school.',
          roles: [
            { icon: GraduationCap, t: 'Student', d: 'A clear path, saved progress, and labs that open instantly.', b: ['XP & levels', 'Weekly assessments', 'Auto-resume'] },
            { icon: Presentation, t: 'Teacher', d: 'A smartboard, classes, assignments and presentable reports.', b: ['Board mode', 'Class management', 'Student reports'] },
            { icon: ShieldCheck, t: 'Administrator', d: 'A school-level view of usage, access and roles.', b: ['Institution admin', 'Analytics', 'Role permissions'] },
          ],
          offlineTitle: 'Works when the network does not.',
          offlineSub: 'A complete local build on USB or the school LAN, with automatic sync when the connection returns.',
          ctaTitle: 'Open your first lab in a minute.',
          ctaSub: 'Create a school account or enter as a guest. Nothing to install.',
          footerTag: 'Interactive science laboratory platform',
          getStartedNow: 'Get started',
        };
    }
  };

  const copy = getCopy();

  const lessons =
    language === 'ja'
      ? [
          { n: '01', t: '金属酸化物の還元反応', u: '第3章 · 化学', lab: 'chemistry', p: 'p. 42–47' },
          { n: '02', t: '弦上の波動シミュレーション', u: '波動力学 · 物理', lab: 'physics', p: 'p. 53–58' },
          { n: '03', t: '神経系の精密解剖学', u: '人体解剖学 · 生物', lab: 'anatomy', p: 'p. 60–64' },
        ]
      : ar
        ? [
            { n: '٠١', t: 'اختزال أكاسيد الفلزات', u: 'الفصل الثالث · كيمياء', lab: 'chemistry', p: 'ص ٤٢–٤٧' },
            { n: '٠٢', t: 'الحركة على وتر', u: 'الموجات · فيزياء', lab: 'physics', p: 'ص ٥٣–٥٨' },
            { n: '٠٣', t: 'الجهاز العصبي', u: 'التشريح · أحياء', lab: 'anatomy', p: 'ص ٦٠–٦٤' },
          ]
        : [
            { n: '01', t: 'Metal oxide reduction', u: 'Chapter 3 · Chemistry', lab: 'chemistry', p: 'pp. 42–47' },
            { n: '02', t: 'Wave on a string', u: 'Waves · Physics', lab: 'physics', p: 'pp. 53–58' },
            { n: '03', t: 'The nervous system', u: 'Anatomy · Biology', lab: 'anatomy', p: 'pp. 60–64' },
          ];

  return (
    <div className="min-h-screen bg-[#f5f5f5]" dir={ar ? 'rtl' : 'ltr'}>
      <LandingHeader signedIn={isSignedIn} />

      <main>
        {/* Hero */}
        <section className="sn-blueprint border-b border-[#e5e5e5]">
          <div className="sn-shell grid items-center gap-14 py-16 lg:grid-cols-[1.02fr_0.98fr] lg:py-24">
            <div className="sn-rise max-w-[560px]">
              <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-[#e5e5e5] bg-white px-3 py-1.5">
                <span className="sn-live-dot h-1.5 w-1.5 rounded-full bg-[#1d4ed8]" />
                <span className="font-mono text-[10px] uppercase tracking-[0.14em] text-[#737373]">
                  {copy.eyebrow}
                </span>
              </div>

              <div>
                <h1 className="sn-display text-[clamp(2.5rem,5.6vw,4.5rem)] font-extrabold tracking-tight">
                  SciNexa <span className="text-[#1d4ed8]">| ساينكسا</span>
                </h1>
                <p className="mt-2 text-[19px] sm:text-[23px] font-bold text-[#171717] leading-snug">
                  {copy.platformSubtitle}
                </p>
              </div>

              <p className="mt-6 max-w-[48ch] text-[15px] leading-[1.7] text-[#737373]">
                {copy.subtitle}
              </p>

              <div className="mt-8 flex flex-wrap items-center gap-3">
                <Link to={isSignedIn ? '/app' : '/sign-up'} className="sn-btn sn-btn-primary sn-btn-lg">
                  {copy.start}
                  <ArrowRight size={16} strokeWidth={1.8} className={ar ? 'rotate-180' : ''} />
                </Link>
                <a href="#labs" className="sn-btn sn-btn-ghost sn-btn-lg">
                  {copy.explore}
                </a>
              </div>

              <div className="mt-5 flex flex-wrap items-center gap-x-5 gap-y-2 text-[12px] text-[#737373]">
                <span className="inline-flex items-center gap-1.5">
                  <Check size={13} strokeWidth={2} className="text-[#047857]" />
                  {copy.noCard}
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <Check size={13} strokeWidth={2} className="text-[#047857]" />
                  {copy.guest}
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <Check size={13} strokeWidth={2} className="text-[#047857]" />
                  {copy.curriculum}
                </span>
              </div>
            </div>

            <div className="sn-rise sn-rise-2 min-w-0">
              <InteractiveLabsShowcase onOpenLab={openLab} />
            </div>
          </div>

          <div className="border-t border-[#e5e5e5] bg-white/60">
            <div className="sn-shell grid grid-cols-2 divide-x divide-[#e5e5e5] py-0 md:grid-cols-4 [&>*]:border-[#e5e5e5] rtl:divide-x-reverse">
              {copy.stats.map((s) => (
                <div key={s.l} className="px-5 py-5 first:ps-0 md:px-7">
                  <div className="sn-number text-[24px] font-semibold leading-none tracking-[-0.04em]">{s.v}</div>
                  <div className="mt-1.5 text-[11px] text-[#737373]">{s.l}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Labs */}
        <section id="labs" className="border-b border-[#e5e5e5] bg-[#f5f5f5] py-16 lg:py-24">
          <div className="sn-shell">
            <div className="mb-10 flex flex-col justify-between gap-5 md:flex-row md:items-end">
              <div>
                <SectionLabel>{copy.labsEyebrow}</SectionLabel>
                <h2 className="sn-h1 mt-3 max-w-[22ch]">{copy.labsTitle}</h2>
              </div>
              <p className="max-w-[38ch] text-[14px] leading-relaxed text-[#737373]">{copy.labsSub}</p>
            </div>

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {LAB_MODULES.map((lab) => (
                <LabCard key={lab.id} lab={lab} onOpen={() => openLab(lab.id)} />
              ))}
            </div>
          </div>
        </section>

        {/* Curriculum */}
        <section id="curriculum" className="border-b border-[#e5e5e5] bg-white py-16 lg:py-24">
          <div className="sn-shell grid items-center gap-14 lg:grid-cols-2">
            <div>
              <SectionLabel>{copy.curriculumEyebrow}</SectionLabel>
              <h2 className="sn-h1 mt-3 max-w-[20ch]">{copy.curriculumTitle}</h2>
              <p className="mt-5 max-w-[46ch] text-[14px] leading-[1.7] text-[#737373]">{copy.curriculumSub}</p>

              <div className="mt-8 space-y-4">
                {copy.curriculumBullets.map((line) => (
                  <div key={line} className="flex items-start gap-3">
                    <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#eff6ff] text-[#1d4ed8]">
                      <Check size={11} strokeWidth={2.4} />
                    </span>
                    <span className="text-[13px] leading-relaxed text-[#171717]">{line}</span>
                  </div>
                ))}
              </div>

              <Link to={isSignedIn ? '/app/curriculum' : '/sign-up'} className="sn-link mt-8">
                {copy.browseCurriculum}
                <ArrowRight size={14} strokeWidth={1.8} className={ar ? 'rotate-180' : ''} />
              </Link>
            </div>

            <div className="sn-card overflow-hidden p-0">
              <div className="flex items-center justify-between border-b border-[#e5e5e5] px-5 py-4">
                <div>
                  <div className="sn-eyebrow">
                    {language === 'ja' ? '高度科学学習コース' : ar ? 'المسار العلمي المتقدم' : 'Advanced Science Pathway'}
                  </div>
                  <div className="mt-1 text-[15px] font-semibold">
                    {language === 'ja' ? '化学 · 無機気体の合成' : ar ? 'الكيمياء · تحضير الغازات غير العضوية' : 'Chemistry · Inorganic Synthesis'}
                  </div>
                </div>
                <span className="sn-badge sn-badge-soft">13%</span>
              </div>

              <div className="divide-y divide-[#f0f0f0]">
                {lessons.map((lesson) => (
                  <div key={lesson.n} className="flex items-center gap-4 px-5 py-4">
                    <span className="font-mono text-[10px] tracking-[0.12em] text-[#a3a3a3]">{lesson.n}</span>
                    <div className="min-w-0 flex-1">
                      <div className="truncate text-[13px] font-medium text-[#0a0a0a]">{lesson.t}</div>
                      <div className="mt-0.5 text-[11px] text-[#737373]">
                        {lesson.u} · {lesson.p}
                      </div>
                    </div>
                    <span className={`sn-${lesson.lab} sn-badge`} style={{ background: 'var(--sn-accent-soft)', color: 'var(--sn-accent)' }}>
                      {language === 'ja' ? '実験室' : ar ? 'معمل' : 'Lab'}
                    </span>
                  </div>
                ))}
              </div>

              <div className="flex items-center justify-between border-t border-[#e5e5e5] bg-[#fafafa] px-5 py-3">
                <span className="text-[11px] text-[#737373]">
                  {language === 'ja' ? '8レッスン中3レッスン完了' : ar ? '٣ من ٨ دروس مكتملة' : '3 of 8 lessons complete'}
                </span>
                <span className="inline-flex items-center gap-1 text-[11px] font-medium text-[#0a0a0a]">
                  {language === 'ja' ? 'コースを開く' : ar ? 'فتح المسار' : 'Open path'}
                  <ArrowUpRight size={12} strokeWidth={1.8} />
                </span>
              </div>
            </div>
          </div>
        </section>

        {/* Roles */}
        <section id="roles" className="border-b border-[#e5e5e5] bg-[#f5f5f5] py-16 lg:py-24">
          <div className="sn-shell">
            <SectionLabel>{copy.rolesEyebrow}</SectionLabel>
            <h2 className="sn-h1 mt-3 max-w-[24ch]">{copy.rolesTitle}</h2>

            <div className="mt-10 grid gap-4 md:grid-cols-3">
              {copy.roles.map((role) => {
                const Icon = role.icon;
                return (
                  <div key={role.t} className="sn-card sn-card-hover p-6">
                    <span className="flex h-10 w-10 items-center justify-center rounded-[12px] border border-[#e5e5e5] bg-white text-[#0a0a0a]">
                      <Icon size={18} strokeWidth={1.6} />
                    </span>
                    <h3 className="sn-h3 mt-5">{role.t}</h3>
                    <p className="mt-2 text-[13px] leading-relaxed text-[#737373]">{role.d}</p>
                    <ul className="mt-5 space-y-2 border-t border-[#f0f0f0] pt-4">
                      {role.b.map((item) => (
                        <li key={item} className="flex items-center gap-2 text-[12px] text-[#171717]">
                          <Check size={12} strokeWidth={2.2} className="text-[#047857]" />
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* Offline */}
        <section id="offline" className="bg-white py-14">
          <div className="sn-shell">
            <div className="sn-card flex flex-col items-start justify-between gap-6 p-6 md:flex-row md:items-center md:p-8">
              <div className="flex items-start gap-4">
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-[12px] bg-[#eff6ff] text-[#1d4ed8]">
                  <WifiOff size={19} strokeWidth={1.6} />
                </span>
                <div>
                  <h3 className="sn-h3">{copy.offlineTitle}</h3>
                  <p className="mt-1 max-w-[58ch] text-[13px] leading-relaxed text-[#737373]">{copy.offlineSub}</p>
                </div>
              </div>
              <span className="sn-badge sn-badge-outline shrink-0">USB · LAN · PWA</span>
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="bg-white pb-20">
          <div className="sn-shell">
            <div className="relative overflow-hidden rounded-[24px] bg-[#0a0a0a] px-6 py-12 md:px-12 md:py-14">
              <div className="absolute inset-0 opacity-[0.08] [background-image:linear-gradient(to_right,#fff_1px,transparent_1px),linear-gradient(to_bottom,#fff_1px,transparent_1px)] [background-size:48px_48px]" />
              <div className="relative flex flex-col items-start justify-between gap-8 md:flex-row md:items-end">
                <div>
                  <span className="font-mono text-[10px] uppercase tracking-[0.16em] text-white/45">
                    {copy.getStartedNow}
                  </span>
                  <h2 className="mt-3 max-w-[20ch] text-[clamp(1.75rem,3.4vw,2.5rem)] font-semibold leading-[1.12] tracking-[-0.04em] text-white">
                    {copy.ctaTitle}
                  </h2>
                  <p className="mt-3 max-w-[42ch] text-[13px] leading-relaxed text-white/55">{copy.ctaSub}</p>
                </div>
                <div className="flex flex-wrap gap-2.5">
                  <Link
                    to={isSignedIn ? '/app' : '/sign-up'}
                    className="sn-btn sn-btn-lg bg-white text-[#0a0a0a] hover:bg-[#f0f0f0]"
                  >
                    {copy.start}
                    <ArrowRight size={16} strokeWidth={1.8} className={ar ? 'rotate-180' : ''} />
                  </Link>
                  <Link
                    to="/sign-in"
                    className="sn-btn sn-btn-lg border border-white/20 bg-transparent text-white hover:bg-white/10"
                  >
                    {language === 'ja' ? 'ログイン' : language === 'fr' ? 'Connexion' : language === 'de' ? 'Anmelden' : ar ? 'تسجيل الدخول' : 'Sign in'}
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-[#e5e5e5] bg-[#fafafa]">
        <div className="sn-shell py-12">
          <div className="grid gap-10 md:grid-cols-[1.4fr_1fr_1fr_1fr]">
            <div>
              <Wordmark />
              <p className="mt-4 max-w-[30ch] text-[12px] leading-relaxed text-[#737373]">{copy.footerTag}</p>
            </div>
            {[
              {
                h: language === 'ja' ? '製品' : language === 'fr' ? 'Produit' : language === 'de' ? 'Produkt' : ar ? 'المنتج' : 'Product',
                items: [
                  [language === 'ja' ? '実験室' : ar ? 'المعامل' : 'Labs', '#labs'],
                  [language === 'ja' ? 'カリキュラム' : ar ? 'المناهج' : 'Curriculum', '#curriculum'],
                  [language === 'ja' ? 'スマート黒板' : ar ? 'السبورة' : 'Classroom', '#roles'],
                ],
              },
              {
                h: language === 'ja' ? '学校向け' : language === 'fr' ? 'Établissement' : language === 'de' ? 'Schule' : ar ? 'المدرسة' : 'School',
                items: [
                  [language === 'ja' ? '教員' : ar ? 'المعلمون' : 'Teachers', '#roles'],
                  [language === 'ja' ? '管理者' : ar ? 'الإدارة' : 'Administrators', '#roles'],
                  [language === 'ja' ? 'オフライン' : ar ? 'بدون إنترنت' : 'Offline', '#offline'],
                ],
              },
              {
                h: language === 'ja' ? 'プロジェクト' : language === 'fr' ? 'Projet' : language === 'de' ? 'Projekt' : ar ? 'المشروع' : 'Project',
                items: [
                  ['ISEF 2026', '#'],
                  [language === 'ja' ? 'チーム' : ar ? 'الفريق' : 'Team', '#'],
                  [language === 'ja' ? 'ライセンス' : ar ? 'التراخيص' : 'Licenses', '#'],
                ],
              },
            ].map((col) => (
              <div key={col.h}>
                <div className="mb-3 text-[12px] font-semibold text-[#0a0a0a]">{col.h}</div>
                <ul className="space-y-2">
                  {col.items.map(([label, href]) => (
                    <li key={label}>
                      <a href={href} className="text-[12px] text-[#737373] hover:text-[#0a0a0a]">
                        {label}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          <div className="mt-10 flex flex-col items-start justify-between gap-3 border-t border-[#e5e5e5] pt-6 text-[11px] text-[#737373] md:flex-row md:items-center">
            <span>© 2026 SciNexa · Islam &amp; Yaseen · ISEF 2026</span>
            <span className="font-mono text-[10px] tracking-[0.06em]">b35dcc2b…38123f</span>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
