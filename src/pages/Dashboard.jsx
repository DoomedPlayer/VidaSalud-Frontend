import { useState } from 'react';
import { useMsal } from "@azure/msal-react";
import { Link } from 'react-router-dom';
import { useApi } from '../hooks/useApi';

export default function Dashboard() {
    const { accounts } = useMsal();
    
    const nombreUsuario = accounts[0]?.name?.toUpperCase() || 'USUARIO';
    const correoUsuario = accounts[0]?.username || 'correo@dominio.com';
    const userRoles = accounts[0]?.idTokenClaims?.roles || [];
    const rolesUsuario = userRoles.join(', ') || 'Sin roles asignados';

    const api = useApi();
    const [apiResponse, setApiResponse] = useState(null);
    const [isLoading, setIsLoading] = useState(false);

    const tieneAcceso = (rolesPermitidos) => {
        return rolesPermitidos.some(rol => userRoles.includes(rol));
    };

    const simularPeticionSegura = async () => {
        setIsLoading(true);
        setApiResponse(null);
        
        try {
            // Apuntamos al endpoint real que Nicolás creó para los KPIs
            const response = await api.get('/report/kpis/today');
            
            setApiResponse({
                status: response.status,
                message: 'Conexión exitosa con el Backend real',
                data: JSON.stringify(response.data),
                timestamp: new Date().toISOString()
            });
        } catch (error) {
            setApiResponse({
                status: error.response?.status || 500,
                message: error.message || 'Error al conectar con API Gateway',
                timestamp: new Date().toISOString()
            });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div style={{ position: 'relative' }}>
            <div style={{ background: 'linear-gradient(135deg, #0f766e 0%, #0d9488 100%)', borderRadius: '16px', padding: '2.5rem', color: 'white', marginBottom: '2rem', boxShadow: '0 10px 15px -3px rgba(13, 148, 136, 0.2)' }}>
                <span style={{ backgroundColor: 'rgba(255,255,255,0.2)', padding: '0.3rem 0.8rem', borderRadius: '20px', fontSize: '0.8rem', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Portal Médico Autorizado</span>
                <h1 style={{ margin: '1rem 0 0.5rem 0', fontSize: '2.2rem', letterSpacing: '0.5px' }}>Bienvenido/a, {nombreUsuario}</h1>
                <p style={{ margin: 0, opacity: 0.9, fontSize: '1.05rem' }}>Sistema unificado de gestión clínica y control de atenciones de la red.</p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
                
                {/* AQUI SE CAMBIARON LOS ARREGLOS DE ROLES */}
                {tieneAcceso(['Admin', 'Recepcionista']) && (
                    <div style={{ backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '16px', padding: '1.75rem', display: 'flex', flexDirection: 'column' }}>
                        <h3 style={{ margin: '0 0 0.75rem 0', color: '#1e293b' }}>Gestión de Atenciones</h3>
                        <p style={{ margin: '0 0 1.5rem 0', color: '#64748b', flexGrow: 1 }}>Control de flujo, estados y asignación de boxes activos.</p>
                        <Link to="/reception" style={{ color: '#0f766e', fontWeight: '600', textDecoration: 'none' }}>Ir a Atenciones →</Link>
                    </div>
                )}

                {tieneAcceso(['Admin', 'Recepcionista']) && (
                    <div style={{ backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '16px', padding: '1.75rem', display: 'flex', flexDirection: 'column' }}>
                        {/* Se actualizó el nombre de la tarjeta en la siguiente línea */}
                        <h3 style={{ margin: '0 0 0.75rem 0', color: '#1e293b' }}>Gestión de box y prestaciones</h3>
                        <p style={{ margin: '0 0 1.5rem 0', color: '#64748b', flexGrow: 1 }}>Administración centralizada de servicios y valores.</p>
                        <Link to="/catalog" style={{ color: '#0f766e', fontWeight: '600', textDecoration: 'none' }}>Ver Catálogo →</Link>
                    </div>
                )}

                {tieneAcceso(['Admin']) && (
                    <div style={{ backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '16px', padding: '1.75rem', display: 'flex', flexDirection: 'column' }}>
                        <h3 style={{ margin: '0 0 0.75rem 0', color: '#1e293b' }}>Reportería y KPIs</h3>
                        <p style={{ margin: '0 0 1.5rem 0', color: '#64748b', flexGrow: 1 }}>Indicadores en tiempo real de demanda y ocupación.</p>
                        <Link to="/reports" style={{ color: '#0f766e', fontWeight: '600', textDecoration: 'none' }}>Ver Reportes →</Link>
                    </div>
                )}

                {tieneAcceso(['Admin', 'Auditor']) && (
                    <div style={{ backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '16px', padding: '1.75rem', display: 'flex', flexDirection: 'column', borderLeft: '4px solid #0284c7' }}>
                        <h3 style={{ margin: '0 0 0.75rem 0', color: '#1e293b' }}>Auditoría de Eventos</h3>
                        <p style={{ margin: '0 0 1.5rem 0', color: '#64748b', flexGrow: 1 }}>Registro de seguridad y trazabilidad clínico-administrativa.</p>
                        <Link to="/audit" style={{ color: '#0f766e', fontWeight: '600', textDecoration: 'none' }}>Ir a Auditoría →</Link>
                    </div>
                )}

                {tieneAcceso(['Paciente']) && (
                    <div style={{ backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '16px', padding: '1.75rem', display: 'flex', flexDirection: 'column', borderLeft: '4px solid #059669' }}>
                        <h3 style={{ margin: '0 0 0.75rem 0', color: '#1e293b' }}>Mi Portal de Paciente</h3>
                        <p style={{ margin: '0 0 1.5rem 0', color: '#64748b', flexGrow: 1 }}>Agende y revise sus horas médicas en la red.</p>
                        <Link to="/patient-portal" style={{ color: '#0f766e', fontWeight: '600', textDecoration: 'none' }}>Entrar al Portal →</Link>
                    </div>
                )}
            </div>

            {/* Información de Sesión */}
            <div style={{ backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '16px', padding: '1.75rem', marginBottom: '1.5rem' }}>
                <h3 style={{ margin: '0 0 1.25rem 0', color: '#1e293b' }}>Información de Sesión y Token</h3>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '2rem' }}>
                    <div><span style={{ fontWeight: '600' }}>Correo: </span><span style={{ color: '#64748b' }}>{correoUsuario}</span></div>
                    <div><span style={{ fontWeight: '600' }}>Roles (Claims): </span><span style={{ color: '#0f766e', fontWeight: '700', backgroundColor: '#ccfbf1', padding: '0.2rem 0.6rem', borderRadius: '4px' }}>{rolesUsuario}</span></div>
                </div>
            </div>

            {/* Simulación API Gateway */}
            <div style={{ backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '16px', padding: '1.75rem' }}>
                <h3 style={{ margin: '0 0 0.75rem 0', color: '#1e293b' }}>Simulación de Conectividad con API Gateway</h3>
                <button onClick={simularPeticionSegura} disabled={isLoading} style={{ backgroundColor: isLoading ? '#94a3b8' : '#0f766e', color: 'white', border: 'none', padding: '0.75rem 1.5rem', borderRadius: '8px', fontWeight: '600', cursor: isLoading ? 'not-allowed' : 'pointer' }}>
                    {isLoading ? 'Conectando...' : 'Ejecutar Petición Segura'}
                </button>
                {apiResponse && (
                    <div style={{ marginTop: '1.5rem', padding: '1rem', backgroundColor: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '8px', color: '#166534', fontFamily: 'monospace' }}>
                        <div><strong>Status:</strong> {apiResponse.status} OK</div>
                        <div><strong>Message:</strong> {apiResponse.message}</div>
                        <div><strong>Bearer Token:</strong> Validado por Spring Security</div>
                    </div>
                )}
            </div>
        </div>
    );
}