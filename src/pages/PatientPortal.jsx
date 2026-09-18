import { useState, useEffect } from 'react';
import { useMsal } from "@azure/msal-react";
import { useApi } from '../hooks/useApi';

export default function PatientPortal() {
    const { accounts } = useMsal();
    const api = useApi();
    
    const nombrePaciente = accounts[0]?.name?.toUpperCase() || 'PACIENTE';
    const correoPaciente = accounts[0]?.username || 'correo@dominio.com';
    
    // Nueva variable para obtener la fecha de hoy y bloquear días anteriores
    const hoy = new Date().toISOString().split('T')[0];
    
    const [misHoras, setMisHoras] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [errorBackend, setErrorBackend] = useState(false);

    // Formulario
    const [especialidad, setEspecialidad] = useState('Medicina General');
    const [fechaReserva, setFechaReserva] = useState('');
    const [horaReserva, setHoraReserva] = useState('08:00');
    const horariosFijos = ['08:00', '08:30', '09:00', '09:30', '10:00', '10:30', '11:00', '11:30'];

    useEffect(() => {
        const fetchMisAtenciones = async () => {
            setIsLoading(true);
            setErrorBackend(false);
            try {
                // Le pasamos el correo como pacienteId (o podríamos filtrar en el backend)
                const res = await api.get('/appointments');
                
                // Mapeamos lo que llega del backend (Atencion.java) a la vista
                const dataMapeada = res.data.map(item => ({
                    id: item.id,
                    especialidad: item.prestacionNombre || 'Medicina General', // Asumiendo que el BFF cruza el nombre
                    medico: 'Dr. Asignado', 
                    sede: item.boxCentroAtencion || 'Sede San Bernardo',
                    fecha: item.fechaCreacion ? item.fechaCreacion.split('T')[0] : 'N/A',
                    hora: item.fechaCreacion ? item.fechaCreacion.split('T')[1].substring(0,5) : 'N/A',
                    estado: item.estado || 'SOLICITADA' // Enum: SOLICITADA, CONFIRMADA...
                }));
                setMisHoras(dataMapeada);
            } catch (error) {
                console.warn("Backend no disponible. Cargando modo offline.");
                setErrorBackend(true);
                setMisHoras([
                    { id: 501, especialidad: 'Medicina General', medico: 'Dr. Roberto Gómez', sede: 'Sede San Bernardo', fecha: '2026-09-15', hora: '10:30', estado: 'CONFIRMADA' }
                ]);
            } finally {
                setIsLoading(false);
            }
        };

        fetchMisAtenciones();
    }, []);

    const solicitarHora = async (e) => {
        e.preventDefault();
        if (!fechaReserva) return;

        // Payload basado en Atencion.java
        const payload = {
            pacienteId: correoPaciente,
            prestacionId: especialidad === 'Cardiología' ? 2 : 1, // Simulamos IDs
            cupoId: 1, // Simulamos un cupo disponible
            estado: 'SOLICITADA',
            fechaCreacion: `${fechaReserva}T${horaReserva}:00`
        };

        try {
            const res = await api.post('/appointments', payload);
            const nuevaCita = {
                id: res.data.id || Math.floor(Math.random() * 900) + 100,
                especialidad,
                medico: especialidad === 'Cardiología' ? 'Dra. Elena Valdés' : 'Dr. Roberto Gómez',
                sede: 'Sede San Bernardo',
                fecha: fechaReserva,
                hora: horaReserva,
                estado: 'SOLICITADA'
            };
            setMisHoras([nuevaCita, ...misHoras]);
        } catch (error) {
            // Guardado Offline
            const nuevaCitaLocal = { id: Math.floor(Math.random() * 900) + 100, especialidad, medico: 'Dr. Asignado', sede: 'Sede Local', fecha: fechaReserva, hora: horaReserva, estado: 'SOLICITADA' };
            setMisHoras([nuevaCitaLocal, ...misHoras]);
        }
        setFechaReserva('');
    };

    const anularHora = async (id) => {
        if(window.confirm('¿Anular reserva?')) {
            try {
                await api.put(`/appointments/${id}/status`, { status: 'CANCELADA' });
                setMisHoras(misHoras.map(h => h.id === id ? { ...h, estado: 'CANCELADA' } : h));
            } catch (error) {
                setMisHoras(misHoras.map(h => h.id === id ? { ...h, estado: 'CANCELADA' } : h));
            }
        }
    };

    return (
        <div>
            <div style={{ backgroundColor: '#0284c7', borderRadius: '16px', padding: '2.5rem', color: 'white', marginBottom: '2rem', boxShadow: '0 10px 15px -3px rgba(2, 132, 199, 0.2)' }}>
                <span style={{ backgroundColor: 'rgba(255,255,255,0.2)', padding: '0.3rem 0.8rem', borderRadius: '20px', fontSize: '0.8rem', fontWeight: '600' }}>Portal de Pacientes</span>
                <h1 style={{ margin: '0.75rem 0 0.5rem 0' }}>Bienvenido/a, {nombrePaciente}</h1>
            </div>

            {errorBackend && (
                <div style={{ backgroundColor: '#fffbeb', borderLeft: '4px solid #f59e0b', padding: '1rem', marginBottom: '1.5rem', borderRadius: '0 8px 8px 0', color: '#b45309', fontSize: '0.9rem', fontWeight: '600' }}>
                    ⚠️ Sin conexión al servidor. Modo offline activado para reservas locales.
                </div>
            )}

            <div style={{ backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '16px', padding: '2rem', marginBottom: '2rem', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.02)' }}>
                <h3 style={{ marginTop: 0, marginBottom: '1.5rem' }}>Solicitar Nueva Hora Médica</h3>
                <form onSubmit={solicitarHora} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem', alignItems: 'end' }}>
                    <div><label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '600', marginBottom: '0.5rem' }}>Especialidad</label><select value={especialidad} onChange={(e) => setEspecialidad(e.target.value)} style={{ width: '100%', padding: '0.75rem', border: '1px solid #cbd5e1', borderRadius: '8px' }}><option value="Medicina General">Medicina General</option><option value="Cardiología">Cardiología</option><option value="Pediatría">Pediatría</option><option value="Urgencia Dental">Urgencia Dental</option></select></div>
                    {/* Se agrega min={hoy} al input date */}
                    <div><label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '600', marginBottom: '0.5rem' }}>Fecha Preferencia</label><input type="date" min={hoy} value={fechaReserva} onChange={(e) => setFechaReserva(e.target.value)} style={{ width: '100%', padding: '0.75rem', border: '1px solid #cbd5e1', borderRadius: '8px' }} required /></div>
                    <div><label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '600', marginBottom: '0.5rem' }}>Horario Preferencia</label><select value={horaReserva} onChange={(e) => setHoraReserva(e.target.value)} style={{ width: '100%', padding: '0.75rem', border: '1px solid #cbd5e1', borderRadius: '8px' }}>{horariosFijos.map(h => <option key={h} value={h}>{h}</option>)}</select></div>
                    <div><button type="submit" style={{ backgroundColor: '#0284c7', color: 'white', border: 'none', padding: '0.8rem 1.25rem', borderRadius: '8px', fontWeight: '600', cursor: 'pointer', width: '100%' }}>Reservar Hora</button></div>
                </form>
            </div>

            <div style={{ backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '16px', padding: '2rem', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.02)' }}>
                <h3 style={{ margin: '0 0 1.5rem 0' }}>Registro de Atenciones</h3>
                {isLoading ? (
                    <div style={{ textAlign: 'center', padding: '2rem', color: '#0284c7' }}>Cargando horas médicas...</div>
                ) : (
                    <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.9rem' }}>
                        <thead><tr style={{ backgroundColor: '#f8fafc', borderBottom: '2px solid #e2e8f0' }}><th style={{ padding: '1rem' }}>ID Reserva</th><th style={{ padding: '1rem' }}>Especialidad</th><th style={{ padding: '1rem' }}>Médico Asignado</th><th style={{ padding: '1rem' }}>Sede</th><th style={{ padding: '1rem' }}>Fecha y Hora</th><th style={{ padding: '1rem' }}>Estado</th><th style={{ padding: '1rem', textAlign: 'right' }}>Acciones</th></tr></thead>
                        <tbody>
                            {misHoras.map((h) => (
                                <tr key={h.id} style={{ borderBottom: '1px solid #e2e8f0' }}>
                                    <td style={{ padding: '1rem' }}>#{h.id}</td><td style={{ padding: '1rem', fontWeight: '700' }}>{h.especialidad}</td><td style={{ padding: '1rem' }}>{h.medico}</td><td style={{ padding: '1rem' }}>{h.sede}</td>
                                    <td style={{ padding: '1rem' }}><div>{h.fecha}</div><div>{h.hora} hrs</div></td>
                                    <td style={{ padding: '1rem' }}>
                                        <span style={{ backgroundColor: h.estado === 'SOLICITADA' ? '#fef3c7' : (h.estado === 'CANCELADA' ? '#fee2e2' : '#d1fae5'), color: h.estado === 'SOLICITADA' ? '#d97706' : (h.estado === 'CANCELADA' ? '#ef4444' : '#059669'), padding: '0.3rem 0.8rem', borderRadius: '20px', fontWeight: '700', fontSize: '0.75rem' }}>
                                            {h.estado}
                                        </span>
                                    </td>
                                    <td style={{ padding: '1rem', textAlign: 'right' }}>
                                        {h.estado !== 'CANCELADA' && h.estado !== 'CERRADA' && (
                                            <button onClick={() => anularHora(h.id)} style={{ backgroundColor: '#ef4444', color: 'white', border: 'none', padding: '0.4rem 1rem', borderRadius: '6px', cursor: 'pointer', fontWeight: '600' }}>Anular</button>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>
        </div>
    );
}