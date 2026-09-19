import { useState, useEffect } from 'react';
import { useMsal } from "@azure/msal-react";
import { useApi } from '../hooks/useApi';

export default function PatientPortal() {
    const { accounts } = useMsal();
    const api = useApi();
    
    const nombrePaciente = accounts[0]?.name?.toUpperCase() || 'PACIENTE';
    const correoPaciente = accounts[0]?.username || 'correo@dominio.com';
    
    const hoy = new Date().toISOString().split('T')[0];
    
    const [misHoras, setMisHoras] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [errorBackend, setErrorBackend] = useState(false);
    const [rutPaciente, setRutPaciente] = useState('');

    // Formulario
    const [boxes, setBoxes] = useState([]);
    const [cupos, setCupos] = useState([]);
    const [boxSeleccionado, setBoxSeleccionado] = useState('');

    const [especialidades, setEspecialidades] = useState([]);
    const [especialidad, setEspecialidad] = useState('');
    const [fechaReserva, setFechaReserva] = useState('');
    const [horaReserva, setHoraReserva] = useState('08:00');
    const horariosFijos = ['08:30', '09:00', '09:30', '10:00', '10:30', '11:00', '11:30', '12:00', '12:30', '13:00', '13:30', '14:00', '14:30', '15:00', '15:30', '16:00', '16:30', '17:00'];

    useEffect(() => {
        const fetchDatosIniciales = async () => {
            setIsLoading(true);
            setErrorBackend(false);
            try {
                const [servicesRes, atencionesRes, boxesRes, cuposRes] = await Promise.all([
                    api.get('/catalog/services'),
                    api.get('/appointments'),
                    api.get('/catalog/boxes'),
                    api.get('/catalog/cupos')
                ]);
                
                const serviciosData = servicesRes.data || [];
                const boxesData = boxesRes.data || [];
                const cuposData = cuposRes.data || [];
                setEspecialidades(serviciosData);
                setBoxes(boxesData);
                setCupos(cuposData);

                const misCitasBackend = (atencionesRes.data || [])
                    .filter(c => c.pacienteId === correoPaciente)
                    .map(c => {
                        const prestacionInfo = serviciosData.find(s => s.id === c.prestacionId);
                        
                        // Buscamos el box evaluando si viene directo en la cita, o si está dentro del cupo asociado
                        const cupoAsociado = cuposData.find(cupo => cupo.id === c.cupoId);
                        const idDelBox = c.boxId || c.box?.id || cupoAsociado?.box?.id || cupoAsociado?.boxId;
                        const boxInfo = boxesData.find(b => String(b.id) === String(idDelBox));

                        return {
                            id: c.id,
                            especialidad: prestacionInfo ? prestacionInfo.nombre : 'Consulta General',
                            medico: 'Médico Asignado', 
                            box: boxInfo ? (boxInfo.codigo || boxInfo.nombre) : 'Box Por Asignar', 
                            fecha: c.fechaCreacion ? String(c.fechaCreacion).split('T')[0] : '',
                            hora: c.fechaCreacion && String(c.fechaCreacion).includes('T') ? String(c.fechaCreacion).split('T')[1].substring(0,5) : '',
                            estado: c.estado
                        };
                    });
                
                setMisHoras(misCitasBackend);
            } catch (error) {
                console.warn("Backend no disponible. Cargando modo offline.");
                setErrorBackend(true);
            } finally {
                setIsLoading(false);
            }
        };

        fetchDatosIniciales();
    }, [api, correoPaciente]);

    const solicitarHora = async (e) => {
        e.preventDefault();
        if (!fechaReserva || !horaReserva || !especialidad || !rutPaciente) return;

        const prestacionObj = especialidades.find(p => p.nombre === especialidad);
        const boxObj = boxes.find(b => String(b.id) === String(boxSeleccionado));

        const fechaBase = fechaReserva;
        const fechaHoraInicio = `${fechaBase}T${horaReserva}:00`;
        const fechaFinObj = new Date(fechaHoraInicio);
        fechaFinObj.setMinutes(fechaFinObj.getMinutes() + 30);
        const horaFinFormat = String(fechaFinObj.getHours()).padStart(2, '0') + ':' + String(fechaFinObj.getMinutes()).padStart(2, '0');
        const fechaHoraFin = `${fechaBase}T${horaFinFormat}:00`;

        try {
            let cupoIdAsignado = 1;
            
            if (boxSeleccionado) {
                const payloadCupo = {
                    box: { id: parseInt(boxSeleccionado) },
                    fechaHoraInicio: fechaHoraInicio,
                    fechaHoraFin: fechaHoraFin,
                    disponible: false
                };
                const resCupo = await api.post('/catalog/cupos', payloadCupo);
                cupoIdAsignado = resCupo.data?.id || cupoIdAsignado;
            }

            const payloadAtencion = {
                pacienteId: correoPaciente, 
                rut: rutPaciente,               
                nombrePaciente: nombrePaciente, 
                prestacionId: prestacionObj ? prestacionObj.id : 1, 
                cupoId: cupoIdAsignado, 
                boxId: boxSeleccionado ? parseInt(boxSeleccionado) : null,
                estado: 'SOLICITADA',
                fechaCreacion: fechaHoraInicio
            };

            const res = await api.post('/appointments', payloadAtencion);
            const nuevaCita = {
                id: res.data?.id || Math.floor(Math.random() * 900) + 100,
                especialidad,
                medico: 'Médico Asignado',
                box: boxObj ? (boxObj.codigo || boxObj.nombre) : 'Box Por Asignar',
                fecha: fechaReserva,
                hora: horaReserva,
                estado: 'SOLICITADA'
            };
            setMisHoras([nuevaCita, ...misHoras]);
        } catch (error) {
            console.warn("Guardando reserva en modo offline / fallback:", error);
            const nuevaCitaLocal = { id: Math.floor(Math.random() * 900) + 100, especialidad, medico: 'Dr. Asignado', box: boxObj ? (boxObj.codigo || boxObj.nombre) : 'Box Por Asignar', fecha: fechaReserva, hora: horaReserva, estado: 'SOLICITADA' };
            setMisHoras([nuevaCitaLocal, ...misHoras]);
        }
        setFechaReserva('');
        setBoxSeleccionado('');
    };

    const anularHora = async (id) => {
        if(window.confirm('¿Anular reserva?')) {
            try {
                await api.put(`/appointments/${id}/status`, { status: 'CANCELADA' });
                setMisHoras(misHoras.map(h => h.id === id ? { ...h, estado: 'CANCELADA' } : h));
            } catch (error) {
                setMisHoras(misHoras.map(h => h.id === id ? { ...h, estado: 'CANCELADA' } : h));
            }
        }
    };

    const isHoraOcupada = (hora) => {
        if (!fechaReserva || !Array.isArray(cupos)) return false;
        return cupos.some(c => {
            if (!c || !c.fechaHoraInicio) return false;
            
            const rawDateStr = String(c.fechaHoraInicio).replace(' ', 'T');
            const parts = rawDateStr.split('T');
            const fechaCupo = parts[0] || '';
            
            // CORRECCIÓN: Validamos que parts[1] exista antes de extraer el substring
            const horaCupo = parts[1] ? parts[1].substring(0, 5) : '';
            
            const matchTime = fechaCupo === fechaReserva && horaCupo === hora;
            
            const boxIdCupo = c.box?.id !== undefined ? c.box.id : (c.boxId !== undefined ? c.boxId : c.box);
            const matchBox = boxSeleccionado ? String(boxIdCupo) === String(boxSeleccionado) : true;
            
            const noDisponible = c.disponible === false || c.disponible === 0 || c.disponible === 'false';
            
            return matchTime && matchBox && noDisponible;
        });
    };

    return (
        <div>
            <div style={{ backgroundColor: '#0284c7', borderRadius: '16px', padding: '2.5rem', color: 'white', marginBottom: '2rem', boxShadow: '0 10px 15px -3px rgba(2, 132, 199, 0.2)' }}>
                <span style={{ backgroundColor: 'rgba(255,255,255,0.2)', padding: '0.3rem 0.8rem', borderRadius: '20px', fontSize: '0.8rem', fontWeight: '600' }}>Portal de Pacientes</span>
                <h1 style={{ margin: '0.75rem 0 0.5rem 0' }}>Bienvenido/a, {nombrePaciente}</h1>
            </div>

            {errorBackend && (
                <div style={{ backgroundColor: '#fffbeb', borderLeft: '4px solid #f59e0b', padding: '1rem', marginBottom: '1.5rem', borderRadius: '0 8px 8px 0', color: '#b45309', fontSize: '0.9rem', fontWeight: '600' }}>
                    ⚠️ Sin conexión al servidor. Modo offline activado para reservas locales.
                </div>
            )}

            <div style={{ backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '16px', padding: '2rem', marginBottom: '2rem', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.02)' }}>
                <h3 style={{ marginTop: 0, marginBottom: '1.5rem' }}>Solicitar Nueva Hora Médica</h3>
                <form onSubmit={solicitarHora} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem', alignItems: 'end' }}>
                    <div><label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '600', marginBottom: '0.5rem' }}>Nombre del Paciente</label><input type="text" value={nombrePaciente} readOnly style={{ width: '100%', padding: '0.75rem', border: '1px solid #cbd5e1', borderRadius: '8px', backgroundColor: '#f1f5f9', color: '#64748b', cursor: 'not-allowed' }} /></div>
                    <div><label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '600', marginBottom: '0.5rem' }}>RUT Paciente</label><input type="text" value={rutPaciente} onChange={(e) => setRutPaciente(e.target.value)} placeholder="Ej: 12345678-9" required style={{ width: '100%', padding: '0.75rem', border: '1px solid #cbd5e1', borderRadius: '8px' }} /></div>
                    <div><label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '600', marginBottom: '0.5rem' }}>Especialidad</label><select required value={especialidad} onChange={(e) => setEspecialidad(e.target.value)} style={{ width: '100%', padding: '0.75rem', border: '1px solid #cbd5e1', borderRadius: '8px' }}><option value="">Seleccione especialidad...</option>{especialidades.map(p => (<option key={p.id} value={p.nombre}>{p.nombre}</option>))}</select></div>
                    <div><label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '600', marginBottom: '0.5rem' }}>Fecha Preferencia</label><input type="date" min={hoy} value={fechaReserva} onChange={(e) => setFechaReserva(e.target.value)} style={{ width: '100%', padding: '0.75rem', border: '1px solid #cbd5e1', borderRadius: '8px' }} required /></div>
                    <div><label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '600', marginBottom: '0.5rem' }}>Horario Preferencia</label><select value={horaReserva} onChange={(e) => setHoraReserva(e.target.value)} style={{ width: '100%', padding: '0.75rem', border: '1px solid #cbd5e1', borderRadius: '8px' }}>{horariosFijos.map(h => {const ocupada = isHoraOcupada(h);return (<option key={h} value={h} disabled={ocupada} style={{ color: ocupada ? '#94a3b8' : 'inherit', backgroundColor: ocupada ? '#f1f5f9' : 'white' }}>{h} {ocupada ? '— Ocupado' : ''}</option>);})}</select></div>
                    <div><label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '600', marginBottom: '0.5rem' }}>Box (Opcional)</label><select value={boxSeleccionado} onChange={(e) => setBoxSeleccionado(e.target.value)} style={{ width: '100%', padding: '0.75rem', border: '1px solid #cbd5e1', borderRadius: '8px' }}><option value="">Sin box específico</option>{boxes.map(b => (<option key={b.id} value={b.id}>{b.codigo || b.nombre || `Box #${b.id}`}</option>))}</select></div>
                    <div><button type="submit" style={{ backgroundColor: '#0284c7', color: 'white', border: 'none', padding: '0.8rem 1.25rem', borderRadius: '8px', fontWeight: '600', cursor: 'pointer', width: '100%' }}>Reservar Hora</button></div>
                </form>
            </div>

            <div style={{ backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '16px', padding: '2rem', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.02)' }}>
                <h3 style={{ margin: '0 0 1.5rem 0' }}>Registro de Atenciones</h3>
                {isLoading ? (
                    <div style={{ textAlign: 'center', padding: '2rem', color: '#0284c7' }}>Cargando horas médicas...</div>
                ) : (
                    <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.9rem' }}>
                        <thead><tr style={{ backgroundColor: '#f8fafc', borderBottom: '2px solid #e2e8f0' }}><th style={{ padding: '1rem' }}>ID Reserva</th><th style={{ padding: '1rem' }}>Especialidad</th><th style={{ padding: '1rem' }}>Médico Asignado</th><th style={{ padding: '1rem' }}>Box</th><th style={{ padding: '1rem' }}>Fecha y Hora</th><th style={{ padding: '1rem' }}>Estado</th><th style={{ padding: '1rem', textAlign: 'right' }}>Acciones</th></tr></thead>
                        <tbody>
                            {misHoras.map((h) => (
                                <tr key={h.id} style={{ borderBottom: '1px solid #e2e8f0' }}>
                                    <td style={{ padding: '1rem' }}>#{h.id}</td><td style={{ padding: '1rem', fontWeight: '700' }}>{h.especialidad}</td><td style={{ padding: '1rem' }}>{h.medico}</td><td style={{ padding: '1rem' }}>{h.box}</td>
                                    <td style={{ padding: '1rem' }}><div>{h.fecha}</div><div>{h.hora} hrs</div></td>
                                    <td style={{ padding: '1rem' }}>
                                        <span style={{ backgroundColor: h.estado === 'SOLICITADA' ? '#fef3c7' : (h.estado === 'CANCELADA' ? '#fee2e2' : '#d1fae5'), color: h.estado === 'SOLICITADA' ? '#d97706' : (h.estado === 'CANCELADA' ? '#ef4444' : '#059669'), padding: '0.3rem 0.8rem', borderRadius: '20px', fontWeight: '700', fontSize: '0.75rem' }}>
                                            {h.estado}
                                        </span>
                                    </td>
                                    <td style={{ padding: '1rem', textAlign: 'right' }}>
                                        {h.estado !== 'CANCELADA' && h.estado !== 'CERRADA' && (
                                            <button onClick={() => anularHora(h.id)} style={{ backgroundColor: '#ef4444', color: 'white', border: 'none', padding: '0.4rem 1rem', borderRadius: '6px', cursor: 'pointer', fontWeight: '600' }}>Anular</button>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>
        </div>
    );
}