//#region IMPORTACIONES
import { useEffect, useState, useRef } from "react";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
//#endregion

//#region INTERFACES Y TYPES
type CareerType = {
  id: number;
  name: string;
};
//#endregion

//#region COMPONENTE TOAST PARA NOTIFICACIONES
const Toast = ({ message, type }: { message: string; type: "success" | "error" }) => {
  return (
    <motion.div
      className={`fixed top-4 right-4 z-50 px-6 py-3 rounded-lg shadow-lg font-medium ${
        type === "success" 
          ? "bg-green-500 text-white" 
          : "bg-red-500 text-white"
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
//#endregion

//#region COMPONENTE PRINCIPAL CAREER
export default function Career() {
  //#region ESTADOS Y HOOKS
  const [careers, setCareers] = useState<CareerType[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [newCareerName, setNewCareerName] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState<number | null>(null);
  const [editName, setEditName] = useState("");
  const [deleteCareerConfirmId, setDeleteCareerConfirmId] = useState<number | null>(null);
  const [toast, setToast] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const inputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();
  
  // Obtener tipo de usuario desde localStorage
  const userType = JSON.parse(localStorage.getItem("user") || "{}").type;
  //#endregion

  //#region TOAST
  const showToast = (text: string, type: "success" | "error") => {
    setToast({ text, type });
    setTimeout(() => setToast(null), 1000); // 1 segundo
  };
  //#endregion

  //#region EFFECTS 
  /**
   * Carga la lista de carreras al montar el componente
   */
  useEffect(() => {
    fetchCareers();
  }, []);

  /**
   * Enfoca el input del formulario cuando se muestra
   */
  useEffect(() => {
    if (showForm && inputRef.current) inputRef.current.focus();
  }, [showForm]);
  //#endregion

  //#region FUNCIONES 
  
  /**
   * Obtiene la lista de carreras desde la API
   */
  const fetchCareers = async () => {
    try {
      const res = await axios.get("https://proyectofinal-backend-1-uqej.onrender.com/carer/all");
      setCareers(res.data);
    } catch {
      setError("Error al cargar carreras");
      showToast("❌ Error al cargar carreras", "error");
    } finally {
      setLoading(false);
    }
  };

  /**
   * Agrega una nueva carrera a la base de datos
   */
  const handleAddCareer = async () => {
    if (!newCareerName.trim()) return;
    try {
      await axios.post("https://proyectofinal-backend-1-uqej.onrender.com/carer/new", {
        name: newCareerName,
      });
      setNewCareerName("");
      fetchCareers();
      setShowForm(false);
      showToast("✅ Carrera agregada con éxito", "success");
    } catch {
      showToast("❌ Error al agregar carrera", "error");
    }
  };

  /**
   * Edita el nombre de una carrera existente
   */
  const handleEditCareer = async (careerId: number) => {
    try {
      await axios.put(`https://proyectofinal-backend-1-uqej.onrender.com/career/${careerId}/edit`, {
        name: editName,
      });
      setEditId(null);
      setEditName("");
      fetchCareers();
      showToast("✅ Carrera editada correctamente", "success");
    } catch {
      showToast("❌ Error al editar carrera", "error");
    }
  };

  /**
   * Confirma y ejecuta la eliminación de una carrera
   */
  const confirmDeleteCareer = async (careerId: number) => {
    try {
      await axios.delete(`https://proyectofinal-backend-1-uqej.onrender.com/career/${careerId}/delete`);
      setCareers((prev) => prev.filter((c) => c.id !== careerId));
      setDeleteCareerConfirmId(null);
      showToast("✅ Carrera eliminada", "success");
    } catch {
      showToast("❌ Error al eliminar carrera", "error");
    }
  };
  //#endregion

  //#region RENDER 
  
  // Estado de carga
  if (loading) return <p className="text-center mt-10">Cargando...</p>;
  
  // Estado de error
  if (error) return <p className="text-red-600">{error}</p>;

  return (
    <>
      {/* Notificaciones Toast */}
      {toast && <Toast message={toast.text} type={toast.type} />}
      
      <motion.div
        className="w-full px-4 sm:px-6 bg-white rounded-lg shadow"
        initial={{ opacity: 0, x: -50 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: 50 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
      >
        <div className="py-6">
          
          {/* Header y descripción */}
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl sm:text-2xl font-bold text-teal-800 flex-1 text-center">
              Listado de Carreras
            </h2>
          </div>
          
          {/* Mensajes según tipo de usuario */}
          {userType === "admin" && (
            <span className="text-sm text-center sm:text-left text-teal-700 block mb-4">
              Seleccioná una carrera para ver el listado de materias disponibles.
            </span>
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

          {/* Lista de carreras */}
          <ul className="divide-y divide-gray-200">
            {careers.map((career) => (
              <li
                key={career.id}
                className="py-3 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2"
              >
                <div className="flex-1 flex items-center gap-2">
                  <span className="text-xl"></span>
                  
                  {/* Modo edición o visualización normal */}
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

                {/* Acciones para administradores */}
                {userType === "admin" && (
                  <div className="flex items-center gap-2 flex-wrap justify-end w-full sm:w-auto">
                    
                    {/* Botones de edición/guardado */}
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

                    {/* Confirmación de eliminación */}
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

          {/* Formulario para agregar nueva carrera (solo admin) */}
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

          {/* Formulario de nueva carrera */}
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
    </>
  );
  //#endregion
}
//#endregion