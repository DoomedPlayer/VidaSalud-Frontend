import { useState, useEffect } from 'react';
import { useApi } from '../hooks/useApi';

export default function Reports() {
    const api = useApi();
    
    const [kpis, setKpis] = useState({
        atencionesHoy: 0,
        variacionAtenciones: "Cálculo en vivo",
        tiempoEspera: 0,
        estadoEspera: "Minutos en promedio",
        boxesOperativos: 0,
        totalBoxes: 0,
        estadoBoxes: "Sincronizando..."
    });
    const [topServices, setTopServices] = useState([]);
    
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [lastUpdate, setLastUpdate] = useState(new Date().toLocaleTimeString());
    const [errorBackend, setErrorBackend] = useState(false);

    const fetchDatos = async () => {
        setIsRefreshing(true);
        setErrorBackend(false);
        try {
            const [appointmentsRes, catalogServicesRes, boxesRes, cuposRes] = await Promise.all([
                api.get('/appointments'),
                api.get('/catalog/services'),
                api.get('/catalog/boxes'),
                api.get('/catalog/cupos')
            ]);

            const appointmentsData = Array.isArray(appointmentsRes.data) ? appointmentsRes.data : [];
            const catalogoData = Array.isArray(catalogServicesRes.data) ? catalogServicesRes.data : [];
            const boxesData = Array.isArray(boxesRes.data) ? boxesRes.data : [];
            const cuposData = Array.isArray(cuposRes.data) ? cuposRes.data : [];

            const now = new Date();
            const fechaHoyStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;

            // Enriquecer atenciones con la fecha del cupo asociado
            const appointmentsWithCupo = appointmentsData.map(a => {
                const cupo = cuposData.find(c => c.id === a.cupoId);
                return {
                    ...a,
                    fechaCupoStr: cupo?.fechaHoraInicio ? String(cupo.fechaHoraInicio).substring(0, 10) : ''
                };
            });

            // Declaración segura de atencionesHoyList
            const atencionesHoyList = appointmentsWithCupo.filter(a => a.fechaCupoStr === fechaHoyStr);
            const atencionesCerradas = atencionesHoyList.filter(a => a.estado === 'CERRADA' || a.estado === 'CERRADO').length;

            // Filtrar pendientes/en espera de HOY para el tiempo de espera real
            const atencionesEnEsperaHoy = atencionesHoyList.filter(a => 
                a.estado === 'EN_ESPERA' || a.estado === 'CONFIRMADA' || a.estado === 'SOLICITADA'
            );

            let calculatedWaitTime = 0;
            if (atencionesEnEsperaHoy.length > 0) {
                const totalDiffMinutes = atencionesEnEsperaHoy.reduce((acc, curr) => {
                    const created = curr.fechaCreacion ? new Date(curr.fechaCreacion) : now;
                    const diffMin = Math.max(0, (now - created) / 60000);
                    return acc + diffMin;
                }, 0);
                calculatedWaitTime = Math.round(totalDiffMinutes / atencionesEnEsperaHoy.length);
            }

            const totalBoxesCount = boxesData.length || 3;
            setKpis({
                atencionesHoy: atencionesHoyList.length,
                variacionAtenciones: `Cerradas: ${atencionesCerradas}`,
                tiempoEspera: calculatedWaitTime,
                estadoEspera: "Minutos en promedio",
                boxesOperativos: totalBoxesCount,
                totalBoxes: totalBoxesCount,
                estadoBoxes: "Operativos"
            });

            // Mapeo de demanda por servicios
            const paletaColores = ['#0f766e', '#0284c7', '#059669', '#d97706', '#8b5cf6', '#e11d48'];
            const conteoPorServicio = {};
            appointmentsData.forEach(item => {
                conteoPorServicio[item.prestacionId] = (conteoPorServicio[item.prestacionId] || 0) + 1;
            });

            const totalSolicitudes = appointmentsData.length || 1;
            const mappedServices = catalogoData.map((serv, index) => {
                const count = conteoPorServicio[serv.id] || 0;
                const porcentajeCalc = Math.round((count / totalSolicitudes) * 100);
                return {
                    nombre: serv.nombre,
                    porcentaje: porcentajeCalc,
                    color: paletaColores[index % paletaColores.length]
                };
            });

            setTopServices(mappedServices.length > 0 ? mappedServices : [
                { nombre: 'Sin atenciones registradas', porcentaje: 0, color: '#94a3b8' }
            ]);

            setLastUpdate(new Date().toLocaleTimeString());
        } catch (error) {
            console.error("Error sincronizando reportes:", error);
            setErrorBackend(true);
            setLastUpdate(new Date().toLocaleTimeString() + " (Error de Red)");
        } finally {
            setIsRefreshing(false);
        }
    };

    useEffect(() => {
        fetchDatos();
    }, []);

    // --- DATOS DE RESPALDO (Si el backend de Nicolás está apagado) ---
    const displayKpis = kpis || {
        atencionesHoy: 148, variacionAtenciones: "+12% vs. ayer",
        tiempoEspera: 15, estadoEspera: "Minutos en promedio", // Valor de respaldo fijado en 15 minutos
        boxesOperativos: 18, totalBoxes: 20, estadoBoxes: "2 en mantención"
    };

    const displayServices = topServices || [
        { nombre: 'Medicina General', porcentaje: 45, color: '#0f766e' },
        { nombre: 'Cardiología', porcentaje: 25, color: '#0284c7' },
        { nombre: 'Pediatría', porcentaje: 20, color: '#059669' },
        { nombre: 'Urgencia Dental', porcentaje: 10, color: '#d97706' }
    ];

    return (
        <div style={{ position: 'relative' }}>
            <div style={{ background: 'linear-gradient(135deg, #0f766e 0%, #115e59 100%)', borderRadius: '16px', padding: '2.5rem', color: 'white', marginBottom: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
                <div>
                    <span style={{ backgroundColor: 'rgba(255,255,255,0.2)', padding: '0.3rem 0.8rem', borderRadius: '20px', fontSize: '0.8rem', fontWeight: '600', textTransform: 'uppercase' }}>Analítica Cloud</span>
                    <h1 style={{ margin: '1rem 0 0.5rem 0', fontSize: '2.2rem' }}>Panel de Reportería y KPIs</h1>
                    <p style={{ margin: 0, opacity: 0.9, fontSize: '1.05rem' }}>Indicadores en tiempo real sobre la demanda y el flujo asistencial de la red.</p>
                </div>
                <div>
                    <button onClick={fetchDatos} disabled={isRefreshing} style={{ backgroundColor: 'rgba(255,255,255,0.2)', color: 'white', border: '1px solid rgba(255,255,255,0.4)', padding: '0.6rem 1.2rem', borderRadius: '8px', fontWeight: '600', cursor: isRefreshing ? 'not-allowed' : 'pointer' }}>
                        {isRefreshing ? '↻ Actualizando...' : '↻ Refrescar Datos'}
                    </button>
                    <div style={{ fontSize: '0.75rem', opacity: 0.8, textAlign: 'right', marginTop: '0.4rem' }}>Última act: {lastUpdate}</div>
                </div>
            </div>

            {errorBackend && (
                <div style={{ backgroundColor: '#fffbeb', borderLeft: '4px solid #f59e0b', padding: '1rem', marginBottom: '2rem', borderRadius: '0 8px 8px 0', color: '#b45309', fontSize: '0.9rem', fontWeight: '600' }}>
                    ⚠️ Backend no detectado. Mostrando datos de simulación para propósitos de interfaz.
                </div>
            )}

            {/* Tarjetas de KPIs */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
                <div style={{ backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '16px', padding: '2rem', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.02)' }}>
                    <span style={{ color: '#64748b', fontSize: '0.85rem', fontWeight: '700', textTransform: 'uppercase' }}>Atenciones Hoy</span>
                    <div style={{ fontSize: '3rem', fontWeight: '800', color: '#0f766e' }}>{displayKpis.atencionesHoy}</div>
                    <span style={{ color: '#059669', fontSize: '0.9rem', fontWeight: '600' }}>{displayKpis.variacionAtenciones}</span>
                </div>
                <div style={{ backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '16px', padding: '2rem', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.02)' }}>
                    <span style={{ color: '#64748b', fontSize: '0.85rem', fontWeight: '700', textTransform: 'uppercase' }}>Tiempo de Espera Promedio</span>
                    <div style={{ fontSize: '3rem', fontWeight: '800', color: '#1e293b' }}>{displayKpis.tiempoEspera} min</div>
                    <span style={{ color: '#0284c7', fontSize: '0.9rem', fontWeight: '600' }}>{displayKpis.estadoEspera}</span>
                </div>
                <div style={{ backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '16px', padding: '2rem', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.02)' }}>
                    <span style={{ color: '#64748b', fontSize: '0.85rem', fontWeight: '700', textTransform: 'uppercase' }}>Boxes Operativos</span>
                    <div style={{ fontSize: '3rem', fontWeight: '800', color: '#1e293b' }}>{displayKpis.boxesOperativos} / {displayKpis.totalBoxes}</div>
                    <span style={{ color: '#d97706', fontSize: '0.9rem', fontWeight: '600' }}>{displayKpis.estadoBoxes}</span>
                </div>
            </div>

            {/* Gráfico de Barras */}
            <div style={{ backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '16px', padding: '2rem', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.02)' }}>
                <h3 style={{ margin: '0 0 2rem 0', color: '#1e293b', fontSize: '1.25rem' }}>Distribución de Atenciones por Especialidad</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                    {displayServices.map((servicio, index) => (
                        <div key={index}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                                <span style={{ fontSize: '0.95rem', color: '#334155', fontWeight: '600' }}>{servicio.nombre}</span>
                                <span style={{ fontSize: '0.95rem', color: '#64748b', fontWeight: '700' }}>{servicio.porcentaje}%</span>
                            </div>
                            <div style={{ width: '100%', backgroundColor: '#f1f5f9', borderRadius: '8px', height: '12px', overflow: 'hidden' }}>
                                <div style={{ width: `${servicio.porcentaje}%`, backgroundColor: servicio.color || '#0f766e', height: '100%', borderRadius: '8px', transition: 'width 1s ease-in-out' }}></div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}