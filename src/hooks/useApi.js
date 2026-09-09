import axios from 'axios';
import { useMsal } from '@azure/msal-react';
import { loginRequest } from '../authConfig';

export const useApi = () => {
    const { instance, accounts } = useMsal();

    const apiClient = axios.create({
        baseURL: 'https://jsonplaceholder.typicode.com' 
    });

    apiClient.interceptors.request.use(async (config) => {
        if (accounts.length > 0) {
            try {
                const response = await instance.acquireTokenSilent({
                    ...loginRequest,
                    account: accounts[0]
                });
                
                config.headers.Authorization = `Bearer ${response.accessToken}`;
            } catch (error) {
                console.error("Error en el interceptor obteniendo el token:", error);
            }
        }
        return config;
    }, (error) => {
        return Promise.reject(error);
    });

    return apiClient;
};