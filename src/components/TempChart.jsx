import { FEVER_THRESHOLD } from '../lib/constants';
import { formatDate } from '../lib/clinical';

export default function TempChart({ temps }) {
  if (!temps || temps.length === 0) {
    return (
      <div className="h-40 flex items-center justify-center text-sm text-slate-400 bg-slate-50 rounded-lg">
        No temperature readings yet
      </div>
    );
  }

  const sorted = [...temps].sort((a, b) => a.date.localeCompare(b.date));
  const values = sorted.map((t) => t.value);
  const min = Math.min(97, ...values) - 0.5;
  const max = Math.max(104, ...values) + 0.5;
  const W = 500;
  const H = 180;
  const padL = 36, padR = 12, padT = 12, padB = 28;
  const plotW = W - padL - padR;
  const plotH = H - padT - padB;

  const x = (i) => padL + (sorted.length === 1 ? plotW / 2 : (i / (sorted.length - 1)) * plotW);
  const y = (v) => padT + (1 - (v - min) / (max - min)) * plotH;
  const thresholdY = y(FEVER_THRESHOLD);

  const path = sorted.map((t, i) => `${i === 0 ? 'M' : 'L'}${x(i)},${y(t.value)}`).join(' ');

  return (
    <div className="bg-white rounded-lg">
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-auto" preserveAspectRatio="none">
        {/* Horizontal grid + y-axis labels */}
        {[98, 100, 102, 104].map((v) => (
          <g key={v}>
            <line x1={padL} x2={W - padR} y1={y(v)} y2={y(v)} stroke="#f1f5f9" strokeWidth="1" />
            <text x={padL - 6} y={y(v) + 3} textAnchor="end" fontSize="10" fill="#94a3b8">{v}°</text>
          </g>
        ))}

        {/* Fever threshold line */}
        <line x1={padL} x2={W - padR} y1={thresholdY} y2={thresholdY} stroke="#b91c1c" strokeWidth="1" strokeDasharray="3 3" opacity="0.55" />
        <text x={W - padR} y={thresholdY - 4} textAnchor="end" fontSize="10" fill="#b91c1c" fontWeight="500">
          Fever threshold {FEVER_THRESHOLD}°F
        </text>

        {/* Line */}
        <path d={path} fill="none" stroke="#2f6362" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />

        {/* Points */}
        {sorted.map((t, i) => (
          <g key={i}>
            <circle
              cx={x(i)}
              cy={y(t.value)}
              r="4"
              fill={t.value >= FEVER_THRESHOLD ? '#b91c1c' : '#2f6362'}
              stroke="white"
              strokeWidth="2"
            />
            <text x={x(i)} y={H - 10} textAnchor="middle" fontSize="10" fill="#64748b">
              {formatDate(t.date)}
            </text>
          </g>
        ))}
      </svg>
    </div>
  );
}
