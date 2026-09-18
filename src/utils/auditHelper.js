export const registrarAuditoria = async (api, cuenta, accion, modulo, detalles) => {
    if (!cuenta) return;
    
    const payload = {
        usuarioId: cuenta.username, 
        accion: accion,            
        entidadId: modulo,
        detalles: detalles,
        fechaHora: new Date().toISOString(),
        origenIp: 'Frontend React'  
    };

    console.log("Enviando evento de auditoría...", payload);

    const response = await api.post('/audit', payload);
    return response;
};