import { useState, useEffect } from 'react';
import './Admin.css';

const defaultJugadores = [
    { id: 1, nombre: 'Wallace', tier: 0, foto: 'https://images.unsplash.com/photo-1560169897-fc0cdbdfa4d5?q=80&w=300&auto=format&fit=crop' },
    { id: 2, nombre: 'Mixwell', tier: 1, foto: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?q=80&w=300&auto=format&fit=crop' },
    { id: 3, nombre: 'TenZ', tier: 0, foto: 'https://images.unsplash.com/photo-1553481187-be93c21490a9?q=80&w=300&auto=format&fit=crop' },
    { id: 4, nombre: 'Aspas', tier: 2, foto: 'https://images.unsplash.com/photo-1612287230202-1bf1d85d1bdf?q=80&w=300&auto=format&fit=crop' },
    { id: 5, nombre: 'Derke', tier: 2, foto: 'https://images.unsplash.com/photo-1538481199705-c710c4e965fc?q=80&w=300&auto=format&fit=crop' },
];

const Admin = () => {
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [password, setPassword] = useState('');
    const [nombre, setNombre] = useState('');
    const [tier, setTier] = useState(1);
    const [foto, setFoto] = useState('');
    const [jugadores, setJugadores] = useState([]);
    const [editingId, setEditingId] = useState(null);

    // Cargar jugadores al montar el componente
    useEffect(() => {
        const data = localStorage.getItem('listaJugadores');
        if (data) {
            setJugadores(JSON.parse(data));
        } else {
            localStorage.setItem('listaJugadores', JSON.stringify(defaultJugadores));
            setJugadores(defaultJugadores);
        }
    }, []);

    const handleLogin = (e) => {
        e.preventDefault();
        if (password === 'AdminMixtoneVandal2026_Secure#') {
            setIsLoggedIn(true);
        } else {
            alert('Sigue intentando, bruto');
        }
    };

    const handleGuardar = (e) => {
        e.preventDefault();

        if (!nombre.trim() || !foto.trim()) {
            alert('Por favor completa todos los campos.');
            return;
        }

        const lista = JSON.parse(localStorage.getItem('listaJugadores') || '[]');
        let nuevaLista;

        if (editingId) {
            // Editando existente
            nuevaLista = lista.map(j => j.id === editingId ? { ...j, nombre, tier, foto } : j);
            alert('Jugador actualizado correctamente');
        } else {
            // Creando nuevo
            const nuevoJugador = { id: Date.now(), nombre, tier, foto };
            nuevaLista = [...lista, nuevoJugador];
            alert('Jugador guardado correctamente');
        }

        localStorage.setItem('listaJugadores', JSON.stringify(nuevaLista));
        setJugadores(nuevaLista);

        // Resetear formulario
        setNombre('');
        setTier(1);
        setFoto('');
        setEditingId(null);
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

    const handleEliminar = (id) => {
        if (window.confirm('¿Estás seguro de que deseas eliminar este jugador?')) {
            const lista = JSON.parse(localStorage.getItem('listaJugadores') || '[]');
            const nuevaLista = lista.filter(j => j.id !== id);
            localStorage.setItem('listaJugadores', JSON.stringify(nuevaLista));
            setJugadores(nuevaLista);

            // Si estábamos editando al eliminado, cancelamos la edición
            if (editingId === id) {
                handleCancelEdit();
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
            </header>

            <div className="admin-grid">
                {/* Formulario */}
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
                            />
                        </div>

                        <div className="form-group">
                            <label>TIER DE HABILIDAD</label>
                            <select value={tier} onChange={(e) => setTier(parseInt(e.target.value))}>
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
                            />
                        </div>

                        <div className="form-actions">
                            <button type="submit" className="val-btn">
                                {editingId ? 'ACTUALIZAR' : 'GUARDAR JUGADOR'}
                            </button>
                            {editingId && (
                                <button type="button" className="val-btn secondary" onClick={handleCancelEdit}>
                                    CANCELAR
                                </button>
                            )}
                        </div>
                    </form>
                </div>

                {/* Tabla de Jugadores */}
                <div className="admin-table-card">
                    <h2>AGENTES REGISTRADOS ({jugadores.length})</h2>
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
                                                    >
                                                        ✏️
                                                    </button>
                                                    <button
                                                        className="action-btn delete-btn"
                                                        onClick={() => handleEliminar(jugador.id)}
                                                        title="Eliminar agente"
                                                    >
                                                        🗑️
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="4" className="table-empty-msg">No hay jugadores registrados en el sistema.</td>
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