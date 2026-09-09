import { useMsal } from "@azure/msal-react";
import { useApi } from "../hooks/useApi";
import { useState } from "react";

export default function Dashboard() {
    const { accounts } = useMsal();
    const apiClient = useApi(); // Llamamos a nuestro interceptor de Axios
    const [apiRespuesta, setApiRespuesta] = useState("");

    // Función para probar la conexión a la API
    const probarApi = async () => {
        try {
            // Hacemos una petición GET. El interceptor inyectará el Token automáticamente.
            const response = await apiClient.get('/posts/1');
            setApiRespuesta(JSON.stringify(response.data, null, 2));
        } catch (error) {
            console.error("Error llamando a la API", error);
            setApiRespuesta("Error en la petición.");
        }
    };

    return (
        <div style={{ padding: '20px', textAlign: 'left' }}>
            <h2>Dashboard - Caso VidaSalud</h2>
            <p><strong>Usuario activo:</strong> {accounts[0]?.name}</p>
            <p><strong>Correo:</strong> {accounts[0]?.username}</p>
            
            <div style={{ marginTop: '30px' }}>
                <h3>Prueba de Interceptor (API Gateway Simulado)</h3>
                {/* Aquí está el botón que nos faltaba */}
                <button onClick={probarApi} style={{ padding: '10px', cursor: 'pointer' }}>
                    Hacer petición a la API
                </button>

                {apiRespuesta && (
                    <div style={{ marginTop: '20px', padding: '15px', backgroundColor: '#242424', borderRadius: '8px' }}>
                        <h4>Respuesta de la API:</h4>
                        <pre style={{ fontSize: '12px', textAlign: 'left' }}>{apiRespuesta}</pre>
                    </div>
                )}
            </div>
        </div>
    );
}