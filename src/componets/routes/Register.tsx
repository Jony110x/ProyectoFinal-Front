import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

interface User {
  id?: number;
  username?: string;
  type?: "admin" | "estudiante" | "profesor";
}

// Componente Toast
const Toast = ({ message, type }: { message: string; type: "success" | "error" | "warning" }) => {
  return (
    <motion.div
      className={`fixed top-4 right-4 z-50 px-6 py-3 rounded-lg shadow-lg font-medium ${
        type === "success" 
          ? "bg-green-500 text-white" 
          : type === "error"
          ? "bg-red-500 text-white"
          : type === "warning"
          ? "bg-yellow-500 text-white"
          : "bg-blue-500 text-white"
      }`}
      initial={{ opacity: 0, x: 100 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 100 }}
      transition={{ duration: 0.3 }}
    >
      {message}
    </motion.div>
  );
};

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

  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState("");
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState<{ type: "success" | "error" | "warning"; text: string } | null>(null);

  const navigate = useNavigate();

  const showToast = (text: string, type: "success" | "error" | "warning") => {
    setToast({ text, type });
    setTimeout(() => setToast(null), 1000); // 1 segundo
  };

  useEffect(() => {
    const storedToken = localStorage.getItem("token");
    const storedUser = localStorage.getItem("user");

    if (storedToken) setToken(storedToken);

    if (storedUser && storedUser !== "undefined") {
      try {
        setUser(JSON.parse(storedUser));
      } catch {
        showToast("❌ Error al obtener datos del usuario", "error");
      }
    } else {
      showToast("❌ No hay datos de usuario disponibles", "error");
    }

    setLoading(false);
  }, []);

  useEffect(() => {
    if (!loading && (!user || user.type !== "admin")) {
       showToast("❌ No tienes permisos para acceder a esta sección", "error");
    }
  }, [user, loading]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!token) {
      showToast("❌ Token no disponible. Iniciá sesión de nuevo", "error");
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
         showToast("✅ Usuario registrado exitosamente", "success");

        setTimeout(() => {
          navigate("/usuarios");
        }, 1500);

      } else {
         showToast("❌ Erro desconocido al registrar", "error");
      }
    } catch (error: any) {
      const detail = error?.response?.data?.detail;
      if (detail?.includes("usuario")) {
        showToast("⚠️ El nombre de usuario ya está en uso", "warning");
      } else if (detail?.includes("email")) {
        showToast("⚠️ El email ya está registrado", "warning");
      } else if (detail?.includes("DNI")) {
        showToast("⚠️ El DNI ya existe", "warning");
      } else {
        showToast("❌ Erro al registrar el usuario", "error");
      }
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center text-lg text-gray-600">Cargando...</div>
      </div>
    );
  }

  if (!user || user.type !== "admin") {
    return (
      <motion.div
        className="w-full px-4 sm:px-6 bg-white rounded-lg shadow"
        initial={{ opacity: 0, x: -50 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
      > 
      
        <div className="p-6 text-center">
          <h3 className="text-lg sm:text-xl font-semibold text-red-600 mb-4">Acceso Denegado</h3>
          <p className="text-gray-600">Solo los administradores pueden acceder a esta sección.</p>
          <button
            onClick={() => navigate("/dashboard")}
            className="mt-4 bg-teal-600 hover:bg-teal-700 text-white py-2 px-6 rounded-md transition-colors"
          >
            Volver al Dashboard
          </button>
        </div>
      </motion.div>
    );
  }

  const formFields = [
    { name: "username", label: "Usuario:", type: "text" },
    { name: "password", label: "Contraseña:", type: "password" },
    { name: "dni", label: "DNI:", type: "text" },
    { name: "firstName", label: "Nombre:", type: "text" },
    { name: "lastName", label: "Apellido:", type: "text" },
    { name: "email", label: "Email:", type: "email" },
  ];

  return (
    <>
    {toast && <Toast message={toast.text} type={toast.type} />}
    <motion.div
      className="w-full px-4 sm:px-6 bg-white rounded-lg shadow"
      initial={{ opacity: 0, x: -50 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
    >
      <div className="min-h-screen bg-gradient-to-br from-teal-50 to-white flex justify-center items-start py-8">
        <form
          onSubmit={handleSubmit}
          className="bg-white p-4 sm:p-6 md:p-8 rounded-xl shadow-2xl w-full max-w-4xl mx-auto"
        >
          <h2 className="text-xl sm:text-2xl font-bold text-center text-teal-700 mb-6">
            Registrar Usuario
          </h2>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
            {formFields.map((field) => (
              <div key={field.name} className="flex flex-col">
                <label 
                  htmlFor={field.name} 
                  className="text-sm font-medium text-gray-700 mb-2"
                >
                  {field.label}
                </label>
                <input
                  type={field.type}
                  id={field.name}
                  name={field.name}
                  value={formData[field.name as keyof typeof formData]}
                  onChange={handleChange}
                  required
                  className="w-full border border-gray-300 rounded-md px-3 py-2 sm:py-3 focus:ring-2 focus:ring-teal-500 focus:border-teal-500 focus:outline-none transition-colors text-sm sm:text-base"
                  placeholder={`Ingrese ${field.label.toLowerCase()}`}
                />
              </div>
            ))}

            <div className="flex flex-col lg:col-span-2">
              <label 
                htmlFor="type" 
                className="text-sm font-medium text-gray-700 mb-2"
              >
                Tipo de usuario:
              </label>
              <select
                id="type"
                name="type"
                value={formData.type}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-md px-3 py-2 sm:py-3 focus:ring-2 focus:ring-teal-500 focus:border-teal-500 focus:outline-none transition-colors text-sm sm:text-base"
              >
                <option value="estudiante">Estudiante</option>
                <option value="profesor">Profesor</option>
              </select>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row justify-between items-center gap-3 sm:gap-4 mt-6 sm:mt-8">
            <button
              type="submit"
              className="w-full sm:w-auto bg-teal-600 hover:bg-teal-700 text-white py-2 sm:py-3 px-6 rounded-md shadow-md transition-colors font-medium text-sm sm:text-base"
            >
              Registrar Usuario
            </button>
            <button
              type="button"
              onClick={() => navigate("/usuarios")}
              className="w-full sm:w-auto bg-gray-500 hover:bg-gray-600 text-white py-2 sm:py-3 px-6 rounded-md shadow-md transition-colors font-medium text-sm sm:text-base"
            >
              Cancelar
            </button>
          </div>

          {/* Información adicional para móvil */}
          <div className="mt-4 sm:hidden text-xs text-gray-500 text-center">
            <p>Completá todos los campos para registrar un nuevo usuario</p>
          </div>
        </form>
      </div>
    </motion.div>
    </>
  );
};

export default RegistroUsuario;