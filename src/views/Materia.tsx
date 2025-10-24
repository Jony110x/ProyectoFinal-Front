import { useEffect, useState, useRef } from "react";
import axios from "axios";
import { useParams } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

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

function Materias() {
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
  const [mensajeExito, setMensajeExito] = useState<string | null>(null);

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
    } finally {
      setLoading(false);
    }
  };

  const fetchProfesores = async () => {
    try {
      const res = await axios.get<ProfesorType[]>(
        `https://proyectofinal-backend-1-uqej.onrender.com/users/profesores/all`
      );
      setProfesores(res.data);
    } catch (err) {
      console.error(err);
      alert("Error al cargar profesores");
    }
  };

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
      alert("Error al cargar estudiantes");
    }
  };

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
      setMensajeExito("Notas guardadas correctamente ✔️");

      setTimeout(() => {
        setMensajeExito(null);
      }, 3000); // desaparece en 3 segundos
    } catch (err) {
      console.error(err);
      alert("Error al guardar notas");
    }
  };

  const handleAddMateria = async () => {
    if (newMateriaName.trim() === "") return;
    try {
      await axios.post("https://proyectofinal-backend-1-uqej.onrender.com/materia/new", {
        name: newMateriaName,
        carer_id: Number(careerId),
      });
      setNewMateriaName("");
      setShowForm(false);
      fetchMateria();
    } catch (err) {
      alert("Error al agregar materia");
      console.error(err);
    }
  };

  const handleAsignarProfesorClick = async (materiaId: number) => {
    setMateriaParaAsignar(materiaId);
    setSelectedProfesorId(null);
    await fetchProfesores();
  };

  const handleConfirmarAsignacion = async () => {
    if (!selectedProfesorId || !materiaParaAsignar) return;
    try {
      await axios.post("https://proyectofinal-backend-1-uqej.onrender.com/users/asignar-materia", {
        user_id: selectedProfesorId,
        materia_id: materiaParaAsignar,
        tipo_relacion: "profesor",
      });
      setAsignadas((prev) => ({ ...prev, [materiaParaAsignar]: true }));
      setMateriaParaAsignar(null);
      setSelectedProfesorId(null);
    } catch (err) {
      console.error(err);
      alert("Error al asignar profesor");
    }
  };

  const handleInscribirse = async (materiaId: number) => {
    try {
      await axios.post("https://proyectofinal-backend-1-uqej.onrender.com/users/asignar-materia", {
        user_id: Number(userId),
        materia_id: materiaId,
        tipo_relacion: "estudiante",
      });

      // Marcar como inscripto SOLO esa materia
      setInscripciones((prev) => ({ ...prev, [materiaId]: true }));
    } catch (err) {
      console.error(err);
      alert("Error al inscribirse en la materia");
    }
  };

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
    } catch (err) {
      console.error(err);
      alert("Error al editar materia");
    }
  };

  const handleDeleteMateria = async (materiaId: number) => {
    setDeleteConfirmId(materiaId);
  };

  const confirmDeleteMateria = async (materiaId: number) => {
    try {
      await axios.delete(`https://proyectofinal-backend-1-uqej.onrender.com/materia/${materiaId}/delete`);
      setMateria((prev) => prev.filter((m) => m.id !== materiaId));
      setDeleteConfirmId(null);
    } catch (err) {
      console.error(err);
      alert("Error al eliminar materia");
    }
  };

  const cancelDeleteMateria = () => {
    setDeleteConfirmId(null);
  };

  useEffect(() => {
    fetchMateria();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [careerId]);

  useEffect(() => {
    const fetchMateriasAsignadas = async () => {
      try {
        const res = await axios.get("https://proyectofinal-backend-1-uqej.onrender.com/asignadas");
        const materiasAsignadas = res.data;
        const asignadasObj: { [materiaId: number]: boolean } = {};
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        materiasAsignadas.forEach((item: any) => {
          asignadasObj[item.materia_id] = true;
        });
        setAsignadas(asignadasObj);
      } catch (err) {
        console.error("Error al obtener materias asignadas", err);
      }
    };

    fetchMateriasAsignadas();
  }, []);

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
      }
    };

    if (userType === "estudiante" && userId) {
      fetchMateriasInscriptas();
    }
  }, [userType, userId]);

  useEffect(() => {
    if (showForm && inputRef.current) {
      inputRef.current.focus();
    }
    if (editMateriaId !== null && editInputRef.current) {
      editInputRef.current.focus();
    }
  }, [showForm, editMateriaId]);

  if (loading) return <p>Cargando materias...</p>;
  if (error) return <p>{error}</p>;

  return (
    <motion.div
      className="max-w-3xl mx-auto p-0 bg-white rounded-lg shadow mt-0"
      initial={{ opacity: 0, x: -50 }} // arranca invisible y un poco a la izquierda
      animate={{ opacity: 1, x: 0 }} // entra deslizándose al centro
      exit={{ opacity: 0, x: 50 }} // cuando salga, se desliza a la derecha
      transition={{ duration: 0.4, ease: "easeOut" }}
    >
    <div className="max-w-3xl mx-auto p-6 bg-white rounded-lg shadow mt-8">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-2xl font-bold text-teal-800 flex-1 text-center">
          Materias
        </h2>
      </div>
      <div className="flex justify-between items-center mb-4 text-sm text-teal-700">
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
            className="bg-gray-300 hover:bg-gray-400 text-gray-800 px-4 py-2 rounded shadow text-sm"
          >
            Volver
          </button>
        )}
      </div>
      <ul className="divide-y divide-gray-200">
        {materias.map((subject) => (
          <li key={subject.id} className="py-3">
            <div className="flex justify-between items-center flex-wrap gap-2">
              <div className="flex-1 flex items-center gap-2">
                {userType === "profesor" ? (
                  <button
                    onClick={() => fetchEstudiantes(subject.id)}
                    className="text-teal-700 font-medium hover:underline"
                  >
                    {subject.name}
                  </button>
                ) : (
                  <span className="text-teal-800 font-medium">
                    {subject.name}
                  </span>
                )}
              </div>

              {userType === "admin" && (
                <div className="flex items-center gap-2 flex-wrap">
                  {!asignadas[subject.id] ? (
                    <>
                      <button
                        onClick={() => handleAsignarProfesorClick(subject.id)}
                        className="bg-blue-500 hover:bg-blue-600 text-white px-2 py-1 rounded text-sm"
                      >
                        Asignar profesor
                      </button>
                      {materiaParaAsignar === subject.id && (
                        <>
                          <select
                            onChange={(e) =>
                              setSelectedProfesorId(Number(e.target.value))
                            }
                            value={selectedProfesorId ?? ""}
                            className="border rounded px-2 py-1 text-sm"
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
                            className="bg-green-500 hover:bg-green-600 text-white px-2 py-1 rounded text-sm"
                          >
                            Confirmar
                          </button>
                        </>
                      )}
                    </>
                  ) : (
                    <button
                      className="bg-green-100 text-green-700 px-2 py-1 rounded text-sm"
                      disabled
                    >
                      Profesor asignado
                    </button>
                  )}

                  {editMateriaId === subject.id ? (
                    <>
                      <input
                        ref={editInputRef}
                        type="text"
                        value={editMateriaName}
                        onChange={(e) => setEditMateriaName(e.target.value)}
                        className="border px-2 py-1 rounded text-sm w-[160px]"
                      />
                      <button
                        onClick={() => handleEditMateria(subject.id)}
                        className="bg-green-500 hover:bg-green-600 text-white px-2 py-1 rounded text-sm"
                      >
                        Guardar
                      </button>
                    </>
                  ) : (
                    <button
                      disabled={editMateriaId === subject.id}
                      onClick={() => {
                        setEditMateriaId(subject.id);
                        setEditMateriaName(subject.name);
                      }}
                      className="text-blue-600 hover:underline mr-2"
                    >
                      Editar
                    </button>
                  )}

                  {deleteConfirmId === subject.id ? (
                    <>
                      <span className="text-sm">¿Seguro?</span>
                      <button
                        onClick={() => confirmDeleteMateria(subject.id)}
                        className="bg-red-600 hover:bg-red-700 text-white px-2 py-1 rounded text-sm"
                      >
                        Sí
                      </button>
                      <button
                        onClick={cancelDeleteMateria}
                        className="bg-gray-400 hover:bg-gray-500 text-white px-2 py-1 rounded text-sm"
                      >
                        No
                      </button>
                    </>
                  ) : (
                    <button
                      onClick={() => handleDeleteMateria(subject.id)}
                      className="text-red-600 hover:underline mr-2"
                    >
                      Eliminar
                    </button>
                  )}
                </div>
              )}

              {userType === "estudiante" && (
                <button
                  className={`px-3 py-1 rounded text-sm text-white ${
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

            {userType === "profesor" && materiaExpandida === subject.id && (
              <div className="mt-4">
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
                        <td className="border px-2 py-1">{est.email}</td>
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

                <div className="flex gap-2 mt-2">
                  <button
                    onClick={async () => {
                      await guardarNotas(subject.id);

                      // Esperar unos segundos antes de cerrar
                      setTimeout(() => {
                        setMateriaExpandida(null);
                      }, 3000);
                    }}
                    className="bg-teal-600 hover:bg-teal-700 text-white px-3 py-1 rounded text-sm"
                  >
                    Guardar Notas
                  </button>
                  <button
                    onClick={() => setMateriaExpandida(null)}
                    className="bg-gray-400 hover:bg-gray-500 text-white px-3 py-1 rounded text-sm"
                  >
                    Cancelar
                  </button>
                </div>
              </div>
            )}
          </li>
        ))}
      </ul>
      {userType === "admin" && !showForm && (
        <div className="mt-6 text-center">
          <button
            onClick={() => setShowForm(true)}
            className="bg-teal-600 hover:bg-teal-700 text-white px-4 py-2 rounded shadow"
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
            className="w-full border px-3 py-2 rounded"
          />
          <div className="flex justify-end space-x-2">
            <button
              onClick={handleAddMateria}
              className="bg-teal-600 hover:bg-teal-700 text-white px-4 py-2 rounded"
            >
              Guardar
            </button>
            <button
              onClick={() => {
                setShowForm(false);
                setNewMateriaName("");
              }}
              className="bg-gray-400 hover:bg-gray-500 text-white px-4 py-2 rounded"
            >
              Cancelar
            </button>
          </div>
        </div>
      )}
      {mensajeExito && (
        <div
          className="fixed top-[80px] right-4 bg-green-500 text-white px-4 py-2 rounded shadow-lg z-50
               animate-fade-in-out transition-opacity duration-500"
        >
          {mensajeExito}
        </div>
      )}
    </div>
    </motion.div>
  );
}

export default Materias;
