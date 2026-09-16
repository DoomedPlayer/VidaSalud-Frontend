import axios from 'axios';
import { useMsal } from '@azure/msal-react';
import { loginRequest } from '../authConfig';

const API_BASE_URL = 'http://localhost:8080/api/bff'; // <-- Ajustado al controlador de Nicolás 

export const useApi = () => {
    const { instance, accounts } = useMsal();

    // Creamos la instancia de Axios
    const apiClient = axios.create({
        baseURL: API_BASE_URL,
    });

    // Interceptor: Se ejecuta ANTES de que la petición salga de React
    apiClient.interceptors.request.use(
        async (config) => {
            if (accounts.length > 0) {
                try {
                    // Pedimos el token de forma silenciosa (sin abrir ventanas)
                    const response = await instance.acquireTokenSilent({
                        ...loginRequest,
                        account: accounts[0]
                    });
                    
                    // Inyectamos el JWT de Azure en la cabecera
                    config.headers.Authorization = `Bearer ${response.accessToken}`;
                } catch (error) {
                    console.error("Error al obtener el token de acceso", error);
                }
            }
            return config;
        },
        (error) => {
            return Promise.reject(error);
        }
    );

    return apiClient;
};