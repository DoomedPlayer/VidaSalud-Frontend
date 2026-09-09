import { useMsal } from "@azure/msal-react";
import { useApi } from "../hooks/useApi";
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";

export default function Dashboard() {
    const { instance, accounts } = useMsal();
    const apiClient = useApi();
    const [tokenClaims, setTokenClaims] = useState(null);
    const [apiRespuesta, setApiRespuesta] = useState("");

    useEffect(() => {
        if (accounts.length > 0) {
            instance.acquireTokenSilent({
                scopes: ["user.read"],
                account: accounts[0]
            }).then((response) => {
                const base64Url = response.accessToken.split('.')[1];
                const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
                const jsonPayload = decodeURIComponent(atob(base64).split('').map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2)).join(''));
                setTokenClaims(JSON.parse(jsonPayload));
            }).catch((e) => console.error("Error obteniendo claims", e));
        }
    }, [accounts, instance]);

    const probarApi = async () => {
        try {
            const response = await apiClient.get('/posts/1');
            setApiRespuesta(JSON.stringify(response.data, null, 2));
        } catch (error) {
            setApiRespuesta("Error en la petición al servidor.");
        }
    };

    return (
        <div>
            {/* Banner Principal Estilo Clínica */}
            <div style={{ background: 'linear-gradient(135deg, #0f766e 0%, #0d9488 100%)', borderRadius: '16px', padding: '2.5rem', color: 'white', marginBottom: '2rem', boxShadow: '0 10px 15px -3px rgba(13, 148, 136, 0.2)' }}>
                <span style={{ backgroundColor: 'rgba(255,255,255,0.2)', padding: '0.3rem 0.8rem', borderRadius: '20px', fontSize: '0.8rem', fontWeight: '600', textTransform: 'uppercase' }}>Portal Médico Autorizado</span>
                <h1 style={{ margin: '0.75rem 0 0.5rem 0', fontSize: '2rem' }}>Bienvenido/a, {accounts[0]?.name}</h1>
                <p style={{ margin: 0, opacity: 0.9, fontSize: '1rem' }}>Sistema unificado de gestión clínica y control de atenciones de la red.</p>
            </div>

            {/* Accesos Rápidos (Estilo Dávila / Indisa) */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
                
                <div style={{ backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '1.5rem', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.02)' }}>
                    <h3 style={{ margin: '0 0 0.5rem 0', color: '#1e293b', fontSize: '1.1rem' }}>Gestión de Atenciones</h3>
                    <p style={{ color: '#64748b', fontSize: '0.9rem', marginBottom: '1rem' }}>Control de flujo, estados y asignación de boxes activos.</p>
                    <Link to="/appointments" style={{ color: '#0d9488', textDecoration: 'none', fontWeight: '600', fontSize: '0.9rem' }}>Ir a Atenciones →</Link>
                </div>

                <div style={{ backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '1.5rem', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.02)' }}>
                    <h3 style={{ margin: '0 0 0.5rem 0', color: '#1e293b', fontSize: '1.1rem' }}>Catálogo de Prestaciones</h3>
                    <p style={{ color: '#64748b', fontSize: '0.9rem', marginBottom: '1rem' }}>Administración centralizada de servicios y valores.</p>
                    <Link to="/catalog" style={{ color: '#0d9488', textDecoration: 'none', fontWeight: '600', fontSize: '0.9rem' }}>Ver Catálogo →</Link>
                </div>

                <div style={{ backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '1.5rem', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.02)' }}>
                    <h3 style={{ margin: '0 0 0.5rem 0', color: '#1e293b', fontSize: '1.1rem' }}>Reportería y KPIs</h3>
                    <p style={{ color: '#64748b', fontSize: '0.9rem', marginBottom: '1rem' }}>Indicadores en tiempo real de demanda y ocupación.</p>
                    <Link to="/reports" style={{ color: '#0d9488', textDecoration: 'none', fontWeight: '600', fontSize: '0.9rem' }}>Ver Reportes →</Link>
                </div>

            </div>

            {/* Credenciales y Sesión */}
            <div style={{ backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '2rem', marginBottom: '1.5rem', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.02)' }}>
                <h3 style={{ marginTop: 0, color: '#1e293b', fontSize: '1.1rem' }}>Información de Sesión y Token</h3>
                <div style={{ display: 'flex', gap: '2rem', color: '#475569', fontSize: '0.95rem', marginTop: '1rem', flexWrap: 'wrap' }}>
                    <div><strong>Correo:</strong> {accounts[0]?.username}</div>
                    <div><strong>Roles (Claims):</strong> {tokenClaims?.roles ? tokenClaims.roles.join(', ') : 'Usuario Autorizado'}</div>
                </div>
            </div>

            {/* Tarjeta de Pruebas con API Gateway */}
            <div style={{ backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '2rem', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.02)' }}>
                <h3 style={{ marginTop: 0, color: '#1e293b', fontSize: '1.1rem' }}>Simulación de Conectividad con API Gateway</h3>
                <p style={{ color: '#64748b', fontSize: '0.9rem', marginBottom: '1rem' }}>Valida la inyección automática del token Bearer hacia los microservicios.</p>
                
                <button onClick={probarApi} style={{ backgroundColor: '#0f766e', color: 'white', border: 'none', padding: '0.65rem 1.25rem', borderRadius: '8px', fontWeight: '600', cursor: 'pointer' }}>
                    Ejecutar Petición Segura
                </button>

                {apiRespuesta && (
                    <div style={{ marginTop: '1.5rem' }}>
                        <h4 style={{ marginBottom: '0.5rem', color: '#334155' }}>Respuesta del Servidor:</h4>
                        <pre style={{ backgroundColor: '#0f172a', color: '#2dd4bf', padding: '1rem', borderRadius: '8px', overflowX: 'auto', fontFamily: 'monospace', fontSize: '0.85rem' }}>
                            {apiRespuesta}
                        </pre>
                    </div>
                )}
            </div>
        </div>
    );
}