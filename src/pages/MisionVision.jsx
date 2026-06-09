import React from 'react';
// IMPORTAMOS EL LOGO
import logo from '../assets/logo.png';

export default function MisionVision() {
    return (
        <main className="static-view-container animated-fade-in">
            <div className="mision-vision-grid">

                {/* SECCIÓN MISIÓN */}
                <section className="panel corporate-mission-card operational-glow-green">
                    <div className="card-header-pro">
                        {/* Reemplazado el emoji por el logo unificado */}
                        <div className="icon-wrapper-bg bg-rgba-green">
                            <img src={logo} alt="Hueso Logo Misión" className="mission-vision-inner-logo" />
                        </div>
                        <div className="title-block">
                            <span className="corporate-sub">TARGET & OPERATIONS</span>
                            <h2>NUESTRA MISIÓN</h2>
                        </div>
                    </div>
                    <p className="corporate-body-text">
                        Proporcionar un ecosistema de trading alternativo, intuitivo y de alto rendimiento,
                        impulsado de forma orgánica por la comunidad y la cultura digital. Buscamos maximizar
                        el valor y entretenimiento financiero mediante una infraestructura transparente,
                        salvaguardando la integridad de los flujos de capital e inyecciones de liquidez de
                        nuestros inversores de élite.
                    </p>
                    <div className="card-metric-footer">
                        <span className="metric-label">Eficiencia Operativa</span>
                        <div className="metric-bar-track">
                            <div className="metric-bar-fill fill-green" style={{ width: '94%' }}></div>
                        </div>
                        <span className="metric-pct font-mono">94%</span>
                    </div>
                </section>

                {/* SECCIÓN VISIÓN */}
                <section className="panel corporate-mission-card operational-glow-gold">
                    <div className="card-header-pro">
                        {/* Reemplazado el emoji por el logo unificado */}
                        <div className="icon-wrapper-bg bg-rgba-gold">
                            <img src={logo} alt="Hueso Logo Visión" className="mission-vision-inner-logo" />
                        </div>
                        <div className="title-block">
                            <span className="corporate-sub">FORECAST & HORIZON</span>
                            <h2>NUESTRA VISIÓN</h2>
                        </div>
                    </div>
                    <p className="corporate-body-text">
                        Consolidarnos como el holding institucional de análisis financiero y cultura de internet
                        de referencia a nivel global, expandiendo nuestros gráficos interactivos e instrumentos
                        hacia mercados de predicción, macroeventos y coyunturas de alto impacto, garantizando
                        un balanceo auditado en tiempo real (Soles, USDT y Hueso Coins).
                    </p>
                    <div className="card-metric-footer">
                        <span className="metric-label">Proyección de Mercado</span>
                        <div className="metric-bar-track">
                            <div className="metric-bar-fill fill-gold" style={{ width: '87%' }}></div>
                        </div>
                        <span className="metric-pct font-mono">87%</span>
                    </div>
                </section>
            </div>

            {/* SECCIÓN ADICIONAL: PILARES CORPORATIVOS */}
            <section className="panel strategic-pillars-section" style={{ marginTop: '20px' }}>
                <h2>PILARES DE GESTIÓN CORPORATIVA</h2>
                <div className="pillars-grid-layout">
                    <div className="pillar-item-box">
                        <span className="pillar-number font-mono">[01]</span>
                        <h4>Hold Inflexible</h4>
                        <p>Filosofía estricta de retención de activos para mitigar la volatilidad y mantener reservas estables.</p>
                    </div>
                    <div className="pillar-item-box">
                        <span className="pillar-number font-mono">[02]</span>
                        <h4>Trazabilidad de Caja</h4>
                        <p>Monitoreo inmediato de aportaciones y conversiones x3 directo en el panel financiero centralizado.</p>
                    </div>
                    <div className="pillar-item-box">
                        <span className="pillar-number font-mono">[03]</span>
                        <h4>Cultura y Comunidad</h4>
                        <p>Diseño centrado en los usuarios del chat de alta frecuencia, operando bajo consenso descentralizado.</p>
                    </div>
                </div>
            </section>
        </main>
    );
}