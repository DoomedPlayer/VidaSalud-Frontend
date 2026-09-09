import { BrowserRouter as Router, Routes, Route, Navigate, Link } from "react-router-dom";
import { useMsal, AuthenticatedTemplate, UnauthenticatedTemplate } from "@azure/msal-react";
import { loginRequest } from "./authConfig";
import Dashboard from "./pages/Dashboard";
import Appointments from "./pages/Appointments";
import Catalog from "./pages/Catalog";
import Reports from "./pages/Reports";
import Audit from "./pages/Audit";
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
          <header style={{ backgroundColor: '#ffffff', borderBottom: '1px solid #e2e8f0', padding: '0 2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', height: '70px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '2rem' }}>
              <img src={logo} alt="VidaSalud Logo" style={{ height: '38px', width: 'auto', objectFit: 'contain' }} />
              <nav style={{ display: 'flex', gap: '1.5rem' }}>
                <Link to="/dashboard" style={{ textDecoration: 'none', color: '#475569', fontWeight: '500' }}>Dashboard</Link>
                <Link to="/appointments" style={{ textDecoration: 'none', color: '#475569', fontWeight: '500' }}>Atenciones</Link>
                <Link to="/catalog" style={{ textDecoration: 'none', color: '#475569', fontWeight: '500' }}>Catálogo</Link>
                <Link to="/reports" style={{ textDecoration: 'none', color: '#475569', fontWeight: '500' }}>Reportería</Link>
                <Link to="/audit" style={{ textDecoration: 'none', color: '#475569', fontWeight: '500' }}>Auditoría</Link>
              </nav>
            </div>
            <div>
              <button onClick={handleLogout} style={{ backgroundColor: '#f1f5f9', color: '#475569', border: 'none', padding: '0.5rem 1rem', borderRadius: '6px', fontWeight: '600', cursor: 'pointer' }}>
                Cerrar Sesión
              </button>
            </div>
          </header>
        </AuthenticatedTemplate>

        <main style={{ maxWidth: '1200px', margin: '2rem auto', padding: '0 1.5rem' }}>
          <Routes>
            <Route path="/" element={
              <>
                <AuthenticatedTemplate>
                  <Navigate to="/dashboard" />
                </AuthenticatedTemplate>
                
                <UnauthenticatedTemplate>
                  <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '70vh' }}>
                    <div style={{ backgroundColor: '#ffffff', padding: '2.5rem', borderRadius: '12px', border: '1px solid #e2e8f0', textAlign: 'center', maxWidth: '400px', width: '100%', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.02)' }}>
                      <img src={logo} alt="VidaSalud Logo" style={{ height: '50px', width: 'auto', margin: '0 auto 1.2rem auto', objectFit: 'contain' }} />
                      <h2 style={{ color: '#1e293b', marginBottom: '0.5rem' }}>Portal Clínico</h2>
                      <p style={{ color: '#64748b', fontSize: '0.9rem', marginBottom: '1.5rem' }}>
                        Inicie sesión con sus credenciales institucionales de Microsoft para acceder.
                      </p>
                      <button onClick={handleLogin} style={{ backgroundColor: '#0d9488', color: 'white', border: 'none', padding: '0.75rem', width: '100%', borderRadius: '8px', fontWeight: '600', cursor: 'pointer' }}>
                        Iniciar sesión con Microsoft
                      </button>
                    </div>
                  </div>
                </UnauthenticatedTemplate>
              </>
            } />
            
            <Route path="/dashboard" element={<AuthenticatedTemplate><Dashboard /></AuthenticatedTemplate>} />
            <Route path="/appointments" element={<AuthenticatedTemplate><Appointments /></AuthenticatedTemplate>} />
            <Route path="/catalog" element={<AuthenticatedTemplate><Catalog /></AuthenticatedTemplate>} />
            <Route path="/reports" element={<AuthenticatedTemplate><Reports /></AuthenticatedTemplate>} />
            <Route path="/audit" element={<AuthenticatedTemplate><Audit /></AuthenticatedTemplate>} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;