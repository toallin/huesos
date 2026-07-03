import { useState, useEffect } from 'react';
import { jugadorService } from '../services/jugadorService.js';
import './Admin.css';

const Admin = () => {
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [password, setPassword] = useState('');
    const [nombre, setNombre] = useState('');
    const [tier, setTier] = useState(1);
    const [foto, setFoto] = useState('');
    const [jugadores, setJugadores] = useState([]);
    const [editingId, setEditingId] = useState(null);
    const [loading, setLoading] = useState(false);

    // Cargar jugadores desde el backend
    useEffect(() => {
        cargarJugadores();
    }, []);

    const cargarJugadores = async () => {
        setLoading(true);
        try {
            const data = await jugadorService.getAll();
            console.log('✅ Jugadores cargados desde el servidor:', data);
            setJugadores(data);
        } catch (error) {
            console.error('❌ Error cargando jugadores:', error);
            alert('Error al cargar los jugadores. Asegúrate que el servidor esté corriendo.');
        } finally {
            setLoading(false);
        }
    };

    const handleLogin = (e) => {
        e.preventDefault();
        if (password === 'AdminMixtoneVandal2026_Secure#') {
            setIsLoggedIn(true);
        } else {
            alert('Sigue intentando, bruto');
        }
    };

    const handleGuardar = async (e) => {
        e.preventDefault();

        if (!nombre.trim() || !foto.trim()) {
            alert('Por favor completa todos los campos.');
            return;
        }

        setLoading(true);
        try {
            if (editingId) {
                // Actualizar jugador existente
                await jugadorService.update(editingId, { nombre, tier, foto });
                alert('✅ Jugador actualizado correctamente');
            } else {
                // Crear nuevo jugador
                await jugadorService.create({ nombre, tier, foto });
                alert('✅ Jugador guardado correctamente');
            }

            // Recargar la lista de jugadores
            await cargarJugadores();

            // Resetear formulario
            setNombre('');
            setTier(1);
            setFoto('');
            setEditingId(null);
        } catch (error) {
            console.error('❌ Error al guardar:', error);
            alert('Error al guardar el jugador: ' + error.message);
        } finally {
            setLoading(false);
        }
    };

    const handleEditClick = (jugador) => {
        setNombre(jugador.nombre);
        setTier(jugador.tier);
        setFoto(jugador.foto);
        setEditingId(jugador.id);
    };

    const handleCancelEdit = () => {
        setNombre('');
        setTier(1);
        setFoto('');
        setEditingId(null);
    };

    const handleEliminar = async (id) => {
        if (window.confirm('¿Estás seguro de que deseas eliminar este jugador?')) {
            setLoading(true);
            try {
                await jugadorService.delete(id);
                alert('✅ Jugador eliminado correctamente');
                await cargarJugadores();

                if (editingId === id) {
                    handleCancelEdit();
                }
            } catch (error) {
                console.error('❌ Error al eliminar:', error);
                alert('Error al eliminar el jugador: ' + error.message);
            } finally {
                setLoading(false);
            }
        }
    };

    if (!isLoggedIn) {
        return (
            <div className="login-wrapper">
                <div className="login-container">
                    <div className="login-header">
                        <h2>AUTENTICACIÓN REQUERIDA</h2>
                        <p>ACCESO EXCLUSIVO PARA ADMINISTRADORES</p>
                    </div>
                    <form onSubmit={handleLogin}>
                        <div className="input-group">
                            <label>CONTRASEÑA</label>
                            <input
                                type="password"
                                placeholder="••••••••"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                            />
                        </div>
                        <button type="submit" className="val-btn">INICIAR SESIÓN</button>
                    </form>
                </div>
            </div>
        );
    }

    return (
        <div className="admin-page-container">
            <header className="admin-header">
                <h1>PANEL DE CONTROL</h1>
                <p>Gestionar jugadores, tiers y avatares del sistema</p>
                <button
                    onClick={cargarJugadores}
                    className="val-btn secondary"
                    style={{ marginTop: '10px', width: 'auto', padding: '8px 16px' }}
                    disabled={loading}
                >
                    {loading ? '🔄 Cargando...' : '🔄 Recargar'}
                </button>
            </header>

            <div className="admin-grid">
                <div className="admin-form-card">
                    <h2>{editingId ? 'EDITAR AGENTE' : 'REGISTRAR NUEVO AGENTE'}</h2>
                    <form onSubmit={handleGuardar} className="admin-form">
                        <div className="form-group">
                            <label>NOMBRE DEL JUGADOR</label>
                            <input
                                type="text"
                                placeholder="Ej. Wallace"
                                value={nombre}
                                onChange={(e) => setNombre(e.target.value)}
                                required
                                disabled={loading}
                            />
                        </div>

                        <div className="form-group">
                            <label>TIER DE HABILIDAD</label>
                            <select
                                value={tier}
                                onChange={(e) => setTier(parseInt(e.target.value))}
                                disabled={loading}
                            >
                                <option value={0}>Tier S (Dios / Top)</option>
                                {[1, 2, 3, 4, 5].map(t => (
                                    <option key={t} value={t}>Tier {t} {t === 1 ? '(Elite)' : t === 5 ? '(Recluta)' : ''}</option>
                                ))}
                            </select>
                        </div>

                        <div className="form-group">
                            <label>URL DE LA FOTO (AVATAR)</label>
                            <input
                                type="url"
                                placeholder="https://ejemplo.com/foto.jpg"
                                value={foto}
                                onChange={(e) => setFoto(e.target.value)}
                                required
                                disabled={loading}
                            />
                        </div>

                        <div className="form-actions">
                            <button type="submit" className="val-btn" disabled={loading}>
                                {loading ? '⏳ PROCESANDO...' : (editingId ? 'ACTUALIZAR' : 'GUARDAR JUGADOR')}
                            </button>
                            {editingId && (
                                <button type="button" className="val-btn secondary" onClick={handleCancelEdit} disabled={loading}>
                                    CANCELAR
                                </button>
                            )}
                        </div>
                    </form>
                </div>

                <div className="admin-table-card">
                    <h2>AGENTES REGISTRADOS ({jugadores.length})</h2>
                    {loading && <p style={{ color: '#8899aa' }}>⏳ Cargando...</p>}
                    <div className="table-responsive">
                        <table className="admin-table">
                            <thead>
                                <tr>
                                    <th>FOTO</th>
                                    <th>NOMBRE</th>
                                    <th>TIER</th>
                                    <th>ACCIONES</th>
                                </tr>
                            </thead>
                            <tbody>
                                {jugadores.length > 0 ? (
                                    jugadores.map((jugador) => (
                                        <tr key={jugador.id}>
                                            <td>
                                                <img
                                                    src={jugador.foto}
                                                    alt={jugador.nombre}
                                                    className="admin-table-avatar"
                                                    onError={(e) => {
                                                        e.target.src = 'https://images.unsplash.com/photo-1542751371-adc38448a05e?q=80&w=300&auto=format&fit=crop';
                                                    }}
                                                />
                                            </td>
                                            <td className="player-name-cell">{jugador.nombre}</td>
                                            <td>
                                                <span
                                                    className="admin-table-tier-badge"
                                                    style={{ backgroundColor: `var(--tier-${jugador.tier})` }}
                                                >
                                                    {jugador.tier === 0 ? 'TIER S' : `TIER ${jugador.tier}`}
                                                </span>
                                            </td>
                                            <td>
                                                <div className="table-actions">
                                                    <button
                                                        className="action-btn edit-btn"
                                                        onClick={() => handleEditClick(jugador)}
                                                        title="Editar agente"
                                                        disabled={loading}
                                                    >
                                                        ✏️
                                                    </button>
                                                    <button
                                                        className="action-btn delete-btn"
                                                        onClick={() => handleEliminar(jugador.id)}
                                                        title="Eliminar agente"
                                                        disabled={loading}
                                                    >
                                                        🗑️
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="4" className="table-empty-msg">
                                            {loading ? 'Cargando jugadores...' : 'No hay jugadores registrados en el sistema.'}
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Admin;