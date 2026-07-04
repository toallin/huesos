import { useState, useEffect } from 'react';
import { jugadorService } from '../services/jugadorService.js';
import './ArmarTeam.css';

const ADMIN_PASSWORD = 'AdminMixtoneVandal2026_Secure#';
const MAX_POR_EQUIPO = 5;
const MAX_EQUIPOS = 10;

const TEAM_COLORS = [
    '#ff4655', '#f1c40f', '#00e5ff', '#aa3bff', '#2ecc71',
    '#e67e22', '#3498db', '#e74c3c', '#9b59b6', '#1abc9c'
];

const TIER_ORDER = [0, 1, 2, 3, 4, 5];
const TIER_LABELS = { 0: 'S', 1: '1', 2: '2', 3: '3', 4: '4', 5: '5' };
const TIER_COLORS = {
    0: '#ff4655', 1: '#ff6b35', 2: '#ffd700',
    3: '#00e5ff', 4: '#3498db', 5: '#9b59b6'
};

const ArmarTeam = () => {
    const [jugadores, setJugadores] = useState([]);
    const [loading, setLoading] = useState(false);
    const [todosCompletos, setTodosCompletos] = useState(false);

    // Admin auth
    const [adminLogueado, setAdminLogueado] = useState(false);
    const [passInput, setPassInput] = useState('');
    const [mostrarLoginAdmin, setMostrarLoginAdmin] = useState(false);

    // Draft state
    const [equipos, setEquipos] = useState([]);
    const [jugadorSeleccionado, setJugadorSeleccionado] = useState(null);
    const [jugadoresSeleccionados, setJugadoresSeleccionados] = useState([]);
    const [jugadoresHabilitados, setJugadoresHabilitados] = useState({});

    // Cargar jugadores
    useEffect(() => {
        cargarJugadores();
    }, []);

    // Verificar si todos los equipos están completos
    useEffect(() => {
        if (equipos.length >= 2) {
            const todosLlenos = equipos.every(eq => {
                const total = (eq.capitan ? 1 : 0) + eq.miembros.length;
                return total === MAX_POR_EQUIPO;
            });
            setTodosCompletos(todosLlenos);
        } else {
            setTodosCompletos(false);
        }
    }, [equipos]);

    const cargarJugadores = async () => {
        setLoading(true);
        try {
            const data = await jugadorService.getAll();
            setJugadores(data);
            const inicialHabilitados = {};
            data.forEach(j => {
                inicialHabilitados[j.id] = false;
            });
            setJugadoresHabilitados(inicialHabilitados);
        } catch (error) {
            console.error('Error cargando jugadores:', error);
            const localData = localStorage.getItem('listaJugadores');
            if (localData) {
                const parsed = JSON.parse(localData);
                setJugadores(parsed);
                const inicialHabilitados = {};
                parsed.forEach(j => {
                    inicialHabilitados[j.id] = false;
                });
                setJugadoresHabilitados(inicialHabilitados);
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
        setTodosCompletos(false);
        setJugadoresSeleccionados([]);
        setJugadorSeleccionado(null);
        const inicialHabilitados = {};
        jugadores.forEach(j => {
            inicialHabilitados[j.id] = false;
        });
        setJugadoresHabilitados(inicialHabilitados);
    };

    // ── Funciones de habilitar/deshabilitar ──
    const toggleHabilitarJugador = (jugadorId) => {
        if (!adminLogueado) return;
        if (jugadoresSeleccionados.includes(jugadorId)) {
            alert('No puedes deshabilitar un jugador que ya está en un equipo');
            return;
        }
        setJugadoresHabilitados(prev => ({
            ...prev,
            [jugadorId]: !prev[jugadorId]
        }));
    };

    const habilitarTodos = () => {
        if (!adminLogueado) return;
        const nuevos = {};
        jugadores.forEach(j => {
            nuevos[j.id] = !jugadoresSeleccionados.includes(j.id);
        });
        setJugadoresHabilitados(nuevos);
    };

    const deshabilitarTodos = () => {
        if (!adminLogueado) return;
        const nuevos = {};
        jugadores.forEach(j => {
            nuevos[j.id] = jugadoresSeleccionados.includes(j.id);
        });
        setJugadoresHabilitados(nuevos);
    };

    // ── Seleccionar jugador para equipo ──
    const seleccionarJugadorParaEquipo = (jugador) => {
        if (!adminLogueado) return;
        if (todosCompletos) return;
        if (jugadoresSeleccionados.includes(jugador.id)) {
            alert('Este jugador ya está en un equipo');
            return;
        }
        if (!jugadoresHabilitados[jugador.id]) {
            alert('Este jugador está deshabilitado. Habilítalo primero.');
            return;
        }

        if (jugadorSeleccionado?.id === jugador.id) {
            setJugadorSeleccionado(null);
            return;
        }
        setJugadorSeleccionado(jugador);
    };

    // ── Funciones del Draft ──
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

    const eliminarEquipo = (idx) => {
        const equipo = equipos[idx];
        if (equipo.capitan || equipo.miembros.length > 0) {
            alert('No puedes eliminar un equipo que tiene jugadores');
            return;
        }
        const nuevosEquipos = equipos.filter((_, i) => i !== idx);
        setEquipos(nuevosEquipos);
    };

    const asignarJugadorAEquipo = (equipoIdx, esCapitan = false) => {
        if (!jugadorSeleccionado) {
            alert('Primero selecciona un jugador de la lista');
            return;
        }

        if (jugadoresSeleccionados.includes(jugadorSeleccionado.id)) {
            alert('Este jugador ya está en un equipo');
            setJugadorSeleccionado(null);
            return;
        }

        if (!jugadoresHabilitados[jugadorSeleccionado.id]) {
            alert('Este jugador está deshabilitado');
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
    };

    const removerJugador = (equipoIdx, jugadorId, esCapitan = false) => {
        if (!adminLogueado) return;
        if (todosCompletos) return;

        const nuevosEquipos = [...equipos];
        if (esCapitan) {
            nuevosEquipos[equipoIdx].capitan = null;
        } else {
            nuevosEquipos[equipoIdx].miembros = nuevosEquipos[equipoIdx].miembros.filter(j => j.id !== jugadorId);
        }
        setEquipos(nuevosEquipos);
        setJugadoresSeleccionados(prev => prev.filter(id => id !== jugadorId));
    };

    const handleAutodraft = () => {
        if (todosCompletos) return;

        const disponibles = jugadores.filter(j => !jugadoresSeleccionados.includes(j.id) && jugadoresHabilitados[j.id]);
        if (disponibles.length === 0) {
            alert('No hay jugadores habilitados disponibles');
            return;
        }

        let nuevosEquipos = equipos.map(eq => ({ ...eq, miembros: [...eq.miembros] }));
        let nuevosSeleccionados = [...jugadoresSeleccionados];
        let disponiblesRestantes = [...disponibles];

        nuevosEquipos.forEach((eq, idx) => {
            if (!eq.capitan && disponiblesRestantes.length > 0) {
                const jugador = disponiblesRestantes.shift();
                eq.capitan = jugador;
                nuevosSeleccionados.push(jugador.id);
            }
        });

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
    };

    // ── Obtener jugadores agrupados por tier ──
    const getJugadoresPorTier = () => {
        const agrupados = {};
        TIER_ORDER.forEach(tier => {
            agrupados[tier] = jugadores.filter(j => j.tier === tier);
        });
        return agrupados;
    };

    // ── Instruction bar ──
    const getInstruccion = () => {
        if (!adminLogueado) {
            return <div className="draft-instruction-bar view-only">👁️ MODO VISTA — SOLO EL ADMIN PUEDE ARMAR EQUIPOS</div>;
        }
        if (todosCompletos) {
            return <div className="draft-instruction-bar finished">✅ TODOS LOS EQUIPOS ESTÁN COMPLETOS</div>;
        }
        return (
            <div className="draft-instruction-bar setup-phase">
                🏆 HABILITA JUGADORES → SELECCIONA → ASIGNA A EQUIPOS
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

    const totalHabilitados = Object.values(jugadoresHabilitados).filter(v => v).length;
    const totalDisponibles = jugadores.filter(j =>
        !jugadoresSeleccionados.includes(j.id) && jugadoresHabilitados[j.id]
    ).length;

    const jugadoresPorTier = getJugadoresPorTier();

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

            {/* CONTENEDOR PRINCIPAL */}
            <div className="draft-main-layout">
                {/* PANEL IZQUIERDO: Lista de Jugadores */}
                <div className="players-list-panel">
                    <div className="list-header">
                        <h2>
                            JUGADORES
                            <span className="list-count-badge">
                                {totalDisponibles} DISP / {jugadores.length} TOT
                            </span>
                            <span className="list-count-badge habilitados-badge">
                                ✅ {totalHabilitados}
                            </span>
                            <span className="list-count-badge deshabilitados-badge">
                                ⛔ {jugadores.length - totalHabilitados - jugadoresSeleccionados.length}
                            </span>
                            {jugadorSeleccionado && (
                                <span className="selected-indicator">
                                    ✅ {jugadorSeleccionado.nombre}
                                </span>
                            )}
                        </h2>
                        <div className="list-actions">
                            {adminLogueado && !todosCompletos && (
                                <>
                                    <button className="val-btn secondary small-btn" onClick={habilitarTodos}>
                                        ✅ TODOS
                                    </button>
                                    <button className="val-btn secondary small-btn" onClick={deshabilitarTodos}>
                                        ❌ NINGUNO
                                    </button>
                                    <button className="val-btn secondary small-btn" onClick={handleAutodraft}>
                                        ⚡ AUTO
                                    </button>
                                </>
                            )}
                        </div>
                    </div>

                    {/* Leyenda */}
                    {adminLogueado && !todosCompletos && (
                        <div className="controles-leyenda">
                            <span className="leyenda-item">🖱️ Click = Seleccionar</span>
                            <span className="leyenda-item">🖱️ Click Der = Habilitar/Deshabilitar</span>
                            <span className="leyenda-item">✅ Habilitado</span>
                            <span className="leyenda-item">⛔ Deshabilitado</span>
                        </div>
                    )}

                    {/* Lista por Tier */}
                    <div className="tier-list-container">
                        {TIER_ORDER.map(tier => {
                            const jugadoresTier = jugadoresPorTier[tier] || [];
                            if (jugadoresTier.length === 0) return null;

                            return (
                                <div key={tier} className="tier-group">
                                    <div className="tier-header" style={{ borderColor: TIER_COLORS[tier] }}>
                                        <span className="tier-label" style={{ color: TIER_COLORS[tier] }}>
                                            TIER {TIER_LABELS[tier]}
                                        </span>
                                        <span className="tier-count">{jugadoresTier.length} jugadores</span>
                                    </div>
                                    <div className="tier-players-horizontal">
                                        {jugadoresTier.map(jugador => {
                                            const seleccionado = jugadoresSeleccionados.includes(jugador.id);
                                            const habilitado = jugadoresHabilitados[jugador.id] || false;
                                            const esJugadorSeleccionado = jugadorSeleccionado?.id === jugador.id;
                                            const enEquipo = seleccionado;

                                            return (
                                                <div
                                                    key={jugador.id}
                                                    className={`player-card ${enEquipo ? 'en-equipo' : ''}
                                                        ${esJugadorSeleccionado ? 'seleccionado-activo' : ''}
                                                        ${!enEquipo && habilitado ? 'habilitado' : ''}
                                                        ${!enEquipo && !habilitado ? 'deshabilitado' : ''}
                                                        ${adminLogueado && !enEquipo && !todosCompletos ? 'admin-interactable' : ''}`}
                                                    onClick={() => {
                                                        if (!adminLogueado) return;
                                                        if (enEquipo) return;
                                                        if (todosCompletos) return;
                                                        if (habilitado) {
                                                            seleccionarJugadorParaEquipo(jugador);
                                                        }
                                                    }}
                                                    onContextMenu={(e) => {
                                                        e.preventDefault();
                                                        if (!adminLogueado) return;
                                                        if (enEquipo) {
                                                            alert('No puedes deshabilitar un jugador en equipo');
                                                            return;
                                                        }
                                                        if (todosCompletos) return;
                                                        toggleHabilitarJugador(jugador.id);
                                                    }}
                                                >
                                                    <div className="player-avatar" style={{ borderColor: TIER_COLORS[tier] }}>
                                                        <img
                                                            src={jugador.foto}
                                                            alt={jugador.nombre}
                                                            onError={(e) => {
                                                                e.target.src = 'https://images.unsplash.com/photo-1542751371-adc38448a05e?q=80&w=300&auto=format&fit=crop';
                                                            }}
                                                        />
                                                        <span className="player-tier-badge" style={{ backgroundColor: TIER_COLORS[tier] }}>
                                                            {TIER_LABELS[tier]}
                                                        </span>
                                                        {enEquipo && (
                                                            <span className="player-equipo-badge">
                                                                EQ {equipos.findIndex(eq =>
                                                                    eq.capitan?.id === jugador.id ||
                                                                    eq.miembros.some(m => m.id === jugador.id)
                                                                ) + 1}
                                                            </span>
                                                        )}
                                                    </div>
                                                    <div className="player-info">
                                                        <span className="player-name">{jugador.nombre}</span>
                                                        <span className={`player-status ${enEquipo ? 'status-en-equipo' : habilitado ? 'status-habilitado' : 'status-deshabilitado'}`}>
                                                            {enEquipo ? '✅ EN EQ' :
                                                                esJugadorSeleccionado ? '🟢 SEL' :
                                                                    habilitado ? '🟡 HAB' : '🔴 DES'}
                                                        </span>
                                                    </div>
                                                    <div className="player-actions">
                                                        {adminLogueado && !enEquipo && !todosCompletos && (
                                                            <>
                                                                <button
                                                                    className={`action-btn toggle-btn ${habilitado ? 'activo' : ''}`}
                                                                    onClick={(e) => {
                                                                        e.stopPropagation();
                                                                        toggleHabilitarJugador(jugador.id);
                                                                    }}
                                                                    title={habilitado ? 'Deshabilitar' : 'Habilitar'}
                                                                >
                                                                    {habilitado ? '✅' : '⛔'}
                                                                </button>
                                                                <button
                                                                    className={`action-btn select-btn ${esJugadorSeleccionado ? 'activo' : ''}`}
                                                                    onClick={(e) => {
                                                                        e.stopPropagation();
                                                                        if (todosCompletos) return;
                                                                        if (habilitado) {
                                                                            seleccionarJugadorParaEquipo(jugador);
                                                                        } else {
                                                                            alert('Habilita el jugador primero');
                                                                        }
                                                                    }}
                                                                    disabled={!habilitado || todosCompletos}
                                                                    title={esJugadorSeleccionado ? 'Deseleccionar' : 'Seleccionar'}
                                                                >
                                                                    {esJugadorSeleccionado ? '🔵' : '⚪'}
                                                                </button>
                                                            </>
                                                        )}
                                                        {enEquipo && (
                                                            <span className="en-equipo-label">✅</span>
                                                        )}
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* PANEL DERECHO: Equipos */}
                {adminLogueado && (
                    <div className="teams-panel">
                        <div className="teams-header">
                            <h2>EQUIPOS ({equipos.length})</h2>
                            <div className="teams-actions">
                                {!todosCompletos && (
                                    <button
                                        className="val-btn"
                                        onClick={agregarEquipo}
                                        disabled={equipos.length >= MAX_EQUIPOS}
                                    >
                                        ➕ AGREGAR
                                    </button>
                                )}
                                {todosCompletos && (
                                    <div className="teams-complete-message">
                                        ✅ TODOS LOS EQUIPOS COMPLETOS
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="teams-horizontal-scroll">
                            {equipos.map((equipo, idx) => {
                                const teamColor = TEAM_COLORS[idx % TEAM_COLORS.length];
                                const totalMiembros = (equipo.capitan ? 1 : 0) + equipo.miembros.length;
                                const estaCompleto = totalMiembros === MAX_POR_EQUIPO;

                                return (
                                    <div
                                        key={idx}
                                        className={`team-card ${estaCompleto ? 'team-complete' : ''}`}
                                        style={{ '--team-color': teamColor }}
                                    >
                                        <div className="team-card-header">
                                            <div className="team-title-row">
                                                <h3>{equipo.nombre || `EQ ${idx + 1}`}</h3>
                                                {!todosCompletos && !equipo.capitan && equipo.miembros.length === 0 && (
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
                                        </div>

                                        <div className="team-players-list">
                                            {/* Capitán */}
                                            {equipo.capitan ? (
                                                <div className="team-player captain">
                                                    <img src={equipo.capitan.foto} alt={equipo.capitan.nombre}
                                                        onError={(e) => { e.target.src = 'https://images.unsplash.com/photo-1542751371-adc38448a05e?q=80&w=300&auto=format&fit=crop'; }} />
                                                    <div className="team-player-info">
                                                        <span className="team-player-name">{equipo.capitan.nombre}</span>
                                                        <span className="team-player-role">CAPITÁN</span>
                                                    </div>
                                                    {!todosCompletos && (
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
                                                <div className="team-player empty-captain">
                                                    <span>👑 SIN CAPITÁN</span>
                                                    {!todosCompletos && jugadorSeleccionado && (
                                                        <button
                                                            className="assign-btn small"
                                                            onClick={() => asignarJugadorAEquipo(idx, true)}
                                                        >
                                                            ASIGNAR
                                                        </button>
                                                    )}
                                                </div>
                                            )}

                                            {/* Miembros */}
                                            {equipo.miembros.map((j, mIdx) => {
                                                const tierColor = TIER_COLORS[j.tier] || '#ffffff';
                                                return (
                                                    <div key={j.id} className="team-player member">
                                                        <span className="member-number">#{mIdx + 1}</span>
                                                        <img src={j.foto} alt={j.nombre}
                                                            onError={(e) => { e.target.src = 'https://images.unsplash.com/photo-1542751371-adc38448a05e?q=80&w=300&auto=format&fit=crop'; }} />
                                                        <div className="team-player-info">
                                                            <span className="team-player-name">{j.nombre}</span>
                                                            <span className="team-player-tier" style={{ color: tierColor }}>
                                                                T{TIER_LABELS[j.tier]}
                                                            </span>
                                                        </div>
                                                        {!todosCompletos && (
                                                            <button
                                                                className="remove-player-btn small"
                                                                onClick={() => removerJugador(idx, j.id, false)}
                                                                title="Remover jugador"
                                                            >
                                                                ✕
                                                            </button>
                                                        )}
                                                    </div>
                                                );
                                            })}

                                            {/* Slots vacíos */}
                                            {Array.from({ length: Math.max(0, MAX_POR_EQUIPO - 1 - equipo.miembros.length) }).map((_, s) => (
                                                <div key={`empty-${s}`} className="team-player empty-slot">
                                                    <span className="empty-slot-icon">⬜</span>
                                                    <span className="empty-slot-label">SLOT {equipo.miembros.length + s + 1}</span>
                                                </div>
                                            ))}

                                            {/* Botón para agregar jugador */}
                                            {!todosCompletos && equipo.capitan && totalMiembros < MAX_POR_EQUIPO && (
                                                <button
                                                    className="add-player-btn"
                                                    onClick={() => asignarJugadorAEquipo(idx, false)}
                                                    disabled={!jugadorSeleccionado}
                                                >
                                                    {jugadorSeleccionado ? '➕ AGREGAR' : '🔒 SELECCIONA UN JUGADOR'}
                                                </button>
                                            )}
                                        </div>

                                        {estaCompleto && (
                                            <div className="team-complete-badge">✅ COMPLETO</div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ArmarTeam;