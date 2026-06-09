import React from 'react';
// IMPORTACIÓN DE VIDEOS LOCALES
// Ajusta las rutas si tus archivos de video tienen otros nombres exactos en tu carpeta assets
import videoLobo from '../assets/lobo.mp4';
import videoLore from '../assets/lore.mp4';

export default function Motivacion() {
    return (
        <main className="static-view-container animated-fade-in">
            <div className="motivation-layout-grid">

                {/* COLUMNA PRINCIPAL: FEED MULTIMEDIA */}
                <section className="panel main-video-feed">
                    <div className="feed-header-pro">
                        <span className="corporate-sub">PREMIUM MULTIMEDIA STREAM</span>
                        <h2>ZONA DE MOTIVACIÓN & TRADING LORE</h2>
                        <p className="panel-desc">Análisis audiovisual y material de archivo seleccionado para mitigar el pánico del mercado.</p>
                    </div>

                    <div className="videos-grid-pro">

                        {/* TARJETA VIDEO 1: LOBO DE WALL STREET */}
                        <div className="video-item-card-pro">
                            <div className="video-player-wrapper">
                                <video
                                    src={videoLobo}
                                    controls
                                    className="native-trading-video"
                                    preload="metadata"
                                    controlsList="nodownload"
                                ></video>
                                <span className="video-badge-resolution">HD 1080P</span>
                            </div>
                            <div className="video-info-strip-pro">
                                <div className="video-title-meta">
                                    <h4>LOBO DE WALL STREET - APERTURA ESTRATÉGICA</h4>
                                    <p>Estudio de caso sobre persuasión y psicología de masas en entornos de alta volatilidad.</p>
                                </div>
                                <span className="font-mono video-duration-tag">[03:45]</span>
                            </div>
                        </div>

                        {/* TARJETA VIDEO 2: HUESO LORE */}
                        <div className="video-item-card-pro">
                            <div className="video-player-wrapper">
                                <video
                                    src={videoLore}
                                    controls
                                    className="native-trading-video"
                                    preload="metadata"
                                    controlsList="nodownload"
                                ></video>
                                <span className="video-badge-resolution gold-res">4K UHD</span>
                            </div>
                            <div className="video-info-strip-pro">
                                <div className="video-title-meta">
                                    <h4>HUESO STOCK TRADING INC. - OFFICIAL LORE</h4>
                                    <p>Documental institucional. Análisis histórico de las inyecciones de liquidez y el holding descentralizado.</p>
                                </div>
                                <span className="font-mono video-duration-tag">[05:20]</span>
                            </div>
                        </div>

                    </div>
                </section>

                {/* COLUMNA LATERAL: PANEL DE CONTROL DE PSICOLOGÍA */}
                <section className="panel side-lore-panel">
                    <h2>MARKET SENTIMENT INDICATORS</h2>

                    <div className="sentiment-meter-box">
                        <div className="sentiment-header">
                            <span>Índice de Codicia (Greed Index)</span>
                            <span className="text-green font-mono">98% EXTREME</span>
                        </div>
                        <div className="metric-bar-track">
                            <div className="metric-bar-fill fill-green" style={{ width: '98%' }}></div>
                        </div>
                    </div>

                    <div className="lore-terminal-feed">
                        <h3>ALERTAS DE MENTALIDAD</h3>
                        <div className="terminal-alert-item warning-border">
                            <span className="alert-time font-mono">[16:40:12]</span>
                            <p><strong>ALERT:</strong> Prohibido entrar en pánico. Las fluctuaciones del mercado son temporales; el Hold es eterno.</p>
                        </div>
                        <div className="terminal-alert-item green-border">
                            <span className="alert-time font-mono">[16:42:55]</span>
                            <p><strong>INFO:</strong> Se detectaron altos niveles de "Mentalidad de Tiburón" inyectados en los módulos de Yape.</p>
                        </div>
                        <div className="terminal-alert-item gold-border">
                            <span className="alert-time font-mono">[16:45:00]</span>
                            <p><strong>RULE:</strong> Premisa del fondo institucional recordada con éxito: <em>No se va a cashear.</em></p>
                        </div>
                    </div>
                </section>

            </div>
        </main>
    );
}