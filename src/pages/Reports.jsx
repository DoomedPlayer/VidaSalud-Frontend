import { useState, useEffect } from 'react';

export default function Reports() {
    // Estado para simular la carga de datos desde ms-vidasalud-report (Kafka)
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [lastUpdate, setLastUpdate] = useState(new Date().toLocaleTimeString());

    const refrescarDatos = () => {
        setIsRefreshing(true);
        // Simulamos el tiempo de respuesta del API Gateway
        setTimeout(() => {
            setIsRefreshing(false);
            setLastUpdate(new Date().toLocaleTimeString());
        }, 800);
    };

    return (
        <div style={{ position: 'relative' }}>
            {/* Banner Analítico */}
            <div style={{ background: 'linear-gradient(135deg, #0f766e 0%, #115e59 100%)', borderRadius: '16px', padding: '2.5rem', color: 'white', marginBottom: '2rem', boxShadow: '0 10px 15px -3px rgba(13, 148, 136, 0.2)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
                <div>
                    <span style={{ backgroundColor: 'rgba(255,255,255,0.2)', padding: '0.3rem 0.8rem', borderRadius: '20px', fontSize: '0.8rem', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                        Analítica Cloud
                    </span>
                    <h1 style={{ margin: '1rem 0 0.5rem 0', fontSize: '2.2rem', letterSpacing: '0.5px' }}>
                        Panel de Reportería y KPIs
                    </h1>
                    <p style={{ margin: 0, opacity: 0.9, fontSize: '1.05rem' }}>
                        Indicadores en tiempo real sobre la demanda y el flujo asistencial de la red.
                    </p>
                </div>
                <div>
                    <button 
                        onClick={refrescarDatos}
                        disabled={isRefreshing}
                        style={{ backgroundColor: 'rgba(255,255,255,0.2)', color: 'white', border: '1px solid rgba(255,255,255,0.4)', padding: '0.6rem 1.2rem', borderRadius: '8px', fontWeight: '600', cursor: isRefreshing ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem', transition: 'all 0.2s', backdropFilter: 'blur(4px)' }}
                    >
                        {isRefreshing ? '↻ Actualizando...' : '↻ Refrescar Datos'}
                    </button>
                    <div style={{ fontSize: '0.75rem', opacity: 0.8, textAlign: 'right', marginTop: '0.4rem' }}>
                        Última act: {lastUpdate}
                    </div>
                </div>
            </div>

            {/* Tarjetas de KPIs (Grid) */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
                
                {/* KPI 1: Atenciones */}
                <div style={{ backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '16px', padding: '2rem', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.02)', display: 'flex', flexDirection: 'column' }}>
                    <span style={{ color: '#64748b', fontSize: '0.85rem', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '0.5rem' }}>
                        Atenciones Hoy
                    </span>
                    <div style={{ fontSize: '3rem', fontWeight: '800', color: '#0f766e', lineHeight: '1', marginBottom: '0.5rem' }}>
                        148
                    </div>
                    <span style={{ color: '#059669', fontSize: '0.9rem', fontWeight: '600' }}>
                        +12% vs. ayer
                    </span>
                </div>

                {/* KPI 2: Tiempo de Espera */}
                <div style={{ backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '16px', padding: '2rem', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.02)', display: 'flex', flexDirection: 'column' }}>
                    <span style={{ color: '#64748b', fontSize: '0.85rem', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '0.5rem' }}>
                        Tiempo de Espera Promedio
                    </span>
                    <div style={{ fontSize: '3rem', fontWeight: '800', color: '#1e293b', lineHeight: '1', marginBottom: '0.5rem' }}>
                        18 min
                    </div>
                    <span style={{ color: '#0284c7', fontSize: '0.9rem', fontWeight: '600' }}>
                        Dentro del rango óptimo
                    </span>
                </div>

                {/* KPI 3: Boxes Operativos */}
                <div style={{ backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '16px', padding: '2rem', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.02)', display: 'flex', flexDirection: 'column' }}>
                    <span style={{ color: '#64748b', fontSize: '0.85rem', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '0.5rem' }}>
                        Boxes Operativos
                    </span>
                    <div style={{ fontSize: '3rem', fontWeight: '800', color: '#1e293b', lineHeight: '1', marginBottom: '0.5rem' }}>
                        18 / 20
                    </div>
                    <span style={{ color: '#d97706', fontSize: '0.9rem', fontWeight: '600' }}>
                        2 en mantención
                    </span>
                </div>

            </div>

            {/* Gráfico de Barras: Distribución de Atenciones */}
            <div style={{ backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '16px', padding: '2rem', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.02)' }}>
                <h3 style={{ margin: '0 0 2rem 0', color: '#1e293b', fontSize: '1.25rem' }}>
                    Distribución de Atenciones por Especialidad
                </h3>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                    
                    {/* Barra 1 */}
                    <div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                            <span style={{ fontSize: '0.95rem', color: '#334155', fontWeight: '600' }}>Medicina General</span>
                            <span style={{ fontSize: '0.95rem', color: '#64748b', fontWeight: '700' }}>45%</span>
                        </div>
                        <div style={{ width: '100%', backgroundColor: '#f1f5f9', borderRadius: '8px', height: '12px', overflow: 'hidden' }}>
                            <div style={{ width: '45%', backgroundColor: '#0f766e', height: '100%', borderRadius: '8px', transition: 'width 1s ease-in-out' }}></div>
                        </div>
                    </div>

                    {/* Barra 2 */}
                    <div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                            <span style={{ fontSize: '0.95rem', color: '#334155', fontWeight: '600' }}>Cardiología</span>
                            <span style={{ fontSize: '0.95rem', color: '#64748b', fontWeight: '700' }}>25%</span>
                        </div>
                        <div style={{ width: '100%', backgroundColor: '#f1f5f9', borderRadius: '8px', height: '12px', overflow: 'hidden' }}>
                            <div style={{ width: '25%', backgroundColor: '#0284c7', height: '100%', borderRadius: '8px', transition: 'width 1s ease-in-out' }}></div>
                        </div>
                    </div>

                    {/* Barra 3 */}
                    <div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                            <span style={{ fontSize: '0.95rem', color: '#334155', fontWeight: '600' }}>Pediatría</span>
                            <span style={{ fontSize: '0.95rem', color: '#64748b', fontWeight: '700' }}>20%</span>
                        </div>
                        <div style={{ width: '100%', backgroundColor: '#f1f5f9', borderRadius: '8px', height: '12px', overflow: 'hidden' }}>
                            <div style={{ width: '20%', backgroundColor: '#059669', height: '100%', borderRadius: '8px', transition: 'width 1s ease-in-out' }}></div>
                        </div>
                    </div>

                    {/* Barra 4 */}
                    <div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                            <span style={{ fontSize: '0.95rem', color: '#334155', fontWeight: '600' }}>Urgencia Dental</span>
                            <span style={{ fontSize: '0.95rem', color: '#64748b', fontWeight: '700' }}>10%</span>
                        </div>
                        <div style={{ width: '100%', backgroundColor: '#f1f5f9', borderRadius: '8px', height: '12px', overflow: 'hidden' }}>
                            <div style={{ width: '10%', backgroundColor: '#d97706', height: '100%', borderRadius: '8px', transition: 'width 1s ease-in-out' }}></div>
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
}