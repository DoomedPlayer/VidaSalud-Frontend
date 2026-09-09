import { BrowserRouter as Router, Routes, Route, Navigate, Link } from "react-router-dom";
import { useMsal, AuthenticatedTemplate, UnauthenticatedTemplate } from "@azure/msal-react";
import { loginRequest } from "./authConfig";
import Dashboard from "./pages/Dashboard";
import Appointments from "./pages/Appointments";
import Catalog from "./pages/Catalog";
import Reports from "./pages/Reports";
import Audit from "./pages/Audit";
import './App.css';

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
      <div className="App">
        {/* Barra de Navegación Global (Solo visible si está autenticado) */}
        <AuthenticatedTemplate>
          <nav style={{ display: 'flex', gap: '15px', padding: '15px', backgroundColor: '#333', marginBottom: '20px' }}>
            <Link to="/dashboard" style={{ color: 'white', textDecoration: 'none' }}>Dashboard</Link>
            <Link to="/appointments" style={{ color: 'white', textDecoration: 'none' }}>Atenciones</Link>
            <Link to="/catalog" style={{ color: 'white', textDecoration: 'none' }}>Catálogo</Link>
            <Link to="/reports" style={{ color: 'white', textDecoration: 'none' }}>Reportería</Link>
            <Link to="/audit" style={{ color: 'white', textDecoration: 'none' }}>Auditoría</Link>
            <div style={{ marginLeft: 'auto' }}>
              <button onClick={handleLogout} style={{ padding: '5px 10px' }}>Cerrar Sesión</button>
            </div>
          </nav>
        </AuthenticatedTemplate>

        <Routes>
          {/* Ruta Pública */}
          <Route path="/" element={
            <>
              <AuthenticatedTemplate>
                <Navigate to="/dashboard" />
              </AuthenticatedTemplate>
              
              <UnauthenticatedTemplate>
                <h1>Caso VidaSalud</h1>
                <button onClick={handleLogin}>Iniciar sesión con Microsoft</button>
              </UnauthenticatedTemplate>
            </>
          } />
          
          {/* Rutas Privadas */}
          <Route path="/dashboard" element={<AuthenticatedTemplate><Dashboard /></AuthenticatedTemplate>} />
          <Route path="/appointments" element={<AuthenticatedTemplate><Appointments /></AuthenticatedTemplate>} />
          <Route path="/catalog" element={<AuthenticatedTemplate><Catalog /></AuthenticatedTemplate>} />
          <Route path="/reports" element={<AuthenticatedTemplate><Reports /></AuthenticatedTemplate>} />
          <Route path="/audit" element={<AuthenticatedTemplate><Audit /></AuthenticatedTemplate>} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;