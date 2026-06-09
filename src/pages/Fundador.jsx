import React from 'react';
import fotoFundador from '../assets/fundador.png';

export default function Fundador() {
    return (
        <main className="static-view-container animated-fade-in">
            <section className="panel founder-profile-card">

                {/* ENCABEZADO PERFIL */}
                <div className="founder-hero-header">
                    <div className="founder-avatar-wrapper">
                        <img src={fotoFundador} alt="Huesos de Wall Street" className="founder-img-pro" />
                        <div className="status-badge-online">
                            <span className="ping-dot"></span> EN LÍNEA
                        </div>
                    </div>

                    <div className="founder-meta-spec">
                        <span className="corporate-badge">CHIEF EXECUTIVE OFFICER & FOUNDER</span>
                        <h2 className="founder-title-name">HUESOS DE WALL STREET</h2>
                        <p className="founder-subtitle-division">Dirección General de Inversiones de Alto Riesgo</p>

                        <div className="executive-quote-box">
                            <p className="quote-text-pro">
                                "La liquidez no se negocia y el chat opera bajo su propio riesgo.
                                Nuestra premisa operativa sigue intacta en los mercados: <strong>NO PIENSO CASHEAR</strong>."
                            </p>
                        </div>
                    </div>
                </div>

                <hr className="divider-line" />

                {/* BLOQUE INFORMATIVO MÈTRICAS EJECUTIVAS */}
                <div className="founder-detailed-grid">

                    <div className="info-column-specs">
                        <h3>PERFIL ESTRATÉGICO</h3>
                        <div className="spec-row">
                            <span className="label-spec">Estilo Operativo:</span>
                            <span className="value-spec high-frequency">Trading de Alta Frecuencia (HFT)</span>
                        </div>
                        <div className="spec-row">
                            <span className="label-spec">Filosofía de Caja:</span>
                            <span className="value-spec hold-absoluto">Hold Absoluto / Anti-Liquidez</span>
                        </div>
                        <div className="spec-row">
                            <span className="label-spec">Apalancamiento:</span>
                            <span className="value-spec">Máximo Permitido (X4 Mode)</span>
                        </div>
                        <div className="spec-row">
                            <span className="label-spec">Jurisdicción:</span>
                            <span className="value-spec">Comunidad Kick / Discord Global</span>
                        </div>
                    </div>

                    <div className="info-column-specs">
                        <h3>ÁREAS DE ENFOQUE</h3>
                        <p className="founder-description">
                            Especialista en la gestión y distribución de activos alternativos de alta volatilidad (Hueso Coins).
                            Responsable de coordinar el flujo de caja inyectado mediante pasarelas descentralizadas locales
                            como Yape y Plin, mitigando el pánico financiero del chat a través de holdings estratégicos de largo plazo.
                        </p>
                        <div className="signature-container">
                            <div className="digital-signature">Huesos W.S.</div>
                            <span className="signature-sub">Firma Autorizada Electrónicamente</span>
                        </div>
                    </div>

                </div>

            </section>
        </main>
    );
}