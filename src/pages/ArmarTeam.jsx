import { useState, useEffect } from 'react';
import { jugadorService } from '../services/jugadorService.js';
import './ArmarTeam.css';

const ADMIN_PASSWORD = 'AdminMixtoneVandal2026_Secure#';
const MAX_POR_EQUIPO = 5;

const TEAM_COLORS = [
    '#ff4655', // Rojo Carmesí
    '#f1c40f', // Amarillo Oro
    '#00e5ff', // Cian Neón
    '#aa3bff', // Púrpura Neón
    '#2ecc71', // Verde Esmeralda
    '#e67e22', // Naranja Fuego
    '#3498db', // Azul Cobalto
    '#e74c3c', // Rojo Tomate
    '#9b59b6', // Violeta Oscuro
    '#1abc9c'  // Verde Turquesa
];

const ArmarTeam = () => {
    const [jugadores, setJugadores] = useState([]);
    const [loading, setLoading] = useState(false);

    // ── Admin auth ──
    const [adminLogueado, setAdminLogueado] = useState(false);
    const [passInput, setPassInput] = useState('');
    const [mostrarLoginAdmin, setMostrarLoginAdmin] = useState(false);

    // ── Draft state ──
    const [numEquipos, setNumEquipos] = useState(2);
    const [fase, setFase] = useState('configuracion');
    const [capitanes, setCapitanes] = useState([]);
    const [equipos, setEquipos] = useState([]);
    const [turnoDeIndex, setTurnoDeIndex] = useState(0);

    // ── Matchup state ──
    const [matchups, setMatchups] = useState(null);

    // Cargar jugadores desde el backend
    useEffect(() => {
        cargarJugadores();
    }, []);

    const cargarJugadores = async () => {
        setLoading(true);
        try {
            const data = await jugadorService.getAll();
            console.log('✅ Jugadores cargados (ArmarTeam):', data);
            setJugadores(data);
        } catch (error) {
            console.error('❌ Error cargando jugadores (ArmarTeam):', error);
            // Fallback a localStorage
            const localData = localStorage.getItem('listaJugadores');
            if (localData) {
                console.log('📦 Usando datos de localStorage como fallback');
                setJugadores(JSON.parse(localData));
            }
        } finally {
            setLoading(false);
        }
    };

    // ── Auth helpers ──
    const handleLoginAdmin = (e) => {
        e.preventDefault();
        if (passInput === ADMIN_PASSWORD) {
            setAdminLogueado(true);
            setMostrarLoginAdmin(false);
            setPassInput('');
        } else {
            alert('Sigue intentando, bruto');
            setPassInput('');
        }
    };

    const handleLogoutAdmin = () => {
        setAdminLogueado(false);
        setCapitanes([]);
        setEquipos([]);
        setTurnoDeIndex(0);
        setFase('configuracion');
        setMatchups(null);
    };

    // ── Draft helpers ──
    const estaSeleccionado = (id) => {
        return capitanes.some(c => c && c.id === id) ||
            equipos.some(eq => eq.some(j => j.id === id));
    };

    const equipoLleno = (idx) => {
        const cap = capitanes[idx];
        const miembros = equipos[idx] || [];
        return cap && miembros.length >= MAX_POR_EQUIPO - 1;
    };

    const todosLlenos = () => {
        return Array.from({ length: capitanes.length }).every((_, idx) => equipoLleno(idx));
    };

    const handleSeleccionarJugador = (jugador) => {
        if (estaSeleccionado(jugador.id)) return;

        if (fase === 'capitanes') {
            const nuevoCapitanes = [...capitanes];
            const primerVacioIdx = nuevoCapitanes.indexOf(null);
            if (primerVacioIdx !== -1) {
                nuevoCapitanes[primerVacioIdx] = jugador;
                setCapitanes(nuevoCapitanes);
                if (!nuevoCapitanes.some(c => c === null)) {
                    setFase('draft');
                    setTurnoDeIndex(0);
                }
            }
        } else if (fase === 'draft') {
            let intentos = 0;
            let idx = turnoDeIndex;
            while (intentos < capitanes.length) {
                if (!equipoLleno(idx)) {
                    const nuevosEquipos = equipos.map((eq, i) =>
                        i === idx ? [...eq, jugador] : eq
                    );
                    setEquipos(nuevosEquipos);
                    let siguienteIdx = (idx + 1) % capitanes.length;
                    setTurnoDeIndex(siguienteIdx);
                    break;
                }
                idx = (idx + 1) % capitanes.length;
                intentos++;
            }
        }
    };

    const handleComenzarDraft = () => {
        const parsedNum = parseInt(numEquipos);
        if (isNaN(parsedNum) || parsedNum < 2) {
            alert('Mínimo 2 equipos.');
            return;
        }
        if (parsedNum > jugadores.length) {
            alert(`No hay suficientes jugadores (${jugadores.length}) para ${parsedNum} capitanes.`);
            return;
        }
        setCapitanes(Array(parsedNum).fill(null));
        setEquipos(Array.from({ length: parsedNum }, () => []));
        setTurnoDeIndex(0);
        setFase('capitanes');
    };

    const handleReiniciarTodo = () => {
        setCapitanes([]);
        setEquipos([]);
        setTurnoDeIndex(0);
        setFase('configuracion');
        setMatchups(null);
    };

    const handleEnfrentamientoRandom = () => {
        const todosEquipos = capitanes.map((cap, idx) => ({
            nombre: `EQUIPO ${idx + 1}`,
            color: TEAM_COLORS[idx % TEAM_COLORS.length],
            capitan: cap,
            miembros: equipos[idx] || [],
        }));

        const mezclados = [...todosEquipos].sort(() => Math.random() - 0.5);
        const pares = [];
        for (let i = 0; i + 1 < mezclados.length; i += 2) {
            pares.push([mezclados[i], mezclados[i + 1]]);
        }
        if (mezclados.length % 2 !== 0) {
            pares.push([mezclados[mezclados.length - 1], null]);
        }
        setMatchups(pares);
    };

    const handleAutodraft = () => {
        if (fase !== 'draft') return;
        const disponibles = jugadores.filter(j => !estaSeleccionado(j.id));
        if (disponibles.length === 0) return;

        const mezclados = [...disponibles].sort(() => Math.random() - 0.5);
        let currentTurnIdx = turnoDeIndex;
        let nuevosEquipos = equipos.map(eq => [...eq]);

        mezclados.forEach(jugador => {
            let intentos = 0;
            while (intentos < capitanes.length) {
                const miembros = nuevosEquipos[currentTurnIdx];
                if (capitanes[currentTurnIdx] && miembros.length < MAX_POR_EQUIPO - 1) {
                    nuevosEquipos[currentTurnIdx].push(jugador);
                    currentTurnIdx = (currentTurnIdx + 1) % capitanes.length;
                    break;
                }
                currentTurnIdx = (currentTurnIdx + 1) % capitanes.length;
                intentos++;
            }
        });

        setEquipos(nuevosEquipos);
        setTurnoDeIndex(currentTurnIdx);
    };

    // ── Instruction bar ──
    const getInstruccion = () => {
        if (!adminLogueado) {
            return (
                <div className="draft-instruction-bar view-only">
                    👁️ MODO VISTA — SOLO EL ADMIN PUEDE ARMAR EQUIPOS
                </div>
            );
        }
        if (fase === 'configuracion') {
            return (
                <div className="draft-instruction-bar setup-phase">
                    INGRESA LA CANTIDAD DE EQUIPOS PARA LA ARENA
                </div>
            );
        }
        if (fase === 'capitanes') {
            const primerVacioIdx = capitanes.indexOf(null);
            const teamColor = TEAM_COLORS[primerVacioIdx % TEAM_COLORS.length];
            return (
                <div className="draft-instruction-bar choose-cap" style={{ '--team-color': teamColor }}>
                    <span className="pulse-dot"></span>
                    SELECCIONA AL <strong className="cap-highlight">CAPITÁN {primerVacioIdx + 1}</strong> DEL POOL
                </div>
            );
        }
        if (todosLlenos()) {
            return <div className="draft-instruction-bar finished">✅ DRAFT COMPLETO — EQUIPOS FORMADOS</div>;
        }
        const capTurno = capitanes[turnoDeIndex];
        const teamColor = TEAM_COLORS[turnoDeIndex % TEAM_COLORS.length];
        return (
            <div className="draft-instruction-bar active-turn" style={{ '--team-color': teamColor }}>
                <span className="pulse-dot"></span>
                TURNO: <strong className="cap-highlight">{capTurno?.nombre}</strong> (CAPITÁN {turnoDeIndex + 1})
            </div>
        );
    };

    if (loading) {
        return (
            <div className="draft-page-container">
                <div className="loading-container">
                    <p>⏳ Cargando jugadores...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="draft-page-container">
            {/* ── Header ── */}
            <header className="draft-header">
                <h1>SALA DE DRAFT</h1>
                <p className="draft-subtitle">Arma tus escuadras de 5 — estilo CS2</p>
                {getInstruccion()}

                {/* Botón recargar */}
                <button
                    onClick={cargarJugadores}
                    className="val-btn secondary"
                    style={{
                        position: 'absolute',
                        right: '180px',
                        top: '20px',
                        width: 'auto',
                        padding: '6px 14px',
                        fontSize: '11px'
                    }}
                    disabled={loading}
                >
                    🔄 RECARGAR
                </button>

                {/* Admin auth button top-right */}
                <div className="admin-auth-bar">
                    {adminLogueado ? (
                        <button className="val-btn secondary auth-btn" onClick={handleLogoutAdmin}>
                            🔓 CERRAR SESIÓN ADMIN
                        </button>
                    ) : (
                        <button className="val-btn auth-btn" onClick={() => setMostrarLoginAdmin(v => !v)}>
                            🔐 ACCESO ADMIN
                        </button>
                    )}
                </div>

                {/* Login dropdown */}
                {mostrarLoginAdmin && !adminLogueado && (
                    <div className="admin-login-dropdown">
                        <form onSubmit={handleLoginAdmin} className="admin-login-form">
                            <label>CONTRASEÑA DE ADMINISTRADOR</label>
                            <div className="admin-login-row">
                                <input
                                    type="password"
                                    placeholder="••••••••••••"
                                    value={passInput}
                                    onChange={(e) => setPassInput(e.target.value)}
                                    autoFocus
                                    required
                                />
                                <button type="submit" className="val-btn">ENTRAR</button>
                            </div>
                        </form>
                    </div>
                )}
            </header>

            {/* ── Pool de Agentes (siempre visible) ── */}
            <div className="players-pool-panel">
                <div className="pool-header">
                    <h2>
                        POOL DE AGENTES
                        <span className="pool-count-badge">
                            {jugadores.filter(j => !estaSeleccionado(j.id)).length} DISPONIBLES / {jugadores.length} TOTAL
                        </span>
                    </h2>
                    {adminLogueado && fase !== 'configuracion' && (
                        <div className="pool-actions">
                            {fase === 'draft' && !todosLlenos() && jugadores.filter(j => !estaSeleccionado(j.id)).length > 0 && (
                                <button className="val-btn secondary" onClick={handleAutodraft}>
                                    AUTO-DRAFT RESTANTES
                                </button>
                            )}
                            <button className="val-btn reset-btn" onClick={handleReiniciarTodo}>
                                ⚙️ CONFIGURACIÓN
                            </button>
                        </div>
                    )}
                </div>

                <div className="pool-grid">
                    {jugadores.map((jugador) => {
                        const seleccionado = estaSeleccionado(jugador.id);
                        let label = '';
                        const capIdx = capitanes.findIndex(c => c && c.id === jugador.id);
                        if (capIdx !== -1) {
                            label = `CAP ${capIdx + 1}`;
                        } else {
                            const eqIdx = equipos.findIndex(eq => eq.some(j => j.id === jugador.id));
                            if (eqIdx !== -1) label = `EQ ${eqIdx + 1}`;
                        }

                        const bloqueado = !adminLogueado || seleccionado;

                        return (
                            <div
                                key={jugador.id}
                                className={`pool-card-item tier-${jugador.tier} ${seleccionado ? 'dark-selected' : ''} ${!adminLogueado ? 'no-admin' : ''}`}
                                onClick={() => !bloqueado && handleSeleccionarJugador(jugador)}
                            >
                                <div className="pool-card-img-wrapper">
                                    <img
                                        src={jugador.foto}
                                        alt={jugador.nombre}
                                        onError={(e) => { e.target.src = 'https://images.unsplash.com/photo-1542751371-adc38448a05e?q=80&w=300&auto=format&fit=crop'; }}
                                    />
                                    {seleccionado && (
                                        <div className="card-selected-overlay">
                                            <span className="overlay-badge">{label}</span>
                                        </div>
                                    )}
                                    <div className="pool-card-tier" style={{ backgroundColor: `var(--tier-${jugador.tier})` }}>
                                        {jugador.tier === 0 ? 'TS' : `T${jugador.tier}`}
                                    </div>
                                </div>
                                <div className="pool-card-info">
                                    <h3>{jugador.nombre}</h3>
                                    <span className="pool-card-status">
                                        {seleccionado ? 'SELECCIONADO' : adminLogueado ? 'DISPONIBLE' : 'VISTA'}
                                    </span>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* ── Sección de Draft (solo admin) ── */}
            {adminLogueado && (
                <div className="draft-active-layout">
                    {fase === 'configuracion' && (
                        <div className="lobby-setup-wrapper">
                            <div className="lobby-setup-card">
                                <div className="lobby-setup-header">
                                    <h2>CONFIGURACIÓN DEL COMBATE</h2>
                                    <p>Equipos de {MAX_POR_EQUIPO} jugadores (capitán incluido) — formato CS2</p>
                                </div>
                                <div className="setup-options">
                                    <label className="setup-label">CANTIDAD DE EQUIPOS</label>
                                    <div className="teams-input-container">
                                        <button type="button" className="num-adjust-btn"
                                            onClick={() => setNumEquipos(prev => Math.max(2, prev - 1))}>
                                            -
                                        </button>
                                        <input
                                            type="number" min="2"
                                            max={Math.floor(jugadores.length / MAX_POR_EQUIPO)}
                                            value={numEquipos}
                                            onChange={(e) => {
                                                const val = parseInt(e.target.value);
                                                setNumEquipos(isNaN(val) ? '' : val);
                                            }}
                                            onBlur={() => {
                                                if (!numEquipos || numEquipos < 2) setNumEquipos(2);
                                            }}
                                            className="teams-number-input"
                                        />
                                        <button type="button" className="num-adjust-btn"
                                            onClick={() => setNumEquipos(prev => Math.min(Math.floor(jugadores.length / MAX_POR_EQUIPO), prev + 1))}>
                                            +
                                        </button>
                                    </div>
                                    <span className="setup-help-text">
                                        Máx. {Math.floor(jugadores.length / MAX_POR_EQUIPO)} equipos con {jugadores.length} agentes registrados
                                    </span>
                                </div>
                                <button type="button" className="val-btn lobby-start-btn" onClick={handleComenzarDraft}>
                                    INICIAR SELECCIÓN DE CAPITANES
                                </button>
                            </div>
                        </div>
                    )}

                    {fase !== 'configuracion' && (
                        <div className="teams-grid-container"
                            style={{ gridTemplateColumns: `repeat(${capitanes.length}, minmax(220px, 1fr))` }}>
                            {Array.from({ length: capitanes.length }).map((_, idx) => {
                                const capitan = capitanes[idx];
                                const miembros = equipos[idx] || [];
                                const esTurnoActivo = fase === 'draft' && turnoDeIndex === idx && !equipoLleno(idx) && !todosLlenos();
                                const teamColor = TEAM_COLORS[idx % TEAM_COLORS.length];
                                const totalMiembros = (capitan ? 1 : 0) + miembros.length;

                                return (
                                    <div
                                        key={idx}
                                        className={`team-column ${esTurnoActivo ? 'active-picking' : ''}`}
                                        style={{ '--team-color': teamColor }}
                                    >
                                        <div className="team-header-panel">
                                            <h2>EQUIPO {idx + 1}</h2>
                                            <div className="team-slots-bar">
                                                {Array.from({ length: MAX_POR_EQUIPO }).map((_, s) => (
                                                    <div
                                                        key={s}
                                                        className={`slot-dot ${s < totalMiembros ? 'filled' : ''}`}
                                                        style={s < totalMiembros ? { backgroundColor: teamColor } : {}}
                                                    />
                                                ))}
                                                <span className="slots-label">{totalMiembros}/{MAX_POR_EQUIPO}</span>
                                            </div>
                                            {capitan ? (
                                                <div className="captain-card-small">
                                                    <img src={capitan.foto} alt={capitan.nombre}
                                                        onError={(e) => { e.target.src = 'https://images.unsplash.com/photo-1542751371-adc38448a05e?q=80&w=300&auto=format&fit=crop'; }} />
                                                    <div className="cap-info">
                                                        <span className="cap-label">CAPITÁN {idx + 1}</span>
                                                        <span className="cap-name">{capitan.nombre}</span>
                                                    </div>
                                                    <span className="cap-tier-badge" style={{ backgroundColor: `var(--tier-${capitan.tier})`, color: [0, 1, 3].includes(capitan.tier) ? '#fff' : '#000' }}>
                                                        {capitan.tier === 0 ? 'S' : capitan.tier}
                                                    </span>
                                                </div>
                                            ) : (
                                                <div className="captain-placeholder">ESPERANDO CAPITÁN...</div>
                                            )}
                                        </div>

                                        <div className="team-members-list">
                                            {miembros.map((j, mIdx) => (
                                                <div key={j.id} className="team-member-row">
                                                    <span className="member-index">#{mIdx + 1}</span>
                                                    <img src={j.foto} alt={j.nombre} className="member-avatar"
                                                        onError={(e) => { e.target.src = 'https://images.unsplash.com/photo-1542751371-adc38448a05e?q=80&w=300&auto=format&fit=crop'; }} />
                                                    <div className="member-detail">
                                                        <span className="member-name">{j.nombre}</span>
                                                        <span className="member-tier" style={{ color: `var(--tier-${j.tier})` }}>
                                                            {j.tier === 0 ? 'TIER S' : `TIER ${j.tier}`}
                                                        </span>
                                                    </div>
                                                </div>
                                            ))}
                                            {Array.from({ length: Math.max(0, (MAX_POR_EQUIPO - 1) - miembros.length) }).map((_, s) => (
                                                <div key={`empty-${s}`} className="team-member-row empty-slot">
                                                    <span className="member-index">#{miembros.length + s + 1}</span>
                                                    <div className="empty-slot-avatar"></div>
                                                    <div className="member-detail">
                                                        <span className="empty-slot-label">— SLOT DISPONIBLE —</span>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            )}

            {/* ── Botón Enfrentamiento ── */}
            {adminLogueado && fase === 'draft' && capitanes.length > 0 && capitanes.every(c => c !== null) && (() => {
                const allFull = capitanes.every((_, idx) => {
                    const miembros = equipos[idx] || [];
                    return miembros.length >= MAX_POR_EQUIPO - 1;
                });
                return allFull ? (
                    <div className="matchup-trigger-wrapper">
                        <button
                            className="val-btn matchup-btn"
                            onClick={handleEnfrentamientoRandom}
                        >
                            ⚔️ ENFRENTAMIENTO RANDOM
                        </button>
                    </div>
                ) : null;
            })()}

            {/* ── Modal de Enfrentamiento ── */}
            {matchups && (
                <div className="matchup-overlay" onClick={() => setMatchups(null)}>
                    <div className="matchup-modal" onClick={e => e.stopPropagation()}>
                        <div className="matchup-modal-header">
                            <h2>⚔️ ENFRENTAMIENTOS</h2>
                            <p className="matchup-subtitle">Bracket generado aleatoriamente</p>
                            <button className="matchup-close-btn" onClick={() => setMatchups(null)}>✕</button>
                        </div>
                        <div className="matchup-brackets">
                            {matchups.map((par, pIdx) => (
                                <div key={pIdx} className="matchup-pair">
                                    <div className="matchup-team" style={{ '--mc': par[0].color }}>
                                        <div className="matchup-team-name" style={{ color: par[0].color }}>{par[0].nombre}</div>
                                        <div className="matchup-captain">
                                            <img src={par[0].capitan?.foto} alt={par[0].capitan?.nombre}
                                                onError={e => { e.target.src = 'https://images.unsplash.com/photo-1542751371-adc38448a05e?q=80&w=300&auto=format&fit=crop'; }} />
                                            <div>
                                                <span className="mc-label">CAPITÁN</span>
                                                <span className="mc-name">{par[0].capitan?.nombre}</span>
                                            </div>
                                        </div>
                                        <ul className="matchup-players">
                                            {par[0].miembros.map(m => (
                                                <li key={m.id}>{m.nombre} <span style={{ color: `var(--tier-${m.tier})`, fontSize: '0.7rem' }}>{m.tier === 0 ? 'S' : `T${m.tier}`}</span></li>
                                            ))}
                                        </ul>
                                    </div>

                                    <div className="matchup-vs">VS</div>

                                    {par[1] ? (
                                        <div className="matchup-team" style={{ '--mc': par[1].color }}>
                                            <div className="matchup-team-name" style={{ color: par[1].color }}>{par[1].nombre}</div>
                                            <div className="matchup-captain">
                                                <img src={par[1].capitan?.foto} alt={par[1].capitan?.nombre}
                                                    onError={e => { e.target.src = 'https://images.unsplash.com/photo-1542751371-adc38448a05e?q=80&w=300&auto=format&fit=crop'; }} />
                                                <div>
                                                    <span className="mc-label">CAPITÁN</span>
                                                    <span className="mc-name">{par[1].capitan?.nombre}</span>
                                                </div>
                                            </div>
                                            <ul className="matchup-players">
                                                {par[1].miembros.map(m => (
                                                    <li key={m.id}>{m.nombre} <span style={{ color: `var(--tier-${m.tier})`, fontSize: '0.7rem' }}>{m.tier === 0 ? 'S' : `T${m.tier}`}</span></li>
                                                ))}
                                            </ul>
                                        </div>
                                    ) : (
                                        <div className="matchup-team bye">
                                            <div className="matchup-team-name">BYE</div>
                                            <p>Descansa esta ronda</p>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                        <button className="val-btn matchup-regen-btn" onClick={handleEnfrentamientoRandom}>
                            🔀 REGENERAR
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ArmarTeam;