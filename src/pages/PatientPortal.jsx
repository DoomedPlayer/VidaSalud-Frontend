import { useState } from 'react';
import { useMsal } from "@azure/msal-react";

export default function PatientPortal() {
    const { accounts } = useMsal();
    const [misHoras, setMisHoras] = useState([
        { id: 501, especialidad: 'Medicina General', medico: 'Dr. Roberto Gómez', fecha: '12/09/2026 - 10:30 hrs', estado: 'CONFIRMADA' },
        { id: 502, especialidad: 'Cardiología', medico: 'Dra. Elena Valdés', fecha: '18/09/2026 - 15:00 hrs', estado: 'SOLICITADA' }
    ]);

    const [especialidad, setEspecialidad] = useState('Medicina General');
    const [fechaReserva, setFechaReserva] = useState('');

    const solicitarHora = (e) => {
        e.preventDefault();
        if (!fechaReserva) return;

        const nuevaHora = {
            id: Math.floor(Math.random() * 900) + 100,
            especialidad,
            medico: especialidad === 'Cardiología' ? 'Dra. Elena Valdés' : 'Dr. Roberto Gómez',
            fecha: `${fechaReserva} - 11:00 hrs`,
            estado: 'SOLICITADA'
        };

        setMisHoras([nuevaHora, ...misHoras]);
        setFechaReserva('');
    };

    const getBadgeStyle = (estado) => {
        if (estado === 'SOLICITADA') return { backgroundColor: '#fef3c7', color: '#d97706', padding: '0.25rem 0.75rem', borderRadius: '20px', fontSize: '0.75rem', fontWeight: '700' };
        return { backgroundColor: '#d1fae5', color: '#059669', padding: '0.25rem 0.75rem', borderRadius: '20px', fontSize: '0.75rem', fontWeight: '700' };
    };

    return (
        <div>
            {/* Banner de Módulo Paciente */}
            <div style={{ background: 'linear-gradient(135deg, #0284c7 0%, #0369a1 100%)', borderRadius: '16px', padding: '2.5rem', color: 'white', marginBottom: '2rem', boxShadow: '0 10px 15px -3px rgba(2, 132, 199, 0.2)' }}>
                <span style={{ backgroundColor: 'rgba(255,255,255,0.2)', padding: '0.3rem 0.8rem', borderRadius: '20px', fontSize: '0.8rem', fontWeight: '600', textTransform: 'uppercase' }}>Portal de Pacientes</span>
                <h1 style={{ margin: '0.75rem 0 0.5rem 0', fontSize: '2rem' }}>Bienvenido/a, {accounts[0]?.name}</h1>
                <p style={{ margin: 0, opacity: 0.9, fontSize: '1rem' }}>Solicite sus horas médicas y revise el estado de sus reservas en la red.</p>
            </div>

            {/* Formulario de Solicitud */}
            <div style={{ backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '16px', padding: '2rem', marginBottom: '2rem', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.02)' }}>
                <h3 style={{ marginTop: 0, color: '#1e293b', fontSize: '1.2rem', marginBottom: '1rem' }}>Solicitar Nueva Hora Médica</h3>
                <form onSubmit={solicitarHora} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.25rem', alignItems: 'end' }}>
                    <div>
                        <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '600', color: '#334155', marginBottom: '0.4rem' }}>Especialidad</label>
                        <select 
                            value={especialidad}
                            onChange={(e) => setEspecialidad(e.target.value)}
                            style={{ width: '100%', padding: '0.7rem', border: '1px solid #cbd5e1', borderRadius: '8px', fontSize: '0.9rem', backgroundColor: '#fff', boxSizing: 'border-box' }}
                        >
                            <option value="Medicina General">Medicina General</option>
                            <option value="Cardiología">Cardiología</option>
                            <option value="Pediatría">Pediatría</option>
                            <option value="Urgencia Dental">Urgencia Dental</option>
                        </select>
                    </div>
                    <div>
                        <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '600', color: '#334155', marginBottom: '0.4rem' }}>Fecha Preferencia</label>
                        <input 
                            type="date" 
                            value={fechaReserva}
                            onChange={(e) => setFechaReserva(e.target.value)}
                            style={{ width: '100%', padding: '0.7rem', border: '1px solid #cbd5e1', borderRadius: '8px', fontSize: '0.9rem', boxSizing: 'border-box' }}
                        />
                    </div>
                    <div>
                        <button type="submit" style={{ backgroundColor: '#0284c7', color: 'white', border: 'none', padding: '0.75rem 1.25rem', fontSize: '0.9rem', fontWeight: '600', borderRadius: '8px', cursor: 'pointer', width: '100%' }}>
                            Reservar Hora
                        </button>
                    </div>
                </form>
            </div>

            {/* Listado de Horas del Paciente */}
            <div style={{ backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '16px', padding: '2rem', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.02)' }}>
                <h3 style={{ marginTop: 0, color: '#1e293b', fontSize: '1.2rem', marginBottom: '1.5rem' }}>Mis Horas Médicas Agendadas</h3>

                <div style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.9rem' }}>
                        <thead>
                            <tr style={{ backgroundColor: '#f8fafc', color: '#334155', borderBottom: '2px solid #e2e8f0' }}>
                                <th style={{ padding: '0.85rem 1rem' }}>ID Reserva</th>
                                <th style={{ padding: '0.85rem 1rem' }}>Especialidad</th>
                                <th style={{ padding: '0.85rem 1rem' }}>Médico Asignado</th>
                                <th style={{ padding: '0.85rem 1rem' }}>Fecha y Hora</th>
                                <th style={{ padding: '0.85rem 1rem' }}>Estado</th>
                            </tr>
                        </thead>
                        <tbody>
                            {misHoras.map((h) => (
                                <tr key={h.id} style={{ borderBottom: '1px solid #e2e8f0' }}>
                                    <td style={{ padding: '0.85rem 1rem', color: '#64748b', fontFamily: 'monospace' }}>#{h.id}</td>
                                    <td style={{ padding: '0.85rem 1rem', fontWeight: '600', color: '#1e293b' }}>{h.especialidad}</td>
                                    <td style={{ padding: '0.85rem 1rem', color: '#475569' }}>{h.medico}</td>
                                    <td style={{ padding: '0.85rem 1rem', color: '#475569' }}>{h.fecha}</td>
                                    <td style={{ padding: '0.85rem 1rem' }}><span style={getBadgeStyle(h.estado)}>{h.estado}</span></td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}