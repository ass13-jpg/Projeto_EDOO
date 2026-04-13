import { useEffect, useState, useCallback, useRef } from 'react';
import { getStatus, toggleDevice } from './api/smarthome';
import StatusBar       from './components/StatusBar';
import AmbientSensors  from './components/AmbientSensors';
import DeviceCard      from './components/DeviceCard';
import ActivityLog     from './components/ActivityLog';

// ─── MOCK ────────────────────────────────────────────────────────────────────
// Exibido enquanto o C++ não estiver rodando. Remova ou ignore quando o
// backend estiver up — getStatus() vai sobrescrever automaticamente.
const MOCK_DATA = {
  dispositivos: [
    { id: 1, nome: 'Luminária Sala',    tipo: 'luz',       comodo: 'Sala de Estar',    ligado: true,  consumo_w: 12,  brilho: 80 },
    { id: 2, nome: 'Ar-Condicionado',   tipo: 'ac',        comodo: 'Quarto Principal', ligado: true,  consumo_w: 900, temperatura: 22 },
    { id: 3, nome: 'Fechadura Smart',   tipo: 'fechadura', comodo: 'Entrada',          ligado: false, consumo_w: 2 },
    { id: 4, nome: 'Câmera Ext.',       tipo: 'camera',    comodo: 'Garagem',          ligado: true,  consumo_w: 5 },
    { id: 5, nome: 'Caixa de Som',      tipo: 'speaker',   comodo: 'Sala de Estar',    ligado: false, consumo_w: 30 },
    { id: 6, nome: 'Persiana Elétrica', tipo: 'persiana',  comodo: 'Escritório',       ligado: true,  consumo_w: 15 },
    { id: 7, nome: 'Ventilador Teto',   tipo: 'ventilador',comodo: 'Cozinha',          ligado: false, consumo_w: 65 },
    { id: 8, nome: 'Smart TV',          tipo: 'tv',        comodo: 'Sala de Estar',    ligado: true,  consumo_w: 150 },
  ],
  sensores: { temperatura: 24, umidade: 58, luminosidade: 340, co2: 412 },
};

// ─── HELPERS ─────────────────────────────────────────────────────────────────
function ts() {
  return new Date().toLocaleTimeString('pt-BR', { hour12: false });
}

function calcStats(dispositivos = []) {
  const on    = dispositivos.filter(d => d.ligado).length;
  const total = dispositivos.length;
  const power = dispositivos
    .filter(d => d.ligado)
    .reduce((acc, d) => acc + (d.consumo_w || 0), 0);
  return {
    totalOn: on,
    total,
    power: power ? `${power}W` : `${on * 40}W est.`,
  };
}

