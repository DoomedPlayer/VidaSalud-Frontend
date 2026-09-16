import { useMsal } from "@azure/msal-react";
import { loginRequest } from "../authConfig";

export default function Login() {
    const { instance } = useMsal();

    const handleLogin = () => {
        // Redirige a la página oficial de Microsoft para iniciar sesión
        instance.loginRedirect(loginRequest).catch(e => {
            console.error(e);
        });
    };

    return (
        <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#f1f5f9' }}>
            <div style={{ backgroundColor: 'white', padding: '3rem', borderRadius: '16px', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.1)', textAlign: 'center', maxWidth: '400px', width: '90%' }}>
                
                {/* Logo / Título */}
                <div style={{ marginBottom: '2rem' }}>
                    <h1 style={{ color: '#0f766e', margin: '0 0 0.5rem 0', fontSize: '2.5rem' }}>VidaSalud</h1>
                    <p style={{ color: '#64748b', margin: 0, fontSize: '0.95rem' }}>Plataforma para gestión de atenciones</p>
                </div>

                <p style={{ color: '#334155', marginBottom: '2rem', fontSize: '0.9rem', lineHeight: '1.5' }}>
                    Acceda con sus credenciales corporativas para gestionar la red de centros de salud.
                </p>

                {/* Botón exigido por el caso */}
                <button 
                    onClick={handleLogin}
                    style={{ 
                        backgroundColor: '#0078D4', // Azul oficial de Microsoft
                        color: 'white', 
                        border: 'none', 
                        padding: '0.9rem 1.5rem', 
                        borderRadius: '8px', 
                        fontWeight: '600', 
                        fontSize: '1rem',
                        cursor: 'pointer', 
                        width: '100%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '0.75rem',
                        transition: 'background-color 0.2s',
                        boxShadow: '0 4px 6px -1px rgba(0, 120, 212, 0.3)'
                    }}
                    onMouseOver={(e) => e.target.style.backgroundColor = '#005a9e'}
                    onMouseOut={(e) => e.target.style.backgroundColor = '#0078D4'}
                >
                    <svg width="20" height="20" viewBox="0 0 21 21" xmlns="http://www.w3.org/2000/svg">
                        <path d="M10 0H0V10H10V0Z" fill="#F25022"/>
                        <path d="M21 0H11V10H21V0Z" fill="#7FBA00"/>
                        <path d="M10 11H0V21H10V11Z" fill="#00A4EF"/>
                        <path d="M21 11H11V21H21V11Z" fill="#FFB900"/>
                    </svg>
                    Iniciar sesión con Microsoft
                </button>
            </div>
        </div>
    );
}