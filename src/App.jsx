import { useMsal, AuthenticatedTemplate, UnauthenticatedTemplate } from "@azure/msal-react";
import { loginRequest } from "./authConfig";
import './App.css';

function App() {
  const { instance, accounts } = useMsal();

  // Cambiamos a Redirect para evitar los bloqueos de popup
  const handleLogin = () => {
    instance.loginRedirect(loginRequest).catch(e => {
      console.error(e);
    });
  };

  // El cierre de sesión también lo pasamos a Redirect
  const handleLogout = () => {
    instance.logoutRedirect({
      postLogoutRedirectUri: "/",
    });
  };

  return (
    <div className="App">
      <h1>Caso VidaSalud</h1>
      
      {/* Todo lo que esté aquí dentro SOLO se verá si el token es válido */}
      <AuthenticatedTemplate>
        <h2>Bienvenido, {accounts[0]?.name}</h2>
        <button onClick={handleLogout}>Cerrar Sesión</button>
      </AuthenticatedTemplate>

      {/* Todo lo que esté aquí dentro SOLO se verá si el usuario no ha iniciado sesión */}
      <UnauthenticatedTemplate>
        <button onClick={handleLogin}>Iniciar sesión con Microsoft</button>
      </UnauthenticatedTemplate>
    </div>
  )
}

export default App;