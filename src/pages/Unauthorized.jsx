import { useNavigate } from 'react-router-dom';

export default function Unauthorized() {
    const navigate = useNavigate();

    return (
        <div style={{ textAlign: 'center', marginTop: '80px', fontFamily: 'sans-serif' }}>
            <span style={{ 
                display: 'inline-block', 
                backgroundColor: '#fee2e2', 
                color: '#991b1b', 
                padding: '6px 16px', 
                borderRadius: '20px', 
                fontWeight: '700', 
                fontSize: '0.9rem', 
                marginBottom: '1rem',
                letterSpacing: '1.5px'
            }}>
                ERROR 403
            </span>
            <h1 style={{ color: '#ef4444', fontSize: '3rem', margin: '0 0 10px 0' }}>🛑 Acceso Denegado</h1>
            <p style={{ fontSize: '1.2rem', color: '#475569', marginBottom: '30px' }}>
                No tienes los permisos necesarios para ver esta página.
            </p>
            <button 
                onClick={() => navigate('/dashboard')} 
                style={{ 
                    padding: '12px 24px', 
                    fontSize: '1rem', 
                    backgroundColor: '#0f766e', 
                    color: 'white', 
                    border: 'none', 
                    borderRadius: '6px', 
                    cursor: 'pointer', 
                    fontWeight: '600',
                    boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)'
                }}>
                Volver a la página principal
            </button>
        </div>
    );
}