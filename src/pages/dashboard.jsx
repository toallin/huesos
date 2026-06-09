import React, { useState, useEffect } from 'react';
import './dashboard.css';
import logo from '../assets/logo.png';

import Fundador from './Fundador';
import MisionVision from './MisionVision';
import Motivacion from './Motivacion';

// IMPORTACIÓN SEGURA: Datos limpios
import { cleanCsvText } from '../utils/datosHistorial';

export default function Dashboard() {
    const [vistaActiva, setVistaActiva] = useState('dashboard');

    const [transacciones, setTransacciones] = useState([]);
    const [metodosAgrupados, setMetodosAgrupados] = useState([]);
    const [totalRecaudado, setTotalRecaudado] = useState(0);
    const [retornoX3, setRetornoX3] = useState(0);

    useEffect(() => {
        if (!cleanCsvText) return;

        const lineas = cleanCsvText.split(/\r?\n/);
        let sumaTotal = 0;
        let sumaGananciaX3 = 0;
        const mapeoMetodos = {};
        const listaLimpia = [];
        // Paleta de colores Premium estilo TradingView
        const colores = ["#26a69a", "#f0a724", "#2980b9", "#9c27b0", "#e74c3c", "#673ab7", "#00bcd4"];

        lineas.forEach((linea, index) => {
            if (index === 0 || !linea.trim()) return;

            const columnas = [];
            let dentroDeComillas = false;
            let columnaActual = '';

            for (let i = 0; i < linea.length; i++) {
                const caracter = linea[i];
                if (caracter === '"') {
                    dentroDeComillas = !dentroDeComillas;
                } else if (caracter === ',' && !dentroDeComillas) {
                    columnas.push(columnaActual);
                    columnaActual = '';
                } else {
                    columnaActual += caracter;
                }
            }
            columnas.push(columnaActual);

            if (columnas.length >= 6) {
                const nombreCompleto = columnas[0].trim();
                const montoRaw = columnas[3].trim();
                const gananciaRaw = columnas[4].trim();
                const metodoPagoRaw = columnas[5].trim().toUpperCase();

                if (!nombreCompleto || nombreCompleto === "-" || nombreCompleto.toLowerCase() === "nombre") return;

                const monto = parseFloat(montoRaw) || 0;
                const ganancia = parseFloat(gananciaRaw) || 0;

                if (monto === 0) return;

                const primerNombre = nombreCompleto.split(' ')[0];

                sumaTotal += monto;
                sumaGananciaX3 += ganancia;

                let metodoClave = "OTROS";
                if (metodoPagoRaw.includes("YAPE")) metodoClave = "YAPE";
                else if (metodoPagoRaw.includes("PLIN")) metodoClave = "PLIN";
                else if (metodoPagoRaw.includes("BCP")) metodoClave = "BCP";
                else if (metodoPagoRaw.includes("AGORA")) metodoClave = "AGORA";
                else if (metodoPagoRaw.includes("SUB")) metodoClave = "SUB";

                if (!mapeoMetodos[metodoClave]) {
                    mapeoMetodos[metodoClave] = { cantidad: 0, monto: 0 };
                }
                mapeoMetodos[metodoClave].cantidad += 1;
                mapeoMetodos[metodoClave].monto += monto;

                listaLimpia.push({
                    nombre: primerNombre,
                    monto: monto,
                    metodo: metodoClave
                });
            }
        });

        // Agrupamos métodos y les asignamos un color fijo de la paleta trading
        const nuevosMetodos = Object.keys(mapeoMetodos).map((key, i) => ({
            metodo: key,
            cantidad: mapeoMetodos[key].cantidad,
            monto: mapeoMetodos[key].monto,
            color: colores[i % colores.length]
        })).sort((a, b) => b.monto - a.monto);

        const transaccionesConGrafica = listaLimpia.map((item, idx) => ({
            ...item,
            porcentaje: sumaTotal > 0 ? parseFloat(((item.monto / sumaTotal) * 100).toFixed(1)) : 0,
            color: colores[idx % colores.length]
        }));

        setTotalRecaudado(sumaTotal);
        setRetornoX3(sumaGananciaX3);
        setMetodosAgrupados(nuevosMetodos);
        setTransacciones(transaccionesConGrafica);
    }, []);

    // LÓGICA DEL GRÁFICO CIRCULAR (SVG Donut Chart)
    let acumuladoPorcentaje = 0;
    const graficoSectores = metodosAgrupados.map((m) => {
        const porc = totalRecaudado > 0 ? (m.monto / totalRecaudado) * 100 : 0;
        const inicioX = Math.cos(2 * Math.PI * (acumuladoPorcentaje / 100) - Math.PI / 2);
        const inicioY = Math.sin(2 * Math.PI * (acumuladoPorcentaje / 100) - Math.PI / 2);

        acumuladoPorcentaje += porc;

        const finX = Math.cos(2 * Math.PI * (acumuladoPorcentaje / 100) - Math.PI / 2);
        const finY = Math.sin(2 * Math.PI * (acumuladoPorcentaje / 100) - Math.PI / 2);

        const grande = porc > 50 ? 1 : 0;

        // Crear ruta SVG arc
        const pathData = `
            M ${inicioX} ${inicioY}
            A 1 1 0 ${grande} 1 ${finX} ${finY}
            L 0 0 Z
        `;
        return { pathData, color: m.color, metodo: m.metodo, porc: porc.toFixed(1) };
    });

    return (
        <div className="trading-dashboard-dark">
            <header className="dashboard-header">
                <div className="header-brand">
                    <div className="logo-container-pro">
                        <img src={logo} alt="Hueso Logo" className="brand-logo-pro" />
                    </div>
                    <div className="brand-text">
                        <h1>HUESO</h1>
                        <p>STOCK TRADING INC.</p>
                    </div>
                </div>

                <nav className="header-nav">
                    <button className={`nav-btn ${vistaActiva === 'dashboard' ? 'active' : ''}`} onClick={() => setVistaActiva('dashboard')}>Panel</button>
                    <button className={`nav-btn ${vistaActiva === 'fundador' ? 'active' : ''}`} onClick={() => setVistaActiva('fundador')}>Fundador</button>
                    <button className={`nav-btn ${vistaActiva === 'mision' ? 'active' : ''}`} onClick={() => setVistaActiva('mision')}>Misión & Visión</button>
                    <button className={`nav-btn ${vistaActiva === 'videos' ? 'active' : ''}`} onClick={() => setVistaActiva('videos')}>Motivación</button>
                </nav>
                {/* Reemplaza la línea del ticker status al final del <header> por esta estructura */}
                <a
                    href="https://kick.com/flapjackdota"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="ticker-status-link"
                    title="Ir al canal de Kick"
                >
                    <span className="pulse-icon"></span> MERCADO OPERATIVO
                </a>
                <div className="ticker-status"><span className="pulse-icon"></span> MERCADO OPERATIVO</div>
            </header>

            {vistaActiva === 'dashboard' && (
                <main className="dashboard-grid-two-columns">

                    {/* PANEL IZQUIERDO: SECCIÓN DE ESTADÍSTICAS Y GRÁFICOS */}
                    <div className="left-column-container">

                        {/* KPIS PRINCIPALES */}
                        <section className="kpi-row-grid">
                            <div className="kpi-card-pro operational-glow-green">
                                <span className="kpi-label">TOTAL CAPITAL RESERVA</span>
                                <span className="kpi-value text-green">S/. {totalRecaudado.toLocaleString('es-PE', { minimumFractionDigits: 2 })}</span>
                            </div>
                            <div className="kpi-card-pro operational-glow-gold">
                                <span className="kpi-label">COMPROMISO DE RETORNO (X3)</span>
                                <span className="kpi-value text-gold">S/. {retornoX3.toLocaleString('es-PE', { minimumFractionDigits: 2 })}</span>
                            </div>
                        </section>

                        {/* GRÁFICO DE DISTRIBUCIÓN DE MÉTODOS */}
                        <section className="panel section-chart-distribution">
                            <h2>DISTRIBUCIÓN DE MÉTODOS DE PAGO</h2>

                            <div className="chart-flex-layout">
                                {/* SVG Donut Render */}
                                <div className="canvas-holder">
                                    <svg viewBox="-1.1 -1.1 2.2 2.2" className="donut-svg">
                                        {graficoSectores.map((sector, idx) => (
                                            <path key={idx} d={sector.pathData} fill={sector.color} />
                                        ))}
                                        {/* Círculo interno para simular la dona/donut */}
                                        <circle cx="0" cy="0" r="0.6" fill="#131722" />
                                    </svg>
                                    <div className="canvas-inner-text">
                                        <span className="inner-monto">S/. {parseInt(totalRecaudado)}</span>
                                        <span className="inner-label">Caja</span>
                                    </div>
                                </div>

                                {/* Leyendas del Gráfico */}
                                <div className="chart-legend-list">
                                    {metodosAgrupados.map((m, i) => {
                                        const porc = totalRecaudado > 0 ? (m.monto / totalRecaudado) * 100 : 0;
                                        return (
                                            <div key={i} className="legend-item-box">
                                                <div className="legend-header">
                                                    <span className="legend-bullet" style={{ backgroundColor: m.color }}></span>
                                                    <span className="legend-name">{m.metodo}</span>
                                                    <span className="legend-pct-pill" style={{ color: m.color, borderColor: m.color }}>{porc.toFixed(1)}%</span>
                                                </div>
                                                <span className="legend-value-sub">S/. {m.monto.toLocaleString('es-PE', { minimumFractionDigits: 2 })}</span>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        </section>
                    </div>

                    {/* PANEL DERECHO: MONITOR DE INVERSIONES PREMIUM */}
                    <section className="panel grid-inversiones">
                        <h2>MONITOR DE INVERSIONES INDIVIDUALES ({transacciones.length})</h2>
                        <div className="inversiones-list-container">
                            <table className="trading-table">
                                <thead>
                                    <tr>
                                        <th>INVERSIONISTA</th>
                                        <th align="center">MÉTODO</th>
                                        <th align="right">MONTO TRADED</th>
                                        <th align="right">SHARE (%)</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {transacciones.map((item, idx) => (
                                        <tr key={idx} className="table-row-item">
                                            <td>
                                                <span className="user-avatar-initial" style={{ borderLeftColor: item.color }}>
                                                    {item.nombre.charAt(0)}
                                                </span>
                                                <strong className="user-table-name">{item.nombre}</strong>
                                            </td>
                                            <td align="center">
                                                <span className={`table-badge-method method-${item.metodo.toLowerCase()}`}>
                                                    {item.metodo}
                                                </span>
                                            </td>
                                            <td align="right" className="font-mono text-white">
                                                S/. {item.monto.toFixed(2)}
                                            </td>
                                            <td align="right" className="font-mono">
                                                <div className="table-pct-wrapper">
                                                    <span>{item.porcentaje}%</span>
                                                    <div className="mini-progress-track">
                                                        <div className="mini-progress-fill" style={{ width: `${Math.min(item.porcentaje * 4, 100)}%`, backgroundColor: item.color }}></div>
                                                    </div>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </section>

                </main>
            )}

            {vistaActiva === 'fundador' && <Fundador />}
            {vistaActiva === 'mision' && <MisionVision />}
            {vistaActiva === 'videos' && <Motivacion />}
        </div>
    );
}