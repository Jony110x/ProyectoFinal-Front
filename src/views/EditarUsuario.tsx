import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { FaEnvelope, FaLock, FaUserEdit, FaTimes } from "react-icons/fa";
import { motion } from "framer-motion";

export default function EditarUsuario() {
  const [form, setForm] = useState({
    id: "",
    username: "",
    password: "",
    confirmPassword: "",
    email: ""
  });

  const [message, setMessage] = useState<{ text: string; color: string } | null>(null);
  const [showModal, setShowModal] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const userRaw = localStorage.getItem("user");

    if (userRaw) {
      try {
        const user = JSON.parse(userRaw);
        if (user.id && user.username && user.email) {
          setForm((prev) => ({
            ...prev,
            id: user.id.toString(),
            username: user.username,
            email: user.email
          }));
        }
      } catch {
        setMessage({ text: "Error cargando el usuario", color: "red" });
        setTimeout(() => setMessage(null), 4000);
      }
    } else {
      setMessage({ text: "Usuario no logueado", color: "red" });
      setTimeout(() => setMessage(null), 4000);
    }
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (form.password !== form.confirmPassword) {
      setMessage({ text: "Las contraseñas no coinciden", color: "red" });
      setTimeout(() => setMessage(null), 4000);
      return;
    }

    setShowModal(true);
  };

  const confirmarActualizacion = async () => {
    setShowModal(false);

    try {
      await axios.put("https://proyectofinal-backend-1-uqej.onrender.com/update-profile", {
        id: parseInt(form.id),
        username: form.username,
        password: form.password,
        email: form.email
      });

      setMessage({ text: "Usuario actualizado con éxito", color: "green" });
      setTimeout(() => setMessage(null), 4000);

      const user = JSON.parse(localStorage.getItem("user") || "{}");
      user.email = form.email;
      localStorage.setItem("user", JSON.stringify(user));
    } catch (error: any) {
      const detail = error.response?.data?.detail || "Error al actualizar usuario";
      setMessage({ text: detail, color: "red" });
      setTimeout(() => setMessage(null), 4000);
    }
  };

  return (
    <motion.div
      className="w-full px-4 sm:px-6 bg-white rounded-lg shadow"
      initial={{ opacity: 0, x: -50 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 50 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
    >
      <div className="min-h-screen bg-gray-100 flex items-start justify-center py-8">
        <div className="bg-white shadow-lg rounded-xl p-4 sm:p-8 w-full max-w-md">
          <div className="flex items-center justify-center mb-6 text-teal-700">
            <FaUserEdit className="text-2xl sm:text-3xl mr-2" />
            <h2 className="text-xl sm:text-2xl font-bold">Editar mi usuario</h2>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                <FaEnvelope className="inline mr-1 text-teal-600" /> Email
              </label>
              <input
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-teal-500 text-sm sm:text-base"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                <FaLock className="inline mr-1 text-teal-600" /> Nueva contraseña
              </label>
              <input
                type="password"
                name="password"
                value={form.password}
                onChange={handleChange}
                className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-teal-500 text-sm sm:text-base"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                <FaLock className="inline mr-1 text-teal-600" /> Confirmar contraseña
              </label>
              <input
                type="password"
                name="confirmPassword"
                value={form.confirmPassword}
                onChange={handleChange}
                className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-teal-500 text-sm sm:text-base"
                required
              />
            </div>

            <div className="flex flex-col sm:flex-row justify-between gap-2 mt-6">
              <button
                type="button"
                onClick={() => navigate("/profile")}
                className="w-full sm:w-auto bg-gray-300 hover:bg-gray-400 text-gray-800 font-semibold py-2 px-4 rounded flex items-center justify-center text-sm sm:text-base"
              >
                <FaTimes className="mr-2" /> Cancelar
              </button>

              <button
                type="submit"
                className="w-full sm:w-auto bg-teal-600 hover:bg-teal-700 text-white font-semibold py-2 px-4 rounded text-sm sm:text-base"
              >
                Actualizar
              </button>
            </div>
          </form>

          {message && (
            <div className={`mt-4 text-sm font-semibold text-center ${
              message.color === 'green' ? 'text-green-600' : 'text-red-600'
            }`}>
              {message.text}
            </div>
          )}
        </div>

        {/* Modal */}
        {showModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
            <div className="bg-white p-6 rounded-xl shadow-xl w-full max-w-sm">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">¿Confirmar actualización?</h3>
              <p className="text-sm text-gray-600 mb-6">
                ¿Estás seguro de que querés actualizar tus datos?
              </p>
              <div className="flex flex-col sm:flex-row justify-end gap-2">
                <button
                  className="w-full sm:w-auto bg-gray-300 hover:bg-gray-400 text-gray-800 py-2 px-4 rounded text-sm"
                  onClick={() => setShowModal(false)}
                >
                  Cancelar
                </button>
                <button
                  className="w-full sm:w-auto bg-teal-600 hover:bg-teal-700 text-white py-2 px-4 rounded text-sm"
                  onClick={confirmarActualizacion}
                >
                  Confirmar
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );
}
