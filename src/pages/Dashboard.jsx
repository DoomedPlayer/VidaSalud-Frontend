import { useMsal } from "@azure/msal-react";
import { useApi } from "../hooks/useApi";
import { useState, useEffect } from "react";

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
                // Decodificamos el payload del JWT para extraer claims, roles y scopes
                const base64Url = response.accessToken.split('.')[1];
                const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
                const jsonPayload = decodeURIComponent(atob(base64).split('').map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2)).join(''));
                setTokenClaims(JSON.parse(jsonPayload));
            }).catch((e) => console.error("Error obteniendo claims del token", e));
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
            <div style={{ backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '2rem', marginBottom: '1.5rem', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.02)' }}>
                <h2 style={{ marginTop: 0, color: '#1e293b' }}>Panel de Control General</h2>
                <p style={{ color: '#64748b', marginBottom: '1.5rem' }}>Sistema unificado de gestión de atenciones de la red clínica.</p>
                
                <div style={{ display: 'flex', gap: '1.5rem', color: '#475569', fontSize: '0.95rem', borderTop: '1px solid #f1f5f9', paddingTop: '1rem', flexWrap: 'wrap' }}>
                    <div><strong>Usuario:</strong> {accounts[0]?.name}</div>
                    <div><strong>Correo:</strong> {accounts[0]?.username}</div>
                    <div><strong>Roles (Claims):</strong> {tokenClaims?.roles ? tokenClaims.roles.join(', ') : 'Usuario estándar / Autorizado'}</div>
                </div>
            </div>

            <div style={{ backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '2rem', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.02)' }}>
                <h3 style={{ marginTop: 0, color: '#1e293b' }}>Validación de Conectividad y Gateway</h3>
                <p style={{ color: '#64748b', fontSize: '0.9rem', marginBottom: '1rem' }}>Verifica la inyección automática del token Bearer hacia el backend de Nicolás.</p>
                
                <button onClick={probarApi} style={{ backgroundColor: '#0d9488', color: 'white', border: 'none', padding: '0.6rem 1.2rem', borderRadius: '8px', fontWeight: '600', cursor: 'pointer' }}>
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