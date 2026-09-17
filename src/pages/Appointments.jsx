import { useState } from 'react';
import {useApi} from '../hooks/useApi'

export default function Appointments() {
    const api = useApi();
    const [atenciones, setAtenciones] = useState([
        { id: 101, paciente: 'Carlos Mendoza', especialidad: 'Medicina General', box: 'Box 03', estado: 'SOLICITADA' },
        { id: 102, paciente: 'Ana Torres', especialidad: 'Cardiología', box: 'Box 01', estado: 'CONFIRMADA' },
        { id: 103, paciente: 'Luis Soto', especialidad: 'Pediatría', box: 'Box 04', estado: 'EN_ESPERA' },
    ]);

    const [nuevoPaciente, setNuevoPaciente] = useState('');
    const [especialidad, setEspecialidad] = useState('Medicina General');
    const [box, setBox] = useState('Box 01');

    const registrarAtencion = async (e) => {
    e.preventDefault();
    if (!nuevoPaciente.trim()) return;

    // 1. Traducir textos del formulario a IDs para Java (Atencion.java)
    const mapeoPrestacion = {
        'Medicina General': 1,
        'Cardiología': 2,
        'Pediatría': 3,
        'Urgencia Dental': 4
    };
    const numBox = parseInt(box.replace('Box 0', '')); 

    const payloadJava = {
        pacienteId: nuevoPaciente, 
        prestacionId: mapeoPrestacion[especialidad] || 1,
        cupoId: numBox
    };

    try {
        const response = await api.post('/appointments', payloadJava);

        const nuevaCitaVisual = {
            id: response.data.id,
            paciente: response.data.pacienteId,
            especialidad: especialidad, 
            box: box,                  
            estado: response.data.estado
        };

        setAtenciones([nuevaCitaVisual, ...atenciones]);
        setNuevoPaciente('');
        
    } catch (error) {
        console.error("Error al registrar la atención:", error);
        alert("No se pudo conectar con el servidor para registrar la cita.");
    }
};

    const cambiarEstado = (id, nuevoEstado) => {
        setAtenciones(atenciones.map(att => att.id === id ? { ...att, estado: nuevoEstado } : att));
    };

    const getBadgeStyle = (estado) => {
        if (estado === 'SOLICITADA') return { backgroundColor: '#fef3c7', color: '#d97706', padding: '0.25rem 0.75rem', borderRadius: '20px', fontSize: '0.75rem', fontWeight: '700' };
        if (estado === 'CONFIRMADA') return { backgroundColor: '#d1fae5', color: '#059669', padding: '0.25rem 0.75rem', borderRadius: '20px', fontSize: '0.75rem', fontWeight: '700' };
        return { backgroundColor: '#e0f2fe', color: '#0284c7', padding: '0.25rem 0.75rem', borderRadius: '20px', fontSize: '0.75rem', fontWeight: '700' };
    };

    return (
        <div>
            {/* Banner de Módulo */}
            <div style={{ background: 'linear-gradient(135deg, #0f766e 0%, #0d9488 100%)', borderRadius: '16px', padding: '2.5rem', color: 'white', marginBottom: '2rem', boxShadow: '0 10px 15px -3px rgba(13, 148, 136, 0.2)' }}>
                <span style={{ backgroundColor: 'rgba(255,255,255,0.2)', padding: '0.3rem 0.8rem', borderRadius: '20px', fontSize: '0.8rem', fontWeight: '600', textTransform: 'uppercase' }}>Módulo Operativo</span>
                <h1 style={{ margin: '0.75rem 0 0.5rem 0', fontSize: '2rem' }}>Gestión de Atenciones Médicas</h1>
                <p style={{ margin: 0, opacity: 0.9, fontSize: '1rem' }}>Control de flujo, asignación de boxes y transición de estados en tiempo real.</p>
            </div>

            {/* Formulario de Registro */}
            <div style={{ backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '16px', padding: '2rem', marginBottom: '2rem', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.02)' }}>
                <h3 style={{ marginTop: 0, color: '#1e293b', fontSize: '1.2rem', marginBottom: '1rem' }}>Registrar Nueva Atención</h3>
                <form onSubmit={registrarAtencion} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.25rem', alignItems: 'end' }}>
                    <div>
                        <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '600', color: '#334155', marginBottom: '0.4rem' }}>Nombre del Paciente</label>
                        <input 
                            type="text" 
                            placeholder="Ej. María Pérez" 
                            value={nuevoPaciente}
                            onChange={(e) => setNuevoPaciente(e.target.value)}
                            style={{ width: '100%', padding: '0.7rem', border: '1px solid #cbd5e1', borderRadius: '8px', fontSize: '0.9rem', boxSizing: 'border-box' }}
                        />
                    </div>
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
                        <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '600', color: '#334155', marginBottom: '0.4rem' }}>Box Asignado</label>
                        <select 
                            value={box}
                            onChange={(e) => setBox(e.target.value)}
                            style={{ width: '100%', padding: '0.7rem', border: '1px solid #cbd5e1', borderRadius: '8px', fontSize: '0.9rem', backgroundColor: '#fff', boxSizing: 'border-box' }}
                        >
                            <option value="Box 01">Box 01</option>
                            <option value="Box 02">Box 02</option>
                            <option value="Box 03">Box 03</option>
                            <option value="Box 04">Box 04</option>
                        </select>
                    </div>
                    <div>
                        <button type="submit" style={{ backgroundColor: '#0d9488', color: 'white', border: 'none', padding: '0.75rem 1.25rem', fontSize: '0.9rem', fontWeight: '600', borderRadius: '8px', cursor: 'pointer', width: '100%' }}>
                            Generar Atención
                        </button>
                    </div>
                </form>
            </div>

            {/* Tabla de Flujo */}
            <div style={{ backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '16px', padding: '2rem', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.02)' }}>
                <h3 style={{ marginTop: 0, color: '#1e293b', fontSize: '1.2rem', marginBottom: '1.5rem' }}>Flujo de Atenciones Activas</h3>

                <div style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.9rem' }}>
                        <thead>
                            <tr style={{ backgroundColor: '#f8fafc', color: '#334155', borderBottom: '2px solid #e2e8f0' }}>
                                <th style={{ padding: '0.85rem 1rem' }}>ID</th>
                                <th style={{ padding: '0.85rem 1rem' }}>Paciente</th>
                                <th style={{ padding: '0.85rem 1rem' }}>Especialidad</th>
                                <th style={{ padding: '0.85rem 1rem' }}>Box</th>
                                <th style={{ padding: '0.85rem 1rem' }}>Estado</th>
                                <th style={{ padding: '0.85rem 1rem' }}>Acciones</th>
                            </tr>
                        </thead>
                        <tbody>
                            {atenciones.map((item) => (
                                <tr key={item.id} style={{ borderBottom: '1px solid #e2e8f0' }}>
                                    <td style={{ padding: '0.85rem 1rem', color: '#64748b', fontFamily: 'monospace' }}>#{item.id}</td>
                                    <td style={{ padding: '0.85rem 1rem', fontWeight: '600', color: '#1e293b' }}>{item.paciente}</td>
                                    <td style={{ padding: '0.85rem 1rem', color: '#475569' }}>{item.especialidad}</td>
                                    <td style={{ padding: '0.85rem 1rem', color: '#475569' }}>{item.box}</td>
                                    <td style={{ padding: '0.85rem 1rem' }}><span style={getBadgeStyle(item.estado)}>{item.estado}</span></td>
                                    <td style={{ padding: '0.85rem 1rem' }}>
                                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                                            {item.estado !== 'CONFIRMADA' && (
                                                <button onClick={() => cambiarEstado(item.id, 'CONFIRMADA')} style={{ backgroundColor: '#059669', color: 'white', border: 'none', padding: '0.4rem 0.8rem', fontSize: '0.75rem', borderRadius: '6px', cursor: 'pointer', fontWeight: '600' }}>
                                                    Confirmar
                                                </button>
                                            )}
                                            {item.estado !== 'EN_ESPERA' && (
                                                <button onClick={() => cambiarEstado(item.id, 'EN_ESPERA')} style={{ backgroundColor: '#0284c7', color: 'white', border: 'none', padding: '0.4rem 0.8rem', fontSize: '0.75rem', borderRadius: '6px', cursor: 'pointer', fontWeight: '600' }}>
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