import { useEffect } from 'react';
import { useMsal } from "@azure/msal-react";
import { EventType } from "@azure/msal-browser";
import { useApi } from '../hooks/useApi';
import { registrarAuditoria } from '../utils/auditHelper';

export default function AuditListener() {
    const { instance } = useMsal();
    const api = useApi();

    useEffect(() => {
        const callbackId = instance.addEventCallback((event) => {
            if (event.eventType === EventType.LOGIN_SUCCESS && event.payload?.account) {
                const cuenta = event.payload.account;
                registrarAuditoria(
                    api, 
                    cuenta, 
                    "LOGIN_SUCCESS", 
                    "Auth MSAL", 
                    `El usuario ${cuenta.name} inició sesión en la plataforma desde ${cuenta.username}.`
                );
            }
        });

        return () => {
            if (callbackId) instance.removeEventCallback(callbackId);
        };
    }, [instance, api]);

    return null; 
}