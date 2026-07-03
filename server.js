// server.js
import jsonServer from 'json-server';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const server = jsonServer.create();
const middlewares = jsonServer.defaults();

const PORT = process.env.PORT || 5000;

// 📁 Verificar que db.json existe
const dbPath = path.join(__dirname, 'db.json');
if (!fs.existsSync(dbPath)) {
    console.log('⚠️ db.json no existe, creando uno nuevo...');
    fs.writeFileSync(dbPath, JSON.stringify({ jugadores: [] }, null, 2));
}

// 📊 Crear el router con db.json
const router = jsonServer.router(dbPath);

// 📁 Ruta donde Vite guarda el build
const staticPath = path.join(__dirname, 'dist');

console.log(`📁 Buscando archivos estáticos en: ${staticPath}`);

// 🔧 Middlewares por defecto (logging, etc.)
server.use(middlewares);

// 📊 API endpoints (todas bajo /api)
server.use('/api', router);

// 🌐 Servir archivos estáticos (frontend) - SOLO si existe dist/
if (fs.existsSync(staticPath)) {
    console.log('✅ Archivos estáticos encontrados');
    server.use(jsonServer.static(staticPath));

    // 🔄 Redirigir todas las rutas que no sean /api al index.html (SPA)
    server.get('*', (req, res) => {
        // Si es una ruta de API, no hacer nada (ya fue manejada)
        if (req.path.startsWith('/api')) return;

        // Si es un archivo estático, no hacer nada (ya fue manejado)
        if (req.path.match(/\.(css|js|png|jpg|jpeg|gif|svg|ico|json)$/)) return;

        // Redirigir todo lo demás al index.html
        const indexPath = path.join(staticPath, 'index.html');
        if (fs.existsSync(indexPath)) {
            res.sendFile(indexPath);
        } else {
            res.status(404).send('Frontend no encontrado');
        }
    });
} else {
    console.log('⚠️ No se encontraron archivos estáticos en dist/');
    console.log('⚠️ La API está disponible en /api/jugadores');
}

server.listen(PORT, () => {
    console.log(`✅ Servidor corriendo en puerto ${PORT}`);
    console.log(`📊 API disponible en: /api/jugadores`);
    if (fs.existsSync(staticPath)) {
        console.log(`🌐 Frontend servido desde: /`);
    } else {
        console.log(`⚠️ Frontend no disponible (ejecuta npm run build)`);
    }
});