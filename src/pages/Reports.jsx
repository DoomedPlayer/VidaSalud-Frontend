export default function Reports() {
    return (
        <div>
            {/* Banner de Módulo */}
            <div style={{ background: 'linear-gradient(135deg, #0f766e 0%, #0d9488 100%)', borderRadius: '16px', padding: '2.5rem', color: 'white', marginBottom: '2rem', boxShadow: '0 10px 15px -3px rgba(13, 148, 136, 0.2)' }}>
                <span style={{ backgroundColor: 'rgba(255,255,255,0.2)', padding: '0.3rem 0.8rem', borderRadius: '20px', fontSize: '0.8rem', fontWeight: '600', textTransform: 'uppercase' }}>Analítica Cloud</span>
                <h1 style={{ margin: '0.75rem 0 0.5rem 0', fontSize: '2rem' }}>Panel de Reportería y KPIs</h1>
                <p style={{ margin: 0, opacity: 0.9, fontSize: '1rem' }}>Indicadores en tiempo real sobre la demanda y el flujo asistencial de la red.</p>
            </div>

            {/* Tarjetas de KPIs */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
                <div style={{ backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '16px', padding: '1.75rem', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.02)' }}>
                    <span style={{ fontSize: '0.85rem', fontWeight: '600', color: '#64748b', textTransform: 'uppercase' }}>Atenciones Hoy</span>
                    <div style={{ fontSize: '2.25rem', fontWeight: '700', color: '#0d9488', margin: '0.5rem 0 0.25rem 0' }}>148</div>
                    <span style={{ fontSize: '0.8rem', color: '#059669', fontWeight: '600' }}>+12% vs. ayer</span>
                </div>

                <div style={{ backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '16px', padding: '1.75rem', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.02)' }}>
                    <span style={{ fontSize: '0.85rem', fontWeight: '600', color: '#64748b', textTransform: 'uppercase' }}>Tiempo de Espera Promedio</span>
                    <div style={{ fontSize: '2.25rem', fontWeight: '700', color: '#1e293b', margin: '0.5rem 0 0.25rem 0' }}>18 min</div>
                    <span style={{ fontSize: '0.8rem', color: '#0284c7', fontWeight: '600' }}>Dentro del rango óptimo</span>
                </div>

                <div style={{ backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '16px', padding: '1.75rem', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.02)' }}>
                    <span style={{ fontSize: '0.85rem', fontWeight: '600', color: '#64748b', textTransform: 'uppercase' }}>Boxes Operativos</span>
                    <div style={{ fontSize: '2.25rem', fontWeight: '700', color: '#1e293b', margin: '0.5rem 0 0.25rem 0' }}>18 / 20</div>
                    <span style={{ fontSize: '0.8rem', color: '#d97706', fontWeight: '600' }}>2 en mantención</span>
                </div>
            </div>

            {/* Barra de Especialidades */}
            <div style={{ backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '16px', padding: '2rem', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.02)' }}>
                <h3 style={{ marginTop: 0, color: '#1e293b', fontSize: '1.2rem', marginBottom: '1.5rem' }}>Distribución de Atenciones por Especialidad</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
                    <div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem', marginBottom: '0.4rem', fontWeight: '600', color: '#334155' }}>
                            <span>Medicina General</span>
                            <span>45%</span>
                        </div>
                        <div style={{ width: '100%', backgroundColor: '#f1f5f9', height: '10px', borderRadius: '5px', overflow: 'hidden' }}>
                            <div style={{ width: '45%', backgroundColor: '#0d9488', height: '100%', borderRadius: '5px' }}></div>
                        </div>
                    </div>
                    <div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem', marginBottom: '0.4rem', fontWeight: '600', color: '#334155' }}>
                            <span>Cardiología</span>
                            <span>25%</span>
                        </div>
                        <div style={{ width: '100%', backgroundColor: '#f1f5f9', height: '10px', borderRadius: '5px', overflow: 'hidden' }}>
                            <div style={{ width: '25%', backgroundColor: '#0284c7', height: '100%', borderRadius: '5px' }}></div>
                        </div>
                    </div>
                    <div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem', marginBottom: '0.4rem', fontWeight: '600', color: '#334155' }}>
                            <span>Pediatría</span>
                            <span>20%</span>
                        </div>
                        <div style={{ width: '100%', backgroundColor: '#f1f5f9', height: '10px', borderRadius: '5px', overflow: 'hidden' }}>
                            <div style={{ width: '20%', backgroundColor: '#059669', height: '100%', borderRadius: '5px' }}></div>
                        </div>
                    </div>
                    <div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem', marginBottom: '0.4rem', fontWeight: '600', color: '#334155' }}>
                            <span>Urgencia Dental</span>
                            <span>10%</span>
                        </div>
                        <div style={{ width: '100%', backgroundColor: '#f1f5f9', height: '10px', borderRadius: '5px', overflow: 'hidden' }}>
                            <div style={{ width: '10%', backgroundColor: '#d97706', height: '100%', borderRadius: '5px' }}></div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}