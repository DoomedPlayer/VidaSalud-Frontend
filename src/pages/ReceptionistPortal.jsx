import { useState } from 'react';
import { useMsal } from "@azure/msal-react";

export default function ReceptionistPortal() {
    const { accounts } = useMsal();
    const [recepcionQueue, setRecepcionQueue] = useState([
        { id: 301, paciente: 'Matías Rojas', rut: '18.234.567-k', especialidad: 'Medicina General', box: 'Box 02', estado: 'POR_LLEGAR' },
        { id: 302, paciente: 'Valentina Soto', rut: '19.882.113-4', especialidad: 'Cardiología', box: 'Box 01', estado: 'EN_ESPERA' },
        { id: 303, paciente: 'Esteban Morales', rut: '14.553.221-9', especialidad: 'Pediatría', box: 'Box 04', estado: 'ATENDIDO' }
    ]);

    const cambiarEstadoRecepcion = (id, nuevoEstado) => {
        setRecepcionQueue(recepcionQueue.map(item => item.id === id ? { ...item, estado: nuevoEstado } : item));
    };

    const getBadgeStyle = (estado) => {
        if (estado === 'POR_LLEGAR') return { backgroundColor: '#fef3c7', color: '#d97706', padding: '0.25rem 0.75rem', borderRadius: '20px', fontSize: '0.75rem', fontWeight: '700' };
        if (estado === 'EN_ESPERA') return { backgroundColor: '#e0f2fe', color: '#0284c7', padding: '0.25rem 0.75rem', borderRadius: '20px', fontSize: '0.75rem', fontWeight: '700' };
        return { backgroundColor: '#d1fae5', color: '#059669', padding: '0.25rem 0.75rem', borderRadius: '20px', fontSize: '0.75rem', fontWeight: '700' };
    };

    return (
        <div>
            <div style={{ background: 'linear-gradient(135deg, #0f766e 0%, #115e59 100%)', borderRadius: '16px', padding: '2.5rem', color: 'white', marginBottom: '2rem', boxShadow: '0 10px 15px -3px rgba(15, 118, 110, 0.2)' }}>
                <span style={{ backgroundColor: 'rgba(255,255,255,0.2)', padding: '0.3rem 0.8rem', borderRadius: '20px', fontSize: '0.8rem', fontWeight: '600', textTransform: 'uppercase' }}>Portal de Recepción y Admisión</span>
                <h1 style={{ margin: '0.75rem 0 0.5rem 0', fontSize: '2rem' }}>Control de Admisión, {accounts[0]?.name}</h1>
                <p style={{ margin: 0, opacity: 0.9, fontSize: '1rem' }}>Gestión de llegada de pacientes, validación de identidad y asignación de boxes en la red.</p>
            </div>

            <div style={{ backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '16px', padding: '2rem', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.02)' }}>
                <h3 style={{ marginTop: 0, color: '#1e293b', fontSize: '1.2rem', marginBottom: '1.5rem' }}>Flujo de Recepción Diaria</h3>

                <div style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.9rem' }}>
                        <thead>
                            <tr style={{ backgroundColor: '#f8fafc', color: '#334155', borderBottom: '2px solid #e2e8f0' }}>
                                <th style={{ padding: '0.85rem 1rem' }}>ID</th>
                                <th style={{ padding: '0.85rem 1rem' }}>Paciente</th>
                                <th style={{ padding: '0.85rem 1rem' }}>RUT</th>
                                <th style={{ padding: '0.85rem 1rem' }}>Especialidad</th>
                                <th style={{ padding: '0.85rem 1rem' }}>Box Asignado</th>
                                <th style={{ padding: '0.85rem 1rem' }}>Estado Admisión</th>
                                <th style={{ padding: '0.85rem 1rem' }}>Acciones mostrador</th>
                            </tr>
                        </thead>
                        <tbody>
                            {recepcionQueue.map((item) => (
                                <tr key={item.id} style={{ borderBottom: '1px solid #e2e8f0' }}>
                                    <td style={{ padding: '0.85rem 1rem', color: '#64748b', fontFamily: 'monospace' }}>#{item.id}</td>
                                    <td style={{ padding: '0.85rem 1rem', fontWeight: '600', color: '#1e293b' }}>{item.paciente}</td>
                                    <td style={{ padding: '0.85rem 1rem', color: '#475569' }}>{item.rut}</td>
                                    <td style={{ padding: '0.85rem 1rem', color: '#475569' }}>{item.especialidad}</td>
                                    <td style={{ padding: '0.85rem 1rem', color: '#475569', fontWeight: '600' }}>{item.box}</td>
                                    <td style={{ padding: '0.85rem 1rem' }}><span style={getBadgeStyle(item.estado)}>{item.estado}</span></td>
                                    <td style={{ padding: '0.85rem 1rem' }}>
                                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                                            {item.estado === 'POR_LLEGAR' && (
                                                <button onClick={() => cambiarEstadoRecepcion(item.id, 'EN_ESPERA')} style={{ backgroundColor: '#0284c7', color: 'white', border: 'none', padding: '0.4rem 0.8rem', fontSize: '0.75rem', borderRadius: '6px', cursor: 'pointer', fontWeight: '600' }}>
                                                    Marcar Llegada
                                                </button>
                                            )}
                                            {item.estado === 'EN_ESPERA' && (
                                                <button onClick={() => cambiarEstadoRecepcion(item.id, 'ATENDIDO')} style={{ backgroundColor: '#059669', color: 'white', border: 'none', padding: '0.4rem 0.8rem', fontSize: '0.75rem', borderRadius: '6px', cursor: 'pointer', fontWeight: '600' }}>
                                                    Derivar a Box
                                                </button>
                                            )}
                                            {item.estado === 'ATENDIDO' && (
                                                <span style={{ fontSize: '0.8rem', color: '#64748b', fontStyle: 'italic' }}>Completado</span>
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