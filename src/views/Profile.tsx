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
      className="mx-auto p-0 bg-white rounded-lg shadow mt-0"
      initial={{ opacity: 0, x: -50 }} // arranca invisible y un poco a la izquierda
      animate={{ opacity: 1, x: 0 }} // entra deslizándose al centro
      exit={{ opacity: 0, x: 50 }} // cuando salga, se desliza a la derecha
      transition={{ duration: 0.4, ease: "easeOut" }}
    >
      <div className="min-h-screen bg-gray-100 px-4 pt-4">
        {/* Título */}
        <h1 className="text-2xl font-bold text-teal-700 mb-2 text-center">
          Perfil del Usuario
        </h1>

        <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-md mx-auto">
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
          <div className="flex justify-between">
            <button
              onClick={() => navigate("/dashboard")}
              className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-semibold py-2 px-4 rounded"
            >
              Volver
            </button>
            <button
              onClick={() => navigate("/editar-usuario")}
              className="bg-teal-600 hover:bg-teal-700 text-white font-semibold py-2 px-4 rounded"
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
