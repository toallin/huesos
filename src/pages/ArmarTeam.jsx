import { useState, useEffect } from 'react';
import { jugadorService } from '../services/jugadorService.js';
import './ArmarTeam.css';

const ADMIN_PASSWORD = 'AdminMixtoneVandal2026_Secure#';
const MAX_POR_EQUIPO = 5;
const MAX_EQUIPOS = 10;

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

    // Admin auth
    const [adminLogueado, setAdminLogueado] = useState(false);
    const [passInput, setPassInput] = useState('');
    const [mostrarLoginAdmin, setMostrarLoginAdmin] = useState(false);

    // Draft state
    const [equipos, setEquipos] = useState([]);
    const [fase, setFase] = useState('configuracion'); // 'configuracion' | 'seleccion' | 'listo'
    const [jugadorSeleccionado, setJugadorSeleccionado] = useState(null); // Jugador que el admin seleccionó para asignar
    const [jugadoresSeleccionados, setJugadoresSeleccionados] = useState([]);

    // Matchup state
    const [matchups, setMatchups] = useState(null);

    // Cargar jugadores
    useEffect(() => {
        cargarJugadores();
    }, []);

    const cargarJugadores = async () => {
        setLoading(true);
        try {
            const data = await jugadorService.getAll();
            setJugadores(data);
        } catch (error) {
            console.error('Error cargando jugadores:', error);
            const localData = localStorage.getItem('listaJugadores');
            if (localData) {
                setJugadores(JSON.parse(localData));
            }
        } finally {
            setLoading(false);
        }
    };

    // Auth
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
        resetDraft();
    };

    const resetDraft = () => {
        setEquipos([]);
        setFase('configuracion');
        setMatchups(null);
        setJugadoresSeleccionados([]);
        setJugadorSeleccionado(null);
    };

    // ── Funciones del Draft ──

    // Agregar nuevo equipo
    const agregarEquipo = () => {
        if (equipos.length >= MAX_EQUIPOS) {
            alert(`Máximo ${MAX_EQUIPOS} equipos permitidos`);
            return;
        }

        setEquipos([...equipos, {
            capitan: null,
            miembros: [],
            nombre: `EQUIPO ${equipos.length + 1}`
        }]);
    };

    // Eliminar equipo
    const eliminarEquipo = (idx) => {
        const equipo = equipos[idx];
        if (equipo.capitan || equipo.miembros.length > 0) {
            alert('No puedes eliminar un equipo que tiene jugadores');
            return;
        }
        const nuevosEquipos = equipos.filter((_, i) => i !== idx);
        setEquipos(nuevosEquipos);
    };

    // Seleccionar un jugador del pool (para asignarlo a un equipo)
    const seleccionarJugadorPool = (jugador) => {
        if (!adminLogueado) return;
        if (fase === 'listo') return;
        if (jugadoresSeleccionados.includes(jugador.id)) {
            alert('Este jugador ya está en un equipo');
            return;
        }

        // Si el jugador ya está seleccionado, lo deseleccionamos
        if (jugadorSeleccionado?.id === jugador.id) {
            setJugadorSeleccionado(null);
            return;
        }

        setJugadorSeleccionado(jugador);
    };

    // Asignar jugador seleccionado a un equipo
    const asignarJugadorAEquipo = (equipoIdx, esCapitan = false) => {
        if (!jugadorSeleccionado) {
            alert('Primero selecciona un jugador del pool');
            return;
        }

        if (jugadoresSeleccionados.includes(jugadorSeleccionado.id)) {
            alert('Este jugador ya está en un equipo');
            setJugadorSeleccionado(null);
            return;
        }

        const equipo = equipos[equipoIdx];
        if (!equipo) return;

        const totalMiembros = (equipo.capitan ? 1 : 0) + equipo.miembros.length;

        if (esCapitan) {
            if (equipo.capitan) {
                alert('Este equipo ya tiene capitán');
                return;
            }
            const nuevosEquipos = [...equipos];
            nuevosEquipos[equipoIdx].capitan = jugadorSeleccionado;
            setEquipos(nuevosEquipos);
            setJugadoresSeleccionados([...jugadoresSeleccionados, jugadorSeleccionado.id]);
            setJugadorSeleccionado(null);
        } else {
            if (totalMiembros >= MAX_POR_EQUIPO) {
                alert(`El equipo ya tiene ${MAX_POR_EQUIPO} jugadores`);
                return;
            }
            if (!equipo.capitan) {
                alert('Este equipo no tiene capitán. Asigna un capitán primero.');
                return;
            }
            const nuevosEquipos = [...equipos];
            nuevosEquipos[equipoIdx].miembros.push(jugadorSeleccionado);
            setEquipos(nuevosEquipos);
            setJugadoresSeleccionados([...jugadoresSeleccionados, jugadorSeleccionado.id]);
            setJugadorSeleccionado(null);
        }

        // Verificar si todos los equipos están completos
        const todosLlenos = equipos.every(eq => {
            const total = (eq.capitan ? 1 : 0) + eq.miembros.length;
            return total === MAX_POR_EQUIPO;
        });
        if (todosLlenos && equipos.length >= 2) {
            setFase('listo');
        }
    };

    // Remover jugador de un equipo
    const removerJugador = (equipoIdx, jugadorId, esCapitan = false) => {
        if (!adminLogueado) return;
        if (fase === 'listo') return;

        const nuevosEquipos = [...equipos];
        if (esCapitan) {
            nuevosEquipos[equipoIdx].capitan = null;
        } else {
            nuevosEquipos[equipoIdx].miembros = nuevosEquipos[equipoIdx].miembros.filter(j => j.id !== jugadorId);
        }
        setEquipos(nuevosEquipos);
        setJugadoresSeleccionados(prev => prev.filter(id => id !== jugadorId));
    };

    // Auto-draft (opcional)
    const handleAutodraft = () => {
        if (fase === 'listo') return;

        const disponibles = jugadores.filter(j => !jugadoresSeleccionados.includes(j.id));
        if (disponibles.length === 0) return;

        // Primero, asegurar que todos los equipos tengan capitán
        let nuevosEquipos = equipos.map(eq => ({ ...eq, miembros: [...eq.miembros] }));
        let nuevosSeleccionados = [...jugadoresSeleccionados];
        let disponiblesRestantes = [...disponibles];

        // Asignar capitanes a equipos sin capitán
        nuevosEquipos.forEach((eq, idx) => {
            if (!eq.capitan && disponiblesRestantes.length > 0) {
                const jugador = disponiblesRestantes.shift();
                eq.capitan = jugador;
                nuevosSeleccionados.push(jugador.id);
            }
        });

        // Llenar el resto de los equipos
        disponiblesRestantes.forEach(jugador => {
            for (let i = 0; i < nuevosEquipos.length; i++) {
                const total = (nuevosEquipos[i].capitan ? 1 : 0) + nuevosEquipos[i].miembros.length;
                if (total < MAX_POR_EQUIPO) {
                    nuevosEquipos[i].miembros.push(jugador);
                    nuevosSeleccionados.push(jugador.id);
                    break;
                }
            }
        });

        setEquipos(nuevosEquipos);
        setJugadoresSeleccionados(nuevosSeleccionados);
        setJugadorSeleccionado(null);

        // Verificar si todos están llenos
        const todosLlenos = nuevosEquipos.every(eq => {
            const total = (eq.capitan ? 1 : 0) + eq.miembros.length;
            return total === MAX_POR_EQUIPO;
        });
        if (todosLlenos && nuevosEquipos.length >= 2) {
            setFase('listo');
        }
    };

    // Generar enfrentamientos
    const handleEnfrentamientoRandom = () => {
        const todosLlenos = equipos.every(eq => {
            const total = (eq.capitan ? 1 : 0) + eq.miembros.length;
            return total === MAX_POR_EQUIPO;
        });

        if (!todosLlenos) {
            alert('Todos los equipos deben estar completos (5 jugadores)');
            return;
        }

        const equiposCompletos = equipos.map((eq, idx) => ({
            nombre: eq.nombre || `EQUIPO ${idx + 1}`,
            color: TEAM_COLORS[idx % TEAM_COLORS.length],
            capitan: eq.capitan,
            miembros: eq.miembros,
        }));

        const mezclados = [...equiposCompletos].sort(() => Math.random() - 0.5);
        const pares = [];
        for (let i = 0; i + 1 < mezclados.length; i += 2) {
            pares.push([mezclados[i], mezclados[i + 1]]);
        }
        if (mezclados.length % 2 !== 0) {
            pares.push([mezclados[mezclados.length - 1], null]);
        }
        setMatchups(pares);
    };

    // ── Instruction bar ──
    const getInstruccion = () => {
        if (!adminLogueado) {
            return <div className="draft-instruction-bar view-only">👁️ MODO VISTA — SOLO EL ADMIN PUEDE ARMAR EQUIPOS</div>;
        }
        if (fase === 'configuracion') {
            return (
                <div className="draft-instruction-bar setup-phase">
                    🏆 1. SELECCIONA UN JUGADOR → 2. ASÍGNALO COMO CAPITÁN A UN EQUIPO
                </div>
            );
        }
        if (fase === 'listo') {
            return <div className="draft-instruction-bar finished">✅ EQUIPOS COMPLETOS — LISTOS PARA ENFRENTAR</div>;
        }
        return null;
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
            {/* Header */}
            <header className="draft-header">
                <h1>SALA DE DRAFT</h1>
                <p className="draft-subtitle">Arma tus escuadras de 5 — estilo CS2</p>
                {getInstruccion()}

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

            {/* Pool de Agentes */}
            <div className="players-pool-panel">
                <div className="pool-header">
                    <h2>
                        POOL DE AGENTES
                        <span className="pool-count-badge">
                            {jugadores.filter(j => !jugadoresSeleccionados.includes(j.id)).length} DISPONIBLES / {jugadores.length} TOTAL
                        </span>
                        {jugadorSeleccionado && (
                            <span className="selected-indicator" style={{ color: '#00ff88', marginLeft: '15px' }}>
                                ✅ SELECCIONADO: {jugadorSeleccionado.nombre}
                            </span>
                        )}
                    </h2>
                    {adminLogueado && fase !== 'listo' && (
                        <button className="val-btn secondary" onClick={handleAutodraft}>
                            ⚡ AUTO-DRAFT
                        </button>
                    )}
                </div>

                <div className="pool-grid">
                    {jugadores.map((jugador) => {
                        const seleccionado = jugadoresSeleccionados.includes(jugador.id);
                        const esJugadorSeleccionado = jugadorSeleccionado?.id === jugador.id;
                        const habilitado = adminLogueado && !seleccionado && fase !== 'listo';

                        return (
                            <div
                                key={jugador.id}
                                className={`pool-card-item tier-${jugador.tier} 
                                    ${seleccionado ? 'dark-selected' : ''} 
                                    ${esJugadorSeleccionado ? 'selected-active' : ''} 
                                    ${habilitado ? 'habilitado' : 'deshabilitado'}`}
                                onClick={() => habilitado && seleccionarJugadorPool(jugador)}
                            >
                                <div className="pool-card-img-wrapper">
                                    <img
                                        src={jugador.foto}
                                        alt={jugador.nombre}
                                        onError={(e) => { e.target.src = 'https://images.unsplash.com/photo-1542751371-adc38448a05e?q=80&w=300&auto=format&fit=crop'; }}
                                    />
                                    {seleccionado && (
                                        <div className="card-selected-overlay">
                                            <span className="overlay-badge">
                                                {equipos.findIndex(eq => eq.capitan?.id === jugador.id) !== -1 ?
                                                    `CAP ${equipos.findIndex(eq => eq.capitan?.id === jugador.id) + 1}` :
                                                    `EQ ${equipos.findIndex(eq => eq.miembros.some(m => m.id === jugador.id)) + 1}`
                                                }
                                            </span>
                                        </div>
                                    )}
                                    {esJugadorSeleccionado && (
                                        <div className="card-selected-overlay" style={{ background: 'rgba(0, 255, 136, 0.2)' }}>
                                            <span className="overlay-badge" style={{ borderColor: '#00ff88', color: '#00ff88' }}>SELECCIONADO</span>
                                        </div>
                                    )}
                                    <div className="pool-card-tier" style={{ backgroundColor: `var(--tier-${jugador.tier})` }}>
                                        {jugador.tier === 0 ? 'TS' : `T${jugador.tier}`}
                                    </div>
                                </div>
                                <div className="pool-card-info">
                                    <h3>{jugador.nombre}</h3>
                                    <span className="pool-card-status">
                                        {seleccionado ? '✅ EN EQUIPO' :
                                            esJugadorSeleccionado ? '🟢 SELECCIONADO' :
                                                (habilitado ? '🟡 DISPONIBLE' : '⚫ DESHABILITADO')}
                                    </span>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Sección de Equipos */}
            {adminLogueado && (
                <div className="draft-active-layout">
                    <div className="teams-config-section">
                        <div className="teams-header">
                            <h2>EQUIPOS ({equipos.length})</h2>
                            <div className="teams-actions">
                                {fase !== 'listo' && (
                                    <button
                                        className="val-btn"
                                        onClick={agregarEquipo}
                                        disabled={fase === 'listo' || equipos.length >= MAX_EQUIPOS}
                                    >
                                        ➕ AGREGAR TEAM
                                    </button>
                                )}
                                {fase === 'listo' && (
                                    <button
                                        className="val-btn matchup-btn"
                                        onClick={handleEnfrentamientoRandom}
                                    >
                                        ⚔️ ENFRENTAMIENTO
                                    </button>
                                )}
                            </div>
                        </div>

                        <div className="teams-grid-container" style={{ gridTemplateColumns: `repeat(${Math.min(equipos.length || 1, 4)}, minmax(220px, 1fr))` }}>
                            {equipos.map((equipo, idx) => {
                                const teamColor = TEAM_COLORS[idx % TEAM_COLORS.length];
                                const totalMiembros = (equipo.capitan ? 1 : 0) + equipo.miembros.length;
                                const estaCompleto = totalMiembros === MAX_POR_EQUIPO;

                                return (
                                    <div
                                        key={idx}
                                        className={`team-column ${estaCompleto ? 'team-complete' : ''}`}
                                        style={{ '--team-color': teamColor }}
                                    >
                                        <div className="team-header-panel">
                                            <div className="team-title-row">
                                                <h2>{equipo.nombre || `EQUIPO ${idx + 1}`}</h2>
                                                {fase !== 'listo' && !equipo.capitan && equipo.miembros.length === 0 && (
                                                    <button
                                                        className="delete-team-btn"
                                                        onClick={() => eliminarEquipo(idx)}
                                                        title="Eliminar equipo vacío"
                                                    >
                                                        ✕
                                                    </button>
                                                )}
                                            </div>
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

                                            {/* Botón Asignar Capitán */}
                                            <div className="team-actions">
                                                {fase !== 'listo' && (
                                                    <button
                                                        className={`assign-btn ${equipo.capitan ? 'has-captain' : ''}`}
                                                        onClick={() => asignarJugadorAEquipo(idx, true)}
                                                        disabled={!!equipo.capitan || !jugadorSeleccionado}
                                                    >
                                                        {equipo.capitan ? '✅ CAPITÁN' : '👑 ASIGNAR CAPITÁN'}
                                                    </button>
                                                )}
                                            </div>

                                            {/* Capitán */}
                                            {equipo.capitan ? (
                                                <div className="captain-card-small">
                                                    <img src={equipo.capitan.foto} alt={equipo.capitan.nombre}
                                                        onError={(e) => { e.target.src = 'https://images.unsplash.com/photo-1542751371-adc38448a05e?q=80&w=300&auto=format&fit=crop'; }} />
                                                    <div className="cap-info">
                                                        <span className="cap-label">CAPITÁN</span>
                                                        <span className="cap-name">{equipo.capitan.nombre}</span>
                                                    </div>
                                                    <span className="cap-tier-badge" style={{ backgroundColor: `var(--tier-${equipo.capitan.tier})`, color: [0, 1, 3].includes(equipo.capitan.tier) ? '#fff' : '#000' }}>
                                                        {equipo.capitan.tier === 0 ? 'S' : equipo.capitan.tier}
                                                    </span>
                                                    {fase !== 'listo' && (
                                                        <button
                                                            className="remove-player-btn"
                                                            onClick={() => removerJugador(idx, equipo.capitan.id, true)}
                                                            title="Remover capitán"
                                                        >
                                                            ✕
                                                        </button>
                                                    )}
                                                </div>
                                            ) : (
                                                <div className="captain-placeholder">
                                                    {fase !== 'listo' ? '⬅️ SELECCIONA JUGADOR Y ASIGNA' : 'ESPERANDO CAPITÁN...'}
                                                </div>
                                            )}

                                            {/* Botón Asignar Miembro */}
                                            <div className="team-actions" style={{ marginTop: '8px' }}>
                                                {fase !== 'listo' && equipo.capitan && (
                                                    <button
                                                        className={`assign-btn ${totalMiembros >= MAX_POR_EQUIPO ? 'full' : ''}`}
                                                        onClick={() => asignarJugadorAEquipo(idx, false)}
                                                        disabled={totalMiembros >= MAX_POR_EQUIPO || !jugadorSeleccionado}
                                                    >
                                                        {totalMiembros >= MAX_POR_EQUIPO ? '✅ COMPLETO' : '➕ ASIGNAR JUGADOR'}
                                                    </button>
                                                )}
                                            </div>

                                            {/* Miembros */}
                                            <div className="team-members-list">
                                                {equipo.miembros.map((j, mIdx) => (
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
                                                        {fase !== 'listo' && (
                                                            <button
                                                                className="remove-player-btn small"
                                                                onClick={() => removerJugador(idx, j.id, false)}
                                                                title="Remover jugador"
                                                            >
                                                                ✕
                                                            </button>
                                                        )}
                                                    </div>
                                                ))}
                                                {Array.from({ length: Math.max(0, (MAX_POR_EQUIPO - 1) - equipo.miembros.length) }).map((_, s) => (
                                                    <div key={`empty-${s}`} className="team-member-row empty-slot">
                                                        <span className="member-index">#{equipo.miembros.length + s + 1}</span>
                                                        <div className="empty-slot-avatar"></div>
                                                        <div className="member-detail">
                                                            <span className="empty-slot-label">— SLOT —</span>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>

                                            {estaCompleto && (
                                                <div className="team-complete-badge">✅ COMPLETO</div>
                                            )}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>
            )}

            {/* Modal de Enfrentamiento */}
            {matchups && (
                <div className="matchup-overlay" onClick={() => setMatchups(null)}>
                    <div className="matchup-modal" onClick={e => e.stopPropagation()}>
                        <div className="matchup-modal-header">
                            <h2>⚔️ ENFRENTAMIENTOS</h2>
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