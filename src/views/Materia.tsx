/* eslint-disable @typescript-eslint/no-explicit-any */
//#region IMPORTACIONES
import { useEffect, useState, useRef } from "react";
import axios from "axios";
import { useParams } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
//#endregion

//#region TIPOS E INTERFACES
type MateriaType = {
  id: number;
  name: string;
  career?: string;
};

type ProfesorType = {
  id: number;
  username: string;
};

type EstudianteType = {
  id: number;
  nombre: string;
  nota: number;
  apellido: string;
  DNI: number;
  email: string;
};
//#endregion

//#region COMPONENTE TOAST
const Toast = ({ message, type }: { message: string; type: "success" | "error" | "info" | "warning" }) => {
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
//#endregion

//#region COMPONENTE PRINCIPAL MATERIAS
function Materias() {
  //#region ESTADOS Y HOOKS
  const navigate = useNavigate();
  const { careerId } = useParams();
  const [materias, setMateria] = useState<MateriaType[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [newMateriaName, setNewMateriaName] = useState("");
  const [showForm, setShowForm] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<number | null>(null);
  const [inscripciones, setInscripciones] = useState<{
    [key: number]: boolean;
  }>({});
  const [asignadas, setAsignadas] = useState<{ [materiaId: number]: boolean }>(
    {}
  );
  const [toast, setToast] = useState<{ type: "success" | "error" | "info" | "warning"; text: string } | null>(null);

  const [editMateriaId, setEditMateriaId] = useState<number | null>(null);
  const [editMateriaName, setEditMateriaName] = useState("");
  const editInputRef = useRef<HTMLInputElement>(null);

  const [profesores, setProfesores] = useState<ProfesorType[]>([]);
  const [selectedProfesorId, setSelectedProfesorId] = useState<number | null>(
    null
  );
  const [materiaParaAsignar, setMateriaParaAsignar] = useState<number | null>(
    null
  );

  const [estudiantesPorMateria, setEstudiantesPorMateria] = useState<
    Record<number, EstudianteType[]>
  >({});
  const [notasPorMateria, setNotasPorMateria] = useState<
    Record<number, Record<number, number | undefined>>
  >({});
  const [materiaExpandida, setMateriaExpandida] = useState<number | null>(null);

  const userId = JSON.parse(localStorage.getItem("user") || "{}").id;
  const userType = JSON.parse(localStorage.getItem("user") || "{}").type;
  //#endregion

  //#region TOAS
  const showToast = (text: string, type: "success" | "error" | "info" | "warning") => {
    setToast({ text, type });
    setTimeout(() => setToast(null), 1000);
  };
  //#endregion

  //#region FUNCIONES DE DATOS
  /**
   * Obtiene la lista de materias según el tipo de usuario
   */
  const fetchMateria = async () => {
    try {
      if (userType === "profesor" && userId) {
        const res = await axios.get<{ materias: MateriaType[] }>(
          `https://proyectofinal-backend-1-uqej.onrender.com/users/${userId}/materias`
        );
        setMateria(res.data.materias);
      } else {
        const res = await axios.get<MateriaType[]>(
          `https://proyectofinal-backend-1-uqej.onrender.com/materia/${careerId}/all`
        );
        setMateria(res.data);
      }
    } catch (err) {
      console.error(err);
      setError("Error al cargar materias");
      showToast("❌ Error al cargar materias", "error");
    } finally {
      setLoading(false);
    }
  };

  /**
   * Obtiene la lista de profesores disponibles
   */
  const fetchProfesores = async () => {
    try {
      const res = await axios.get<ProfesorType[]>(
        `https://proyectofinal-backend-1-uqej.onrender.com/users/profesores/all`
      );
      setProfesores(res.data);
    } catch (err) {
      console.error(err);
      showToast("❌ Error al cargar profesores", "error");
    }
  };

  /**
   * Obtiene los estudiantes inscritos en una materia específica
   */
  const fetchEstudiantes = async (materiaId: number) => {
    try {
      const res = await axios.get(
        `https://proyectofinal-backend-1-uqej.onrender.com/materia/${materiaId}/estudiantes`
      );
      setEstudiantesPorMateria((prev) => ({
        ...prev,
        [materiaId]: res.data.estudiantes,
      }));

      const notasIniciales: Record<number, number | undefined> = {};
      res.data.estudiantes.forEach((e: EstudianteType) => {
        notasIniciales[e.id] = e.nota !== null ? e.nota : undefined;
      });

      setNotasPorMateria((prev) => ({
        ...prev,
        [materiaId]: notasIniciales,
      }));

      setMateriaExpandida(materiaId);
    } catch (err) {
      console.error(err);
      showToast("❌ Error al cargar estudiantes", "error");
    }
  };

  /**
   * Maneja el cambio de notas de los estudiantes
   */
  const handleNotaChange = (
    materiaId: number,
    estudianteId: number,
    nota: number
  ) => {
    setNotasPorMateria((prev) => ({
      ...prev,
      [materiaId]: {
        ...prev[materiaId],
        [estudianteId]: nota,
      },
    }));
  };

  /**
   * Guarda las notas de los estudiantes en el backend
   */
  const guardarNotas = async (materiaId: number) => {
    const notas = notasPorMateria[materiaId];
    const data = Object.entries(notas).map(([user_id, nota]) => ({
      user_id: Number(user_id),
      nota: typeof nota === "number" && !isNaN(nota) ? Number(nota) : null,
    }));

    try {
      await axios.post(
        `https://proyectofinal-backend-1-uqej.onrender.com/materia/${materiaId}/notas`,
        data
      );
      showToast("✅ Notas guardadas correctamente", "success");

      setTimeout(() => {
        setMateriaExpandida(null);
      }, 1000);
    } catch (err) {
      console.error(err);
      showToast("❌ Error al guardar notas", "error");
    }
  };
  //#endregion

  //#region FUNCIONES DE GESTIÓN DE MATERIAS
  /**
   * Agrega una nueva materia al sistema
   */
  const handleAddMateria = async () => {
    if (newMateriaName.trim() === "") {
      showToast("⚠️ Ingresa un nombre para la materia", "warning");
      return;
    }
    try {
      await axios.post("https://proyectofinal-backend-1-uqej.onrender.com/materia/new", {
        name: newMateriaName,
        carer_id: Number(careerId),
      });
      setNewMateriaName("");
      setShowForm(false);
      fetchMateria();
      showToast("✅ Materia agregada correctamente", "success");
    } catch (err) {
      showToast("❌ Error al agregar materia", "error");
      console.error(err);
    }
  };

  /**
   * Edita el nombre de una materia existente
   */
  const handleEditMateria = async (materiaId: number) => {
    const materia = materias.find((m) => m.id === materiaId);
    if (!materia) return;
    try {
      await axios.put(`https://proyectofinal-backend-1-uqej.onrender.com/materia/${materiaId}/edit`, {
        name: editMateriaName,
      });

      setMateria((prev) =>
        prev.map((m) =>
          m.id === materiaId ? { ...m, name: editMateriaName } : m
        )
      );

      setEditMateriaId(null);
      setEditMateriaName("");
      showToast("✅ Materia editada correctamente", "success");
    } catch (err) {
      console.error(err);
      showToast("❌ Error al editar materia", "error");
    }
  };

  /**
   * Elimina una materia del sistema
   */
  const handleDeleteMateria = async (materiaId: number) => {
    setDeleteConfirmId(materiaId);
  };

  /**
   * Confirma la eliminación de una materia
   */
  const confirmDeleteMateria = async (materiaId: number) => {
    try {
      await axios.delete(`https://proyectofinal-backend-1-uqej.onrender.com/materia/${materiaId}/delete`);
      setMateria((prev) => prev.filter((m) => m.id !== materiaId));
      setDeleteConfirmId(null);
      showToast("✅ Materia eliminada correctamente", "success");
    } catch (err) {
      console.error(err);
      showToast("❌ Error al eliminar materia", "error");
    }
  };

  /**
   * Cancela la eliminación de una materia
   */
  const cancelDeleteMateria = () => {
    setDeleteConfirmId(null);
  };
  //#endregion

  //#region FUNCIONES DE ASIGNACIÓN E INSCRIPCIÓN
  /**
   * Prepara la asignación de un profesor a una materia
   */
  const handleAsignarProfesorClick = async (materiaId: number) => {
    setMateriaParaAsignar(materiaId);
    setSelectedProfesorId(null);
    await fetchProfesores();
  };

  /**
   * Confirma la asignación de un profesor a una materia
   */
  const handleConfirmarAsignacion = async () => {
    if (!selectedProfesorId || !materiaParaAsignar) {
      showToast("⚠️ Selecciona un profesor", "warning");
      return;
    }
    try {
      await axios.post("https://proyectofinal-backend-1-uqej.onrender.com/users/asignar-materia", {
        user_id: selectedProfesorId,
        materia_id: materiaParaAsignar,
        tipo_relacion: "profesor",
      });
      setAsignadas((prev) => ({ ...prev, [materiaParaAsignar]: true }));
      setMateriaParaAsignar(null);
      setSelectedProfesorId(null);
      showToast("✅ Profesor asignado correctamente", "success");
    } catch (err) {
      console.error(err);
      showToast("❌ Error al asignar profesor", "error");
    }
  };

  /**
   * Maneja la inscripción de un estudiante a una materia
   */
  const handleInscribirse = async (materiaId: number) => {
    try {
      await axios.post("https://proyectofinal-backend-1-uqej.onrender.com/users/asignar-materia", {
        user_id: Number(userId),
        materia_id: materiaId,
        tipo_relacion: "estudiante",
      });

      setInscripciones((prev) => ({ ...prev, [materiaId]: true }));
      showToast("✅ Inscripción realizada correctamente", "success");
    } catch (err) {
      console.error(err);
      showToast("❌ Error al inscribirse en la materia", "error");
    }
  };
  //#endregion

  //#region EFFECTS Y LIFECYCLE
  // Effect para cargar materias
  useEffect(() => {
    fetchMateria();
  }, [careerId]);

  // Effect para cargar materias asignadas
  useEffect(() => {
    const fetchMateriasAsignadas = async () => {
      try {
        const res = await axios.get("https://proyectofinal-backend-1-uqej.onrender.com/asignadas");
        const materiasAsignadas = res.data;
        const asignadasObj: { [materiaId: number]: boolean } = {};
        materiasAsignadas.forEach((item: any) => {
          asignadasObj[item.materia_id] = true;
        });
        setAsignadas(asignadasObj);
      } catch (err) {
        console.error("Error al obtener materias asignadas", err);
        showToast("❌ Error al cargar asignaciones", "error");
      }
    };

    fetchMateriasAsignadas();
  }, []);

  // Effect para cargar materias inscriptas del estudiante
  useEffect(() => {
    const fetchMateriasInscriptas = async () => {
      try {
        const res = await axios.get(
          `https://proyectofinal-backend-1-uqej.onrender.com/users/${userId}/materias`
        );
        const materiasInscriptas = res.data.materias;

        const nuevoEstado: { [key: number]: boolean } = {};
        materiasInscriptas.forEach((m: { id: number }) => {
          nuevoEstado[m.id] = true;
        });

        setInscripciones(nuevoEstado);
      } catch (err) {
        console.error("Error al obtener materias inscriptas:", err);
        showToast("❌ Error al cargar inscripciones", "error");
      }
    };

    if (userType === "estudiante" && userId) {
      fetchMateriasInscriptas();
    }
  }, [userType, userId]);

  // Effect para manejar el foco en los inputs
  useEffect(() => {
    if (showForm && inputRef.current) {
      inputRef.current.focus();
    }
    if (editMateriaId !== null && editInputRef.current) {
      editInputRef.current.focus();
    }
  }, [showForm, editMateriaId]);
  //#endregion

  //#region RENDER
  if (loading) return <p className="text-center p-4">Cargando materias...</p>;
  if (error) return <p className="text-red-600 text-center p-4">{error}</p>;

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
          {/* Header de la página */}
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl sm:text-2xl font-bold text-teal-800 flex-1 text-center">
              Materias
            </h2>
          </div>

          {/* Información y controles */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 mb-4 text-sm text-teal-700">
            <span className="text-center sm:text-left">
              {userType === "estudiante"
                ? "Seleccioná una materia para inscribirte."
                : userType === "profesor"
                ? "Hacé clic en una materia para ver y cargar notas."
                : "Gestioná las materias disponibles en el sistema."}
            </span>

            {userType !== "profesor" && (
              <button
                onClick={() => navigate(-1)}
                className="w-full sm:w-auto bg-gray-300 hover:bg-gray-400 text-gray-800 px-4 py-2 rounded shadow text-sm"
              >
                Volver
              </button>
            )}
          </div>
          
          {/* Lista de materias */}
          <ul className="divide-y divide-gray-200">
            {materias.map((subject) => (
              <li key={subject.id} className="py-4">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                  {/* Nombre de la materia */}
                  <div className="flex-1 flex items-center gap-2">
                    {userType === "profesor" ? (
                      <button
                        onClick={() => fetchEstudiantes(subject.id)}
                        className="text-teal-700 font-medium hover:underline text-left text-base sm:text-lg"
                      >
                        {subject.name}
                      </button>
                    ) : (
                      <span className="text-teal-800 font-medium text-base sm:text-lg">
                        {subject.name}
                      </span>
                    )}
                  </div>

                  {/* Acciones para administradores */}
                  {userType === "admin" && (
                    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 flex-wrap w-full sm:w-auto">
                      {/* Asignación de profesores */}
                      {!asignadas[subject.id] ? (
                        <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
                          <button
                            onClick={() => handleAsignarProfesorClick(subject.id)}
                            className="w-full sm:w-auto bg-blue-500 hover:bg-blue-600 text-white px-3 py-2 rounded text-sm"
                          >
                            Asignar profesor
                          </button>
                          {materiaParaAsignar === subject.id && (
                            <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
                              <select
                                onChange={(e) =>
                                  setSelectedProfesorId(Number(e.target.value))
                                }
                                value={selectedProfesorId ?? ""}
                                className="w-full sm:w-auto border rounded px-2 py-2 text-sm"
                              >
                                <option value="">Seleccionar profesor</option>
                                {profesores.map((prof) => (
                                  <option key={prof.id} value={prof.id}>
                                    {prof.username}
                                  </option>
                                ))}
                              </select>
                              <button
                                onClick={handleConfirmarAsignacion}
                                className="w-full sm:w-auto bg-green-500 hover:bg-green-600 text-white px-3 py-2 rounded text-sm"
                              >
                                Confirmar
                              </button>
                            </div>
                          )}
                        </div>
                      ) : (
                        <button
                          className="w-full sm:w-auto bg-green-100 text-green-700 px-3 py-2 rounded text-sm"
                          disabled
                        >
                          Profesor asignado
                        </button>
                      )}

                      {/* Edición y eliminación */}
                      <div className="flex gap-2 mt-2 sm:mt-0">
                        {editMateriaId === subject.id ? (
                          <div className="flex flex-col sm:flex-row gap-2 w-full">
                            <input
                              ref={editInputRef}
                              type="text"
                              value={editMateriaName}
                              onChange={(e) => setEditMateriaName(e.target.value)}
                              className="w-full border px-2 py-2 rounded text-sm"
                            />
                            <button
                              onClick={() => handleEditMateria(subject.id)}
                              className="w-full sm:w-auto bg-green-500 hover:bg-green-600 text-white px-3 py-2 rounded text-sm"
                            >
                              Guardar
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => {
                              setEditMateriaId(subject.id);
                              setEditMateriaName(subject.name);
                            }}
                            className="w-full sm:w-auto text-blue-600 hover:underline px-3 py-2 text-sm border border-blue-200 rounded"
                          >
                            Editar
                          </button>
                        )}

                        {deleteConfirmId === subject.id ? (
                          <div className="flex flex-col sm:flex-row items-center gap-2">
                            <span className="text-sm">¿Seguro?</span>
                            <div className="flex gap-2">
                              <button
                                onClick={() => confirmDeleteMateria(subject.id)}
                                className="bg-red-600 hover:bg-red-700 text-white px-3 py-2 rounded text-sm"
                              >
                                Sí
                              </button>
                              <button
                                onClick={cancelDeleteMateria}
                                className="bg-gray-400 hover:bg-gray-500 text-white px-3 py-2 rounded text-sm"
                              >
                                No
                              </button>
                            </div>
                          </div>
                        ) : (
                          <button
                            onClick={() => handleDeleteMateria(subject.id)}
                            className="w-full sm:w-auto text-red-600 hover:underline px-3 py-2 text-sm border border-red-200 rounded"
                          >
                            Eliminar
                          </button>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Inscripción para estudiantes */}
                  {userType === "estudiante" && (
                    <button
                      className={`w-full sm:w-auto px-4 py-2 rounded text-sm text-white ${
                        inscripciones[subject.id]
                          ? "bg-gray-400 cursor-default"
                          : "bg-teal-500 hover:bg-teal-600"
                      }`}
                      onClick={() => handleInscribirse(subject.id)}
                      disabled={inscripciones[subject.id]}
                    >
                      {inscripciones[subject.id] ? "Inscripto" : "Inscribirse"}
                    </button>
                  )}
                </div>

                {/* Panel de estudiantes y notas para profesores */}
                {userType === "profesor" && materiaExpandida === subject.id && (
                  <div className="mt-4 bg-gray-50 p-4 rounded-lg">
                    <div className="overflow-x-auto">
                      <table className="w-full border text-sm">
                        <thead className="bg-teal-100 text-teal-800">
                          <tr>
                            <th className="border px-2 py-1">Nombre</th>
                            <th className="border px-2 py-1">Apellido</th>
                            <th className="border px-2 py-1">DNI</th>
                            <th className="border px-2 py-1">Email</th>
                            <th className="border px-2 py-1">Nota</th>
                          </tr>
                        </thead>
                        <tbody>
                          {estudiantesPorMateria[subject.id]?.map((est) => (
                            <tr key={est.id}>
                              <td className="border px-2 py-1">{est.nombre}</td>
                              <td className="border px-2 py-1">{est.apellido}</td>
                              <td className="border px-2 py-1">{est.DNI}</td>
                              <td className="border px-2 py-1 text-xs">{est.email}</td>
                              <td className="border px-2 py-1">
                                <input
                                  type="number"
                                  min={1}
                                  max={10}
                                  value={
                                    notasPorMateria[subject.id]?.[est.id] !==
                                    undefined
                                      ? notasPorMateria[subject.id][est.id]
                                      : ""
                                  }
                                  onChange={(e) => {
                                    let value = Number(e.target.value);
                                    if (!isNaN(value)) {
                                      if (value < 1) value = 1;
                                      if (value > 10) value = 10;
                                      handleNotaChange(subject.id, est.id, value);
                                    }
                                  }}
                                  className="border rounded w-16 px-1"
                                />
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-2 mt-3">
                      <button
                        onClick={async () => {
                          await guardarNotas(subject.id);
                        }}
                        className="w-full sm:w-auto bg-teal-600 hover:bg-teal-700 text-white px-4 py-2 rounded text-sm"
                      >
                        Guardar Notas
                      </button>
                      <button
                        onClick={() => setMateriaExpandida(null)}
                        className="w-full sm:w-auto bg-gray-400 hover:bg-gray-500 text-white px-4 py-2 rounded text-sm"
                      >
                        Cancelar
                      </button>
                    </div>
                  </div>
                )}
              </li>
            ))}
          </ul>
          
          {/* Formulario para agregar materias (solo admin) */}
          {userType === "admin" && !showForm && (
            <div className="mt-6 text-center">
              <button
                onClick={() => setShowForm(true)}
                className="w-full sm:w-auto bg-teal-600 hover:bg-teal-700 text-white px-4 py-2 rounded shadow text-sm sm:text-base"
              >
                + Agregar Materia
              </button>
            </div>
          )}
          
          {userType === "admin" && showForm && (
            <div className="mt-6 space-y-2">
              <input
                ref={inputRef}
                type="text"
                value={newMateriaName}
                onChange={(e) => setNewMateriaName(e.target.value)}
                placeholder="Nombre de la materia"
                className="w-full border px-3 py-2 rounded text-sm sm:text-base"
              />
              <div className="flex flex-col sm:flex-row justify-end gap-2">
                <button
                  onClick={handleAddMateria}
                  className="w-full sm:w-auto bg-teal-600 hover:bg-teal-700 text-white px-4 py-2 rounded text-sm sm:text-base"
                >
                  Guardar
                </button>
                <button
                  onClick={() => {
                    setShowForm(false);
                    setNewMateriaName("");
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
export default Materias;
//#endregion