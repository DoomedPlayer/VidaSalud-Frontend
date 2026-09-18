import { useState, useEffect } from 'react';
import { useApi } from '../hooks/useApi';
import { useMsal } from "@azure/msal-react";
import { registrarAuditoria } from '../utils/auditHelper';

export default function Catalog() {
    const { accounts } = useMsal();
    const cuenta = accounts.length > 0 ? accounts[0] : null;
    const api = useApi();

    // 1. Estados compartidos
    const [vistaActiva, setVistaActiva] = useState('AGENDA');
    const [isLoading, setIsLoading] = useState(true);
    const [errorBackend, setErrorBackend] = useState(false);

    // 2. Estados de datos
    const [prestaciones, setPrestaciones] = useState([]);
    const [boxesConfig, setBoxesConfig] = useState([]);
    const [cupos, setCupos] = useState([]);
    const [boxSeleccionado, setBoxSeleccionado] = useState(null);

    // 3. Estados de UI - Agenda
    const [modoNuevo, setModoNuevo] = useState(false);
    const [nuevoCupo, setNuevoCupo] = useState({ rut: '', paciente: '', hora: '08:30', especialidad: '' });

    // 4. Estados de UI - Prestaciones
    const [nuevaPrestacion, setNuevaPrestacion] = useState({ nombre: '', precio: '', descripcion: '' });
    const [precioEditando, setPrecioEditando] = useState({ id: null, nuevoPrecio: '' });

    const fechaActualISO = new Date().toISOString().split('T')[0];
    const [fechaSeleccionada, setFechaSeleccionada] = useState(fechaActualISO);

    const horariosFijos = [
        '08:30', '09:00', '09:30', '10:00', '10:30', '11:00', '11:30', 
        '12:00', '12:30', '13:00', '13:30', '14:00', '14:30', '15:00', 
        '15:30', '16:00', '16:30', '17:00'
    ];

    const normalizarFecha = (fechaOriginal) => {
        if (!fechaOriginal) return '';
        if (Array.isArray(fechaOriginal)) {
            const [y, m, d, h, min] = fechaOriginal;
            return `${y}-${String(m).padStart(2,'0')}-${String(d).padStart(2,'0')}T${String(h).padStart(2,'0')}:${String(min).padStart(2,'0')}:00`;
        }
        return fechaOriginal; 
    };

    useEffect(() => {
        const fetchCatalogData = async () => {
            setIsLoading(true);
            setErrorBackend(false);
            try {
                const [servicesRes, boxesRes, cuposRes, atencionesRes] = await Promise.all([
                    api.get('/catalog/services'),
                    api.get('/catalog/boxes'),
                    api.get('/catalog/cupos'),
                    api.get('/appointments')
                ]);
                
                const prestacionesData = servicesRes.data || [];
                const boxesData = boxesRes.data || [];
                const cuposRaw = cuposRes.data || [];
                const atencionesData = atencionesRes.data || [];

                const cuposEnriquecidos = cuposRaw.map(cupo => {
                    const atencionVinculada = atencionesData.find(a => a.cupoId === cupo.id);
                    
                    let nombreEspecialidad = '';
                    if (atencionVinculada) {
                        const prestacionObj = prestacionesData.find(p => p.id === atencionVinculada.prestacionId);
                        nombreEspecialidad = prestacionObj ? prestacionObj.nombre : '';
                    }

                    return {
                        id: cupo.id,
                        boxId: cupo.box ? cupo.box.id : null,
                        fechaHoraInicio: normalizarFecha(cupo.fechaHoraInicio), 
                        rut: atencionVinculada ? atencionVinculada.pacienteId : '',
                        paciente: atencionVinculada ? (atencionVinculada.nombrePaciente || atencionVinculada.pacienteId) : '', 
                        especialidad: nombreEspecialidad
                    };
                });
                
                setPrestaciones(prestacionesData);
                setBoxesConfig(boxesData);
                setCupos(cuposEnriquecidos);
                
                if (boxesData.length > 0) {
                    setBoxSeleccionado(boxesData[0]);
                }
            } catch (err) {
                console.error("Error conectando al BFF.", err);
                setErrorBackend(true);
            } finally {
                setIsLoading(false);
            }
        };

        fetchCatalogData();
    }, []); 

    const obtenerCitaEnSlot = (horaSlot) => {
        return cupos.find(c => {
            if (c.boxId !== boxSeleccionado?.id) return false;
            if (!c.fechaHoraInicio) return false;
            
            const [fechaBD, horaBDCompleta] = c.fechaHoraInicio.split('T');
            const horaBDCorta = horaBDCompleta ? horaBDCompleta.substring(0, 5) : '';
            
            return fechaBD === fechaSeleccionada && horaBDCorta === horaSlot;
        });
    };

    const isHoraOcupada = (horaSlot) => !!obtenerCitaEnSlot(horaSlot);

    const abrirAgendamiento = (hora) => {
        setNuevoCupo({ rut: '', paciente: '', hora: hora, especialidad: '' });
        setModoNuevo(true);
    };

    const handleCrearCita = async (e) => {
        e.preventDefault();
        if (!nuevoCupo.especialidad) {
            alert("Por favor, seleccione una prestación antes de guardar.");
            return;
        }

        const fechaBase = fechaSeleccionada; 
        const fechaHoraInicio = `${fechaBase}T${nuevoCupo.hora}:00`;
        const fechaFinObj = new Date(`${fechaBase}T${nuevoCupo.hora}:00`);
        fechaFinObj.setMinutes(fechaFinObj.getMinutes() + 30);
        const horaFinFormat = String(fechaFinObj.getHours()).padStart(2, '0') + ':' + String(fechaFinObj.getMinutes()).padStart(2, '0');
        const fechaHoraFin = `${fechaBase}T${horaFinFormat}:00`;

        const payloadCupo = {
            box: { id: boxSeleccionado.id },
            fechaHoraInicio: fechaHoraInicio,
            fechaHoraFin: fechaHoraFin,
            disponible: false 
        };

        try {
            const resCupo = await api.post('/catalog/cupos', payloadCupo);
            const cupoGenerado = resCupo.data;

            const prestacionObj = prestaciones.find(p => p.nombre === nuevoCupo.especialidad);

            const fechaActualLocal = new Date();
            fechaActualLocal.setMinutes(fechaActualLocal.getMinutes() - fechaActualLocal.getTimezoneOffset());
            const fechaCreacionJava = fechaActualLocal.toISOString().slice(0, 19);

            const payloadAtencion = {
                pacienteId: nuevoCupo.rut,
                rut: nuevoCupo.rut,
                nombrePaciente: nuevoCupo.paciente,
                prestacionId: prestacionObj ? prestacionObj.id : 1,
                cupoId: cupoGenerado.id,
                estado: 'CONFIRMADA', 
                fechaCreacion: fechaCreacionJava 
            };
            
            await api.post('/appointments', payloadAtencion);

            const citaVisual = {
                id: cupoGenerado.id,
                boxId: boxSeleccionado.id,
                fechaHoraInicio: fechaHoraInicio,
                rut: nuevoCupo.rut,
                paciente: nuevoCupo.paciente, 
                especialidad: nuevoCupo.especialidad
            };

            setCupos([...cupos, citaVisual]);
            setModoNuevo(false);
            setNuevoCupo({ rut: '', paciente: '', hora: '08:30', especialidad: '' });

        } catch (err) {
            console.error("Detalle del error:", err);
            alert("Ocurrió un error al guardar en la base de datos.");
        }
    };

    const handleCrearPrestacion = async (e) => {
        e.preventDefault();
        if (!nuevaPrestacion.nombre || !nuevaPrestacion.precio) return;
        
        const payload = {
            nombre: nuevaPrestacion.nombre,
            precio: parseFloat(nuevaPrestacion.precio),
            descripcion: nuevaPrestacion.descripcion
        };

        try {
            const res = await api.post('/catalog/services', payload);

            if (cuenta) {
                await registrarAuditoria(
                    api, 
                    cuenta, 
                    "CATALOG_CREATE", 
                    "Catálogo", 
                    `Se creó la prestación: ${nuevaPrestacion.nombre} con precio $${nuevaPrestacion.precio}`
                );
            } else {
                console.warn("⚠️ Auditoría omitida: No hay cuenta MSAL activa.");
            }

            setPrestaciones([...prestaciones, res.data]);
        } catch (err) {
            console.error("Error al crear prestación:", err);
            console.warn("Guardando prestación en memoria (Modo Offline)");
            setPrestaciones([...prestaciones, { ...payload, id: Date.now() }]);
        }
        setNuevaPrestacion({ nombre: '', precio: '', descripcion: '' });
    };

    const iniciarEdicionPrecio = (prestacion) => setPrecioEditando({ id: prestacion.id, nuevoPrecio: prestacion.precio });
    
    const guardarEdicionPrecio = async (id) => {
    const payload = { precio: parseFloat(precioEditando.nuevoPrecio) };
    try {
        await api.put(`/catalog/services/${id}`, payload);
        setPrestaciones(prestaciones.map(p => p.id === id ? { ...p, precio: payload.precio } : p));
        const prestacionEncontrada = prestaciones.find(p => p.id === id);
        const nombrePrestacion = prestacionEncontrada ? prestacionEncontrada.nombre : `ID ${id}`;

        if (cuenta) {
                await registrarAuditoria(
                    api, 
                    cuenta, 
                    "CATALOG_UPDATE", 
                    "Catálogo", 
                    `Se modificó la prestación: ${nombrePrestacion} a nuevo precio $${payload.precio}.`
                );
            } else {
                console.warn("⚠️ Auditoría de precio omitida: No hay cuenta MSAL activa.");
            }
        } catch (err) {
            console.error("Error al actualizar precio:", err);
            console.warn("Actualizando precio en memoria (Modo Offline)");
            setPrestaciones(prestaciones.map(p => p.id === id ? { ...p, precio: payload.precio } : p));
        }
        setPrecioEditando({ id: null, nuevoPrecio: '' });
};

    if (isLoading) return <div style={{ padding: '2rem' }}>Cargando catálogo...</div>;

    return (
        <div style={{ position: 'relative' }}>
            {errorBackend && (
                <div style={{ backgroundColor: '#fffbeb', borderLeft: '4px solid #f59e0b', padding: '1rem', marginBottom: '1.5rem', borderRadius: '0 8px 8px 0', color: '#b45309', fontSize: '0.9rem', fontWeight: '600' }}>
                    ⚠️ Backend de Catálogo no detectado. Modo simulación activado.
                </div>
            )}

            {/* Modal de Agendamiento */}
            {modoNuevo && (
                <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(15, 23, 42, 0.7)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 9999 }}>
                    <div style={{ backgroundColor: 'white', padding: '2.5rem', borderRadius: '16px', width: '500px', maxWidth: '90%', boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)' }}>
                        <h3 style={{ marginTop: 0, marginBottom: '0.5rem', color: '#1e293b', fontSize: '1.5rem' }}>Agendar Nueva Cita</h3>
                        <p style={{ color: '#64748b', marginBottom: '1.5rem', marginTop: 0, fontSize: '0.95rem' }}>
                            Box: <strong style={{ color: '#0f766e' }}>{boxSeleccionado?.codigo}</strong> | Fecha: <strong>{fechaSeleccionada}</strong>
                        </p>

                        <form onSubmit={handleCrearCita} style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
                            
                            <div style={{ display: 'flex', gap: '1rem' }}>
                                <div style={{ flex: 1 }}>
                                    <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '600', color: '#475569', marginBottom: '0.5rem' }}>Hora Seleccionada</label>
                                    <input readOnly type="text" value={`${nuevoCupo.hora} hrs`} style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid #cbd5e1', backgroundColor: '#f1f5f9', color: '#475569', fontWeight: '700', boxSizing: 'border-box' }} />
                                </div>
                                <div style={{ flex: 1 }}>
                                    <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '600', color: '#475569', marginBottom: '0.5rem' }}>RUT Paciente</label>
                                    <input required type="text" value={nuevoCupo.rut} onChange={e => setNuevoCupo({...nuevoCupo, rut: e.target.value})} placeholder="Ej: 12345678-9" style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid #cbd5e1', boxSizing: 'border-box' }} autoFocus />
                                </div>
                            </div>

                            {/* NUEVO CAMPO: Nombre del Paciente */}
                            <div>
                                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '600', color: '#475569', marginBottom: '0.5rem' }}>Nombre del Paciente</label>
                                <input required type="text" value={nuevoCupo.paciente} onChange={e => setNuevoCupo({...nuevoCupo, paciente: e.target.value})} placeholder="Ej: Juan Pérez" style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid #cbd5e1', boxSizing: 'border-box' }} />
                            </div>
                            
                            <div>
                                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '600', color: '#475569', marginBottom: '0.5rem' }}>Prestación</label>
                                <select required value={nuevoCupo.especialidad} onChange={e => setNuevoCupo({...nuevoCupo, especialidad: e.target.value})} style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid #cbd5e1', backgroundColor: 'white', boxSizing: 'border-box' }}>
                                    <option value="">Seleccione una especialidad...</option>
                                    {prestaciones.map(p => (
                                        <option key={p.id} value={p.nombre}>{p.nombre}</option>
                                    ))}
                                </select>
                            </div>
                            
                            <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
                                <button type="button" onClick={() => setModoNuevo(false)} style={{ flex: 1, backgroundColor: 'white', color: '#64748b', border: '1px solid #cbd5e1', padding: '0.8rem', borderRadius: '8px', fontWeight: '600', cursor: 'pointer' }}>Cancelar</button>
                                <button type="submit" style={{ flex: 1, backgroundColor: '#0f766e', color: 'white', border: 'none', padding: '0.8rem', borderRadius: '8px', fontWeight: '600', cursor: 'pointer' }}>Guardar Cita</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Encabezado Principal */}
            <div style={{ background: 'linear-gradient(135deg, #0f766e 0%, #115e59 100%)', borderRadius: '16px', padding: '2.5rem', color: 'white', marginBottom: '2rem' }}>
                <span style={{ backgroundColor: 'rgba(255,255,255,0.2)', padding: '0.3rem 0.8rem', borderRadius: '20px', fontSize: '0.85rem', fontWeight: 'bold' }}>
                    Gestión de Box y Prestaciones
                </span>
                <h1 style={{ margin: '1rem 0 0 0', fontSize: '2rem' }}>Administración Centralizada</h1>
            </div>

            {/* Pestañas de Navegación */}
            <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem', borderBottom: '2px solid #e2e8f0', paddingBottom: '1rem' }}>
                <button onClick={() => setVistaActiva('AGENDA')} style={{ backgroundColor: vistaActiva === 'AGENDA' ? '#0f766e' : 'transparent', color: vistaActiva === 'AGENDA' ? 'white' : '#475569', border: 'none', padding: '0.8rem 1.5rem', borderRadius: '8px', fontWeight: '700', cursor: 'pointer' }}>📅 Agenda de Boxes</button>
                <button onClick={() => setVistaActiva('PRESTACIONES')} style={{ backgroundColor: vistaActiva === 'PRESTACIONES' ? '#0f766e' : 'transparent', color: vistaActiva === 'PRESTACIONES' ? 'white' : '#475569', border: 'none', padding: '0.8rem 1.5rem', borderRadius: '8px', fontWeight: '700', cursor: 'pointer' }}>⚕️ Catálogo de Prestaciones</button>
            </div>

            {/* --- VISTA: AGENDA --- */}
            {vistaActiva === 'AGENDA' && boxSeleccionado && (
                <div>
                    <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem', overflowX: 'auto', paddingBottom: '0.5rem' }}>
                        {boxesConfig.map(box => (
                            <button key={box.id} onClick={() => setBoxSeleccionado(box)} style={{ backgroundColor: boxSeleccionado.id === box.id ? '#0f766e' : '#ffffff', color: boxSeleccionado.id === box.id ? 'white' : '#475569', border: boxSeleccionado.id === box.id ? '1px solid #0f766e' : '1px solid #cbd5e1', padding: '1rem 1.5rem', borderRadius: '12px', cursor: 'pointer', textAlign: 'left', minWidth: '220px' }}>
                                <div style={{ fontSize: '1.2rem', fontWeight: '700', marginBottom: '0.25rem' }}>{box.codigo}</div>
                                <div style={{ fontSize: '0.85rem', opacity: 0.8 }}>{box.centroAtencion}</div>
                            </button>
                        ))}
                    </div>

                    <div style={{ backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '16px', padding: '2rem' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', borderBottom: '2px solid #f1f5f9', paddingBottom: '1rem' }}>
                            <div>
                                <h2 style={{ margin: 0, color: '#1e293b' }}>Agenda Diaria</h2>
                                <p style={{ margin: '0.25rem 0 0 0', color: '#64748b' }}>Gestionando turnos para: <strong>{boxSeleccionado.codigo}</strong></p>
                            </div>
                            <div>
                                <label style={{ marginRight: '1rem', fontWeight: '600', fontSize: '0.9rem' }}>Fecha de Agenda:</label>
                                <input 
                                    type="date" 
                                    value={fechaSeleccionada} 
                                    min={fechaActualISO}
                                    onChange={(e) => setFechaSeleccionada(e.target.value)}
                                    style={{ padding: '0.6rem', borderRadius: '8px', border: '1px solid #cbd5e1' }}
                                />
                            </div>
                        </div>

                        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.95rem' }}>
                            <thead>
                                <tr style={{ backgroundColor: '#f8fafc', borderBottom: '2px solid #e2e8f0' }}>
                                    <th style={{ padding: '1rem', width: '120px' }}>Hora</th>
                                    <th style={{ padding: '1rem' }}>Paciente</th>
                                    <th style={{ padding: '1rem' }}>Especialidad</th>
                                    <th style={{ padding: '1rem', textAlign: 'right' }}>Disponibilidad</th>
                                </tr>
                            </thead>
                            <tbody>
                                {horariosFijos.map(hora => {
                                    const citaSlot = obtenerCitaEnSlot(hora);
                                    return (
                                        <tr key={hora} style={{ borderBottom: '1px solid #e2e8f0', backgroundColor: citaSlot ? '#f8fafc' : '#ffffff' }}>
                                            <td style={{ padding: '1rem', fontWeight: '700', color: citaSlot ? '#475569' : '#0f766e' }}>{hora} hrs</td>
                                            {citaSlot ? (
                                                <>
                                                    <td style={{ padding: '1rem', fontWeight: '600' }}>{citaSlot.paciente || citaSlot.rut}</td>
                                                    <td style={{ padding: '1rem' }}>{citaSlot.especialidad}</td>
                                                    <td style={{ padding: '1rem', textAlign: 'right' }}>
                                                        <span style={{ backgroundColor: '#fee2e2', color: '#ef4444', padding: '0.3rem 0.7rem', borderRadius: '20px', fontSize: '0.75rem', fontWeight: '700' }}>Ocupado</span>
                                                    </td>
                                                </>
                                            ) : (
                                                <>
                                                    <td style={{ padding: '1rem', color: '#94a3b8', fontStyle: 'italic' }}>---</td>
                                                    <td style={{ padding: '1rem', color: '#94a3b8', fontStyle: 'italic' }}>---</td>
                                                    <td style={{ padding: '1rem', textAlign: 'right' }}>
                                                        {fechaSeleccionada < fechaActualISO ? (
                                                            <span style={{ color: '#94a3b8', fontSize: '0.85rem', fontWeight: '600' }}>No disponible</span>
                                                        ) : (
                                                            <button onClick={() => abrirAgendamiento(hora)} style={{ backgroundColor: '#0f766e', color: 'white', border: 'none', padding: '0.4rem 1rem', borderRadius: '6px', fontWeight: '600', cursor: 'pointer', fontSize: '0.8rem' }}>+ Agendar</button>
                                                        )}
                                                    </td>
                                                </>
                                            )}
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* --- VISTA: PRESTACIONES --- */}
            {vistaActiva === 'PRESTACIONES' && (
                <div style={{ backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '16px', padding: '2rem' }}>
                    <h2 style={{ margin: '0 0 1.5rem 0' }}>Catálogo Oficial de Prestaciones</h2>
                    
                    <div style={{ backgroundColor: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '1.5rem', marginBottom: '2rem' }}>
                        <h4 style={{ margin: '0 0 1rem 0', color: '#0f766e' }}>Registrar Nueva Prestación</h4>
                        <form onSubmit={handleCrearPrestacion} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem', alignItems: 'end' }}>
                            <div><label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '600', marginBottom: '0.4rem' }}>Nombre</label><input type="text" value={nuevaPrestacion.nombre} onChange={e => setNuevaPrestacion({...nuevaPrestacion, nombre: e.target.value})} style={{ width: '100%', padding: '0.7rem', borderRadius: '8px', border: '1px solid #cbd5e1', boxSizing: 'border-box' }} required /></div>
                            <div><label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '600', marginBottom: '0.4rem' }}>Precio Base ($)</label><input type="number" value={nuevaPrestacion.precio} onChange={e => setNuevaPrestacion({...nuevaPrestacion, precio: e.target.value})} style={{ width: '100%', padding: '0.7rem', borderRadius: '8px', border: '1px solid #cbd5e1', boxSizing: 'border-box' }} required /></div>
                            <div style={{ gridColumn: '1 / -1' }}><label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '600', marginBottom: '0.4rem' }}>Descripción</label><input type="text" value={nuevaPrestacion.descripcion} onChange={e => setNuevaPrestacion({...nuevaPrestacion, descripcion: e.target.value})} style={{ width: '100%', padding: '0.7rem', borderRadius: '8px', border: '1px solid #cbd5e1', boxSizing: 'border-box' }} /></div>
                            <div style={{ gridColumn: '1 / -1', display: 'flex', justifyContent: 'flex-end' }}><button type="submit" style={{ backgroundColor: '#0f766e', color: 'white', border: 'none', padding: '0.75rem 2rem', borderRadius: '8px', fontWeight: '600', cursor: 'pointer' }}>Agregar</button></div>
                        </form>
                    </div>

                    <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.95rem' }}>
                        <thead>
                            <tr style={{ backgroundColor: '#f1f5f9', borderBottom: '2px solid #e2e8f0' }}>
                                <th style={{ padding: '1rem' }}>ID</th>
                                <th style={{ padding: '1rem' }}>Nombre</th>
                                <th style={{ padding: '1rem' }}>Descripción</th>
                                <th style={{ padding: '1rem' }}>Precio ($)</th>
                                <th style={{ padding: '1rem', textAlign: 'right' }}>Acciones</th>
                            </tr>
                        </thead>
                        <tbody>
                            {prestaciones.map(p => (
                                <tr key={p.id} style={{ borderBottom: '1px solid #e2e8f0' }}>
                                    <td style={{ padding: '1rem' }}>#{p.id}</td>
                                    <td style={{ padding: '1rem', fontWeight: '600' }}>{p.nombre}</td>
                                    <td style={{ padding: '1rem' }}>{p.descripcion}</td>
                                    <td style={{ padding: '1rem', fontWeight: '700', color: '#0f766e' }}>
                                        {precioEditando.id === p.id 
                                            ? <input type="number" value={precioEditando.nuevoPrecio} onChange={e => setPrecioEditando({...precioEditando, nuevoPrecio: e.target.value})} style={{ width: '100px', padding: '0.4rem' }} autoFocus /> 
                                            : `$ ${p.precio.toLocaleString('es-CL')}`
                                        }
                                    </td>
                                    <td style={{ padding: '1rem', textAlign: 'right' }}>
                                        {precioEditando.id === p.id 
                                            ? <button onClick={() => guardarEdicionPrecio(p.id)} style={{ backgroundColor: '#059669', color: 'white', border: 'none', padding: '0.4rem 0.8rem', borderRadius: '6px', cursor: 'pointer' }}>Guardar</button> 
                                            : <button onClick={() => iniciarEdicionPrecio(p)} style={{ backgroundColor: '#f1f5f9', border: '1px solid #cbd5e1', padding: '0.4rem 0.8rem', borderRadius: '6px', cursor: 'pointer' }}>Editar Precio</button>
                                        }
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
}