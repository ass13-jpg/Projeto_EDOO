// Card individual de dispositivo.
// onToggle(id) — dispara chamada de API no pai (App.jsx).
// Não gerencia estado próprio — reflete exatamente o que o C++ disse.

const ICON_MAP = {
  luz: '💡', light: '💡', luminaria: '💡',
  termostato: '🌡️', ac: '❄️',
  fechadura: '🔒', lock: '🔒',
  camera: '📷', câmera: '📷',
  speaker: '🔊', caixa: '🔊',
  tv: '📺',
  fan: '🌀', ventilador: '🌀',
  sensor: '📡',
  plug: '🔌', tomada: '🔌',
  blind: '🪟', persiana: '🪟',
};

function iconFor(tipo = '') {
  const t = tipo.toLowerCase();
  for (const [k, v] of Object.entries(ICON_MAP)) {
    if (t.includes(k)) return v;
  }
  return '⬡';
}

function StatLabel({ d }) {
  if (d.consumo_w)              return <><strong className="text-[var(--text)]">{d.consumo_w}W</strong></>;
  if (d.temperatura != null)    return <><strong className="text-[var(--text)]">{d.temperatura}°C</strong></>;
  if (d.brilho      != null)    return <><strong className="text-[var(--text)]">{d.brilho}%</strong></>;
  return <>ID <strong className="text-[var(--text)]">#{d.id}</strong></>;
}

export default function DeviceCard({ device: d, onToggle, isToggling }) {
  const on   = d.ligado ?? (d.status === 'on') ?? false;
  const room = d.comodo || d.sala || d.room || '';

  return (
    <div className={`relative overflow-hidden rounded-2xl border px-5 py-5
                     backdrop-blur-md transition-all duration-300
                     ${on
                       ? 'border-[var(--border-active)] bg-[var(--glass)]'
                       : 'border-[var(--border)]         bg-[var(--glass)]'}
                     ${isToggling ? 'opacity-60 pointer-events-none' : ''}
                     hover:bg-white/[.07]`}>

      {/* linha de glow no topo quando ligado */}
      {on && (
        <div className="absolute inset-x-0 top-0 h-px
                        bg-gradient-to-r from-transparent via-[var(--cyan)] to-transparent" />
      )}

      {/* header: ícone + toggle */}
      <div className="flex items-start justify-between mb-5">
        <div className={`flex items-center justify-center w-11 h-11 rounded-xl text-xl
                         border transition-all duration-300
                         ${on
                           ? 'bg-[var(--cyan-dim)] border-[rgba(0,229,255,0.3)]'
                           : 'bg-white/[.04] border-[var(--border)]'}`}>
          {iconFor(d.tipo || d.type || d.nome)}
        </div>

        {/* toggle switch — dispara onToggle, não inverte estado local */}
        <button
          onClick={() => onToggle(d.id)}
          aria-label={`Toggle ${d.nome}`}
          className={`relative w-12 h-7 rounded-full border transition-all duration-250 flex-shrink-0
                      ${on
                        ? 'bg-[var(--cyan)]  border-[var(--cyan)]'
                        : 'bg-white/[.05]    border-[var(--border)]'}`}>
          <span className={`absolute top-[3px] left-[3px] w-[18px] h-[18px] rounded-full
                            transition-all duration-250
                            ${on ? 'translate-x-5 bg-[var(--bg)]' : 'bg-white/40'}`} />
        </button>
      </div>

      {/* nome + cômodo */}
      <div className="text-base font-semibold tracking-tight">{d.nome || d.name || 'Dispositivo'}</div>
      <div className="text-xs mt-0.5" style={{ color: 'var(--text-muted)', fontFamily: 'var(--mono)' }}>
        {room || '—'}
      </div>

      {/* rodapé: stat + chip de status */}
      <div className="flex items-center justify-between mt-4 pt-4 border-t border-[var(--border)]">
        <div className="text-sm" style={{ color: 'var(--text-dim)' }}>
          <StatLabel d={d} />
        </div>
        <span className={`text-[10px] font-mono uppercase tracking-wider px-2 py-0.5 rounded
                          ${on
                            ? 'bg-[rgba(0,229,255,0.1)] text-[var(--cyan)] border border-[rgba(0,229,255,0.3)]'
                            : 'bg-white/[.04] text-[var(--text-muted)] border border-[var(--border)]'}`}>
          {on ? 'ligado' : 'desligado'}
        </span>
      </div>
    </div>
  );
}