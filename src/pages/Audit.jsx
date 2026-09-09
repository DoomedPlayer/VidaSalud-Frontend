export default function Audit() {
    const eventos = [
        { id: 1, timestamp: '09/09/2026 - 18:32:10', usuario: 'do.urrutia@duocuc.cl', accion: 'LOGIN_SUCCESS', modulo: 'Auth MSAL', ip: '190.160.22.14' },
        { id: 2, timestamp: '09/09/2026 - 18:35:42', usuario: 'do.urrutia@duocuc.cl', accion: 'UPDATE_APPOINTMENT_STATUS', modulo: 'Atenciones', ip: '190.160.22.14' },
        { id: 3, timestamp: '09/09/2026 - 18:40:15', usuario: 'nicolas.backend@duocuc.cl', accion: 'GATEWAY_PROXY_TOKEN_VALID', modulo: 'API Gateway', ip: '10.0.1.15' },
        { id: 4, timestamp: '09/09/2026 - 18:45:00', usuario: 'do.urrutia@duocuc.cl', accion: 'CATALOG_ITEM_CREATED', modulo: 'Catálogo', ip: '190.160.22.14' }
    ];

    return (
        <div>
            {/* Banner de Módulo */}
            <div style={{ background: 'linear-gradient(135deg, #0f766e 0%, #0d9488 100%)', borderRadius: '16px', padding: '2.5rem', color: 'white', marginBottom: '2rem', boxShadow: '0 10px 15px -3px rgba(13, 148, 136, 0.2)' }}>
                <span style={{ backgroundColor: 'rgba(255,255,255,0.2)', padding: '0.3rem 0.8rem', borderRadius: '20px', fontSize: '0.8rem', fontWeight: '600', textTransform: 'uppercase' }}>Seguridad y Trazabilidad</span>
                <h1 style={{ margin: '0.75rem 0 0.5rem 0', fontSize: '2rem' }}>Auditoría de Eventos</h1>
                <p style={{ margin: 0, opacity: 0.9, fontSize: '1rem' }}>Registro de seguridad (solo lectura) validado a través de microservicios y pasarela API.</p>
            </div>

            {/* Timeline */}
            <div style={{ backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '16px', padding: '2rem', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.02)' }}>
                <h3 style={{ marginTop: 0, color: '#1e293b', fontSize: '1.2rem', marginBottom: '1.5rem' }}>Timeline de Actividad en la Red</h3>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    {eventos.map((ev) => (
                        <div key={ev.id} style={{ display: 'flex', alignItems: 'flex-start', gap: '1rem', padding: '1.2rem', backgroundColor: '#f8fafc', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                            <div style={{ backgroundColor: '#e0f2fe', color: '#0284c7', padding: '0.5rem 0.9rem', borderRadius: '8px', fontSize: '0.75rem', fontWeight: '700', fontFamily: 'monospace', whiteSpace: 'nowrap' }}>
                                {ev.modulo}
                            </div>
                            <div style={{ flex: 1 }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.3rem' }}>
                                    <span style={{ fontWeight: '600', color: '#1e293b', fontSize: '0.95rem' }}>{ev.accion}</span>
                                    <span style={{ fontSize: '0.8rem', color: '#64748b' }}>{ev.timestamp}</span>
                                </div>
                                <div style={{ fontSize: '0.85rem', color: '#475569' }}>
                                    Usuario: <strong style={{ color: '#334155' }}>{ev.usuario}</strong> | IP Origen: <code style={{ color: '#0f766e', backgroundColor: '#f1f5f9', padding: '0.1rem 0.4rem', borderRadius: '4px' }}>{ev.ip}</code>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}