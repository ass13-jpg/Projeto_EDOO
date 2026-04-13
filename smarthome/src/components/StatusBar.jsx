// Barra superior com totais + indicador de status da API.
// Recebe dados já calculados — não faz fetch.

export default function StatusBar({ totalOn, total, power, apiStatus }) {
  const pill = {
    ok:      'text-[var(--emerald)] border-[rgba(0,230,118,0.3)] bg-[rgba(0,230,118,0.06)]',
    err:     'text-[var(--rose)]    border-[rgba(255,79,112,0.3)] bg-[rgba(255,79,112,0.06)]',
    loading: 'text-[var(--text-dim)] border-[var(--border)] bg-[var(--glass)]',
  }[apiStatus.state];

  const labels = { ok: 'API conectada', err: 'API offline', loading: 'Conectando...' };

  return (
    <div className="flex flex-wrap items-center justify-between gap-3
                    rounded-xl border border-[var(--border)] bg-[var(--glass)]
                    px-6 py-4 mb-8 backdrop-blur-sm">

      <Stat label="Dispositivos ativos" value={totalOn ?? '—'} color="var(--cyan)" />
      <Divider />
      <Stat label="Total cadastrado"    value={total   ?? '—'} />
      <Divider />
      <Stat label="Consumo estimado"    value={power   ?? '—'} color="var(--amber)" />
      <Divider />
      <Stat label="Endpoint"
            value="localhost:8080"
            style={{ fontFamily: 'var(--mono)', fontSize: '0.75rem',
                     color: 'var(--text-dim)' }} />

      <div className={`flex items-center gap-2 rounded-lg border px-4 py-1.5 text-sm ${pill}`}>
        {apiStatus.state === 'loading'
          ? <span className="[animation:blink_1s_step-start_infinite]">●</span>
          : <span>●</span>}
        <span>{labels[apiStatus.state]}</span>
      </div>
    </div>
  );
}

function Stat({ label, value, color, style }) {
  return (
    <div>
      <div className="text-xs uppercase tracking-widest mb-1"
           style={{ color: 'var(--text-muted)' }}>
        {label}
      </div>
      <div className="text-base font-semibold" style={{ color, ...style }}>
        {value}
      </div>
    </div>
  );
}

function Divider() {
  return <div className="hidden sm:block w-px h-9 bg-[var(--border)]" />;
}