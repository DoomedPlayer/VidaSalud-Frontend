import { useState } from 'react';
import { useMsal } from "@azure/msal-react";
import { Link } from 'react-router-dom';

export default function Dashboard() {
    const { accounts } = useMsal();
    
    // Extracción de datos del token
    const nombreUsuario = accounts[0]?.name?.toUpperCase() || 'USUARIO';
    const correoUsuario = accounts[0]?.username || 'correo@dominio.com';
    const userRoles = accounts[0]?.idTokenClaims?.roles || [];
    const rolesUsuario = userRoles.join(', ') || 'Sin roles asignados';

    const [apiResponse, setApiResponse] = useState(null);
    const [isLoading, setIsLoading] = useState(false);

    // Función clave: Verifica si el usuario actual tiene el rol necesario
    const tieneAcceso = (rolesPermitidos) => {
        return rolesPermitidos.some(rol => userRoles.includes(rol));
    };

    const simularPeticionSegura = () => {
        setIsLoading(true);
        setApiResponse(null);
        setTimeout(() => {
            setApiResponse({
                status: 200,
                message: 'Conexión exitosa con API Gateway',
                tokenValido: true,
                timestamp: new Date().toISOString()
            });
            setIsLoading(false);
        }, 1200);
    };

    return (
        <div style={{ position: 'relative' }}>
            {/* Banner Principal */}
            <div style={{ background: 'linear-gradient(135deg, #0f766e 0%, #0d9488 100%)', borderRadius: '16px', padding: '2.5rem', color: 'white', marginBottom: '2rem', boxShadow: '0 10px 15px -3px rgba(13, 148, 136, 0.2)' }}>
                <span style={{ backgroundColor: 'rgba(255,255,255,0.2)', padding: '0.3rem 0.8rem', borderRadius: '20px', fontSize: '0.8rem', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                    Portal Médico Autorizado
                </span>
                <h1 style={{ margin: '1rem 0 0.5rem 0', fontSize: '2.2rem', letterSpacing: '0.5px' }}>
                    Bienvenido/a, {nombreUsuario}
                </h1>
                <p style={{ margin: 0, opacity: 0.9, fontSize: '1.05rem' }}>
                    Sistema unificado de gestión clínica y control de atenciones de la red.
                </p>
            </div>

            {/* Accesos Directos Dinámicos (Grid) */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
                
                {/* Visible para Admin y Operador (Recepcionista) */}
                {tieneAcceso(['Admin', 'Operador']) && (
                    <div style={{ backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '16px', padding: '1.75rem', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.02)', display: 'flex', flexDirection: 'column' }}>
                        <h3 style={{ margin: '0 0 0.75rem 0', color: '#1e293b', fontSize: '1.15rem' }}>Gestión de Atenciones</h3>
                        <p style={{ margin: '0 0 1.5rem 0', color: '#64748b', fontSize: '0.95rem', lineHeight: '1.5', flexGrow: 1 }}>
                            Control de flujo, estados y asignación de boxes activos.
                        </p>
                        <Link to="/reception" style={{ color: '#0f766e', fontWeight: '600', textDecoration: 'none', fontSize: '0.95rem', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                            Ir a Atenciones →
                        </Link>
                    </div>
                )}

                {/* Visible para Admin y Operador (Recepcionista) */}
                {tieneAcceso(['Admin', 'Operador']) && (
                    <div style={{ backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '16px', padding: '1.75rem', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.02)', display: 'flex', flexDirection: 'column' }}>
                        <h3 style={{ margin: '0 0 0.75rem 0', color: '#1e293b', fontSize: '1.15rem' }}>Catálogo de Prestaciones</h3>
                        <p style={{ margin: '0 0 1.5rem 0', color: '#64748b', fontSize: '0.95rem', lineHeight: '1.5', flexGrow: 1 }}>
                            Administración centralizada de servicios y valores.
                        </p>
                        <Link to="/catalog" style={{ color: '#0f766e', fontWeight: '600', textDecoration: 'none', fontSize: '0.95rem', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                            Ver Catálogo →
                        </Link>
                    </div>
                )}

                {/* Visible solo para Admin */}
                {tieneAcceso(['Admin']) && (
                    <div style={{ backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '16px', padding: '1.75rem', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.02)', display: 'flex', flexDirection: 'column' }}>
                        <h3 style={{ margin: '0 0 0.75rem 0', color: '#1e293b', fontSize: '1.15rem' }}>Reportería y KPIs</h3>
                        <p style={{ margin: '0 0 1.5rem 0', color: '#64748b', fontSize: '0.95rem', lineHeight: '1.5', flexGrow: 1 }}>
                            Indicadores en tiempo real de demanda y ocupación.
                        </p>
                        <Link to="/reports" style={{ color: '#0f766e', fontWeight: '600', textDecoration: 'none', fontSize: '0.95rem', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                            Ver Reportes →
                        </Link>
                    </div>
                )}

                {/* Visible para Admin y Auditor */}
                {tieneAcceso(['Admin', 'Auditor']) && (
                    <div style={{ backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '16px', padding: '1.75rem', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.02)', display: 'flex', flexDirection: 'column', borderLeft: '4px solid #0284c7' }}>
                        <h3 style={{ margin: '0 0 0.75rem 0', color: '#1e293b', fontSize: '1.15rem' }}>Auditoría de Eventos</h3>
                        <p style={{ margin: '0 0 1.5rem 0', color: '#64748b', fontSize: '0.95rem', lineHeight: '1.5', flexGrow: 1 }}>
                            Registro de seguridad y trazabilidad clínico-administrativa.
                        </p>
                        <Link to="/audit" style={{ color: '#0f766e', fontWeight: '600', textDecoration: 'none', fontSize: '0.95rem', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                            Ir a Auditoría →
                        </Link>
                    </div>
                )}

                {/* Visible solo para Paciente (Cliente) */}
                {tieneAcceso(['Cliente']) && (
                    <div style={{ backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '16px', padding: '1.75rem', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.02)', display: 'flex', flexDirection: 'column', borderLeft: '4px solid #059669' }}>
                        <h3 style={{ margin: '0 0 0.75rem 0', color: '#1e293b', fontSize: '1.15rem' }}>Mi Portal de Paciente</h3>
                        <p style={{ margin: '0 0 1.5rem 0', color: '#64748b', fontSize: '0.95rem', lineHeight: '1.5', flexGrow: 1 }}>
                            Agende y revise sus horas médicas en la red.
                        </p>
                        <Link to="/patient-portal" style={{ color: '#0f766e', fontWeight: '600', textDecoration: 'none', fontSize: '0.95rem', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                            Entrar al Portal →
                        </Link>
                    </div>
                )}
            </div>

            {/* Información de Sesión */}
            <div style={{ backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '16px', padding: '1.75rem', marginBottom: '1.5rem', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.02)' }}>
                <h3 style={{ margin: '0 0 1.25rem 0', color: '#1e293b', fontSize: '1.15rem' }}>Información de Sesión y Token</h3>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '2rem' }}>
                    <div>
                        <span style={{ fontWeight: '600', color: '#334155', fontSize: '0.95rem' }}>Correo: </span>
                        <span style={{ color: '#64748b', fontSize: '0.95rem' }}>{correoUsuario}</span>
                    </div>
                    <div>
                        <span style={{ fontWeight: '600', color: '#334155', fontSize: '0.95rem' }}>Roles (Claims): </span>
                        <span style={{ color: '#0f766e', fontSize: '0.95rem', fontWeight: '700', backgroundColor: '#ccfbf1', padding: '0.2rem 0.6rem', borderRadius: '4px' }}>
                            {rolesUsuario}
                        </span>
                    </div>
                </div>
            </div>

            {/* Simulación API Gateway */}
            <div style={{ backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '16px', padding: '1.75rem', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.02)' }}>
                <h3 style={{ margin: '0 0 0.75rem 0', color: '#1e293b', fontSize: '1.15rem' }}>Simulación de Conectividad con API Gateway</h3>
                <p style={{ margin: '0 0 1.5rem 0', color: '#64748b', fontSize: '0.95rem' }}>
                    Valida la inyección automática del token Bearer hacia los microservicios.
                </p>
                
                <button 
                    onClick={simularPeticionSegura}
                    disabled={isLoading}
                    style={{ 
                        backgroundColor: isLoading ? '#94a3b8' : '#0f766e', 
                        color: 'white', 
                        border: 'none', 
                        padding: '0.75rem 1.5rem', 
                        borderRadius: '8px', 
                        fontWeight: '600', 
                        cursor: isLoading ? 'not-allowed' : 'pointer',
                        transition: 'background-color 0.2s',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem'
                    }}
                >
                    {isLoading ? 'Conectando...' : 'Ejecutar Petición Segura'}
                </button>

                {apiResponse && (
                    <div style={{ marginTop: '1.5rem', padding: '1rem', backgroundColor: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '8px', color: '#166534', fontSize: '0.9rem', fontFamily: 'monospace', animation: 'fadeIn 0.3s ease-in-out' }}>
                        <div><strong>Status:</strong> {apiResponse.status} OK</div>
                        <div><strong>Message:</strong> {apiResponse.message}</div>
                        <div><strong>Bearer Token:</strong> Validado por Spring Security</div>
                        <div style={{ fontSize: '0.8rem', color: '#15803d', marginTop: '0.5rem' }}>{apiResponse.timestamp}</div>
                    </div>
                )}
            </div>

            <style>{`
                @keyframes fadeIn {
                    from { opacity: 0; transform: translateY(-5px); }
                    to { opacity: 1; transform: translateY(0); }
                }
            `}</style>
        </div>
    );
}