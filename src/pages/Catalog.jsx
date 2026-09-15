import { useState } from 'react';

export default function Catalog() {
    // --- ESTADO PRINCIPAL (Navegación) ---
    const [vistaActiva, setVistaActiva] = useState('AGENDA'); // 'AGENDA' | 'PRESTACIONES'

    // --- ESTADO: PRESTACIONES (Alineado con CatalogController y Prestacion) ---
    const [prestaciones, setPrestaciones] = useState([
        { id: 1, nombre: 'Medicina General', precio: 25000, descripcion: 'Consulta médica básica' },
        { id: 2, nombre: 'Cardiología', precio: 45000, descripcion: 'Evaluación cardiovascular' },
        { id: 3, nombre: 'Pediatría', precio: 30000, descripcion: 'Control niño sano' },
        { id: 4, nombre: 'Urgencia Dental', precio: 35000, descripcion: 'Atención dental inmediata' }
    ]);

    const [nuevaPrestacion, setNuevaPrestacion] = useState({ nombre: '', precio: '', descripcion: '' });
    const [precioEditando, setPrecioEditando] = useState({ id: null, nuevoPrecio: '' });

    // --- ESTADO: AGENDA Y BOXES (Alineado con Cupo y Box) ---
    const boxesConfig = [
        { id: 1, codigo: 'Box 01', centroAtencion: 'Sede San Bernardo' },
        { id: 2, codigo: 'Box 02', centroAtencion: 'Sede San Bernardo' },
        { id: 3, codigo: 'Box 03', centroAtencion: 'Sede San Bernardo' },
        { id: 4, codigo: 'Box 04', centroAtencion: 'Sede San Bernardo' }
    ];
    const [boxSeleccionado, setBoxSeleccionado] = useState(boxesConfig[0]);

    const [cupos, setCupos] = useState([
        { id: 1, boxId: 1, fechaHoraInicio: '09:00', disponible: false, rut: '19.283.746-K', paciente: 'Francisca Valenzuela', especialidad: 'Medicina General' },
        { id: 2, boxId: 1, fechaHoraInicio: '09:30', disponible: false, rut: '21.886.383-3', paciente: 'Donnovan Urrutia', especialidad: 'Medicina General' }
    ]);
    const horariosFijos = ['08:00', '08:30', '09:00', '09:30', '10:00', '10:30', '11:00', '11:30', '12:00', '12:30', '13:00', '13:30', '14:00', '14:30', '15:00', '15:30'];

    // Modales y formularios de Agenda
    const [modalModificar, setModalModificar] = useState({ isOpen: false, cupoId: null, nuevaHora: '', nuevaEspecialidad: '' });
    const [modalConfirmar, setModalConfirmar] = useState({ isOpen: false, cupoId: null });
    const [modoNuevo, setModoNuevo] = useState(false);
    const [nuevoCupo, setNuevoCupo] = useState({ rut: '', paciente: '', hora: '08:00', especialidad: 'Medicina General' });

    // --- FUNCIONES CRUD: PRESTACIONES ---
    const handleCrearPrestacion = (e) => {
        e.preventDefault();
        if (!nuevaPrestacion.nombre || !nuevaPrestacion.precio) return;
        
        const prestacion = {
            id: Date.now(),
            nombre: nuevaPrestacion.nombre,
            precio: parseFloat(nuevaPrestacion.precio),
            descripcion: nuevaPrestacion.descripcion
        };
        setPrestaciones([...prestaciones, prestacion]);
        setNuevaPrestacion({ nombre: '', precio: '', descripcion: '' });
    };

    const iniciarEdicionPrecio = (prestacion) => {
        setPrecioEditando({ id: prestacion.id, nuevoPrecio: prestacion.precio });
    };

    const guardarEdicionPrecio = (id) => {
        setPrestaciones(prestaciones.map(p => 
            p.id === id ? { ...p, precio: parseFloat(precioEditando.nuevoPrecio) } : p
        ));
        setPrecioEditando({ id: null, nuevoPrecio: '' });
    };

    // --- FUNCIONES CRUD: AGENDA ---
    const handleCrearCita = (e) => {
        e.preventDefault();
        const cita = {
            id: Date.now(),
            boxId: boxSeleccionado.id,
            fechaHoraInicio: nuevoCupo.hora,
            disponible: false,
            rut: nuevoCupo.rut,
            paciente: nuevoCupo.paciente,
            especialidad: nuevoCupo.especialidad
        };
        setCupos([...cupos, cita]);
        setModoNuevo(false);
        setNuevoCupo({ rut: '', paciente: '', hora: '08:00', especialidad: prestaciones[0]?.nombre || '' });
    };

    const abrirModalModificar = (cupo) => {
        setModalModificar({ isOpen: true, cupoId: cupo.id, nuevaHora: cupo.fechaHoraInicio, nuevaEspecialidad: cupo.especialidad });
    };

    const guardarModificacion = () => {
        setCupos(cupos.map(c => 
            c.id === modalModificar.cupoId ? { ...c, fechaHoraInicio: modalModificar.nuevaHora, especialidad: modalModificar.nuevaEspecialidad } : c
        ));
        setModalModificar({ isOpen: false, cupoId: null, nuevaHora: '', nuevaEspecialidad: '' });
    };

    const confirmarCancelacion = () => {
        setCupos(cupos.filter(c => c.id !== modalConfirmar.cupoId));
        setModalConfirmar({ isOpen: false, cupoId: null });
    };

    const isHoraOcupada = (horaEvaluar, boxIdEvaluar, ignorarCupoId = null) => {
        return cupos.some(c => c.boxId === boxIdEvaluar && c.fechaHoraInicio === horaEvaluar && c.id !== ignorarCupoId);
    };

    const agendaActual = cupos.filter(c => c.boxId === boxSeleccionado.id).sort((a, b) => a.fechaHoraInicio.localeCompare(b.fechaHoraInicio));

    return (
        <div style={{ position: 'relative' }}>
            
            {/* Navegación Superior (Tabs) */}
            <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem', borderBottom: '2px solid #e2e8f0', paddingBottom: '1rem' }}>
                <button 
                    onClick={() => setVistaActiva('AGENDA')}
                    style={{ backgroundColor: vistaActiva === 'AGENDA' ? '#0f766e' : 'transparent', color: vistaActiva === 'AGENDA' ? 'white' : '#475569', border: 'none', padding: '0.8rem 1.5rem', borderRadius: '8px', fontWeight: '700', cursor: 'pointer', transition: 'all 0.2s' }}
                >
                    📅 Agenda de Boxes
                </button>
                <button 
                    onClick={() => setVistaActiva('PRESTACIONES')}
                    style={{ backgroundColor: vistaActiva === 'PRESTACIONES' ? '#0f766e' : 'transparent', color: vistaActiva === 'PRESTACIONES' ? 'white' : '#475569', border: 'none', padding: '0.8rem 1.5rem', borderRadius: '8px', fontWeight: '700', cursor: 'pointer', transition: 'all 0.2s' }}
                >
                    ⚕️ Catálogo de Prestaciones
                </button>
            </div>

            {/* =========================================
                VISTA 1: AGENDA DE BOXES
            ========================================= */}
            {vistaActiva === 'AGENDA' && (
                <div>
                    {/* Selector de Boxes */}
                    <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem', overflowX: 'auto', paddingBottom: '0.5rem' }}>
                        {boxesConfig.map(box => (
                            <button key={box.id} onClick={() => setBoxSeleccionado(box)} style={{ backgroundColor: boxSeleccionado.id === box.id ? '#0f766e' : '#ffffff', color: boxSeleccionado.id === box.id ? 'white' : '#475569', border: boxSeleccionado.id === box.id ? '1px solid #0f766e' : '1px solid #cbd5e1', padding: '1rem 1.5rem', borderRadius: '12px', cursor: 'pointer', textAlign: 'left', minWidth: '220px', boxShadow: boxSeleccionado.id === box.id ? '0 4px 6px -1px rgba(15, 118, 110, 0.2)' : 'none', transition: 'all 0.2s' }}>
                                <div style={{ fontSize: '1.2rem', fontWeight: '700', marginBottom: '0.25rem' }}>{box.codigo}</div>
                                <div style={{ fontSize: '0.85rem', opacity: 0.8 }}>{box.centroAtencion}</div>
                            </button>
                        ))}
                    </div>

                    <div style={{ backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '16px', padding: '2rem', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.02)' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', borderBottom: '2px solid #f1f5f9', paddingBottom: '1rem' }}>
                            <div>
                                <h2 style={{ margin: 0, color: '#1e293b', fontSize: '1.5rem' }}>Agenda y Lista de Espera</h2>
                                <p style={{ margin: '0.25rem 0 0 0', color: '#64748b', fontSize: '0.9rem' }}>Gestionando turnos para: <strong>{boxSeleccionado.codigo}</strong></p>
                            </div>
                            {!modoNuevo && (
                                <button onClick={() => setModoNuevo(true)} style={{ backgroundColor: '#0284c7', color: 'white', border: 'none', padding: '0.6rem 1.2rem', borderRadius: '8px', fontWeight: '600', cursor: 'pointer' }}>+ Cita Directa</button>
                            )}
                        </div>

                        {modoNuevo && (
                            <div style={{ backgroundColor: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '1.5rem', marginBottom: '2rem' }}>
                                <h4 style={{ margin: '0 0 1rem 0', color: '#0f766e' }}>Agendar Nueva Cita</h4>
                                <form onSubmit={handleCrearCita} style={{ display: 'flex', gap: '1rem', alignItems: 'flex-end', flexWrap: 'wrap' }}>
                                    <div style={{ flex: '1 1 120px' }}><label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '600', color: '#334155', marginBottom: '0.3rem' }}>RUT</label><input type="text" value={nuevoCupo.rut} onChange={e => setNuevoCupo({...nuevoCupo, rut: e.target.value})} style={{ width: '100%', padding: '0.6rem', borderRadius: '6px', border: '1px solid #cbd5e1' }} required /></div>
                                    <div style={{ flex: '2 1 180px' }}><label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '600', color: '#334155', marginBottom: '0.3rem' }}>Paciente</label><input type="text" value={nuevoCupo.paciente} onChange={e => setNuevoCupo({...nuevoCupo, paciente: e.target.value})} style={{ width: '100%', padding: '0.6rem', borderRadius: '6px', border: '1px solid #cbd5e1' }} required /></div>
                                    <div style={{ flex: '2 1 150px' }}>
                                        <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '600', color: '#334155', marginBottom: '0.3rem' }}>Especialidad / Prestación</label>
                                        <select value={nuevoCupo.especialidad} onChange={e => setNuevoCupo({...nuevoCupo, especialidad: e.target.value})} style={{ width: '100%', padding: '0.6rem', borderRadius: '6px', border: '1px solid #cbd5e1', backgroundColor: '#fff' }}>
                                            {prestaciones.map(p => <option key={p.id} value={p.nombre}>{p.nombre}</option>)}
                                        </select>
                                    </div>
                                    <div style={{ flex: '1 1 100px' }}>
                                        <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '600', color: '#334155', marginBottom: '0.3rem' }}>Hora</label>
                                        <select value={nuevoCupo.hora} onChange={e => setNuevoCupo({...nuevoCupo, hora: e.target.value})} style={{ width: '100%', padding: '0.6rem', borderRadius: '6px', border: '1px solid #cbd5e1', backgroundColor: '#fff' }}>
                                            {horariosFijos.map(h => <option key={h} value={h} disabled={isHoraOcupada(h, boxSeleccionado.id)}>{h} {isHoraOcupada(h, boxSeleccionado.id) ? '(Ocupado)' : ''}</option>)}
                                        </select>
                                    </div>
                                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                                        <button type="submit" style={{ backgroundColor: '#0f766e', color: 'white', border: 'none', padding: '0.6rem 1.2rem', borderRadius: '6px', fontWeight: '600', cursor: 'pointer' }}>Guardar</button>
                                        <button type="button" onClick={() => setModoNuevo(false)} style={{ backgroundColor: '#f1f5f9', color: '#475569', border: '1px solid #cbd5e1', padding: '0.6rem 1.2rem', borderRadius: '6px', fontWeight: '600', cursor: 'pointer' }}>Cancelar</button>
                                    </div>
                                </form>
                            </div>
                        )}

                        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.95rem' }}>
                            <thead>
                                <tr style={{ backgroundColor: '#f8fafc', color: '#475569', borderBottom: '2px solid #e2e8f0' }}>
                                    <th style={{ padding: '1rem' }}>Hora</th>
                                    <th style={{ padding: '1rem' }}>RUT</th>
                                    <th style={{ padding: '1rem' }}>Paciente</th>
                                    <th style={{ padding: '1rem' }}>Especialidad</th>
                                    <th style={{ padding: '1rem' }}>Estado</th>
                                    <th style={{ padding: '1rem', textAlign: 'right' }}>Acciones</th>
                                </tr>
                            </thead>
                            <tbody>
                                {agendaActual.map(cupo => (
                                    <tr key={cupo.id} style={{ borderBottom: '1px solid #e2e8f0' }}>
                                        <td style={{ padding: '1rem', fontWeight: '700', color: '#0f766e' }}>{cupo.fechaHoraInicio}</td>
                                        <td style={{ padding: '1rem', color: '#64748b' }}>{cupo.rut}</td>
                                        <td style={{ padding: '1rem', fontWeight: '600', color: '#1e293b' }}>{cupo.paciente}</td>
                                        <td style={{ padding: '1rem', color: '#475569' }}>{cupo.especialidad}</td>
                                        <td style={{ padding: '1rem' }}><span style={{ backgroundColor: '#d1fae5', color: '#059669', padding: '0.3rem 0.7rem', borderRadius: '20px', fontSize: '0.75rem', fontWeight: '700' }}>Confirmada</span></td>
                                        <td style={{ padding: '1rem', textAlign: 'right' }}>
                                            <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
                                                {/* Botón Modificar Cita */}
                                                <button onClick={() => abrirModalModificar(cupo)} style={{ backgroundColor: '#f0f9ff', color: '#0284c7', border: '1px solid #bae6fd', padding: '0.4rem 0.8rem', fontSize: '0.8rem', borderRadius: '6px', cursor: 'pointer', fontWeight: '600' }}>✏️ Modificar</button>
                                                <button onClick={() => setModalConfirmar({ isOpen: true, cupoId: cupo.id })} style={{ backgroundColor: '#fee2e2', color: '#ef4444', border: '1px solid #fca5a5', padding: '0.4rem 0.8rem', fontSize: '0.8rem', borderRadius: '6px', cursor: 'pointer', fontWeight: '600' }}>❌ Cancelar</button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* =========================================
                VISTA 2: GESTIÓN DE PRESTACIONES
            ========================================= */}
            {vistaActiva === 'PRESTACIONES' && (
                <div style={{ backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '16px', padding: '2rem', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.02)' }}>
                    <h2 style={{ margin: '0 0 1.5rem 0', color: '#1e293b' }}>Catálogo Oficial de Prestaciones</h2>
                    
                    {/* Crear nueva Prestacion (Arreglo de Grid y Spacing aplicado aquí) */}
                    <div style={{ backgroundColor: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '1.5rem', marginBottom: '2rem' }}>
                        <h4 style={{ margin: '0 0 1rem 0', color: '#0f766e' }}>Registrar Nueva Prestación</h4>
                        <form onSubmit={handleCrearPrestacion} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem', alignItems: 'end' }}>
                            <div>
                                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '600', color: '#334155', marginBottom: '0.4rem' }}>Nombre de la Prestación</label>
                                <input type="text" value={nuevaPrestacion.nombre} onChange={e => setNuevaPrestacion({...nuevaPrestacion, nombre: e.target.value})} style={{ width: '100%', padding: '0.7rem', borderRadius: '8px', border: '1px solid #cbd5e1', boxSizing: 'border-box' }} required />
                            </div>
                            <div>
                                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '600', color: '#334155', marginBottom: '0.4rem' }}>Precio Base ($)</label>
                                <input type="number" value={nuevaPrestacion.precio} onChange={e => setNuevaPrestacion({...nuevaPrestacion, precio: e.target.value})} style={{ width: '100%', padding: '0.7rem', borderRadius: '8px', border: '1px solid #cbd5e1', boxSizing: 'border-box' }} required />
                            </div>
                            <div style={{ gridColumn: '1 / -1' }}>
                                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '600', color: '#334155', marginBottom: '0.4rem' }}>Descripción</label>
                                <input type="text" value={nuevaPrestacion.descripcion} onChange={e => setNuevaPrestacion({...nuevaPrestacion, descripcion: e.target.value})} style={{ width: '100%', padding: '0.7rem', borderRadius: '8px', border: '1px solid #cbd5e1', boxSizing: 'border-box' }} />
                            </div>
                            <div style={{ gridColumn: '1 / -1', display: 'flex', justifyContent: 'flex-end' }}>
                                <button type="submit" style={{ backgroundColor: '#0f766e', color: 'white', border: 'none', padding: '0.75rem 2rem', borderRadius: '8px', fontWeight: '600', cursor: 'pointer' }}>Agregar</button>
                            </div>
                        </form>
                    </div>

                    {/* Tabla de Prestaciones */}
                    <div style={{ overflowX: 'auto' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.95rem' }}>
                            <thead>
                                <tr style={{ backgroundColor: '#f1f5f9', color: '#475569', borderBottom: '2px solid #e2e8f0' }}>
                                    <th style={{ padding: '1rem' }}>ID</th>
                                    <th style={{ padding: '1rem' }}>Nombre (Especialidad)</th>
                                    <th style={{ padding: '1rem' }}>Descripción</th>
                                    <th style={{ padding: '1rem' }}>Precio ($)</th>
                                    <th style={{ padding: '1rem', textAlign: 'right' }}>Acciones</th>
                                </tr>
                            </thead>
                            <tbody>
                                {prestaciones.map(p => (
                                    <tr key={p.id} style={{ borderBottom: '1px solid #e2e8f0' }}>
                                        <td style={{ padding: '1rem', color: '#64748b' }}>#{p.id}</td>
                                        <td style={{ padding: '1rem', fontWeight: '600', color: '#1e293b' }}>{p.nombre}</td>
                                        <td style={{ padding: '1rem', color: '#475569', fontSize: '0.85rem' }}>{p.descripcion}</td>
                                        <td style={{ padding: '1rem', fontWeight: '700', color: '#0f766e' }}>
                                            {precioEditando.id === p.id ? (
                                                <input type="number" value={precioEditando.nuevoPrecio} onChange={e => setPrecioEditando({...precioEditando, nuevoPrecio: e.target.value})} style={{ width: '100px', padding: '0.4rem', borderRadius: '4px', border: '1px solid #0f766e' }} autoFocus />
                                            ) : `$ ${p.precio.toLocaleString('es-CL')}`}
                                        </td>
                                        <td style={{ padding: '1rem', textAlign: 'right' }}>
                                            {precioEditando.id === p.id ? (
                                                <button onClick={() => guardarEdicionPrecio(p.id)} style={{ backgroundColor: '#059669', color: 'white', border: 'none', padding: '0.4rem 0.8rem', fontSize: '0.8rem', borderRadius: '6px', cursor: 'pointer', fontWeight: '600' }}>Guardar</button>
                                            ) : (
                                                <button onClick={() => iniciarEdicionPrecio(p)} style={{ backgroundColor: '#f1f5f9', color: '#475569', border: '1px solid #cbd5e1', padding: '0.4rem 0.8rem', fontSize: '0.8rem', borderRadius: '6px', cursor: 'pointer', fontWeight: '600' }}>Editar Precio</button>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* MODAL 1: Modificar Cita Completa (Hora y Especialidad) */}
            {modalModificar.isOpen && (
                <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(15, 23, 42, 0.7)', backdropFilter: 'blur(4px)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 9999 }}>
                    <div style={{ backgroundColor: 'white', padding: '2.5rem', borderRadius: '16px', width: '450px', maxWidth: '90%', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)' }}>
                        <h3 style={{ marginTop: 0, marginBottom: '1.5rem', color: '#1e293b' }}>Modificar Cita Agendada</h3>
                        
                        <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '600', color: '#334155', marginBottom: '0.5rem' }}>Especialidad / Prestación:</label>
                        <select 
                            value={modalModificar.nuevaEspecialidad} 
                            onChange={(e) => setModalModificar({...modalModificar, nuevaEspecialidad: e.target.value})}
                            style={{ width: '100%', padding: '0.8rem', borderRadius: '8px', border: '1px solid #cbd5e1', marginBottom: '1.5rem', fontSize: '1rem', backgroundColor: '#fff' }}
                        >
                            {prestaciones.map(p => <option key={p.id} value={p.nombre}>{p.nombre}</option>)}
                        </select>

                        <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '600', color: '#334155', marginBottom: '0.5rem' }}>Nueva hora de inicio:</label>
                        <select 
                            value={modalModificar.nuevaHora} 
                            onChange={(e) => setModalModificar({...modalModificar, nuevaHora: e.target.value})}
                            style={{ width: '100%', padding: '0.8rem', borderRadius: '8px', border: '1px solid #cbd5e1', marginBottom: '2rem', fontSize: '1rem', backgroundColor: '#fff' }}
                        >
                            <option value="">-- Seleccione Hora --</option>
                            {horariosFijos.map(h => {
                                const ocupado = isHoraOcupada(h, boxSeleccionado.id, modalModificar.cupoId);
                                return <option key={h} value={h} disabled={ocupado}>{h} {ocupado ? '(Ocupado)' : ''}</option>;
                            })}
                        </select>

                        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
                            <button onClick={() => setModalModificar({isOpen: false, cupoId: null, nuevaHora: '', nuevaEspecialidad: ''})} style={{ backgroundColor: '#f1f5f9', color: '#475569', border: '1px solid #cbd5e1', padding: '0.8rem 1.5rem', borderRadius: '8px', fontWeight: '700', cursor: 'pointer', width: '100%' }}>Cancelar</button>
                            <button onClick={guardarModificacion} disabled={!modalModificar.nuevaHora || !modalModificar.nuevaEspecialidad} style={{ backgroundColor: '#0f766e', color: 'white', border: 'none', padding: '0.8rem 1.5rem', borderRadius: '8px', fontWeight: '700', cursor: 'pointer', width: '100%' }}>Guardar Cambios</button>
                        </div>
                    </div>
                </div>
            )}

            {/* MODAL 2: Confirmar Cancelación */}
            {modalConfirmar.isOpen && (
                <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(15, 23, 42, 0.7)', backdropFilter: 'blur(4px)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 9999 }}>
                    <div style={{ backgroundColor: 'white', padding: '2.5rem', borderRadius: '16px', width: '400px', maxWidth: '90%', textAlign: 'center' }}>
                        <div style={{ backgroundColor: '#fee2e2', color: '#ef4444', width: '60px', height: '60px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem auto', fontSize: '1.5rem' }}>⚠️</div>
                        <h3 style={{ marginTop: 0, marginBottom: '1rem', color: '#1e293b', fontSize: '1.25rem' }}>¿Cancelar Cita?</h3>
                        <p style={{ color: '#64748b', fontSize: '0.95rem', marginBottom: '2rem', lineHeight: '1.5' }}>Esta acción eliminará el cupo reservado de la agenda.</p>
                        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
                            <button onClick={() => setModalConfirmar({ isOpen: false, cupoId: null })} style={{ backgroundColor: '#f1f5f9', color: '#475569', border: '1px solid #cbd5e1', padding: '0.8rem 1.5rem', borderRadius: '8px', fontWeight: '700', cursor: 'pointer', width: '100%' }}>Volver</button>
                            <button onClick={confirmarCancelacion} style={{ backgroundColor: '#ef4444', color: 'white', border: 'none', padding: '0.8rem 1.5rem', borderRadius: '8px', fontWeight: '700', cursor: 'pointer', width: '100%' }}>Sí, Cancelar</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}