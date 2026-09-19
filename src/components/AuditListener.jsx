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

            const tokenIat = cuenta.idTokenClaims?.iat?.toString();
            const ultimaAuditoria = sessionStorage.getItem(sessionKey);

            if (ultimaAuditoria !== tokenIat) {
                console.log("Token nuevo detectado. Intentando guardar auditoría de login...");

                const roles = cuenta.idTokenClaims?.roles || [];
                const rolStr = roles.join(' ').toUpperCase();

                let mensajePersonalizado = `El usuario ${cuenta.name} inició sesión en la plataforma.`;
                
                if (rolStr.includes('ADMIN')) {
                    mensajePersonalizado = `Administrador ${cuenta.name} conectado. Acceso total a gestión y KPIs.`;
                } else if (rolStr.includes('RECEPCION') || rolStr.includes('OPERADOR')) {
                    mensajePersonalizado = `Recepcionista ${cuenta.name} en línea. Portal de admisión activado.`;
                } else if (rolStr.includes('PACIENTE') || rolStr.includes('CLIENTE')) {
                    mensajePersonalizado = `Paciente ${cuenta.name} accedió a su portal de reservas médicas.`;
                } else if (rolStr.includes('AUDITOR')) {
                    mensajePersonalizado = `Auditor ${cuenta.name} conectado. Sistema de trazabilidad en modo lectura.`;
                }

                registrarAuditoria(
                    api, 
                    cuenta, 
                    "LOGIN_SUCCESS", 
                    "Auth MSAL", 
                    mensajePersonalizado
                ).then(() => {
                    console.log("✅ Auditoría de login guardada exitosamente.");
                    sessionStorage.setItem(sessionKey, tokenIat || 'true');
                }).catch(err => {
                    console.error("❌ Falló el guardado en backend.", err);
                });
            } else {
                console.log("Auditoría ya registrada para este token (bloqueado por sessionStorage).");
            }
        }
    }, [isAuthenticated, accounts, api]);

    return null;
}