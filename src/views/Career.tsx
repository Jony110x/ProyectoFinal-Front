import { useEffect, useState, useRef } from "react";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

type CareerType = {
  id: number;
  name: string;
};

export default function Career() {
  const [careers, setCareers] = useState<CareerType[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [newCareerName, setNewCareerName] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState<number | null>(null);
  const [editName, setEditName] = useState("");
  const [deleteCareerConfirmId, setDeleteCareerConfirmId] = useState<
    number | null
  >(null);
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  const inputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();
  const userType = JSON.parse(localStorage.getItem("user") || "{}").type;

  const fetchCareers = async () => {
    try {
      const res = await axios.get("https://proyectofinal-backend-1-uqej.onrender.com/carer/all");
      setCareers(res.data);
    } catch {
      setError("Error al cargar carreras");
    } finally {
      setLoading(false);
    }
  };

  const showTempMessage = (text: string, type: "success" | "error") => {
    setMessage({ text, type });
    setTimeout(() => setMessage(null), 3000);
  };

  const handleAddCareer = async () => {
    if (!newCareerName.trim()) return;
    try {
      await axios.post("https://proyectofinal-backend-1-uqej.onrender.com/carer/new", {
        name: newCareerName,
      });
      setNewCareerName("");
      fetchCareers();
      setShowForm(false);
      showTempMessage("✅ Carrera agregada con éxito", "success");
    } catch {
      showTempMessage("❌ Error al agregar carrera", "error");
    }
  };

  const handleEditCareer = async (careerId: number) => {
    try {
      await axios.put(`https://proyectofinal-backend-1-uqej.onrender.com/career/${careerId}/edit`, {
        name: editName,
      });
      setEditId(null);
      setEditName("");
      fetchCareers();
      showTempMessage("✅ Carrera editada correctamente", "success");
    } catch {
      showTempMessage("❌ Error al editar carrera", "error");
    }
  };

  const confirmDeleteCareer = async (careerId: number) => {
    try {
      await axios.delete(`https://proyectofinal-backend-1-uqej.onrender.com/career/${careerId}/delete`);
      setCareers((prev) => prev.filter((c) => c.id !== careerId));
      setDeleteCareerConfirmId(null);
      showTempMessage("✅ Carrera eliminada", "success");
    } catch {
      showTempMessage("❌ Error al eliminar carrera", "error");
    }
  };

  useEffect(() => {
    fetchCareers();
  }, []);

  useEffect(() => {
    if (showForm && inputRef.current) inputRef.current.focus();
  }, [showForm]);

  if (loading) return <p className="text-center mt-10">Cargando...</p>;
  if (error) return <p className="text-red-600">{error}</p>;

  return (
    <motion.div
      className="w-full px-4 sm:px-6 bg-white rounded-lg shadow"
      initial={{ opacity: 0, x: -50 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 50 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
    >
      <div className="py-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl sm:text-2xl font-bold text-teal-800 flex-1 text-center">
            Listado de Carreras
          </h2>
        </div>
        {userType === "admin" && (
          <span className="text-sm text-center sm:text-left text-teal-700 block mb-4">
            Seleccioná una carrera para ver el listado de materias disponibles.
          </span>
        )}

        {message && (
          <div
            className={`mb-4 text-center px-4 py-2 rounded ${
              message.type === "success"
                ? "bg-green-100 text-green-800"
                : "bg-red-100 text-red-800"
            }`}
          >
            {message.text}
          </div>
        )}

        {userType === "estudiante" && (
          <div className="flex flex-col sm:flex-row justify-between items-center mb-4 text-sm text-teal-700 gap-2">
            <span className="text-center sm:text-left">
              Seleccioná una carrera para ver el listado de materias disponibles.
            </span>
            <button
              onClick={() => navigate(-1)}
              className="w-full sm:w-auto bg-gray-300 hover:bg-gray-400 text-gray-800 px-4 py-2 rounded shadow text-sm"
            >
              Volver
            </button>
          </div>
        )}

        <ul className="divide-y divide-gray-200">
          {careers.map((career) => (
            <li
              key={career.id}
              className="py-3 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2"
            >
              <div className="flex-1 flex items-center gap-2">
                <span className="text-xl"></span>
                {editId === career.id ? (
                  <input
                    type="text"
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    className="border px-2 py-1 rounded w-full"
                    autoFocus
                  />
                ) : (
                  <Link
                    to={`/career/${career.id}/materia`}
                    className="text-teal-700 font-medium hover:underline text-base sm:text-lg"
                  >
                    {career.name}
                  </Link>
                )}
              </div>

              {userType === "admin" && (
                <div className="flex items-center gap-2 flex-wrap justify-end w-full sm:w-auto">
                  {editId === career.id ? (
                    <button
                      onClick={() => handleEditCareer(career.id)}
                      className="bg-green-500 hover:bg-green-600 text-white px-3 py-1 rounded text-sm"
                    >
                      Guardar
                    </button>
                  ) : (
                    <button
                      onClick={() => {
                        setEditId(career.id);
                        setEditName(career.name);
                      }}
                      className="text-blue-600 hover:underline text-sm"
                    >
                      Editar
                    </button>
                  )}

                  {deleteCareerConfirmId === career.id ? (
                    <div className="flex items-center gap-2">
                      <span className="text-sm">¿Seguro?</span>
                      <button
                        onClick={() => confirmDeleteCareer(career.id)}
                        className="bg-red-600 hover:bg-red-700 text-white px-2 py-1 rounded text-sm"
                      >
                        Sí
                      </button>
                      <button
                        onClick={() => setDeleteCareerConfirmId(null)}
                        className="bg-gray-400 hover:bg-gray-500 text-white px-2 py-1 rounded text-sm"
                      >
                        No
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => setDeleteCareerConfirmId(career.id)}
                      className="text-red-600 hover:underline text-sm"
                    >
                      Eliminar
                    </button>
                  )}
                </div>
              )}
            </li>
          ))}
        </ul>

        {userType === "admin" && !showForm && (
          <div className="mt-6 text-center">
            <button
              onClick={() => setShowForm(true)}
              className="w-full sm:w-auto bg-teal-600 hover:bg-teal-700 text-white px-4 py-2 rounded shadow text-sm sm:text-base"
            >
              + Agregar Carrera
            </button>
          </div>
        )}

        {userType === "admin" && showForm && (
          <div className="mt-6 space-y-2">
            <input
              ref={inputRef}
              type="text"
              value={newCareerName}
              onChange={(e) => setNewCareerName(e.target.value)}
              placeholder="Nombre de la carrera"
              className="w-full border px-3 py-2 rounded text-sm sm:text-base"
            />
            <div className="flex flex-col sm:flex-row justify-end space-y-2 sm:space-y-0 sm:space-x-2">
              <button
                onClick={handleAddCareer}
                className="w-full sm:w-auto bg-teal-600 hover:bg-teal-700 text-white px-4 py-2 rounded text-sm sm:text-base"
              >
                Guardar
              </button>
              <button
                onClick={() => {
                  setShowForm(false);
                  setNewCareerName("");
                }}
                className="w-full sm:w-auto bg-gray-400 hover:bg-gray-500 text-white px-4 py-2 rounded text-sm sm:text-base"
              >
                Cancelar
              </button>
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );
}