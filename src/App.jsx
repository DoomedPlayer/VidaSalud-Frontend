import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { useMsal, AuthenticatedTemplate, UnauthenticatedTemplate } from "@azure/msal-react";
import { loginRequest } from "./authConfig";
import Dashboard from "./pages/Dashboard";
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
        {/* Barra de navegación superior */}
        <nav style={{ display: 'flex', justifyContent: 'flex-end', padding: '10px' }}>
          <AuthenticatedTemplate>
            <button onClick={handleLogout}>Cerrar Sesión</button>
          </AuthenticatedTemplate>
        </nav>

        {/* Configuración de Rutas (Pantallas) */}
        <Routes>
          {/* Ruta Pública: Login */}
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
          
          {/* Ruta Privada (Guard): Dashboard */}
          <Route path="/dashboard" element={
            <AuthenticatedTemplate>
              <Dashboard />
            </AuthenticatedTemplate>
          } />
        </Routes>
      </div>
    </Router>
  );
}

export default App;