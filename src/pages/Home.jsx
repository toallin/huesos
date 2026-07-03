import { useState, useEffect } from 'react';

const Home = () => {
    const [jugadores, setJugadores] = useState([]);

    // Cargar los datos desde localStorage al montar el componente
    useEffect(() => {
        const data = localStorage.getItem('listaJugadores');
        if (data) {
            setJugadores(JSON.parse(data));
        }
    }, []);

    return (
        <div className="home-container">
            <h1>Lista de Jugadores - Salas Mixtone</h1>

            <div className="grid-jugadores">
                {jugadores.length > 0 ? (
                    jugadores.map((jugador) => (
                        <div key={jugador.id} className={`card-jugador tier-${jugador.tier}`}>
                            <img src={jugador.foto} alt={jugador.nombre} style={{ width: '100px' }} />
                            <h3>{jugador.nombre}</h3>
                            <p>Tier: {jugador.tier}</p>
                        </div>
                    ))
                ) : (
                    <p>No hay jugadores registrados todavía.</p>
                )}
            </div>
        </div>
    );
};

export default Home;