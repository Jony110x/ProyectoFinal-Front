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
      className="mx-auto p-0 bg-white rounded-lg shadow mt-0"
      initial={{ opacity: 0, x: -50 }} // arranca invisible y un poco a la izquierda
      animate={{ opacity: 1, x: 0 }} // entra deslizándose al centro
      exit={{ opacity: 0, x: 50 }} // cuando salga, se desliza a la derecha
      transition={{ duration: 0.4, ease: "easeOut" }}
    >
    <div className="p-6 min-h-screen bg-gray-50">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-teal-700">Materias inscriptas</h2>
        <button
          onClick={() => navigate("/career")}
          className="bg-teal-600 hover:bg-teal-700 text-white font-semibold py-2 px-4 rounded-lg shadow"
        >
          Inscribirse a materias
        </button>
      </div>

      {materias.length === 0 ? (
        <p className="text-gray-600">No estás inscripto en ninguna materia.</p>
      ) : (
        <div className="overflow-x-auto bg-white shadow-md rounded-xl">
          <table className="min-w-full text-sm text-left text-gray-700">
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
      )}
    </div>
    </motion.div>
  );
}

export default CareerEstudiante;

