// Cards dos sensores ambientais.
// Recebe o objeto `sensores` direto do JSON do C++.

const FIELDS = [
  { key: 'temperatura',  label: 'Temperatura',    unit: '°C',  color: 'var(--amber)'  },
  { key: 'umidade',      label: 'Umidade',        unit: '%',   color: 'var(--cyan)'   },
  { key: 'luminosidade', label: 'Luminosidade',   unit: ' lux',color: 'var(--violet)' },
  { key: 'co2',          label: 'CO₂ (ppm)',      unit: ' ppm',color: 'var(--emerald)'},
];

export default function AmbientSensors({ sensores }) {
  return (
    <div className="grid gap-3 mb-8"
         style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))' }}>
      {FIELDS.map(f => (
        <div key={f.key}
             className="rounded-xl border border-[var(--border)] bg-[var(--glass)]
                        px-4 py-3 backdrop-blur-sm">
          <div className="text-xs uppercase tracking-widest mb-1"
               style={{ color: 'var(--text-muted)', fontFamily: 'var(--mono)' }}>
            {f.label}
          </div>

          {sensores
            ? <div className="text-3xl font-semibold tracking-tight"
                   style={{ color: f.color }}>
                {sensores[f.key]}{f.unit}
              </div>
            : <div className="h-8 w-20 rounded-lg [animation:shimmer_1.5s_infinite]
                              bg-white/5" />}
        </div>
      ))}
    </div>
  );
}