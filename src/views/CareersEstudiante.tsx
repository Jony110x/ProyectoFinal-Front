import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

type MateriaType = {
  id: number;
  name: string;
  career: string;
  profesor?: {
    firstName: string;
    lastName: string;
  } | null;
};

type MateriaConNota = MateriaType & {
  nota: number | null;
};

function CareerEstudiante() {
  const userId = JSON.parse(localStorage.getItem("user") || "{}").id;
  const navigate = useNavigate();
  const [materias, setMaterias] = useState<MateriaConNota[]>([]);

  useEffect(() => {
    const fetchMaterias = async () => {
      try {
        const res = await axios.get(`https://proyectofinal-backend-1-uqej.onrender.com/users/${userId}/profesor`);
        const materiasBase: MateriaType[] = res.data.materias || [];

        const materiasConNotas: MateriaConNota[] = await Promise.all(
          materiasBase.map(async (materia) => {
            try {
              const notaRes = await axios.get(`https://proyectofinal-backend-1-uqej.onrender.com/materia/${materia.id}/${userId}`);
              const nota = notaRes.data.nota ?? null;
              return { ...materia, nota };
            } catch (error) {
              console.error(`Error al obtener nota de materia ${materia.name}:`, error);
              return { ...materia, nota: null };
            }
          })
        );

        setMaterias(materiasConNotas);
      } catch (error) {
        console.error("Error al obtener materias del estudiante:", error);
        setMaterias([]);
      }
    };

    if (userId) {
      fetchMaterias();
    }
  }, [userId]);

  return (
    <motion.div
      className="w-full px-4 sm:px-6 bg-white rounded-lg shadow"
      initial={{ opacity: 0, x: -50 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 50 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
    >
      <div className="p-4 sm:p-6 min-h-screen bg-gray-50">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <h2 className="text-xl sm:text-2xl font-bold text-teal-700">Materias inscriptas</h2>
          <button
            onClick={() => navigate("/career")}
            className="w-full sm:w-auto bg-teal-600 hover:bg-teal-700 text-white font-semibold py-2 px-4 rounded-lg shadow text-sm sm:text-base"
          >
            Inscribirse a materias
          </button>
        </div>

        {materias.length === 0 ? (
          <p className="text-gray-600 text-center py-8">No estás inscripto en ninguna materia.</p>
        ) : (
          <div className="overflow-x-auto bg-white shadow-md rounded-xl">
            {/* Vista de tabla para desktop */}
            <div className="hidden md:block">
              <table className="w-full text-sm text-left text-gray-700">
                <thead className="bg-teal-100 text-teal-800">
                  <tr>
                    <th className="p-3 border-b">Materia</th>
                    <th className="p-3 border-b">Carrera</th>
                    <th className="p-3 border-b">Profesor</th>
                    <th className="p-3 border-b text-center">Nota</th>
                  </tr>
                </thead>
                <tbody>
                  {materias.map((materia) => (
                    <tr key={materia.id} className="border-t hover:bg-gray-50">
                      <td className="p-3">{materia.name}</td>
                      <td className="p-3">{materia.career}</td>
                      <td className="p-3">
                        {materia.profesor
                          ? `${materia.profesor.firstName} ${materia.profesor.lastName}`
                          : <span className="text-gray-400">Sin profesor</span>}
                      </td>
                      <td className="p-3 text-center">
                        {materia.nota !== null ? (
                          <span className="font-medium text-gray-800">{materia.nota}</span>
                        ) : (
                          <span className="text-gray-400">-</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Vista de cards para móvil */}
            <div className="block md:hidden space-y-4 p-4">
              {materias.map((materia) => (
                <div key={materia.id} className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
                  <div className="space-y-2">
                    <h3 className="font-semibold text-teal-700 text-lg">{materia.name}</h3>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Carrera:</span>
                      <span>{materia.career}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Profesor:</span>
                      <span>
                        {materia.profesor
                          ? `${materia.profesor.firstName} ${materia.profesor.lastName}`
                          : <span className="text-gray-400">Sin profesor</span>}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Nota:</span>
                      <span>
                        {materia.nota !== null ? (
                          <span className="font-medium text-gray-800">{materia.nota}</span>
                        ) : (
                          <span className="text-gray-400">-</span>
                        )}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );
}

export default CareerEstudiante;