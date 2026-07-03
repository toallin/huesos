// server-express.cjs
const express = require('express');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(express.json());

// Servir archivos estáticos del frontend
app.use(express.static('dist'));

// --- API ---
const dbPath = path.join(__dirname, 'db.json');

// Leer base de datos
const readDB = () => {
    if (!fs.existsSync(dbPath)) {
        fs.writeFileSync(dbPath, JSON.stringify({ jugadores: [] }, null, 2));
    }
    return JSON.parse(fs.readFileSync(dbPath));
};

// Escribir base de datos
const writeDB = (data) => {
    fs.writeFileSync(dbPath, JSON.stringify(data, null, 2));
};

// GET /api/jugadores
app.get('/api/jugadores', (req, res) => {
    try {
        const db = readDB();
        res.json(db.jugadores);
    } catch (error) {
        res.status(500).json({ error: 'Error al leer la base de datos' });
    }
});

// POST /api/jugadores
app.post('/api/jugadores', (req, res) => {
    try {
        const db = readDB();
        const nuevoJugador = {
            id: Date.now(),
            nombre: req.body.nombre,
            tier: req.body.tier,
            foto: req.body.foto
        };
        db.jugadores.push(nuevoJugador);
        writeDB(db);
        res.json(nuevoJugador);
    } catch (error) {
        res.status(500).json({ error: 'Error al crear jugador' });
    }
});

// PUT /api/jugadores/:id
app.put('/api/jugadores/:id', (req, res) => {
    try {
        const db = readDB();
        const id = parseInt(req.params.id);
        const index = db.jugadores.findIndex(j => j.id === id);
        if (index === -1) {
            return res.status(404).json({ error: 'Jugador no encontrado' });
        }
        db.jugadores[index] = { ...db.jugadores[index], ...req.body };
        writeDB(db);
        res.json(db.jugadores[index]);
    } catch (error) {
        res.status(500).json({ error: 'Error al actualizar jugador' });
    }
});

// DELETE /api/jugadores/:id
app.delete('/api/jugadores/:id', (req, res) => {
    try {
        const db = readDB();
        const id = parseInt(req.params.id);
        db.jugadores = db.jugadores.filter(j => j.id !== id);
        writeDB(db);
        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ error: 'Error al eliminar jugador' });
    }
});

// SPA: redirigir todas las rutas no-API al index.html
// CORREGIDO: Usar app.use en lugar de app.get('*')
app.use((req, res, next) => {
    // Si es una ruta de API, continuar
    if (req.path.startsWith('/api')) {
        return next();
    }

    // Si es un archivo estático, dejar que express.static lo maneje
    if (req.path.match(/\.(css|js|png|jpg|jpeg|gif|svg|ico|json)$/)) {
        return next();
    }

    // Redirigir al index.html
    const indexPath = path.join(__dirname, 'dist', 'index.html');
    if (fs.existsSync(indexPath)) {
        res.sendFile(indexPath);
    } else {
        res.status(404).send('Frontend no encontrado. Ejecuta: npm run build');
    }
});

app.listen(PORT, () => {
    console.log(`✅ Servidor corriendo en puerto ${PORT}`);
    console.log(`📊 API disponible en: /api/jugadores`);
    console.log(`🌐 Frontend servido desde: /`);
    console.log(`📁 Base de datos: ${dbPath}`);
});