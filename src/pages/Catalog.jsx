import { useState } from 'react';

export default function Catalog() {
    const [prestaciones, setPrestaciones] = useState([
        { id: 1, codigo: 'MED-001', nombre: 'Consulta Medicina General', valor: '$25.000', duracion: '20 min' },
        { id: 2, codigo: 'CAR-002', nombre: 'Evaluación Cardiológica', valor: '$45.000', duracion: '30 min' },
        { id: 3, codigo: 'DEN-003', nombre: 'Urgencia Dental Preventiva', valor: '$30.000', duracion: '25 min' },
    ]);

    const [codigo, setCodigo] = useState('');
    const [nombre, setNombre] = useState('');
    const [valor, setValor] = useState('');
    const [duracion, setDuracion] = useState('20 min');

    const agregarPrestacion = (e) => {
        e.preventDefault();
        if (!codigo.trim() || !nombre.trim() || !valor.trim()) return;

        const nueva = {
            id: Date.now(),
            codigo,
            nombre,
            valor: `$${valor.replace('$', '')}`,
            duracion
        };

        setPrestaciones([nueva, ...prestaciones]);
        setCodigo('');
        setNombre('');
        setValor('');
    };

    return (
        <div>
            {/* Banner de Módulo */}
            <div style={{ background: 'linear-gradient(135deg, #0f766e 0%, #0d9488 100%)', borderRadius: '16px', padding: '2.5rem', color: 'white', marginBottom: '2rem', boxShadow: '0 10px 15px -3px rgba(13, 148, 136, 0.2)' }}>
                <span style={{ backgroundColor: 'rgba(255,255,255,0.2)', padding: '0.3rem 0.8rem', borderRadius: '20px', fontSize: '0.8rem', fontWeight: '600', textTransform: 'uppercase' }}>Administración de Red</span>
                <h1 style={{ margin: '0.75rem 0 0.5rem 0', fontSize: '2rem' }}>Catálogo de Prestaciones y Box</h1>
                <p style={{ margin: 0, opacity: 0.9, fontSize: '1rem' }}>Gestión centralizada de servicios médicos y valores referenciales.</p>
            </div>

            {/* Formulario */}
            <div style={{ backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '16px', padding: '2rem', marginBottom: '2rem', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.02)' }}>
                <h3 style={{ marginTop: 0, color: '#1e293b', fontSize: '1.2rem', marginBottom: '1rem' }}>Registrar Nueva Prestación</h3>
                <form onSubmit={agregarPrestacion} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1.25rem', alignItems: 'end' }}>
                    <div>
                        <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '600', color: '#334155', marginBottom: '0.4rem' }}>Código</label>
                        <input 
                            type="text" 
                            placeholder="Ej. PED-004" 
                            value={codigo}
                            onChange={(e) => setCodigo(e.target.value)}
                            style={{ width: '100%', padding: '0.7rem', border: '1px solid #cbd5e1', borderRadius: '8px', fontSize: '0.9rem', boxSizing: 'border-box' }}
                        />
                    </div>
                    <div>
                        <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '600', color: '#334155', marginBottom: '0.4rem' }}>Nombre del Servicio</label>
                        <input 
                            type="text" 
                            placeholder="Ej. Control Pediátrico" 
                            value={nombre}
                            onChange={(e) => setNombre(e.target.value)}
                            style={{ width: '100%', padding: '0.7rem', border: '1px solid #cbd5e1', borderRadius: '8px', fontSize: '0.9rem', boxSizing: 'border-box' }}
                        />
                    </div>
                    <div>
                        <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '600', color: '#334155', marginBottom: '0.4rem' }}>Valor Referencial</label>
                        <input 
                            type="text" 
                            placeholder="Ej. 20.000" 
                            value={valor}
                            onChange={(e) => setValor(e.target.value)}
                            style={{ width: '100%', padding: '0.7rem', border: '1px solid #cbd5e1', borderRadius: '8px', fontSize: '0.9rem', boxSizing: 'border-box' }}
                        />
                    </div>
                    <div>
                        <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '600', color: '#334155', marginBottom: '0.4rem' }}>Duración Estimada</label>
                        <select 
                            value={duracion}
                            onChange={(e) => setDuracion(e.target.value)}
                            style={{ width: '100%', padding: '0.7rem', border: '1px solid #cbd5e1', borderRadius: '8px', fontSize: '0.9rem', backgroundColor: '#fff', boxSizing: 'border-box' }}
                        >
                            <option value="15 min">15 min</option>
                            <option value="20 min">20 min</option>
                            <option value="30 min">30 min</option>
                            <option value="45 min">45 min</option>
                        </select>
                    </div>
                    <div>
                        <button type="submit" style={{ backgroundColor: '#0d9488', color: 'white', border: 'none', padding: '0.75rem 1.25rem', fontSize: '0.9rem', fontWeight: '600', borderRadius: '8px', cursor: 'pointer', width: '100%' }}>
                            Agregar al Catálogo
                        </button>
                    </div>
                </form>
            </div>

            {/* Tabla */}
            <div style={{ backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '16px', padding: '2rem', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.02)' }}>
                <h3 style={{ marginTop: 0, color: '#1e293b', fontSize: '1.2rem', marginBottom: '1.5rem' }}>Listado Oficial de Prestaciones</h3>

                <div style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.9rem' }}>
                        <thead>
                            <tr style={{ backgroundColor: '#f8fafc', color: '#334155', borderBottom: '2px solid #e2e8f0' }}>
                                <th style={{ padding: '0.85rem 1rem' }}>Código</th>
                                <th style={{ padding: '0.85rem 1rem' }}>Prestación</th>
                                <th style={{ padding: '0.85rem 1rem' }}>Valor Referencial</th>
                                <th style={{ padding: '0.85rem 1rem' }}>Duración Estimada</th>
                            </tr>
                        </thead>
                        <tbody>
                            {prestaciones.map((p) => (
                                <tr key={p.id} style={{ borderBottom: '1px solid #e2e8f0' }}>
                                    <td style={{ padding: '0.85rem 1rem' }}><code style={{ backgroundColor: '#f1f5f9', padding: '0.2rem 0.5rem', borderRadius: '6px', color: '#0f766e', fontWeight: '600' }}>{p.codigo}</code></td>
                                    <td style={{ padding: '0.85rem 1rem', fontWeight: '600', color: '#1e293b' }}>{p.nombre}</td>
                                    <td style={{ padding: '0.85rem 1rem', color: '#475569' }}>{p.valor}</td>
                                    <td style={{ padding: '0.85rem 1rem', color: '#475569' }}>{p.duracion}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}