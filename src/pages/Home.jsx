import { useState, useEffect } from 'react';
import './Home.css';

const Home = () => {
    const [jugadores, setJugadores] = useState([]);
    const [busqueda, setBusqueda] = useState('');
    const [tierFiltro, setTierFiltro] = useState('todos');

    useEffect(() => {
        console.log('🔄 Home - useEffect ejecutado');
        const data = localStorage.getItem('listaJugadores');
        console.log('📦 Datos en localStorage (Home):', data);

        if (data) {
            const parsedData = JSON.parse(data);
            console.log('✅ Datos parseados (Home):', parsedData);
            setJugadores(parsedData);
        } else {
            console.log('⚠️ No hay datos en localStorage (Home), inicializando vacío');
            localStorage.setItem('listaJugadores', JSON.stringify([]));
            setJugadores([]);
        }
    }, []);

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

                <div className="stats-bar">
                    <div className="stat-card">
                        <span className="stat-value">{jugadores.length}</span>
                        <span className="stat-label">TOTAL JUGADORES</span>
                    </div>
                    <div className="stat-card">
                        <span className="stat-value">{jugadores.filter(j => j.tier === 0).length}</span>
                        <span className="stat-label">TIER S (DIOS)</span>
                    </div>
                    <div className="stat-card">
                        <span className="stat-value">{jugadores.filter(j => j.tier === 1).length}</span>
                        <span className="stat-label">TIER 1 (ELITE)</span>
                    </div>
                </div>
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
                        style={tierFiltro === '0' ? { backgroundColor: `var(--tier-0)`, borderColor: `var(--tier-0)` } : {}}
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
            </div>

            <div className="grid-jugadores">
                {jugadoresFiltrados.length > 0 ? (
                    jugadoresFiltrados.map((jugador) => (
                        <div key={jugador.id} className={`card-jugador tier-${jugador.tier}`}>
                            <div className="card-image-wrapper">
                                <img src={jugador.foto} alt={jugador.nombre} onError={(e) => {
                                    e.target.src = 'https://images.unsplash.com/photo-1542751371-adc38448a05e?q=80&w=300&auto=format&fit=crop';
                                }} />
                                <div className="card-tier-badge" style={{ backgroundColor: `var(--tier-${jugador.tier})` }}>
                                    {jugador.tier === 0 ? 'TIER S' : `TIER ${jugador.tier}`}
                                </div>
                            </div>

                            <div className="info-container">
                                <h3>{jugador.nombre}</h3>
                                <div className="card-footer-lines">
                                    <span className="card-role-label">AGENTE MIXTONE</span>
                                    <span className="card-tech-id">#{jugador.id.toString().slice(-4)}</span>
                                </div>
                            </div>
                            <div className="card-edge-cut"></div>
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