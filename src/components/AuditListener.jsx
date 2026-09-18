import { useEffect } from 'react';
import { useMsal, useIsAuthenticated } from "@azure/msal-react";
import { useApi } from '../hooks/useApi';
import { registrarAuditoria } from '../utils/auditHelper';

export default function AuditListener() {
    const { accounts } = useMsal();
    const isAuthenticated = useIsAuthenticated();
    const api = useApi();

    useEffect(() => {
        if (isAuthenticated && accounts.length > 0) {
            const cuenta = accounts[0];
            const sessionKey = `audit_login_${cuenta.username}`;

            if (!sessionStorage.getItem(sessionKey)) {
                
                registrarAuditoria(
                    api, 
                    cuenta, 
                    "LOGIN_SUCCESS", 
                    "Auth MSAL", 
                    `El usuario ${cuenta.name} inició sesión en la plataforma.`
                ).then(() => {
                    sessionStorage.setItem(sessionKey, 'true');
                }).catch(err => {
                    console.error("No se pudo registrar la auditoría de login", err);
                });
            }
        }
    }, [isAuthenticated, accounts, api]);

    return null;
}