import { useState, useEffect } from 'react';
import { useApi } from '../hooks/useApi';

export default function Catalog() {
    const api = useApi();
    
    const [vistaActiva, setVistaActiva] = useState('AGENDA');
    const [isLoading, setIsLoading] = useState(true);
    const [errorBackend, setErrorBackend] = useState(false);

    // Estados de datos
    const [prestaciones, setPrestaciones] = useState([]);
    const [boxesConfig, setBoxesConfig] = useState([]);
    const [cupos, setCupos] = useState([]);

    // Estados de UI
    const [nuevaPrestacion, setNuevaPrestacion] = useState({ nombre: '', precio: '', descripcion: '' });
    const [precioEditando, setPrecioEditando] = useState({ id: null, nuevoPrecio: '' });
    const [boxSeleccionado, setBoxSeleccionado] = useState(null);
    const [modalModificar, setModalModificar] = useState({ isOpen: false, cupoId: null, nuevaHora: '', nuevaEspecialidad: '' });
    const [modalConfirmar, setModalConfirmar] = useState({ isOpen: false, cupoId: null });
    const [modoNuevo, setModoNuevo] = useState(false);
    const [nuevoCupo, setNuevoCupo] = useState({ rut: '', paciente: '', hora: '08:00', especialidad: '' });

    const horariosFijos = ['08:00', '08:30', '09:00', '09:30', '10:00', '10:30', '11:00', '11:30', '12:00', '12:30', '13:00', '13:30', '14:00', '14:30', '15:00', '15:30'];

    // --- 1. CARGA INICIAL DESDE EL BACKEND ---
    useEffect(() => {
        const fetchCatalogData = async () => {
            setIsLoading(true);
            setErrorBackend(false);
            try {
                // Hacemos las 3 peticiones al BFF en paralelo
                const [servicesRes, boxesRes, cuposRes] = await Promise.all([
                    api.get('/catalog/services'),
                    api.get('/catalog/boxes'),
                    api.get('/catalog/cupos')
                ]);
                
                setPrestaciones(servicesRes.data || []);
                setBoxesConfig(boxesRes.data || []);
                setCupos(cuposRes.data || []);
                
                if (boxesRes.data && boxesRes.data.length > 0) {
                    setBoxSeleccionado(boxesRes.data[0]);
                }
            } catch (err) {
                console.error("Error conectando al BFF. Activando modo offline.", err);
                setErrorBackend(true);
                // Cargar datos de prueba si falla el backend
                cargarDatosDePrueba();
            } finally {
                setIsLoading(false);
            }
        };

        fetchCatalogData();
    }, []); // eslint-disable-line react-hooks/exhaustive-deps

    const cargarDatosDePrueba = () => {
        const mockBoxes = [
            { id: 1, codigo: 'Box 01', centroAtencion: 'Sede San Bernardo' },
            { id: 2, codigo: 'Box 02', centroAtencion: 'Sede San Bernardo' }
        ];
        const mockPrestaciones = [
            { id: 1, nombre: 'Medicina General', precio: 25000, descripcion: 'Consulta médica básica' },
            { id: 2, nombre: 'Cardiología', precio: 45000, descripcion: 'Evaluación cardiovascular' }
        ];
        setBoxesConfig(mockBoxes);
        setPrestaciones(mockPrestaciones);
        setBoxSeleccionado(mockBoxes[0]);
        setCupos([
            { id: 1, boxId: 1, fechaHoraInicio: '09:00', rut: '19.283.746-K', paciente: 'Francisca Valenzuela', especialidad: 'Medicina General' }
        ]);
    };

    // --- 2. ACCIONES CON EL BACKEND (Con Fallback Offline) ---

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
            setPrestaciones([...prestaciones, res.data]);
        } catch (err) {
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
        } catch (err) {
            console.warn("Actualizando precio en memoria (Modo Offline)");
            setPrestaciones(prestaciones.map(p => p.id === id ? { ...p, precio: payload.precio } : p));
        }
        setPrecioEditando({ id: null, nuevoPrecio: '' });
    };

    const handleCrearCita = async (e) => {
    e.preventDefault();
    const payload = {
        boxId: boxSeleccionado.id,
        fechaHoraInicio: nuevoCupo.hora, 
        rut: nuevoCupo.rut,
        paciente: nuevoCupo.paciente,
        especialidad: nuevoCupo.especialidad
    };
    try {
        const res = await api.post('/catalog/cupos', payload);
        setCupos([...cupos, res.data]);
        setModoNuevo(false);
        setNuevoCupo({ rut: '', paciente: '', hora: '08:00', especialidad: prestaciones[0]?.nombre || '' });
    } catch (err) {
        console.error("Error al registrar el cupo en el backend", err);
        alert("No se pudo guardar el cupo en la base de datos.");
        const citaFallback = { id: Date.now(), ...payload };
        setCupos([...cupos, citaFallback]);
    }
};

    const isHoraOcupada = (horaEvaluar, boxIdEvaluar, ignorarCupoId = null) => cupos.some(c => c.boxId === boxIdEvaluar && c.fechaHoraInicio === horaEvaluar && c.id !== ignorarCupoId);
    const agendaActual = boxSeleccionado ? cupos.filter(c => c.boxId === boxSeleccionado.id).sort((a, b) => a.fechaHoraInicio.localeCompare(b.fechaHoraInicio)) : [];

    if (isLoading) {
        return <div style={{ padding: '3rem', textAlign: 'center', color: '#0f766e', fontWeight: 'bold' }}>Cargando datos del Catálogo y Boxes... ⏳</div>;
    }

    return (
        <div style={{ position: 'relative' }}>
            {errorBackend && (
                <div style={{ backgroundColor: '#fffbeb', borderLeft: '4px solid #f59e0b', padding: '1rem', marginBottom: '1.5rem', borderRadius: '0 8px 8px 0', color: '#b45309', fontSize: '0.9rem', fontWeight: '600' }}>
                    ⚠️ Backend de Catálogo no detectado. Modo simulación activado. Los cambios se guardarán solo en la memoria de su navegador.
                </div>
            )}

            <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem', borderBottom: '2px solid #e2e8f0', paddingBottom: '1rem' }}>
                <button onClick={() => setVistaActiva('AGENDA')} style={{ backgroundColor: vistaActiva === 'AGENDA' ? '#0f766e' : 'transparent', color: vistaActiva === 'AGENDA' ? 'white' : '#475569', border: 'none', padding: '0.8rem 1.5rem', borderRadius: '8px', fontWeight: '700', cursor: 'pointer' }}>📅 Agenda de Boxes</button>
                <button onClick={() => setVistaActiva('PRESTACIONES')} style={{ backgroundColor: vistaActiva === 'PRESTACIONES' ? '#0f766e' : 'transparent', color: vistaActiva === 'PRESTACIONES' ? 'white' : '#475569', border: 'none', padding: '0.8rem 1.5rem', borderRadius: '8px', fontWeight: '700', cursor: 'pointer' }}>⚕️ Catálogo de Prestaciones</button>
            </div>

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
                            <div><h2 style={{ margin: 0, color: '#1e293b' }}>Agenda y Lista de Espera</h2><p style={{ margin: '0.25rem 0 0 0', color: '#64748b' }}>Gestionando turnos para: <strong>{boxSeleccionado.codigo}</strong></p></div>
                            {!modoNuevo && <button onClick={() => setModoNuevo(true)} style={{ backgroundColor: '#0284c7', color: 'white', border: 'none', padding: '0.6rem 1.2rem', borderRadius: '8px', fontWeight: '600', cursor: 'pointer' }}>+ Cita Directa</button>}
                        </div>

                        {modoNuevo && (
                            <div style={{ backgroundColor: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '1.5rem', marginBottom: '2rem' }}>
                                <h4 style={{ margin: '0 0 1rem 0', color: '#0f766e' }}>Agendar Nueva Cita Local</h4>
                                <form onSubmit={handleCrearCita} style={{ display: 'flex', gap: '1rem', alignItems: 'flex-end', flexWrap: 'wrap' }}>
                                    <div style={{ flex: '1 1 120px' }}><label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '600', marginBottom: '0.3rem' }}>RUT</label><input type="text" value={nuevoCupo.rut} onChange={e => setNuevoCupo({...nuevoCupo, rut: e.target.value})} style={{ width: '100%', padding: '0.6rem', borderRadius: '6px', border: '1px solid #cbd5e1' }} required /></div>
                                    <div style={{ flex: '2 1 180px' }}><label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '600', marginBottom: '0.3rem' }}>Paciente</label><input type="text" value={nuevoCupo.paciente} onChange={e => setNuevoCupo({...nuevoCupo, paciente: e.target.value})} style={{ width: '100%', padding: '0.6rem', borderRadius: '6px', border: '1px solid #cbd5e1' }} required /></div>
                                    <div style={{ flex: '2 1 150px' }}><label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '600', marginBottom: '0.3rem' }}>Prestación</label><select value={nuevoCupo.especialidad} onChange={e => setNuevoCupo({...nuevoCupo, especialidad: e.target.value})} style={{ width: '100%', padding: '0.6rem', borderRadius: '6px', border: '1px solid #cbd5e1' }}>{prestaciones.map(p => <option key={p.id} value={p.nombre}>{p.nombre}</option>)}</select></div>
                                    <div style={{ flex: '1 1 100px' }}><label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '600', marginBottom: '0.3rem' }}>Hora</label><select value={nuevoCupo.hora} onChange={e => setNuevoCupo({...nuevoCupo, hora: e.target.value})} style={{ width: '100%', padding: '0.6rem', borderRadius: '6px', border: '1px solid #cbd5e1' }}>{horariosFijos.map(h => <option key={h} value={h} disabled={isHoraOcupada(h, boxSeleccionado.id)}>{h} {isHoraOcupada(h, boxSeleccionado.id) ? '(Ocupado)' : ''}</option>)}</select></div>
                                    <div style={{ display: 'flex', gap: '0.5rem' }}><button type="submit" style={{ backgroundColor: '#0f766e', color: 'white', border: 'none', padding: '0.6rem 1.2rem', borderRadius: '6px', cursor: 'pointer' }}>Guardar</button><button type="button" onClick={() => setModoNuevo(false)} style={{ backgroundColor: '#f1f5f9', border: '1px solid #cbd5e1', padding: '0.6rem 1.2rem', borderRadius: '6px', cursor: 'pointer' }}>Cancelar</button></div>
                                </form>
                            </div>
                        )}

                        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.95rem' }}>
                            <thead>
                                <tr style={{ backgroundColor: '#f8fafc', borderBottom: '2px solid #e2e8f0' }}><th style={{ padding: '1rem' }}>Hora</th><th style={{ padding: '1rem' }}>RUT</th><th style={{ padding: '1rem' }}>Paciente</th><th style={{ padding: '1rem' }}>Especialidad</th><th style={{ padding: '1rem' }}>Estado</th></tr>
                            </thead>
                            <tbody>
                                {agendaActual.map(cupo => (
                                    <tr key={cupo.id} style={{ borderBottom: '1px solid #e2e8f0' }}>
                                        <td style={{ padding: '1rem', fontWeight: '700', color: '#0f766e' }}>{cupo.fechaHoraInicio || cupo.hora}</td>
                                        <td style={{ padding: '1rem' }}>{cupo.rut || 'N/A'}</td>
                                        <td style={{ padding: '1rem', fontWeight: '600' }}>{cupo.paciente || 'N/A'}</td>
                                        <td style={{ padding: '1rem' }}>{cupo.especialidad || 'N/A'}</td>
                                        <td style={{ padding: '1rem' }}><span style={{ backgroundColor: '#d1fae5', color: '#059669', padding: '0.3rem 0.7rem', borderRadius: '20px', fontSize: '0.75rem', fontWeight: '700' }}>Confirmada</span></td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {vistaActiva === 'PRESTACIONES' && (
                <div style={{ backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '16px', padding: '2rem' }}>
                    <h2 style={{ margin: '0 0 1.5rem 0' }}>Catálogo Oficial de Prestaciones</h2>
                    <div style={{ backgroundColor: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '1.5rem', marginBottom: '2rem' }}>
                        <h4 style={{ margin: '0 0 1rem 0', color: '#0f766e' }}>Registrar Nueva Prestación</h4>
                        <form onSubmit={handleCrearPrestacion} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem', alignItems: 'end' }}>
                            <div><label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '600', marginBottom: '0.4rem' }}>Nombre</label><input type="text" value={nuevaPrestacion.nombre} onChange={e => setNuevaPrestacion({...nuevaPrestacion, nombre: e.target.value})} style={{ width: '100%', padding: '0.7rem', borderRadius: '8px', border: '1px solid #cbd5e1' }} required /></div>
                            <div><label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '600', marginBottom: '0.4rem' }}>Precio Base ($)</label><input type="number" value={nuevaPrestacion.precio} onChange={e => setNuevaPrestacion({...nuevaPrestacion, precio: e.target.value})} style={{ width: '100%', padding: '0.7rem', borderRadius: '8px', border: '1px solid #cbd5e1' }} required /></div>
                            <div style={{ gridColumn: '1 / -1' }}><label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '600', marginBottom: '0.4rem' }}>Descripción</label><input type="text" value={nuevaPrestacion.descripcion} onChange={e => setNuevaPrestacion({...nuevaPrestacion, descripcion: e.target.value})} style={{ width: '100%', padding: '0.7rem', borderRadius: '8px', border: '1px solid #cbd5e1' }} /></div>
                            <div style={{ gridColumn: '1 / -1', display: 'flex', justifyContent: 'flex-end' }}><button type="submit" style={{ backgroundColor: '#0f766e', color: 'white', border: 'none', padding: '0.75rem 2rem', borderRadius: '8px', fontWeight: '600', cursor: 'pointer' }}>Agregar</button></div>
                        </form>
                    </div>
                    <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.95rem' }}>
                        <thead><tr style={{ backgroundColor: '#f1f5f9', borderBottom: '2px solid #e2e8f0' }}><th style={{ padding: '1rem' }}>ID</th><th style={{ padding: '1rem' }}>Nombre</th><th style={{ padding: '1rem' }}>Descripción</th><th style={{ padding: '1rem' }}>Precio ($)</th><th style={{ padding: '1rem', textAlign: 'right' }}>Acciones</th></tr></thead>
                        <tbody>
                            {prestaciones.map(p => (
                                <tr key={p.id} style={{ borderBottom: '1px solid #e2e8f0' }}>
                                    <td style={{ padding: '1rem' }}>#{p.id}</td><td style={{ padding: '1rem', fontWeight: '600' }}>{p.nombre}</td><td style={{ padding: '1rem' }}>{p.descripcion}</td>
                                    <td style={{ padding: '1rem', fontWeight: '700', color: '#0f766e' }}>{precioEditando.id === p.id ? <input type="number" value={precioEditando.nuevoPrecio} onChange={e => setPrecioEditando({...precioEditando, nuevoPrecio: e.target.value})} style={{ width: '100px', padding: '0.4rem' }} autoFocus /> : `$ ${p.precio.toLocaleString('es-CL')}`}</td>
                                    <td style={{ padding: '1rem', textAlign: 'right' }}>{precioEditando.id === p.id ? <button onClick={() => guardarEdicionPrecio(p.id)} style={{ backgroundColor: '#059669', color: 'white', border: 'none', padding: '0.4rem 0.8rem', borderRadius: '6px', cursor: 'pointer' }}>Guardar</button> : <button onClick={() => iniciarEdicionPrecio(p)} style={{ backgroundColor: '#f1f5f9', border: '1px solid #cbd5e1', padding: '0.4rem 0.8rem', borderRadius: '6px', cursor: 'pointer' }}>Editar Precio</button>}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
}