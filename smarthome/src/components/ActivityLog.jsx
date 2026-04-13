// Log de atividade. Recebe array de entradas, não escreve nada.

export default function ActivityLog({ entries }) {
  return (
    <div className="rounded-xl border border-[var(--border)] bg-[var(--glass)]
                    px-4 py-3 backdrop-blur-sm max-h-44 overflow-y-auto">
      {entries.length === 0 && (
        <p className="text-xs" style={{ color: 'var(--text-muted)', fontFamily: 'var(--mono)' }}>
          Aguardando eventos...
        </p>
      )}
      {entries.map((e, i) => (
        <div key={i} className="flex gap-3 py-1 border-b border-white/[.03] last:border-0">
          <span className="text-xs flex-shrink-0" style={{ color: 'var(--text-muted)', fontFamily: 'var(--mono)' }}>
            {e.time}
          </span>
          <span className={`text-xs font-mono
            ${e.type === 'success' ? 'text-[var(--emerald)]'
            : e.type === 'error'   ? 'text-[var(--rose)]'
            :                        'text-[var(--cyan)]'}`}>
            {e.msg}
          </span>
        </div>
      ))}
    </div>
  );
}