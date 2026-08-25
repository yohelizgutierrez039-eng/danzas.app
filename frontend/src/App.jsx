import { useEffect, useState } from "react";

function App() {
    const [usuarios, setUsuarios] = useState([]);

    useEffect(() => {
        fetch("http://localhost:3000/api/usuarios")
            .then((respuesta) => respuesta.json())
            .then((datos) => {
                setUsuarios(datos);
            })
            .catch((error) => {
                console.error("Error:", error);
            });
    }, []);

    return (
        <div>
            <h1>Usuarios</h1>

            {usuarios.map((usuario) => (
                <div key={usuario.id}>
                    <h3>{usuario.nombre}</h3>
                    <p>{usuario.correo}</p>
                </div>
            ))}
        </div>
    );
}

export default App;