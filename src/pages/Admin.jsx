import { useState } from 'react';

const Admin = () => {
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [password, setPassword] = useState('');
    const [nombre, setNombre] = useState('');
    const [tier, setTier] = useState(5);
    const [foto, setFoto] = useState('');

    const handleLogin = (e) => {
        e.preventDefault();
        if (password === 'admin123') {
            setIsLoggedIn(true);
        } else {
            alert('Contraseña incorrecta');
        }
    };

    const handleGuardar = (e) => {
        e.preventDefault();
        const nuevaLista = JSON.parse(localStorage.getItem('listaJugadores') || '[]');
        const nuevoJugador = { id: Date.now(), nombre, tier, foto };

        localStorage.setItem('listaJugadores', JSON.stringify([...nuevaLista, nuevoJugador]));

        alert('Jugador guardado correctamente');
        setNombre('');
        setFoto('');
    };

    if (!isLoggedIn) {
        return (
            <div className="login-container">
                <h2>Login Admin</h2>
                <form onSubmit={handleLogin}>
                    <input
                        type="password"
                        placeholder="Contraseña"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                    />
                    <button type="submit">Entrar</button>
                </form>
            </div>
        );
    }

    return (
        <div className="admin-container">
            <h2>Panel de Administración</h2>
            <form onSubmit={handleGuardar}>
                <input placeholder="Nombre del jugador" value={nombre} onChange={(e) => setNombre(e.target.value)} required />
                <select value={tier} onChange={(e) => setTier(parseInt(e.target.value))}>
                    {[1, 2, 3, 4, 5].map(t => <option key={t} value={t}>Tier {t}</option>)}
                </select>
                <input placeholder="URL de la foto" value={foto} onChange={(e) => setFoto(e.target.value)} required />
                <button type="submit">Guardar Jugador</button>
            </form>
        </div>
    );
};

export default Admin;