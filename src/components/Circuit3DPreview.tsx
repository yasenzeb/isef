import React from 'react';
import { Activity, Battery, CircleDot, Cpu, Zap } from 'lucide-react';

interface Circuit3DPreviewProps {
  language: string;
  voltage: number;
  current: number;
}

export const Circuit3DPreview: React.FC<Circuit3DPreviewProps> = ({ language, voltage, current }) => {
  const ar = language === 'ar';
  return (
    <section className="circuit-stage" aria-label={ar ? 'منظور ثلاثي الأبعاد للدائرة' : '3D circuit perspective'}>
      <div className="circuit-stage__header">
        <div>
          <span className="sci-badge">{ar ? 'مختبر ثلاثي الأبعاد' : '3D INSTRUMENT VIEW'}</span>
          <h3>{ar ? 'الدائرة على طاولة المختبر' : 'Circuit on the lab bench'}</h3>
        </div>
        <span className="circuit-live"><span />{ar ? 'محاكاة حية' : 'LIVE SOLVER'}</span>
      </div>
      <div className="circuit-board" role="img" aria-label={ar ? 'بطارية ومقاومتان ومفتاح موصلة بأسلاك مضيئة' : 'Battery, two resistors and switch connected by glowing wires'}>
        <div className="circuit-wire wire-a" />
        <div className="circuit-wire wire-b" />
        <div className="circuit-wire wire-c" />
        <div className="circuit-node node-a" />
        <div className="circuit-node node-b" />
        <div className="circuit-node node-c" />
        <div className="circuit-component battery"><Battery /><small>12V</small></div>
        <div className="circuit-component resistor resistor-a"><Activity /><small>R1 · 100Ω</small></div>
        <div className="circuit-component resistor resistor-b"><Activity /><small>R2 · 200Ω</small></div>
        <div className="circuit-component switch"><Zap /><small>S1 · ON</small></div>
        <div className="circuit-chip"><Cpu /><span>Kirchhoff<br /><b>{ar ? 'حل عقدي' : 'MNA solved'}</b></span></div>
      </div>
      <div className="circuit-stage__metrics">
        <span><CircleDot /> {ar ? 'الجهد' : 'Voltage'} <b>{voltage.toFixed(1)} V</b></span>
        <span><Activity /> {ar ? 'التيار' : 'Current'} <b>{(current * 1000).toFixed(1)} mA</b></span>
        <span>{ar ? 'المسار مغلق' : 'Closed loop'}</span>
      </div>
    </section>
  );
};
