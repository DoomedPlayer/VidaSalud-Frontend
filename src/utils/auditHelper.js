export const registrarAuditoria = async (api, cuenta, accion, modulo, detalles) => {
    if (!cuenta) return;
    
    const payload = {
        usuarioId: cuenta.username, 
        accion: accion,            
        entidadId: modulo,
        detalles: detalles,
        fechaHora: new Date().toISOString().substring(0, 19),
        origenIp: 'Frontend React'  
    };

    try {
        await api.post('/audit/event', payload);
    } catch (error) {
        console.error("Fallo al registrar auditoría (silenciado para no bloquear al usuario)", error);
    }
};