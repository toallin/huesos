// server.js (ES Modules)
import jsonServer from 'json-server';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const server = jsonServer.create();
const router = jsonServer.router('db.json');
const middlewares = jsonServer.defaults();

const PORT = process.env.PORT || 5000;

// Servir archivos estáticos de Vite (después del build)
const staticPath = path.join(__dirname, 'dist');

console.log(`📁 Buscando archivos estáticos en: ${staticPath}`);

// Primero, servir archivos estáticos (frontend)
if (fs.existsSync(staticPath)) {
    console.log('✅ Archivos estáticos encontrados');
    server.use(jsonServer.static(staticPath));
} else {
    console.log('⚠️ No se encontraron archivos estáticos en dist/');
}

// API endpoints (todas bajo /api)
server.use('/api', router);

// Redirigir todas las rutas que no sean /api al index.html (SPA)
server.get('*', (req, res) => {
    if (req.path.startsWith('/api')) return;
    const indexPath = path.join(staticPath, 'index.html');
    if (fs.existsSync(indexPath)) {
        res.sendFile(indexPath);
    } else {
        res.status(404).send('Archivo no encontrado');
    }
});

// Middlewares por defecto (logging, etc.)
server.use(middlewares);

server.listen(PORT, () => {
    console.log(`✅ Servidor corriendo en puerto ${PORT}`);
    console.log(`📊 API disponible en: /api/jugadores`);
    console.log(`🌐 Frontend servido desde: /`);
    console.log(`📁 Archivos estáticos: ${staticPath}`);
});