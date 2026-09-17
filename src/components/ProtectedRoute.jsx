import { Navigate } from 'react-router-dom';
import { useMsal, useIsAuthenticated } from '@azure/msal-react';

export default function ProtectedRoute({ children, allowedRoles }) {
    const isAuthenticated = useIsAuthenticated();
    const { accounts } = useMsal();

    // 1. Si no está logueado, lo mandamos directo al Login
    if (!isAuthenticated) {
        return <Navigate to="/login" replace />;
    }

    // 2. Extraemos los roles del token JWT de Azure (o un array vacío si no tiene)
    const userRoles = accounts[0]?.idTokenClaims?.roles || [];

    // 3. Verificamos si el usuario tiene al menos UNO de los roles permitidos para esta vista
    const tieneAcceso = allowedRoles.some(rol => userRoles.includes(rol));

    if (!tieneAcceso) {
        // Si está logueado pero no tiene el rol (ej: un Paciente intentando entrar a Auditoría)
        // lo devolvemos al Dashboard para que no vea pantallas bloqueadas.
        return <Navigate to="/dashboard" replace />;
    }

    // Si pasó todas las pruebas, renderizamos la vista que solicitó
    return children;
}