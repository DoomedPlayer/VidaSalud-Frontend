import { useState, useEffect } from 'react';
import { useMsal } from "@azure/msal-react";
import { useApi } from '../hooks/useApi';

export default function ReceptionistPortal() {
    const { accounts } = useMsal();
    const api = useApi();
    
    const nombreRecepcionista = accounts[0]?.name?.toUpperCase() || 'RECEPCIONISTA';
    const boxesDisponibles = ['Box 01', 'Box 02', 'Box 03', 'Box 04'];
    
    const [recepcionQueue, setRecepcionQueue] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [errorBackend, setErrorBackend] = useState(false);
    
    const [modalBox, setModalBox] = useState({ isOpen: false, accion: '', pacienteId: null, boxDestino: '', nombrePaciente: '' });

    useEffect(() => {
        const fetchAtenciones = async () => {
            setIsLoading(true);
            setErrorBackend(false);
            try {
                const res = await api.get('/appointments');
                
                // Mapeo de Atencion.java a la UI de Recepción
                const dataMapeada = res.data.map(item => ({
                    id: item.id,
                    paciente: item.pacienteId || 'Paciente Desconocido',
                    rut: 'No registrado', // El RUT podría venir del pacienteId
                    especialidad: item.prestacionNombre || 'Consulta General',
                    box: item.boxCodigo || 'Box Por Asignar',
                    estado: item.estado || 'SOLICITADA' // Enum: SOLICITADA, EN_ESPERA, CERRADA
                }));
                setRecepcionQueue(dataMapeada);
            } catch (error) {
                console.warn("Backend no disponible. Cargando modo offline.");
                setErrorBackend(true);
                setRecepcionQueue([
                    { id: 301, paciente: 'Matías Rojas', rut: '18.234.567-K', especialidad: 'Medicina General', box: 'Box 02', estado: 'SOLICITADA' },
                    { id: 302, paciente: 'Valentina Soto', rut: '19.882.113-4', especialidad: 'Cardiología', box: 'Box 01', estado: 'EN_ESPERA' },
                    { id: 303, paciente: 'Esteban Morales', rut: '14.553.221-9', especialidad: 'Pediatría', box: 'Box 04', estado: 'CERRADA' }
                ]);
            } finally {
                setIsLoading(false);
            }
        };

        fetchAtenciones();
    }, []);

    // Función que hace el PUT al backend de Nicolás para cambiar el estado de la cita
    const actualizarEstado = async (id, nuevoEstado) => {
        try {
            await api.put(`/appointments/${id}/status`, { status: nuevoEstado });
            setRecepcionQueue(recepcionQueue.map(item => item.id === id ? { ...item, estado: nuevoEstado } : item));
        } catch (error) {
            // Fallback offline
            setRecepcionQueue(recepcionQueue.map(item => item.id === id ? { ...item, estado: nuevoEstado } : item));
        }
    };

    const marcarLlegada = (id) => actualizarEstado(id, 'EN_ESPERA');
    
    const abrirModal = (accion, paciente) => setModalBox({ isOpen: true, accion: accion, pacienteId: paciente.id, boxDestino: paciente.box !== 'Box Por Asignar' ? paciente.box : boxesDisponibles[0], nombrePaciente: paciente.paciente });
    
    const confirmarModal = () => {
        if (modalBox.accion === 'DERIVAR') {
            actualizarEstado(modalBox.pacienteId, 'EN_ATENCION');
            // Aquí idealmente haríamos un PUT para actualizar el box, pero simulamos el cambio visual
            setRecepcionQueue(recepcionQueue.map(item => item.id === modalBox.pacienteId ? { ...item, box: modalBox.boxDestino, estado: 'CERRADA' } : item));
        } else {
            setRecepcionQueue(recepcionQueue.map(item => item.id === modalBox.pacienteId ? { ...item, box: modalBox.boxDestino } : item));
        }
        setModalBox({ isOpen: false, accion: '', pacienteId: null, boxDestino: '', nombrePaciente: '' });
    };

    const getBadgeStyle = (estado) => {
        if (estado === 'SOLICITADA') return { backgroundColor: '#fef3c7', color: '#d97706', padding: '0.3rem 0.8rem', borderRadius: '20px', fontSize: '0.75rem', fontWeight: '700' };
        if (estado === 'EN_ESPERA') return { backgroundColor: '#e0f2fe', color: '#0284c7', padding: '0.3rem 0.8rem', borderRadius: '20px', fontSize: '0.75rem', fontWeight: '700' };
        if (estado === 'CANCELADA') return { backgroundColor: '#fee2e2', color: '#ef4444', padding: '0.3rem 0.8rem', borderRadius: '20px', fontSize: '0.75rem', fontWeight: '700' };
        return { backgroundColor: '#d1fae5', color: '#059669', padding: '0.3rem 0.8rem', borderRadius: '20px', fontSize: '0.75rem', fontWeight: '700' }; // Para CERRADA / EN_ATENCION
    };

    return (
        <div style={{ position: 'relative' }}>
            <div style={{ background: 'linear-gradient(135deg, #115e59 0%, #0f766e 100%)', borderRadius: '16px', padding: '2.5rem', color: 'white', marginBottom: '2rem', boxShadow: '0 10px 15px -3px rgba(15, 118, 110, 0.2)' }}>
                <span style={{ backgroundColor: 'rgba(255,255,255,0.2)', padding: '0.3rem 0.8rem', borderRadius: '20px', fontSize: '0.8rem', fontWeight: '600' }}>Portal de Recepción y Admisión</span>
                <h1 style={{ margin: '0.75rem 0 0.5rem 0' }}>Control de Admisión, {nombreRecepcionista}</h1>
            </div>

            {errorBackend && (
                <div style={{ backgroundColor: '#fffbeb', borderLeft: '4px solid #f59e0b', padding: '1rem', marginBottom: '1.5rem', borderRadius: '0 8px 8px 0', color: '#b45309', fontSize: '0.9rem', fontWeight: '600' }}>
                    ⚠️ Sin conexión al servidor. Mostrando lista de pacientes simulada.
                </div>
            )}

            <div style={{ backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '16px', padding: '2rem', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.02)' }}>
                <h3 style={{ marginTop: 0, marginBottom: '1.5rem', color: '#1e293b' }}>Flujo de Recepción Diaria</h3>
                
                {isLoading ? (
                     <div style={{ textAlign: 'center', padding: '2rem', color: '#0f766e' }}>Sincronizando atenciones con el servidor...</div>
                ) : (
                    <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.95rem' }}>
                        <thead><tr style={{ backgroundColor: '#f8fafc', borderBottom: '2px solid #e2e8f0' }}><th style={{ padding: '1rem' }}>ID</th><th style={{ padding: '1rem' }}>Paciente</th><th style={{ padding: '1rem' }}>RUT</th><th style={{ padding: '1rem' }}>Especialidad</th><th style={{ padding: '1rem' }}>Box Asignado</th><th style={{ padding: '1rem' }}>Estado Admisión</th><th style={{ padding: '1rem', textAlign: 'right' }}>Acciones mostrador</th></tr></thead>
                        <tbody>
                            {recepcionQueue.map((item) => (
                                <tr key={item.id} style={{ borderBottom: '1px solid #e2e8f0' }}>
                                    <td style={{ padding: '1rem' }}>#{item.id}</td><td style={{ padding: '1rem', fontWeight: '700' }}>{item.paciente}</td><td style={{ padding: '1rem' }}>{item.rut}</td><td style={{ padding: '1rem' }}>{item.especialidad}</td>
                                    <td style={{ padding: '1rem' }}><div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}><span style={{ fontWeight: '600', color: '#0f766e' }}>{item.box}</span>{item.estado !== 'CERRADA' && (<button onClick={() => abrirModal('REASIGNAR', item)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>✏️</button>)}</div></td>
                                    <td style={{ padding: '1rem' }}><span style={getBadgeStyle(item.estado)}>{item.estado.replace('_', ' ')}</span></td>
                                    <td style={{ padding: '1rem', textAlign: 'right' }}>
                                        <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
                                            {item.estado === 'SOLICITADA' && (<button onClick={() => marcarLlegada(item.id)} style={{ backgroundColor: '#0284c7', color: 'white', border: 'none', padding: '0.5rem 1rem', borderRadius: '6px', cursor: 'pointer', fontWeight: '600' }}>Marcar Llegada</button>)}
                                            {item.estado === 'EN_ESPERA' && (<button onClick={() => abrirModal('DERIVAR', item)} style={{ backgroundColor: '#059669', color: 'white', border: 'none', padding: '0.5rem 1rem', borderRadius: '6px', cursor: 'pointer', fontWeight: '600' }}>Derivar a Box</button>)}
                                            {(item.estado === 'CERRADA' || item.estado === 'CANCELADA') && (<span style={{ fontSize: '0.85rem', color: '#94a3b8', fontStyle: 'italic', fontWeight: '600' }}>Completado</span>)}
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>

            {/* MODAL DE REASIGNACIÓN / DERIVACIÓN */}
            {modalBox.isOpen && (
                <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(15, 23, 42, 0.7)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 9999 }}>
                    <div style={{ backgroundColor: 'white', padding: '2.5rem', borderRadius: '16px', width: '400px' }}>
                        <h3 style={{ marginTop: 0, marginBottom: '0.5rem' }}>{modalBox.accion === 'DERIVAR' ? 'Derivar Paciente' : 'Reasignar Box'}</h3>
                        <p style={{ marginBottom: '1.5rem', marginTop: 0 }}>Paciente: <strong>{modalBox.nombrePaciente}</strong></p>
                        <select value={modalBox.boxDestino} onChange={(e) => setModalBox({...modalBox, boxDestino: e.target.value})} style={{ width: '100%', padding: '0.8rem', borderRadius: '8px', border: '1px solid #cbd5e1', marginBottom: '2rem' }}>{boxesDisponibles.map(b => (<option key={b} value={b}>{b}</option>))}</select>
                        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}><button onClick={() => setModalBox({ isOpen: false, accion: '', pacienteId: null, boxDestino: '', nombrePaciente: '' })} style={{ border: '1px solid #cbd5e1', padding: '0.8rem 1.5rem', borderRadius: '8px', width: '100%', fontWeight: '600', cursor: 'pointer' }}>Cancelar</button><button onClick={confirmarModal} style={{ backgroundColor: modalBox.accion === 'DERIVAR' ? '#059669' : '#0f766e', color: 'white', border: 'none', padding: '0.8rem 1.5rem', borderRadius: '8px', width: '100%', fontWeight: '600', cursor: 'pointer' }}>{modalBox.accion === 'DERIVAR' ? 'Confirmar Derivación' : 'Guardar Cambios'}</button></div>
                    </div>
                </div>
            )}
        </div>
    );
}