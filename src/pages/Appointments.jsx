import { useState } from 'react';

export default function Appointments() {
    const [atenciones, setAtenciones] = useState([
        { id: 101, paciente: 'Carlos Mendoza', especialidad: 'Medicina General', box: 'Box 03', estado: 'SOLICITADA' },
        { id: 102, paciente: 'Ana Torres', especialidad: 'Cardiología', box: 'Box 01', estado: 'CONFIRMADA' },
        { id: 103, paciente: 'Luis Soto', especialidad: 'Pediatría', box: 'Box 04', estado: 'EN_ESPERA' },
    ]);

    const [nuevoPaciente, setNuevoPaciente] = useState('');
    const [especialidad, setEspecialidad] = useState('Medicina General');
    const [box, setBox] = useState('Box 01');

    const registrarAtencion = (e) => {
        e.preventDefault();
        if (!nuevoPaciente.trim()) return;

        const nueva = {
            id: Math.floor(Math.random() * 900) + 100,
            paciente: nuevoPaciente,
            especialidad,
            box,
            estado: 'SOLICITADA'
        };

        setAtenciones([nueva, ...atenciones]);
        setNuevoPaciente('');
    };

    const cambiarEstado = (id, nuevoEstado) => {
        setAtenciones(atenciones.map(att => att.id === id ? { ...att, estado: nuevoEstado } : att));
    };

    const getBadgeStyle = (estado) => {
        if (estado === 'SOLICITADA') return { backgroundColor: '#fef3c7', color: '#d97706', padding: '0.25rem 0.65rem', borderRadius: '9999px', fontSize: '0.75rem', fontWeight: '600' };
        if (estado === 'CONFIRMADA') return { backgroundColor: '#d1fae5', color: '#059669', padding: '0.25rem 0.65rem', borderRadius: '9999px', fontSize: '0.75rem', fontWeight: '600' };
        return { backgroundColor: '#e0f2fe', color: '#0284c7', padding: '0.25rem 0.65rem', borderRadius: '9999px', fontSize: '0.75rem', fontWeight: '600' };
    };

    return (
        <div>
            {/* Formulario para Registrar Nueva Atención */}
            <div style={{ backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '2rem', marginBottom: '1.5rem', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.02)' }}>
                <h3 style={{ marginTop: 0, color: '#1e293b' }}>Registrar Nueva Atención Médica</h3>
                <form onSubmit={registrarAtencion} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', alignItems: 'end', marginTop: '1rem' }}>
                    <div>
                        <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '600', color: '#334155', marginBottom: '0.35rem' }}>Nombre del Paciente</label>
                        <input 
                            type="text" 
                            placeholder="Ej. María Pérez" 
                            value={nuevoPaciente}
                            onChange={(e) => setNuevoPaciente(e.target.value)}
                            style={{ width: '100%', padding: '0.6rem', border: '1px solid #cbd5e1', borderRadius: '8px', fontSize: '0.9rem', boxSizing: 'border-box' }}
                        />
                    </div>
                    <div>
                        <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '600', color: '#334155', marginBottom: '0.35rem' }}>Especialidad</label>
                        <select 
                            value={especialidad}
                            onChange={(e) => setEspecialidad(e.target.value)}
                            style={{ width: '100%', padding: '0.6rem', border: '1px solid #cbd5e1', borderRadius: '8px', fontSize: '0.9rem', backgroundColor: '#white', boxSizing: 'border-box' }}
                        >
                            <option value="Medicina General">Medicina General</option>
                            <option value="Cardiología">Cardiología</option>
                            <option value="Pediatría">Pediatría</option>
                            <option value="Urgencia Dental">Urgencia Dental</option>
                        </select>
                    </div>
                    <div>
                        <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '600', color: '#334155', marginBottom: '0.35rem' }}>Box Asignado</label>
                        <select 
                            value={box}
                            onChange={(e) => setBox(e.target.value)}
                            style={{ width: '100%', padding: '0.6rem', border: '1px solid #cbd5e1', borderRadius: '8px', fontSize: '0.9rem', backgroundColor: '#white', boxSizing: 'border-box' }}
                        >
                            <option value="Box 01">Box 01</option>
                            <option value="Box 02">Box 02</option>
                            <option value="Box 03">Box 03</option>
                            <option value="Box 04">Box 04</option>
                        </select>
                    </div>
                    <div>
                        <button type="submit" style={{ backgroundColor: '#0d9488', color: 'white', border: 'none', padding: '0.65rem 1.25rem', fontSize: '0.9rem', fontWeight: '600', borderRadius: '8px', cursor: 'pointer', width: '100%' }}>
                            Generar Atención
                        </button>
                    </div>
                </form>
            </div>

            {/* Tabla de Listado */}
            <div style={{ backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '2rem', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.02)' }}>
                <h2 style={{ marginTop: 0, color: '#1e293b' }}>Flujo de Atenciones Activas</h2>
                <p style={{ color: '#64748b', fontSize: '0.9rem', marginBottom: '1.5rem' }}>Control operativo y transición de estados en tiempo real.</p>

                <div style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.9rem' }}>
                        <thead>
                            <tr style={{ backgroundColor: '#f8fafc', color: '#334155', borderBottom: '2px solid #e2e8f0' }}>
                                <th style={{ padding: '0.75rem 1rem' }}>ID</th>
                                <th style={{ padding: '0.75rem 1rem' }}>Paciente</th>
                                <th style={{ padding: '0.75rem 1rem' }}>Especialidad</th>
                                <th style={{ padding: '0.75rem 1rem' }}>Box</th>
                                <th style={{ padding: '0.75rem 1rem' }}>Estado</th>
                                <th style={{ padding: '0.75rem 1rem' }}>Acciones</th>
                            </tr>
                        </thead>
                        <tbody>
                            {atenciones.map((item) => (
                                <tr key={item.id} style={{ borderBottom: '1px solid #e2e8f0' }}>
                                    <td style={{ padding: '0.75rem 1rem', color: '#64748b', fontFamily: 'monospace' }}>#{item.id}</td>
                                    <td style={{ padding: '0.75rem 1rem', fontWeight: '600', color: '#1e293b' }}>{item.paciente}</td>
                                    <td style={{ padding: '0.75rem 1rem', color: '#475569' }}>{item.especialidad}</td>
                                    <td style={{ padding: '0.75rem 1rem', color: '#475569' }}>{item.box}</td>
                                    <td style={{ padding: '0.75rem 1rem' }}><span style={getBadgeStyle(item.estado)}>{item.estado}</span></td>
                                    <td style={{ padding: '0.75rem 1rem' }}>
                                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                                            {item.estado !== 'CONFIRMADA' && (
                                                <button onClick={() => cambiarEstado(item.id, 'CONFIRMADA')} style={{ backgroundColor: '#059669', color: 'white', border: 'none', padding: '0.3rem 0.6rem', fontSize: '0.75rem', borderRadius: '6px', cursor: 'pointer', fontWeight: '600' }}>
                                                    Confirmar
                                                </button>
                                            )}
                                            {item.estado !== 'EN_ESPERA' && (
                                                <button onClick={() => cambiarEstado(item.id, 'EN_ESPERA')} style={{ backgroundColor: '#0284c7', color: 'white', border: 'none', padding: '0.3rem 0.6rem', fontSize: '0.75rem', borderRadius: '6px', cursor: 'pointer', fontWeight: '600' }}>
                                                    En Espera
                                                </button>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}