import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

interface User {
  id?: number;
  username?: string;
  type?: "admin" | "estudiante" | "profesor";
}

const RegistroUsuario: React.FC = () => {
  const [formData, setFormData] = useState({
    username: "",
    password: "",
    dni: "",
    firstName: "",
    lastName: "",
    email: "",
    type: "estudiante",
  });

  const [mensaje, setMensaje] = useState<string | null>(null);
  const [mensajeTipo, setMensajeTipo] = useState<"success" | "error">("success");
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState("");
  const [loading, setLoading] = useState(true);

  const navigate = useNavigate();

  useEffect(() => {
    const storedToken = localStorage.getItem("token");
    const storedUser = localStorage.getItem("user");

    if (storedToken) setToken(storedToken);

    if (storedUser && storedUser !== "undefined") {
      try {
        setUser(JSON.parse(storedUser));
      } catch {
        setMensaje("Error al obtener datos del usuario");
        setMensajeTipo("error");
      }
    } else {
      setMensaje("No hay datos de usuario disponibles");
      setMensajeTipo("error");
    }

    setLoading(false);
  }, []);

  useEffect(() => {
    if (!loading && (!user || user.type !== "admin")) {
      setMensaje("No tienes permisos para acceder a esta sección");
      setMensajeTipo("error");
    }
  }, [user, loading]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!token) {
      setMensaje("Token no disponible. Iniciá sesión de nuevo.");
      setMensajeTipo("error");
      return;
    }

    try {
      const res = await axios.post("https://proyectofinal-backend-1-uqej.onrender.com/users/new", formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (res.data.detail === "Usuario agregado correctamente") {
        setMensaje("Usuario registrado exitosamente");
        setMensajeTipo("success");

        setTimeout(() => {
          navigate("/usuarios");
        }, 1500);

      } else {
        setMensaje(res.data.detail || "Error desconocido al registrar");
        setMensajeTipo("error");
      }
    } catch (error: any) {
      const detail = error?.response?.data?.detail;
      if (detail?.includes("usuario")) {
        setMensaje("El nombre de usuario ya está en uso.");
      } else if (detail?.includes("email")) {
        setMensaje("El email ya está registrado.");
      } else if (detail?.includes("DNI")) {
        setMensaje("El DNI ya existe.");
      } else {
        setMensaje("Error al registrar el usuario.");
      }

      setMensajeTipo("error");
    }
  };

  if (loading) return <div className="text-center mt-10">Cargando...</div>;

  if (!user || user.type !== "admin") {
    return (
      <div className="p-6 text-center">
        <h3 className="text-lg font-semibold">Acceso Denegado</h3>
        <p className="text-red-600">{mensaje}</p>
        <p>Solo los administradores pueden acceder a esta sección.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 to-white flex justify-center items-start pt-0 py-12 px-4">
      <form
        onSubmit={handleSubmit}
        className="bg-white p-8 rounded-xl shadow-2xl w-full max-w-6xl"
      >
        <h2 className="text-2xl font-bold text-center text-teal-700 mb-6">Registrar Usuario</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {[{ name: "username", label: "Usuario:" },
            { name: "password", label: "Contraseña:", type: "password" },
            { name: "dni", label: "DNI:" },
            { name: "firstName", label: "Nombre:" },
            { name: "lastName", label: "Apellido:" },
            { name: "email", label: "Email:", type: "email" },
          ].map((field) => (
            <div key={field.name} className="flex flex-col">
              <label htmlFor={field.name} className="text-sm font-medium text-gray-700 mb-1">
                {field.label}
              </label>
              <input
                type={field.type || "text"}
                id={field.name}
                name={field.name}
                value={formData[field.name as keyof typeof formData]}
                onChange={handleChange}
                required
                className="border rounded-md px-3 py-2 focus:ring-2 focus:ring-teal-500 focus:outline-none bg-gray-200"
              />
            </div>
          ))}

          <div className="flex flex-col">
            <label htmlFor="type" className="text-sm font-medium text-gray-700 mb-1">
              Tipo de usuario:
            </label>
            <select
              id="type"
              name="type"
              value={formData.type}
              onChange={handleChange}
              className="border rounded-md px-3 py-2 focus:ring-2 focus:ring-teal-500 focus:outline-none bg-gray-200"
            >
              <option value="estudiante">Estudiante</option>
              <option value="profesor">Profesor</option>
            </select>
          </div>
        </div>

        <div className="flex flex-col md:flex-row justify-between items-center gap-4 mt-8">
          <button
            type="submit"
            className="w-full md:w-auto bg-teal-600 hover:bg-teal-700 text-white py-2 px-6 rounded shadow-md transition"
          >
            Registrar
          </button>
          <button
            type="button"
            onClick={() => navigate("/usuarios")}
            className="w-full md:w-auto bg-gray-500 hover:bg-gray-700 text-white py-2 px-6 rounded shadow-md transition"
          >
            Cancelar
          </button>
        </div>

        {mensaje && (
          <div
            className={`mt-6 text-center text-sm font-medium p-3 rounded ${
              mensajeTipo === "success" ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
            }`}
          >
            {mensaje}
          </div>
        )}
      </form>
    </div>
  );
};

export default RegistroUsuario;

