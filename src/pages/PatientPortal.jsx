import { useState } from 'react';
import { useMsal } from "@azure/msal-react";

export default function PatientPortal() {
    const { accounts } = useMsal();
    
    // Si MSAL no carga el nombre, usamos el de la captura como fallback
    const nombrePaciente = accounts[0]?.name?.toUpperCase() || 'BENJAMIN ALEJANDRO PALOMINOS GAJARDO';

    const [misHoras, setMisHoras] = useState([
        { id: 501, especialidad: 'Medicina General', medico: 'Dr. Roberto Gómez', sede: 'Sede San Bernardo (Presencial)', fecha: '2026-09-12', hora: '10:30 hrs', estado: 'CONFIRMADA' },
        { id: 502, especialidad: 'Cardiología', medico: 'Dra. Elena Valdés', sede: 'Sede San Bernardo (Presencial)', fecha: '2026-09-18', hora: '15:00 hrs', estado: 'SOLICITADA' }
    ]);

    const [especialidad, setEspecialidad] = useState('Medicina General');
    const [fechaReserva, setFechaReserva] = useState('');
    const [horaReserva, setHoraReserva] = useState('08:00 hrs');
    const [tabActiva, setTabActiva] = useState('proximas'); // 'proximas' | 'historial'

    const horariosFijos = ['08:00 hrs', '08:30 hrs', '09:00 hrs', '09:30 hrs', '10:00 hrs', '10:30 hrs', '11:00 hrs'];

    const solicitarHora = (e) => {
        e.preventDefault();
        if (!fechaReserva) return;

        const nuevaHora = {
            id: Math.floor(Math.random() * 900) + 100,
            especialidad,
            medico: especialidad === 'Cardiología' ? 'Dra. Elena Valdés' : 'Dr. Roberto Gómez',
            sede: 'Sede San Bernardo (Presencial)',
            fecha: fechaReserva,
            hora: horaReserva,
            estado: 'SOLICITADA'
        };

        setMisHoras([nuevaHora, ...misHoras]);
        setFechaReserva('');
        setHoraReserva('08:00 hrs');
    };

    const anularHora = (id) => {
        if(window.confirm('¿Está seguro que desea anular esta reserva?')) {
            setMisHoras(misHoras.filter(h => h.id !== id));
        }
    };

    const getBadgeStyle = (estado) => {
        if (estado === 'SOLICITADA') return { backgroundColor: '#fef3c7', color: '#d97706', padding: '0.3rem 0.8rem', borderRadius: '20px', fontSize: '0.75rem', fontWeight: '700' };
        return { backgroundColor: '#d1fae5', color: '#059669', padding: '0.3rem 0.8rem', borderRadius: '20px', fontSize: '0.75rem', fontWeight: '700' };
    };

    return (
        <div>
            {/* Banner de Módulo Paciente */}
            <div style={{ backgroundColor: '#0284c7', borderRadius: '16px', padding: '2.5rem', color: 'white', marginBottom: '2rem', boxShadow: '0 10px 15px -3px rgba(2, 132, 199, 0.2)' }}>
                <span style={{ backgroundColor: 'rgba(255,255,255,0.2)', padding: '0.3rem 0.8rem', borderRadius: '20px', fontSize: '0.8rem', fontWeight: '600', textTransform: 'uppercase' }}>Portal de Pacientes</span>
                <h1 style={{ margin: '0.75rem 0 0.5rem 0', fontSize: '1.8rem', letterSpacing: '0.5px' }}>Bienvenido/a, {nombrePaciente}</h1>
                <p style={{ margin: 0, opacity: 0.9, fontSize: '1rem' }}>Solicite sus horas médicas y revise el estado de sus reservas en la red.</p>
            </div>

            {/* Formulario de Solicitud */}
            <div style={{ backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '16px', padding: '2rem', marginBottom: '2rem', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.02)' }}>
                <h3 style={{ marginTop: 0, color: '#1e293b', fontSize: '1.2rem', marginBottom: '1.5rem' }}>Solicitar Nueva Hora Médica</h3>
                <form onSubmit={solicitarHora} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem', alignItems: 'end' }}>
                    <div>
                        <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '600', color: '#334155', marginBottom: '0.5rem' }}>Especialidad</label>
                        <select 
                            value={especialidad}
                            onChange={(e) => setEspecialidad(e.target.value)}
                            style={{ width: '100%', padding: '0.75rem', border: '1px solid #cbd5e1', borderRadius: '8px', fontSize: '0.9rem', backgroundColor: '#fff', boxSizing: 'border-box' }}
                        >
                            <option value="Medicina General">Medicina General</option>
                            <option value="Cardiología">Cardiología</option>
                            <option value="Pediatría">Pediatría</option>
                            <option value="Urgencia Dental">Urgencia Dental</option>
                        </select>
                    </div>
                    <div>
                        <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '600', color: '#334155', marginBottom: '0.5rem' }}>Fecha Preferencia</label>
                        <input 
                            type="date" 
                            value={fechaReserva}
                            onChange={(e) => setFechaReserva(e.target.value)}
                            style={{ width: '100%', padding: '0.75rem', border: '1px solid #cbd5e1', borderRadius: '8px', fontSize: '0.9rem', boxSizing: 'border-box' }}
                            required
                        />
                    </div>
                    <div>
                        <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '600', color: '#334155', marginBottom: '0.5rem' }}>Horario Preferencia</label>
                        <select 
                            value={horaReserva}
                            onChange={(e) => setHoraReserva(e.target.value)}
                            style={{ width: '100%', padding: '0.75rem', border: '1px solid #cbd5e1', borderRadius: '8px', fontSize: '0.9rem', backgroundColor: '#fff', boxSizing: 'border-box' }}
                        >
                            {horariosFijos.map(h => <option key={h} value={h}>{h}</option>)}
                        </select>
                    </div>
                    <div>
                        <button type="submit" style={{ backgroundColor: '#0284c7', color: 'white', border: 'none', padding: '0.8rem 1.25rem', fontSize: '0.95rem', fontWeight: '600', borderRadius: '8px', cursor: 'pointer', width: '100%', transition: 'background-color 0.2s' }}>
                            Reservar Hora
                        </button>
                    </div>
                </form>
            </div>

            {/* Listado de Horas del Paciente */}
            <div style={{ backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '16px', padding: '2rem', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.02)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', borderBottom: '2px solid #f1f5f9', paddingBottom: '1rem' }}>
                    <h3 style={{ margin: 0, color: '#1e293b', fontSize: '1.2rem' }}>Registro de Atenciones</h3>
                    
                    {/* Tabs de navegación internas */}
                    <div style={{ display: 'flex', gap: '1rem' }}>
                        <button 
                            onClick={() => setTabActiva('proximas')}
                            style={{ background: 'none', border: 'none', padding: '0.5rem', cursor: 'pointer', fontSize: '0.95rem', fontWeight: tabActiva === 'proximas' ? '700' : '500', color: tabActiva === 'proximas' ? '#0f766e' : '#64748b', borderBottom: tabActiva === 'proximas' ? '2px solid #0f766e' : '2px solid transparent' }}
                        >
                            Próximas Atenciones
                        </button>
                        <button 
                            onClick={() => setTabActiva('historial')}
                            style={{ background: 'none', border: 'none', padding: '0.5rem', cursor: 'pointer', fontSize: '0.95rem', fontWeight: tabActiva === 'historial' ? '700' : '500', color: tabActiva === 'historial' ? '#0f766e' : '#64748b', borderBottom: tabActiva === 'historial' ? '2px solid #0f766e' : '2px solid transparent' }}
                        >
                            Historial
                        </button>
                    </div>
                </div>

                <div style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.9rem' }}>
                        <thead>
                            <tr style={{ backgroundColor: '#f8fafc', color: '#475569', borderBottom: '2px solid #e2e8f0' }}>
                                <th style={{ padding: '1rem' }}>ID Reserva</th>
                                <th style={{ padding: '1rem' }}>Especialidad</th>
                                <th style={{ padding: '1rem' }}>Médico Asignado</th>
                                <th style={{ padding: '1rem' }}>Sede / Modalidad</th>
                                <th style={{ padding: '1rem' }}>Fecha y Hora</th>
                                <th style={{ padding: '1rem' }}>Estado</th>
                                <th style={{ padding: '1rem', textAlign: 'right' }}>Acciones</th>
                            </tr>
                        </thead>
                        <tbody>
                            {misHoras.length === 0 ? (
                                <tr>
                                    <td colSpan="7" style={{ textAlign: 'center', padding: '3rem', color: '#94a3b8' }}>No hay atenciones registradas.</td>
                                </tr>
                            ) : (
                                misHoras.map((h) => (
                                    <tr key={h.id} style={{ borderBottom: '1px solid #e2e8f0' }}>
                                        <td style={{ padding: '1rem', color: '#64748b' }}>#{h.id}</td>
                                        <td style={{ padding: '1rem', fontWeight: '700', color: '#1e293b' }}>{h.especialidad}</td>
                                        <td style={{ padding: '1rem', color: '#475569' }}>{h.medico}</td>
                                        <td style={{ padding: '1rem', color: '#475569', fontSize: '0.85rem' }}>{h.sede}</td>
                                        <td style={{ padding: '1rem', color: '#1e293b' }}>
                                            <div style={{ fontWeight: '600' }}>{h.fecha}</div>
                                            <div style={{ fontSize: '0.8rem', color: '#64748b' }}>{h.hora}</div>
                                        </td>
                                        <td style={{ padding: '1rem' }}><span style={getBadgeStyle(h.estado)}>{h.estado}</span></td>
                                        <td style={{ padding: '1rem', textAlign: 'right' }}>
                                            <button onClick={() => anularHora(h.id)} style={{ backgroundColor: '#ef4444', color: 'white', border: 'none', padding: '0.4rem 1rem', fontSize: '0.8rem', borderRadius: '6px', cursor: 'pointer', fontWeight: '600' }}>
                                                Anular
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}