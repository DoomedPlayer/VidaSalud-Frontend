import { BrowserRouter as Router, Routes, Route, Navigate, Link } from "react-router-dom";
import { useMsal, AuthenticatedTemplate, UnauthenticatedTemplate } from "@azure/msal-react";
import { loginRequest } from "./authConfig";
import Dashboard from "./pages/Dashboard";
import Appointments from "./pages/Appointments";
import Catalog from "./pages/Catalog";
import Reports from "./pages/Reports";
import Audit from "./pages/Audit";
import PatientPortal from "./pages/PatientPortal";
import ReceptionistPortal from "./pages/ReceptionistPortal";
import logo from "./assets/logo.png";

function App() {
  const { instance } = useMsal();

  const handleLogin = () => {
    instance.loginRedirect(loginRequest);
  };

  const handleLogout = () => {
    instance.logoutRedirect({ postLogoutRedirectUri: "/" });
  };

  return (
    <Router>
      <div style={{ backgroundColor: '#f8fafc', minHeight: '100vh', fontFamily: 'system-ui, sans-serif', color: '#1e293b', margin: 0 }}>
        
        <AuthenticatedTemplate>
          <header style={{ backgroundColor: '#ffffff', borderBottom: '1px solid #e2e8f0', padding: '0 2.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', height: '85px', boxShadow: '0 2px 4px rgba(0,0,0,0.02)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '2.5rem' }}>
              <div style={{ display: 'flex', alignItems: 'center' }}>
                {/* Logo configurado a 80px */}
                <img src={logo} alt="VidaSalud Logo" style={{ height: '80px', width: 'auto', objectFit: 'contain' }} />
              </div>
              <nav style={{ display: 'flex', gap: '1.2rem', flexWrap: 'wrap' }}>
                <Link to="/dashboard" style={{ textDecoration: 'none', color: '#334155', fontWeight: '600', fontSize: '0.9rem' }}>Dashboard</Link>
                <Link to="/appointments" style={{ textDecoration: 'none', color: '#64748b', fontWeight: '500', fontSize: '0.9rem' }}>Atenciones</Link>
                <Link to="/reception" style={{ textDecoration: 'none', color: '#0f766e', fontWeight: '600', fontSize: '0.9rem' }}>Recepción</Link>
                <Link to="/catalog" style={{ textDecoration: 'none', color: '#64748b', fontWeight: '500', fontSize: '0.9rem' }}>Catálogo</Link>
                <Link to="/reports" style={{ textDecoration: 'none', color: '#64748b', fontWeight: '500', fontSize: '0.9rem' }}>Reportería</Link>
                <Link to="/audit" style={{ textDecoration: 'none', color: '#64748b', fontWeight: '500', fontSize: '0.9rem' }}>Auditoría</Link>
                <Link to="/patient-portal" style={{ textDecoration: 'none', color: '#0284c7', fontWeight: '600', fontSize: '0.9rem' }}>Portal Paciente</Link>
              </nav>
            </div>
            <div>
              <button onClick={handleLogout} style={{ backgroundColor: '#f1f5f9', color: '#475569', border: '1px solid #cbd5e1', padding: '0.5rem 1rem', borderRadius: '8px', fontWeight: '600', cursor: 'pointer', fontSize: '0.85rem' }}>
                Cerrar Sesión
              </button>
            </div>
          </header>
        </AuthenticatedTemplate>

        <main style={{ maxWidth: '1280px', margin: '2.5rem auto', padding: '0 1.5rem' }}>
          <Routes>
            <Route path="/" element={
              <>
                <AuthenticatedTemplate>
                  <Navigate to="/dashboard" />
                </AuthenticatedTemplate>
                
                <UnauthenticatedTemplate>
                  <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '75vh' }}>
                    <div style={{ backgroundColor: '#ffffff', padding: '3rem', borderRadius: '16px', border: '1px solid #e2e8f0', textAlign: 'center', maxWidth: '440px', width: '100%', boxShadow: '0 10px 25px -5px rgba(0,0,0,0.05)' }}>
                      <img src={logo} alt="VidaSalud Logo" style={{ height: '70px', width: 'auto', margin: '0 auto 1.5rem auto', objectFit: 'contain' }} />
                      <h2 style={{ color: '#0f172a', marginBottom: '0.5rem', fontSize: '1.5rem' }}>Portal Clínico Institucional</h2>
                      <p style={{ color: '#64748b', fontSize: '0.95rem', marginBottom: '2rem' }}>
                        Acceso seguro unificado para profesionales, recepción y pacientes.
                      </p>
                      <button onClick={handleLogin} style={{ backgroundColor: '#0d9488', color: 'white', border: 'none', padding: '0.8rem', width: '100%', borderRadius: '10px', fontWeight: '600', cursor: 'pointer', fontSize: '1rem' }}>
                        Iniciar sesión con Microsoft
                      </button>
                    </div>
                  </div>
                </UnauthenticatedTemplate>
              </>
            } />
            
            <Route path="/dashboard" element={<AuthenticatedTemplate><Dashboard /></AuthenticatedTemplate>} />
            <Route path="/appointments" element={<AuthenticatedTemplate><Appointments /></AuthenticatedTemplate>} />
            <Route path="/reception" element={<AuthenticatedTemplate><ReceptionistPortal /></AuthenticatedTemplate>} />
            <Route path="/catalog" element={<AuthenticatedTemplate><Catalog /></AuthenticatedTemplate>} />
            <Route path="/reports" element={<AuthenticatedTemplate><Reports /></AuthenticatedTemplate>} />
            <Route path="/audit" element={<AuthenticatedTemplate><Audit /></AuthenticatedTemplate>} />
            <Route path="/patient-portal" element={<AuthenticatedTemplate><PatientPortal /></AuthenticatedTemplate>} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;