import { useState, useEffect } from 'react';
import { jugadorService } from '../services/jugadorService.js';
import './Home.css?t=20260704';

const Home = () => {
    const [jugadores, setJugadores] = useState([]);
    const [busqueda, setBusqueda] = useState('');
    const [tierFiltro, setTierFiltro] = useState('todos');
    const [loading, setLoading] = useState(false);

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

    const jugadoresFiltrados = jugadores.filter(jugador => {
        const matchesNombre = jugador.nombre.toLowerCase().includes(busqueda.toLowerCase());
        const matchesTier = tierFiltro === 'todos' || jugador.tier === parseInt(tierFiltro);
        return matchesNombre && matchesTier;
    });

    return (
        <div className="home-container">
            <header className="home-header">
                <h1>AGENTES REGISTRADOS</h1>
                <p className="home-subtitle">Lista de jugadores para el draft de salas mixtas</p>
            </header>

            <div className="filters-container">
                <div className="search-box">
                    <span className="search-icon">🔍</span>
                    <input
                        type="text"
                        placeholder="BUSCAR JUGADOR..."
                        value={busqueda}
                        onChange={(e) => setBusqueda(e.target.value)}
                    />
                </div>

                <div className="tier-filter-buttons">
                    <button
                        className={tierFiltro === 'todos' ? 'val-btn active' : 'val-btn secondary'}
                        onClick={() => setTierFiltro('todos')}
                    >
                        TODOS
                    </button>
                    <button
                        className={tierFiltro === '0' ? 'val-btn active' : 'val-btn secondary'}
                        style={tierFiltro === '0' ? { backgroundColor: '#ff4655', borderColor: '#ff4655' } : {}}
                        onClick={() => setTierFiltro('0')}
                    >
                        TIER S
                    </button>
                    {[1, 2, 3, 4, 5].map(t => (
                        <button
                            key={t}
                            className={tierFiltro === String(t) ? 'val-btn active' : 'val-btn secondary'}
                            style={tierFiltro === String(t) ? { backgroundColor: `var(--tier-${t})`, borderColor: `var(--tier-${t})` } : {}}
                            onClick={() => setTierFiltro(String(t))}
                        >
                            TIER {t}
                        </button>
                    ))}
                </div>

                <button
                    onClick={cargarJugadores}
                    className="val-btn secondary"
                    style={{
                        width: 'auto',
                        padding: '8px 16px',
                        fontSize: '11px',
                        letterSpacing: '0.5px'
                    }}
                    disabled={loading}
                >
                    {loading ? '🔄 CARGANDO...' : '🔄 RECARGAR'}
                </button>
            </div>

            <div className="stats-bar-compact">
                <span className="stat-item">Total: <strong>{jugadores.length}</strong></span>
                <span className="stat-item">Tier S: <strong style={{ color: '#ff4655' }}>{jugadores.filter(j => j.tier === 0).length}</strong></span>
                <span className="stat-item">Tier 1: <strong style={{ color: '#ff6b35' }}>{jugadores.filter(j => j.tier === 1).length}</strong></span>
                <span className="stat-item">Tier 2: <strong style={{ color: '#ffd700' }}>{jugadores.filter(j => j.tier === 2).length}</strong></span>
                <span className="stat-item">Tier 3: <strong style={{ color: '#00e5ff' }}>{jugadores.filter(j => j.tier === 3).length}</strong></span>
                <span className="stat-item">Tier 4: <strong style={{ color: '#3498db' }}>{jugadores.filter(j => j.tier === 4).length}</strong></span>
                <span className="stat-item">Tier 5: <strong style={{ color: '#9b59b6' }}>{jugadores.filter(j => j.tier === 5).length}</strong></span>
            </div>

            <div className="grid-jugadores-compact">
                {loading ? (
                    <div className="empty-message-container">
                        <p className="empty-message">⏳ Cargando jugadores...</p>
                    </div>
                ) : jugadoresFiltrados.length > 0 ? (
                    jugadoresFiltrados.map((jugador) => (
                        <div
                            key={jugador.id}
                            className="card-jugador-compact"
                        >
                            <div className="card-image-wrapper-compact">
                                <img src={jugador.foto} alt={jugador.nombre} onError={(e) => {
                                    e.target.src = 'https://images.unsplash.com/photo-1542751371-adc38448a05e?q=80&w=300&auto=format&fit=crop';
                                }} />
                                <span className="card-tier-badge-compact" style={{ backgroundColor: `var(--tier-${jugador.tier})` }}>
                                    {jugador.tier === 0 ? 'S' : jugador.tier}
                                </span>

                                {/* ── OVERLAY CON LA FRASE ── */}
                                {jugador.frase && (
                                    <div className="card-hover-overlay">
                                        <div className="card-hover-content">
                                            <span className="card-hover-quote">"</span>
                                            <span className="card-hover-text">{jugador.frase}</span>
                                            <span className="card-hover-quote">"</span>
                                        </div>
                                    </div>
                                )}
                            </div>
                            <div className="card-info-compact">
                                <span className="card-name-compact">{jugador.nombre}</span>
                                <span className="card-role-compact">AGENTE MIXTONE</span>
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="empty-message-container">
                        <p className="empty-message">No hay agentes registrados en el sistema.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Home;