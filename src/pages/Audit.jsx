import { useState, useEffect } from 'react';
import { useApi } from '../hooks/useApi';

export default function Audit() {
    const api = useApi();
    
    const [eventos, setEventos] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [errorBackend, setErrorBackend] = useState(false);

    // Filtros
    const [filtroUsuario, setFiltroUsuario] = useState('');
    const [filtroFecha, setFiltroFecha] = useState('');
    const [filtroTipo, setFiltroTipo] = useState('');

   const normalizarFecha = (fechaOriginal) => {
        if (!fechaOriginal) return 'N/A';
        if (Array.isArray(fechaOriginal)) {
            const [y, m, d, h, min, sec] = fechaOriginal;
            return `${y}-${String(m).padStart(2,'0')}-${String(d).padStart(2,'0')}T${String(h).padStart(2,'0')}:${String(min).padStart(2,'0')}:${sec ? String(sec).padStart(2,'0') : '00'}`;
        }
        return String(fechaOriginal); 
    };

    useEffect(() => {
        const fetchAuditorias = async () => {
            setIsLoading(true);
            setErrorBackend(false);
            try {
                const response = await api.get('/audit');
                
                const dataMapeada = response.data.map(item => {
                    // Pasamos la fecha por el normalizador antes del split
                    const fechaSegura = normalizarFecha(item.fechaHora);
                    const [fechaFormateada, horaFormateada] = fechaSegura !== 'N/A' ? fechaSegura.split('T') : ['N/A', 'N/A'];
                    
                    return {
                        id: item.id || Math.random(),
                        usuario: item.usuarioId || 'Desconocido',
                        accion: item.accion || 'SIN_ACCION',
                        fecha: fechaFormateada,
                        hora: horaFormateada,
                        ip: item.origenIp || 'N/A',
                        modulo: item.entidadId || 'Sistema',
                        detalles: item.detalles || 'Sin detalles adicionales'
                    };
                });
                
                setEventos(dataMapeada);
            } catch (err) {
                console.error("Error conectando al BFF. Activando modo offline.", err);
                setErrorBackend(true);
            } finally {
                setIsLoading(false);
            }
        };

        fetchAuditorias();
    }, []);

    // --- DATOS DE RESPALDO (Modo Offline) ---
    const mockEventos = [
        { id: 1, fecha: '2026-09-15', hora: '08:32:10', usuario: 'do.urrutia@duocuc.cl', accion: 'LOGIN_SUCCESS', modulo: 'Auth MSAL', ip: '190.160.22.14' },
        { id: 2, fecha: '2026-09-15', hora: '09:15:00', usuario: 'paciente.nuevo@mail.com', accion: 'APPOINTMENT_REQUESTED', modulo: 'Portal Paciente', ip: '200.111.45.2' },
        { id: 3, fecha: '2026-09-15', hora: '10:05:33', usuario: 'benjamin.recepcion@duocuc.cl', accion: 'APPOINTMENT_CONFIRMED', modulo: 'Recepción', ip: '10.0.1.50' }
    ];

    const eventosAMostrar = errorBackend ? mockEventos : eventos;

    // Lógica de filtrado
    const eventosFiltrados = eventosAMostrar.filter(ev => {
        return ev.usuario.toLowerCase().includes(filtroUsuario.toLowerCase()) && 
               (filtroFecha === '' || ev.fecha === filtroFecha) && 
               (filtroTipo === '' || ev.accion.toLowerCase().includes(filtroTipo.toLowerCase()));
    });

    return (
        <div>
            {/* Banner */}
            <div style={{ background: 'linear-gradient(135deg, #0f766e 0%, #0d9488 100%)', borderRadius: '16px', padding: '2.5rem', color: 'white', marginBottom: '2rem', boxShadow: '0 10px 15px -3px rgba(13, 148, 136, 0.2)' }}>
                <span style={{ backgroundColor: 'rgba(255,255,255,0.2)', padding: '0.3rem 0.8rem', borderRadius: '20px', fontSize: '0.8rem', fontWeight: '600', textTransform: 'uppercase' }}>Seguridad y Trazabilidad</span>
                <h1 style={{ margin: '0.75rem 0 0.5rem 0', fontSize: '2rem' }}>Auditoría de Eventos</h1>
                <p style={{ margin: 0, opacity: 0.9, fontSize: '1rem' }}>Registro de seguridad validado a través de microservicios y pasarela API.</p>
            </div>

            {errorBackend && (
                <div style={{ backgroundColor: '#fffbeb', borderLeft: '4px solid #f59e0b', padding: '1rem', marginBottom: '2rem', borderRadius: '0 8px 8px 0', color: '#b45309', fontSize: '0.9rem', fontWeight: '600' }}>
                    ⚠️ Servidor de Auditoría no detectado. Mostrando registros de simulación local.
                </div>
            )}

            {/* Filtros */}
            <div style={{ backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '16px', padding: '1.5rem 2rem', marginBottom: '2rem', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.02)' }}>
                <h3 style={{ marginTop: 0, color: '#1e293b', fontSize: '1.1rem', marginBottom: '1rem' }}>Filtros de Búsqueda</h3>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem', alignItems: 'end' }}>
                    <div>
                        <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '600', color: '#334155', marginBottom: '0.4rem' }}>Usuario (Correo)</label>
                        <input type="text" placeholder="Ej: do.urrutia@duocuc.cl" value={filtroUsuario} onChange={(e) => setFiltroUsuario(e.target.value)} style={{ width: '100%', padding: '0.7rem', border: '1px solid #cbd5e1', borderRadius: '8px', fontSize: '0.9rem', boxSizing: 'border-box' }} />
                    </div>
                    <div>
                        <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '600', color: '#334155', marginBottom: '0.4rem' }}>Fecha del Evento</label>
                        <input type="date" value={filtroFecha} onChange={(e) => setFiltroFecha(e.target.value)} style={{ width: '100%', padding: '0.7rem', border: '1px solid #cbd5e1', borderRadius: '8px', fontSize: '0.9rem', boxSizing: 'border-box' }} />
                    </div>
                    <div>
                        <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '600', color: '#334155', marginBottom: '0.4rem' }}>Tipo de Evento</label>
                        <select value={filtroTipo} onChange={(e) => setFiltroTipo(e.target.value)} style={{ width: '100%', padding: '0.7rem', border: '1px solid #cbd5e1', borderRadius: '8px', fontSize: '0.9rem', boxSizing: 'border-box', backgroundColor: '#fff' }}>
                            <option value="">Todos los eventos</option>
                            <option value="LOGIN">Autenticación (Login)</option>
                            <option value="APPOINTMENT">Atenciones (Agendar/Confirmar)</option>
                            <option value="CATALOG">Catálogo (Prestaciones)</option>
                        </select>
                    </div>
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                        <button onClick={() => { setFiltroUsuario(''); setFiltroFecha(''); setFiltroTipo(''); }} style={{ backgroundColor: '#f1f5f9', color: '#475569', border: '1px solid #cbd5e1', padding: '0.7rem 1.2rem', borderRadius: '8px', fontWeight: '600', cursor: 'pointer', width: '100%' }}>Limpiar</button>
                    </div>
                </div>
            </div>

            {/* Timeline */}
            <div style={{ backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '16px', padding: '2rem', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.02)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                    <h3 style={{ margin: 0, color: '#1e293b', fontSize: '1.2rem' }}>Timeline de Actividad</h3>
                    <span style={{ fontSize: '0.85rem', color: '#64748b', fontWeight: '600' }}>
                        Mostrando {eventosFiltrados.length} evento(s)
                    </span>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    {isLoading ? (
                        <div style={{ textAlign: 'center', padding: '3rem', color: '#0f766e', fontWeight: '600' }}>
                            Cargando registros desde el servidor... ⏳
                        </div>
                    ) : eventosFiltrados.length === 0 ? (
                        <div style={{ textAlign: 'center', padding: '3rem', color: '#94a3b8' }}>
                            No se encontraron eventos.
                        </div>
                    ) : (
                        eventosFiltrados.map((ev, index) => (
                            <div key={ev.id || index} style={{ display: 'flex', alignItems: 'flex-start', gap: '1.5rem', padding: '1.2rem', backgroundColor: '#f8fafc', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
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
                                    <div style={{ marginTop: '0.75rem', padding: '0.75rem', backgroundColor: '#f1f5f9', borderRadius: '8px', borderLeft: '3px solid #0ea5e9', fontSize: '0.85rem', color: '#334155' }}>
                                        <strong>Detalle de auditoría:</strong> {ev.detalles}
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