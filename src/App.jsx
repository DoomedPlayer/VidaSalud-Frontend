import { BrowserRouter as Router, Routes, Route, Navigate, useLocation, useNavigate, Link } from 'react-router-dom';
import { useIsAuthenticated, useMsal } from '@azure/msal-react';

import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import ReceptionistPortal from './pages/ReceptionistPortal';
import PatientPortal from './pages/PatientPortal';
import Catalog from './pages/Catalog';
import Reports from './pages/Reports';
import Audit from './pages/Audit';
import ProtectedRoute from './components/ProtectedRoute';

// Importamos el logo oficial
import logo from './assets/logo.png'; 

// --- COMPONENTE DE BARRA SUPERIOR ---
function TopBar() {
    const isAuthenticated = useIsAuthenticated();
    const { instance } = useMsal();
    const location = useLocation();
    const navigate = useNavigate();

    // No mostramos la barra superior si no está logueado o está en el Login
    if (!isAuthenticated || location.pathname === '/login') return null;

    const handleLogout = () => {
        instance.logoutRedirect({ postLogoutRedirectUri: "/" });
    };

    return (
        <nav style={{ backgroundColor: '#ffffff', borderBottom: '1px solid #e2e8f0', padding: '1rem 2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.02)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
                
                {/* Logo interactivo -> Devuelve al menú principal */}
                <Link to="/dashboard" style={{ display: 'flex', alignItems: 'center', textDecoration: 'none', color: '#0f766e', fontWeight: '800', fontSize: '1.4rem', gap: '0.5rem', letterSpacing: '-0.5px' }}>
                    <img src={logo} alt="Logo" style={{ height: '35px', objectFit: 'contain' }} onError={(e) => e.target.style.display = 'none'} />
                    VidaSalud
                </Link>
                
                {/* Botón Volver -> Aparece solo si NO estamos en el Dashboard */}
                {location.pathname !== '/dashboard' && (
                    <button onClick={() => navigate(-1)} style={{ backgroundColor: '#f8fafc', color: '#475569', border: '1px solid #cbd5e1', padding: '0.4rem 0.8rem', borderRadius: '6px', fontWeight: '600', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.9rem', transition: 'all 0.2s' }}>
                        ← Volver atrás
                    </button>
                )}
            </div>

            {/* Botón Cerrar Sesión (Vital para MSAL) */}
            <button onClick={handleLogout} style={{ backgroundColor: '#ef4444', color: 'white', border: 'none', padding: '0.5rem 1rem', borderRadius: '6px', fontWeight: '600', cursor: 'pointer', fontSize: '0.9rem' }}>
                Cerrar Sesión
            </button>
        </nav>
    );
}

// --- APLICACIÓN PRINCIPAL ---
export default function App() {
    const isAuthenticated = useIsAuthenticated();
    const { inProgress } = useMsal(); 

    if (inProgress !== 'none') {
        return (
            <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#f1f5f9' }}>
                <h3 style={{ color: '#0f766e', fontFamily: 'sans-serif' }}>Procesando autenticación con Microsoft...</h3>
            </div>
        );
    }

    return (
        <Router>
            <div style={{ minHeight: '100vh', backgroundColor: '#f8fafc', display: 'flex', flexDirection: 'column' }}>
                
                {/* Barra de Navegación Global */}
                <TopBar />
                
                {/* Contenedor central para recuperar la estética de la pantalla */}
                <div style={{ maxWidth: '1200px', width: '100%', margin: '0 auto', padding: '0 2rem 2rem 2rem', boxSizing: 'border-box' }}>
                    <Routes>
                        <Route path="/login" element={isAuthenticated ? <Navigate to="/dashboard" replace /> : <Login />} />
                        
                        <Route path="/dashboard" element={<ProtectedRoute allowedRoles={['Admin', 'Recepcionista', 'Paciente', 'Auditor']}><Dashboard /></ProtectedRoute>} />
                        <Route path="/reception" element={<ProtectedRoute allowedRoles={['Admin', 'Recepcionista']}><ReceptionistPortal /></ProtectedRoute>} />
                        <Route path="/patient-portal" element={<ProtectedRoute allowedRoles={['Paciente']}><PatientPortal /></ProtectedRoute>} />
                        <Route path="/catalog" element={<ProtectedRoute allowedRoles={['Admin', 'Recepcionista']}><Catalog /></ProtectedRoute>} />
                        <Route path="/reports" element={<ProtectedRoute allowedRoles={['Admin']}><Reports /></ProtectedRoute>} />
                        <Route path="/audit" element={<ProtectedRoute allowedRoles={['Admin', 'Auditor']}><Audit /></ProtectedRoute>} />

                        <Route path="*" element={<Navigate to={isAuthenticated ? "/dashboard" : "/login"} replace />} />
                    </Routes>
                </div>
            </div>
        </Router>
    );
}