// ─── APP ─────────────────────────────────────────────────────────────────────
export default function App() {
  const [dispositivos, setDispositivos] = useState([]);
  const [sensores,     setSensores]     = useState(null);
  const [apiStatus,    setApiStatus]    = useState({ state: 'loading' });
  const [toggling,     setToggling]     = useState(new Set());
  const [log,          setLog]          = useState([]);

  const addLog = useCallback((msg, type = 'info') => {
    setLog(prev => [{ time: ts(), msg, type }, ...prev].slice(0, 50));
  }, []);

  // ── fetch status do C++ ────────────────────────────────────────────────────
  const fetchStatus = useCallback(async (silent = false) => {
    if (!silent) addLog('GET /api/status');
    try {
      const data = await getStatus();
      const devs = data.dispositivos || data.devices || [];
      setDispositivos(devs);
      setSensores(data.sensores || data.ambiente || null);
      setApiStatus({ state: 'ok' });
      if (!silent) addLog(`Recebidos ${devs.length} dispositivo(s)`, 'success');
    } catch (e) {
      setApiStatus({ state: 'err' });
      addLog(`Erro: ${e.message} — modo offline (mock)`, 'error');
      // cai no mock somente na primeira carga
      if (dispositivos.length === 0) {
        setDispositivos(MOCK_DATA.dispositivos);
        setSensores(MOCK_DATA.sensores);
      }
    }
  }, [addLog, dispositivos.length]);

  // ── toggle de dispositivo ──────────────────────────────────────────────────
  const handleToggle = useCallback(async (id) => {
    setToggling(prev => new Set(prev).add(id));
    addLog(`POST /api/dispositivo/${id}/toggle`);

    // atualização otimista — inverte localmente enquanto aguarda C++
    setDispositivos(prev =>
      prev.map(d => d.id === id ? { ...d, ligado: !d.ligado } : d)
    );

    try {
      const res = await toggleDevice(id);
      // aplica o estado real que o C++ decidiu
      setDispositivos(prev =>
        prev.map(d => d.id === id ? { ...d, ligado: res.ligado } : d)
      );
      addLog(`Dispositivo #${id} → ${res.ligado ? 'ligado' : 'desligado'}`, 'success');
    } catch (e) {
      // rollback se a API falhar
      setDispositivos(prev =>
        prev.map(d => d.id === id ? { ...d, ligado: !d.ligado } : d)
      );
      addLog(`Erro no toggle #${id}: ${e.message}`, 'error');
    } finally {
      setToggling(prev => { const s = new Set(prev); s.delete(id); return s; });
    }
  }, [addLog]);

  // ── boot + polling ─────────────────────────────────────────────────────────
  useEffect(() => {
    fetchStatus();
    const interval = setInterval(() => fetchStatus(true), 30_000);
    return () => clearInterval(interval);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const stats = calcStats(dispositivos);

  return (
    <>
      {/* ── NAV ─────────────────────────────────────────────────────────── */}
      <nav className="sticky top-0 z-50 flex items-center justify-between
                      px-8 h-[60px] border-b border-[var(--border)]
                      bg-[rgba(8,12,20,0.7)] backdrop-blur-xl">
        <div className="text-[1.1rem] font-semibold tracking-tight">
          SmartHome<span className="text-[var(--cyan)]">.sim</span>
        </div>
        <div className="flex gap-8 text-sm" style={{ color: 'var(--text-dim)' }}>
          {['Sobre','Funcionalidades','Simulador','Pilares'].map(l => (
            <span key={l} className="cursor-pointer hover:text-[var(--text)] transition-colors">{l}</span>
          ))}
        </div>
        <div className="flex items-center gap-2 text-xs rounded-full px-4 py-1.5
                        border border-[var(--border)]"
             style={{ color: 'var(--text-dim)' }}>
          <span className="w-1.5 h-1.5 rounded-full bg-[var(--emerald)]
                           [animation:pulse_2s_infinite]" />
          <span>
            {apiStatus.state === 'ok'      ? 'API conectada'
           : apiStatus.state === 'err'     ? 'API offline'
           :                                 'conectando...'}
          </span>
        </div>
      </nav>

      {/* ── HERO ────────────────────────────────────────────────────────── */}
      <div className="max-w-[900px] mx-auto px-8 pt-20 pb-12 text-center">
        <div className="inline-flex items-center gap-1.5 text-[.72rem] tracking-[.12em]
                        uppercase text-[var(--cyan)] border border-[rgba(0,229,255,.3)]
                        rounded-full px-4 py-1 mb-6">
          CIN · UFPE · EDOO
        </div>
        <h1 className="text-[clamp(2.4rem,6vw,4rem)] font-bold leading-[1.05]
                       tracking-[-0.04em] mb-4">
          Smart Home<br />
          <span className="text-[var(--cyan)]">Ecosystem Simulator</span>
        </h1>
        <p className="text-base leading-relaxed max-w-[580px] mx-auto"
           style={{ color: 'var(--text-dim)' }}>
          Simulador de ecossistema IoT residencial inteligente, desenvolvido em C++
          como projeto da disciplina de Estrutura de Dados e Orientação a Objetos.
        </p>
        <div className="flex flex-wrap gap-2.5 justify-center mt-6">
          {['⌁ IoT Residencial','◈ C++ / POO','⚡ Automação Inteligente'].map(p => (
            <span key={p}
                  className="text-xs rounded-md border border-[var(--border)]
                             bg-white/[.04] px-3 py-1.5"
                  style={{ fontFamily: 'var(--mono)', color: 'var(--text-dim)' }}>
              {p}
            </span>
          ))}
        </div>
      </div>

      {/* ── MAIN ────────────────────────────────────────────────────────── */}
      <main className="max-w-[1200px] mx-auto px-6 pb-16">

        <StatusBar {...stats} apiStatus={apiStatus} />

        {/* sensores */}
        <SectionLabel>Sensores Ambientais</SectionLabel>
        <AmbientSensors sensores={sensores} />

        {/* dispositivos */}
        <SectionLabel>Dispositivos</SectionLabel>
        {dispositivos.length === 0
          ? <SkeletonGrid />
          : (
            <div className="grid gap-4 mb-10"
                 style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))' }}>
              {dispositivos.map(d => (
                <DeviceCard
                  key={d.id}
                  device={d}
                  onToggle={handleToggle}
                  isToggling={toggling.has(d.id)}
                />
              ))}
            </div>
          )}

        {/* log */}
        <SectionLabel>Log de Atividade</SectionLabel>
        <ActivityLog entries={log} />

      </main>

      <footer className="text-center py-8 border-t border-[var(--border)] mt-8"
              style={{ fontSize: '.72rem', color: 'var(--text-muted)', fontFamily: 'var(--mono)' }}>
        SmartHome<span className="text-[var(--cyan)]">.sim</span> · CIN · UFPE · EDOO · C++ / POO
      </footer>
    </>
  );
}

// ─── MICRO-COMPONENTES locais do App ──────────────────────────────────────────
function SectionLabel({ children }) {
  return (
    <div className="flex items-center gap-3 mb-4 mt-0"
         style={{ fontSize: '.7rem', letterSpacing: '.14em', textTransform: 'uppercase',
                  color: 'var(--text-muted)' }}>
      {children}
      <div className="flex-1 h-px bg-[var(--border)]" />
    </div>
  );
}

function SkeletonGrid() {
  return (
    <div className="grid gap-4 mb-10"
         style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))' }}>
      {[...Array(4)].map((_, i) => (
        <div key={i} className="h-40 rounded-2xl border border-[var(--border)]
                                 bg-white/[.03] [animation:shimmer_1.5s_infinite]" />
      ))}
    </div>
  );
}