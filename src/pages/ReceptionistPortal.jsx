import { useState } from 'react';
import { useMsal } from "@azure/msal-react";

export default function ReceptionistPortal() {
    const { accounts } = useMsal();
    // Fallback al nombre de la captura si MSAL demora en cargar
    const nombreRecepcionista = accounts[0]?.name?.toUpperCase() || 'DONNOVAN URRUTIA MUNILLA';

    const boxesDisponibles = ['Box 01', 'Box 02', 'Box 03', 'Box 04'];

    const [recepcionQueue, setRecepcionQueue] = useState([
        { id: 301, paciente: 'Matías Rojas', rut: '18.234.567-K', especialidad: 'Medicina General', box: 'Box 02', estado: 'POR_LLEGAR' },
        { id: 302, paciente: 'Valentina Soto', rut: '19.882.113-4', especialidad: 'Cardiología', box: 'Box 01', estado: 'EN_ESPERA' },
        { id: 303, paciente: 'Esteban Morales', rut: '14.553.221-9', especialidad: 'Pediatría', box: 'Box 04', estado: 'ATENDIDO' }
    ]);

    // Estado centralizado para el Modal (puede ser para REASIGNAR box o para DERIVAR al paciente)
    const [modalBox, setModalBox] = useState({ isOpen: false, accion: '', pacienteId: null, boxDestino: '', nombrePaciente: '' });

    // --- FUNCIONES DEL FLUJO DE RECEPCIÓN ---

    const marcarLlegada = (id) => {
        setRecepcionQueue(recepcionQueue.map(item => item.id === id ? { ...item, estado: 'EN_ESPERA' } : item));
    };

    const abrirModal = (accion, paciente) => {
        setModalBox({
            isOpen: true,
            accion: accion, // 'REASIGNAR' o 'DERIVAR'
            pacienteId: paciente.id,
            boxDestino: paciente.box,
            nombrePaciente: paciente.paciente
        });
    };

    const confirmarModal = () => {
        if (modalBox.accion === 'DERIVAR') {
            // Actualiza el box y pasa el estado a ATENDIDO (ingresó al box)
            setRecepcionQueue(recepcionQueue.map(item => 
                item.id === modalBox.pacienteId ? { ...item, box: modalBox.boxDestino, estado: 'ATENDIDO' } : item
            ));
        } else {
            // Solo cambia el box, mantiene el estado actual
            setRecepcionQueue(recepcionQueue.map(item => 
                item.id === modalBox.pacienteId ? { ...item, box: modalBox.boxDestino } : item
            ));
        }
        setModalBox({ isOpen: false, accion: '', pacienteId: null, boxDestino: '', nombrePaciente: '' });
    };

    const getBadgeStyle = (estado) => {
        if (estado === 'POR_LLEGAR') return { backgroundColor: '#fef3c7', color: '#d97706', padding: '0.3rem 0.8rem', borderRadius: '20px', fontSize: '0.75rem', fontWeight: '700' };
        if (estado === 'EN_ESPERA') return { backgroundColor: '#e0f2fe', color: '#0284c7', padding: '0.3rem 0.8rem', borderRadius: '20px', fontSize: '0.75rem', fontWeight: '700' };
        return { backgroundColor: '#d1fae5', color: '#059669', padding: '0.3rem 0.8rem', borderRadius: '20px', fontSize: '0.75rem', fontWeight: '700' };
    };

    return (
        <div style={{ position: 'relative' }}>
            {/* Banner de Módulo */}
            <div style={{ background: 'linear-gradient(135deg, #115e59 0%, #0f766e 100%)', borderRadius: '16px', padding: '2.5rem', color: 'white', marginBottom: '2rem', boxShadow: '0 10px 15px -3px rgba(15, 118, 110, 0.2)' }}>
                <span style={{ backgroundColor: 'rgba(255,255,255,0.2)', padding: '0.3rem 0.8rem', borderRadius: '20px', fontSize: '0.8rem', fontWeight: '600', textTransform: 'uppercase' }}>Portal de Recepción y Admisión</span>
                <h1 style={{ margin: '0.75rem 0 0.5rem 0', fontSize: '2rem' }}>Control de Admisión, {nombreRecepcionista}</h1>
                <p style={{ margin: 0, opacity: 0.9, fontSize: '1rem' }}>Gestión de llegada de pacientes, validación de identidad y asignación de boxes en la red.</p>
            </div>

            {/* Tabla Principal */}
            <div style={{ backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '16px', padding: '2rem', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.02)' }}>
                <h3 style={{ marginTop: 0, color: '#1e293b', fontSize: '1.2rem', marginBottom: '1.5rem' }}>Flujo de Recepción Diaria</h3>

                <div style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.95rem' }}>
                        <thead>
                            <tr style={{ backgroundColor: '#f8fafc', color: '#475569', borderBottom: '2px solid #e2e8f0' }}>
                                <th style={{ padding: '1rem', width: '80px' }}>ID</th>
                                <th style={{ padding: '1rem' }}>Paciente</th>
                                <th style={{ padding: '1rem' }}>RUT</th>
                                <th style={{ padding: '1rem' }}>Especialidad</th>
                                <th style={{ padding: '1rem' }}>Box Asignado</th>
                                <th style={{ padding: '1rem' }}>Estado Admisión</th>
                                <th style={{ padding: '1rem', textAlign: 'right' }}>Acciones mostrador</th>
                            </tr>
                        </thead>
                        <tbody>
                            {recepcionQueue.map((item) => (
                                <tr key={item.id} style={{ borderBottom: '1px solid #e2e8f0' }}>
                                    <td style={{ padding: '1rem', color: '#64748b', fontFamily: 'monospace' }}>#{item.id}</td>
                                    <td style={{ padding: '1rem', fontWeight: '700', color: '#1e293b' }}>{item.paciente}</td>
                                    <td style={{ padding: '1rem', color: '#64748b' }}>{item.rut}</td>
                                    <td style={{ padding: '1rem', color: '#475569' }}>{item.especialidad}</td>
                                    <td style={{ padding: '1rem' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                            <span style={{ fontWeight: '600', color: '#0f766e' }}>{item.box}</span>
                                            {item.estado !== 'ATENDIDO' && (
                                                <button onClick={() => abrirModal('REASIGNAR', item)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '1rem', opacity: 0.6 }} title="Cambiar Box">✏️</button>
                                            )}
                                        </div>
                                    </td>
                                    <td style={{ padding: '1rem' }}><span style={getBadgeStyle(item.estado)}>{item.estado.replace('_', ' ')}</span></td>
                                    <td style={{ padding: '1rem', textAlign: 'right' }}>
                                        <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
                                            {item.estado === 'POR_LLEGAR' && (
                                                <button onClick={() => marcarLlegada(item.id)} style={{ backgroundColor: '#0284c7', color: 'white', border: 'none', padding: '0.5rem 1rem', fontSize: '0.85rem', borderRadius: '6px', cursor: 'pointer', fontWeight: '600', transition: 'all 0.2s' }}>
                                                    Marcar Llegada
                                                </button>
                                            )}
                                            {item.estado === 'EN_ESPERA' && (
                                                <button onClick={() => abrirModal('DERIVAR', item)} style={{ backgroundColor: '#059669', color: 'white', border: 'none', padding: '0.5rem 1rem', fontSize: '0.85rem', borderRadius: '6px', cursor: 'pointer', fontWeight: '600', transition: 'all 0.2s' }}>
                                                    Derivar a Box
                                                </button>
                                            )}
                                            {item.estado === 'ATENDIDO' && (
                                                <span style={{ fontSize: '0.85rem', color: '#94a3b8', fontStyle: 'italic', paddingRight: '0.5rem' }}>Completado</span>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* MODAL: Reasignar / Derivar Box */}
            {modalBox.isOpen && (
                <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(15, 23, 42, 0.7)', backdropFilter: 'blur(4px)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 9999 }}>
                    <div style={{ backgroundColor: 'white', padding: '2.5rem', borderRadius: '16px', width: '400px', maxWidth: '90%', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)', animation: 'fadeIn 0.2s ease-out' }}>
                        <h3 style={{ marginTop: 0, marginBottom: '0.5rem', color: '#1e293b' }}>
                            {modalBox.accion === 'DERIVAR' ? 'Derivar Paciente' : 'Reasignar Box'}
                        </h3>
                        <p style={{ color: '#64748b', fontSize: '0.9rem', marginBottom: '1.5rem', marginTop: 0 }}>
                            Paciente: <strong>{modalBox.nombrePaciente}</strong>
                        </p>
                        
                        <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '600', color: '#334155', marginBottom: '0.5rem' }}>Seleccione Box de destino:</label>
                        <select 
                            value={modalBox.boxDestino} 
                            onChange={(e) => setModalBox({...modalBox, boxDestino: e.target.value})}
                            style={{ width: '100%', padding: '0.8rem', borderRadius: '8px', border: '1px solid #cbd5e1', marginBottom: '2rem', fontSize: '1rem', backgroundColor: '#fff' }}
                        >
                            {boxesDisponibles.map(b => (
                                <option key={b} value={b}>{b}</option>
                            ))}
                        </select>

                        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
                            <button onClick={() => setModalBox({ isOpen: false, accion: '', pacienteId: null, boxDestino: '', nombrePaciente: '' })} style={{ backgroundColor: '#f1f5f9', color: '#475569', border: '1px solid #cbd5e1', padding: '0.8rem 1.5rem', borderRadius: '8px', fontWeight: '700', cursor: 'pointer', width: '100%' }}>
                                Cancelar
                            </button>
                            <button onClick={confirmarModal} style={{ backgroundColor: modalBox.accion === 'DERIVAR' ? '#059669' : '#0f766e', color: 'white', border: 'none', padding: '0.8rem 1.5rem', borderRadius: '8px', fontWeight: '700', cursor: 'pointer', width: '100%' }}>
                                {modalBox.accion === 'DERIVAR' ? 'Confirmar Derivación' : 'Guardar Cambios'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <style>{`
                @keyframes fadeIn {
                    from { opacity: 0; transform: scale(0.95); }
                    to { opacity: 1; transform: scale(1); }
                }
            `}</style>
        </div>
    );
}