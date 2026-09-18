import { useState, useEffect } from 'react';
import { useApi } from '../hooks/useApi';

export default function Catalog() {
    const api = useApi();

    const [prestaciones, setPrestaciones] = useState([]);
    const [boxesConfig, setBoxesConfig] = useState([]);
    const [cupos, setCupos] = useState([]);
    const [boxSeleccionado, setBoxSeleccionado] = useState(null);

    const [modoNuevo, setModoNuevo] = useState(false);
    const [nuevoCupo, setNuevoCupo] = useState({ rut: '', paciente: '', hora: '08:30', especialidad: '' });

    const [isLoading, setIsLoading] = useState(true);
    const [errorBackend, setErrorBackend] = useState(false);

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
                        paciente: atencionVinculada ? atencionVinculada.pacienteId : '', 
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

    if (isLoading) return <div style={{ padding: '2rem' }}>Cargando catálogo...</div>;

    return (
        <div style={{ position: 'relative' }}>
            <div style={{ background: 'linear-gradient(135deg, #0f766e 0%, #115e59 100%)', borderRadius: '16px', padding: '2.5rem', color: 'white', marginBottom: '2rem' }}>
                <span style={{ backgroundColor: 'rgba(255,255,255,0.2)', padding: '0.3rem 0.8rem', borderRadius: '20px', fontSize: '0.8rem', fontWeight: '600' }}>Catálogo de Servicios</span>
                <h1 style={{ margin: '1rem 0 0.5rem 0', fontSize: '2.2rem' }}>Gestión de Boxes y Agendas</h1>
            </div>

            {errorBackend && (
                <div style={{ backgroundColor: '#fffbeb', borderLeft: '4px solid #f59e0b', padding: '1rem', marginBottom: '2rem', borderRadius: '0 8px 8px 0', color: '#b45309', fontWeight: '600' }}>
                    ⚠️ Problema de conexión con el backend.
                </div>
            )}

            {/* Selector de Box */}
            <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem', overflowX: 'auto', paddingBottom: '1rem' }}>
                {boxesConfig.map(box => (
                    <button 
                        key={box.id} 
                        onClick={() => {
                            setBoxSeleccionado(box);
                            setModoNuevo(false); // Cierra el form si cambias de box
                        }}
                        style={{
                            padding: '1rem 2rem', borderRadius: '12px', fontWeight: '700', fontSize: '1rem', cursor: 'pointer', border: 'none', transition: 'all 0.2s',
                            backgroundColor: boxSeleccionado?.id === box.id ? '#0f766e' : '#f1f5f9',
                            color: boxSeleccionado?.id === box.id ? 'white' : '#475569',
                            boxShadow: boxSeleccionado?.id === box.id ? '0 4px 6px -1px rgba(15, 118, 110, 0.4)' : 'none'
                        }}
                    >
                        {box.codigo}
                    </button>
                ))}
            </div>

            {boxSeleccionado && (
                <div style={{ backgroundColor: 'white', border: '1px solid #e2e8f0', borderRadius: '16px', padding: '2rem', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.02)' }}>
                    
                    {/* Controles de la Agenda */}
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
                                onChange={(e) => {
                                    setFechaSeleccionada(e.target.value);
                                    setModoNuevo(false); // Cierra el form si cambias de fecha
                                }}
                                style={{ padding: '0.6rem', borderRadius: '8px', border: '1px solid #cbd5e1' }}
                            />
                        </div>
                    </div>

                    {/* Formulario de Nueva Cita */}
                    {modoNuevo && (
                        <form onSubmit={handleCrearCita} style={{ backgroundColor: '#f8fafc', padding: '1.5rem', borderRadius: '12px', marginBottom: '2rem', border: '1px solid #e2e8f0', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', alignItems: 'end' }}>
                            <div>
                                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '600', color: '#475569', marginBottom: '0.5rem' }}>RUT Paciente</label>
                                <input required type="text" value={nuevoCupo.rut} onChange={e => setNuevoCupo({...nuevoCupo, rut: e.target.value})} placeholder="Ej: 12345678-9" style={{ width: '100%', padding: '0.6rem', borderRadius: '8px', border: '1px solid #cbd5e1' }} />
                            </div>
                            
                            <div>
                                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '600', color: '#475569', marginBottom: '0.5rem' }}>Hora Seleccionada</label>
                                <input readOnly type="text" value={`${nuevoCupo.hora} hrs`} style={{ width: '100%', padding: '0.6rem', borderRadius: '8px', border: '1px solid #cbd5e1', backgroundColor: '#e2e8f0', color: '#475569', fontWeight: '600' }} />
                            </div>
                            
                            <div>
                                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '600', color: '#475569', marginBottom: '0.5rem' }}>Prestación</label>
                                <select required value={nuevoCupo.especialidad} onChange={e => setNuevoCupo({...nuevoCupo, especialidad: e.target.value})} style={{ width: '100%', padding: '0.6rem', borderRadius: '8px', border: '1px solid #cbd5e1', backgroundColor: 'white' }}>
                                    <option value="">Seleccione...</option>
                                    {prestaciones.map(p => (
                                        <option key={p.id} value={p.nombre}>{p.nombre}</option>
                                    ))}
                                </select>
                            </div>
                            
                            <div style={{ display: 'flex', gap: '0.5rem' }}>
                                <button type="submit" style={{ flex: 1, backgroundColor: '#0f766e', color: 'white', border: 'none', padding: '0.6rem', borderRadius: '8px', fontWeight: '600', cursor: 'pointer' }}>Guardar</button>
                                <button type="button" onClick={() => setModoNuevo(false)} style={{ flex: 1, backgroundColor: 'white', color: '#64748b', border: '1px solid #cbd5e1', padding: '0.6rem', borderRadius: '8px', fontWeight: '600', cursor: 'pointer' }}>Cancelar</button>
                            </div>
                        </form>
                    )}

                    {/* Grilla de Horarios */}
                    <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.95rem' }}>
                        <thead>
                            <tr style={{ backgroundColor: '#f8fafc', borderBottom: '2px solid #e2e8f0' }}>
                                <th style={{ padding: '1rem', width: '120px' }}>Hora</th>
                                <th style={{ padding: '1rem' }}>Paciente (RUT)</th>
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
                                                <td style={{ padding: '1rem', fontWeight: '600' }}>{citaSlot.rut}</td>
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
                                                        <button onClick={() => abrirAgendamiento(hora)} style={{ backgroundColor: '#0f766e', color: 'white', border: 'none', padding: '0.4rem 1rem', borderRadius: '6px', fontWeight: '600', cursor: 'pointer', fontSize: '0.8rem' }}>
                                                            + Agendar
                                                        </button>
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
            )}
        </div>
    );
}