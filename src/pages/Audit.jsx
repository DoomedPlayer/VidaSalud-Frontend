import { useState } from 'react';

export default function Audit() {
    // Datos de prueba alineados con los eventos clínicos y de seguridad del caso
    const [eventos] = useState([
        { id: 1, fecha: '2026-09-15', hora: '08:32:10', usuario: 'do.urrutia@duocuc.cl', accion: 'LOGIN_SUCCESS', modulo: 'Auth MSAL', ip: '190.160.22.14' },
        { id: 2, fecha: '2026-09-15', hora: '09:15:00', usuario: 'paciente.nuevo@mail.com', accion: 'APPOINTMENT_REQUESTED', modulo: 'Portal Paciente', ip: '200.111.45.2' },
        { id: 3, fecha: '2026-09-15', hora: '10:05:33', usuario: 'benjamin.recepcion@duocuc.cl', accion: 'APPOINTMENT_CONFIRMED', modulo: 'Recepción', ip: '10.0.1.50' },
        { id: 4, fecha: '2026-09-15', hora: '10:35:42', usuario: 'benjamin.recepcion@duocuc.cl', accion: 'PATIENT_ADMITTED_TO_BOX', modulo: 'Recepción', ip: '10.0.1.50' },
        { id: 5, fecha: '2026-09-15', hora: '11:10:00', usuario: 'nicolas.backend@duocuc.cl', accion: 'APPOINTMENT_CLOSED', modulo: 'Atenciones', ip: '10.0.1.15' },
        { id: 6, fecha: '2026-09-14', hora: '18:45:00', usuario: 'do.urrutia@duocuc.cl', accion: 'CATALOG_PRICE_UPDATED', modulo: 'Catálogo', ip: '190.160.22.14' }
    ]);

    // Estados para los filtros requeridos por el caso
    const [filtroUsuario, setFiltroUsuario] = useState('');
    const [filtroFecha, setFiltroFecha] = useState('');
    const [filtroTipo, setFiltroTipo] = useState('');

    // Lógica de filtrado
    const eventosFiltrados = eventos.filter(ev => {
        const coincideUsuario = ev.usuario.toLowerCase().includes(filtroUsuario.toLowerCase());
        const coincideFecha = filtroFecha === '' || ev.fecha === filtroFecha;
        const coincideTipo = filtroTipo === '' || ev.accion.toLowerCase().includes(filtroTipo.toLowerCase());
        return coincideUsuario && coincideFecha && coincideTipo;
    });

    return (
        <div>
            {/* Banner de Módulo */}
            <div style={{ background: 'linear-gradient(135deg, #0f766e 0%, #0d9488 100%)', borderRadius: '16px', padding: '2.5rem', color: 'white', marginBottom: '2rem', boxShadow: '0 10px 15px -3px rgba(13, 148, 136, 0.2)' }}>
                <span style={{ backgroundColor: 'rgba(255,255,255,0.2)', padding: '0.3rem 0.8rem', borderRadius: '20px', fontSize: '0.8rem', fontWeight: '600', textTransform: 'uppercase' }}>Seguridad y Trazabilidad</span>
                <h1 style={{ margin: '0.75rem 0 0.5rem 0', fontSize: '2rem' }}>Auditoría de Eventos</h1>
                <p style={{ margin: 0, opacity: 0.9, fontSize: '1rem' }}>Registro de seguridad (solo lectura) validado a través de microservicios y pasarela API.</p>
            </div>

            {/* Panel de Filtros (Requisito del Documento) */}
            <div style={{ backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '16px', padding: '1.5rem 2rem', marginBottom: '2rem', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.02)' }}>
                <h3 style={{ marginTop: 0, color: '#1e293b', fontSize: '1.1rem', marginBottom: '1rem' }}>Filtros de Búsqueda</h3>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem', alignItems: 'end' }}>
                    <div>
                        <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '600', color: '#334155', marginBottom: '0.4rem' }}>Usuario (Correo)</label>
                        <input 
                            type="text" 
                            placeholder="Ej: do.urrutia@duocuc.cl" 
                            value={filtroUsuario}
                            onChange={(e) => setFiltroUsuario(e.target.value)}
                            style={{ width: '100%', padding: '0.7rem', border: '1px solid #cbd5e1', borderRadius: '8px', fontSize: '0.9rem', boxSizing: 'border-box' }}
                        />
                    </div>
                    <div>
                        <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '600', color: '#334155', marginBottom: '0.4rem' }}>Fecha del Evento</label>
                        <input 
                            type="date" 
                            value={filtroFecha}
                            onChange={(e) => setFiltroFecha(e.target.value)}
                            style={{ width: '100%', padding: '0.7rem', border: '1px solid #cbd5e1', borderRadius: '8px', fontSize: '0.9rem', boxSizing: 'border-box' }}
                        />
                    </div>
                    <div>
                        <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '600', color: '#334155', marginBottom: '0.4rem' }}>Tipo de Evento</label>
                        <select 
                            value={filtroTipo}
                            onChange={(e) => setFiltroTipo(e.target.value)}
                            style={{ width: '100%', padding: '0.7rem', border: '1px solid #cbd5e1', borderRadius: '8px', fontSize: '0.9rem', boxSizing: 'border-box', backgroundColor: '#fff' }}
                        >
                            <option value="">Todos los eventos</option>
                            <option value="LOGIN">Autenticación (Login)</option>
                            <option value="APPOINTMENT">Atenciones (Agendar/Confirmar)</option>
                            <option value="CATALOG">Catálogo (Prestaciones)</option>
                        </select>
                    </div>
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                        <button 
                            onClick={() => { setFiltroUsuario(''); setFiltroFecha(''); setFiltroTipo(''); }}
                            style={{ backgroundColor: '#f1f5f9', color: '#475569', border: '1px solid #cbd5e1', padding: '0.7rem 1.2rem', borderRadius: '8px', fontWeight: '600', cursor: 'pointer', width: '100%' }}
                        >
                            Limpiar
                        </button>
                    </div>
                </div>
            </div>

            {/* Timeline */}
            <div style={{ backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '16px', padding: '2rem', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.02)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                    <h3 style={{ margin: 0, color: '#1e293b', fontSize: '1.2rem' }}>Timeline de Actividad en la Red</h3>
                    <span style={{ fontSize: '0.85rem', color: '#64748b', fontWeight: '600' }}>
                        Mostrando {eventosFiltrados.length} evento(s)
                    </span>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    {eventosFiltrados.length === 0 ? (
                        <div style={{ textAlign: 'center', padding: '3rem', color: '#94a3b8' }}>
                            No se encontraron eventos con los filtros aplicados.
                        </div>
                    ) : (
                        eventosFiltrados.map((ev) => (
                            <div key={ev.id} style={{ display: 'flex', alignItems: 'flex-start', gap: '1.5rem', padding: '1.2rem', backgroundColor: '#f8fafc', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                                <div style={{ backgroundColor: '#e0f2fe', color: '#0284c7', padding: '0.5rem 0.9rem', borderRadius: '8px', fontSize: '0.75rem', fontWeight: '700', fontFamily: 'monospace', whiteSpace: 'nowrap', minWidth: '100px', textAlign: 'center' }}>
                                    {ev.modulo}
                                </div>
                                <div style={{ flex: 1 }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem' }}>
                                        <span style={{ fontWeight: '700', color: '#1e293b', fontSize: '0.95rem' }}>{ev.accion}</span>
                                        <span style={{ fontSize: '0.85rem', color: '#64748b', fontWeight: '600' }}>{ev.fecha} - {ev.hora}</span>
                                    </div>
                                    <div style={{ fontSize: '0.9rem', color: '#475569' }}>
                                        Usuario: <strong style={{ color: '#334155' }}>{ev.usuario}</strong> | IP Origen: <code style={{ color: '#0f766e', backgroundColor: '#f1f5f9', padding: '0.2rem 0.5rem', borderRadius: '4px' }}>{ev.ip}</code>
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
}