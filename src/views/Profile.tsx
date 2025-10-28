import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

function Profile() {
  const user = JSON.parse(localStorage.getItem("user") || "{}");

  const userName = user.firstName;
  const lastName = user.lastName;
  const type = user.type;
  const dni = user.dni;
  const email = user.email;

  const navigate = useNavigate();

  return (
    <motion.div
      className="w-full px-4 sm:px-6 bg-white rounded-lg shadow"
      initial={{ opacity: 0, x: -50 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 50 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
    >
      <div className="min-h-screen bg-gray-100 py-4 sm:py-8">
        {/* Título */}
        <h1 className="text-xl sm:text-2xl font-bold text-teal-700 mb-4 text-center">
          Perfil del Usuario
        </h1>

        <div className="bg-white p-4 sm:p-6 rounded-lg shadow-xl w-full max-w-md mx-auto">
          {/* Datos del perfil */}
          <div className="space-y-3 text-gray-800 text-sm mb-6">
            <div className="bg-gray-50 px-4 py-2 rounded border border-gray-200">
              <strong className="text-teal-600 block">Nombre:</strong>{" "}
              {userName}
            </div>

            <div className="bg-gray-50 px-4 py-2 rounded border border-gray-200">
              <strong className="text-teal-600 block">Apellido:</strong>{" "}
              {lastName}
            </div>

            <div className="bg-gray-50 px-4 py-2 rounded border border-gray-200">
              <strong className="text-teal-600 block">DNI:</strong> {dni}
            </div>

            <div className="bg-gray-50 px-4 py-2 rounded border border-gray-200">
              <strong className="text-teal-600 block">Email:</strong> {email}
            </div>

            <div className="bg-gray-50 px-4 py-2 rounded border border-gray-200">
              <strong className="text-teal-600 block">Tipo de usuario:</strong>{" "}
              {type}
            </div>
          </div>

          {/* Botones de acción */}
          <div className="flex flex-col sm:flex-row justify-between gap-2">
            <button
              onClick={() => navigate("/dashboard")}
              className="w-full sm:w-auto bg-gray-300 hover:bg-gray-400 text-gray-800 font-semibold py-2 px-4 rounded text-sm sm:text-base"
            >
              Volver
            </button>
            <button
              onClick={() => navigate("/editar-usuario")}
              className="w-full sm:w-auto bg-teal-600 hover:bg-teal-700 text-white font-semibold py-2 px-4 rounded text-sm sm:text-base"
            >
              Editar Usuario
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

export default Profile;