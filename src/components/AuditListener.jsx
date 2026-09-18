import { useEffect } from 'react';
import { useMsal, useIsAuthenticated } from "@azure/msal-react";
import { useApi } from '../hooks/useApi';
import { registrarAuditoria } from '../utils/auditHelper';

export default function AuditListener() {
    const { accounts } = useMsal();
    const isAuthenticated = useIsAuthenticated();
    const api = useApi();

    useEffect(() => {
        console.log("AuditListener detectó estado:", { isAuthenticated, cuentas: accounts.length });
        if (isAuthenticated && accounts.length > 0) {
            const cuenta = accounts[0];
            const sessionKey = `audit_login_${cuenta.username}`;
            
            if (!sessionStorage.getItem(sessionKey)) {
                console.log("Intentando guardar auditoría de login...");
                
                registrarAuditoria(
                    api, 
                    cuenta, 
                    "LOGIN_SUCCESS", 
                    "Auth MSAL", 
                    `El usuario ${cuenta.name} inició sesión en la plataforma.`
                ).then(() => {
                    console.log("✅ Auditoría de login guardada exitosamente en BD.");
                    sessionStorage.setItem(sessionKey, 'true');
                }).catch(err => {
                    console.error("❌ Falló el guardado en backend. Código de error:", err.response?.status);
                    console.error("Detalle del error:", err.response?.data || err.message);
                });
            } else {
                console.log("Auditoría ya registrada para esta sesión (bloqueado por sessionStorage).");
            }
        }
    }, [isAuthenticated, accounts, api]);

    return null;
}