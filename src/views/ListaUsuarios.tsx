import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import React from "react";
import { motion } from "framer-motion";

interface Usuario {
  id: number;
  username: string;
  email: string;
  dni: number;
  firstName: string;
  lastName: string;
  type: "admin" | "estudiante" | "profesor";
}

interface PaginationState {
  page: number;
  total: number;
  users: Usuario[];
  loading: boolean;
}

export default function ListaUsuarios() {
  const [profesores, setProfesores] = useState<PaginationState>({
    page: 0,
    total: 0,
    users: [],
    loading: true,
  });
  
  const [estudiantes, setEstudiantes] = useState<PaginationState>({
    page: 0,
    total: 0,
    users: [],
    loading: true,
  });

  const [searchTerm, setSearchTerm] = useState("");
  const [resettingPassword, setResettingPassword] = useState<number | null>(null);
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  const limit = 20;
  const navigate = useNavigate();

  const fetchUsuarios = async (tipo: "profesor" | "estudiante", pagina: number) => {
    try {
      const token = localStorage.getItem("token");
      
      const res = await axios.get("https://proyectofinal-backend-1-uqej.onrender.com/users/paginated-by-type", {
        headers: { Authorization: `Bearer ${token}` },
        params: {
          user_type: tipo,
          limit,
          offset: pagina * limit,
        },
      });

      if (tipo === "profesor") {
        setProfesores(prev => ({
          ...prev,
          users: res.data.users,
          total: res.data.total,
          loading: false,
        }));
      } else {
        setEstudiantes(prev => ({
          ...prev,
          users: res.data.users,
          total: res.data.total,
          loading: false,
        }));
      }
    } catch (error) {
      console.error(`Error al traer ${tipo}s:`, error);
      if (tipo === "profesor") {
        setProfesores(prev => ({ ...prev, loading: false }));
      } else {
        setEstudiantes(prev => ({ ...prev, loading: false }));
      }
    }
  };

  const fetchUsuariosFiltrados = async (tipo: "profesor" | "estudiante", filtro: string, pagina: number) => {
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get("https://proyectofinal-backend-1-uqej.onrender.com/users/search-by-type", {
        headers: { Authorization: `Bearer ${token}` },
        params: {
          user_type: tipo,
          q: filtro,
          limit,
          offset: pagina * limit,
        },
      });

      if (tipo === "profesor") {
        setProfesores(prev => ({
          ...prev,
          users: res.data.users,
          total: res.data.total,
          loading: false,
        }));
      } else {
        setEstudiantes(prev => ({
          ...prev,
          users: res.data.users,
          total: res.data.total,
          loading: false,
        }));
      }
    } catch (error) {
      console.error(`Error al buscar ${tipo}s:`, error);
      if (tipo === "profesor") {
        setProfesores(prev => ({ ...prev, loading: false }));
      } else {
        setEstudiantes(prev => ({ ...prev, loading: false }));
      }
    }
  };

  useEffect(() => {
    if (searchTerm.trim().length === 0) {
      fetchUsuarios("profesor", profesores.page);
    } else {
      fetchUsuariosFiltrados("profesor", searchTerm, profesores.page);
    }
  }, [profesores.page, searchTerm]);

  useEffect(() => {
    if (searchTerm.trim().length === 0) {
      fetchUsuarios("estudiante", estudiantes.page);
    } else {
      fetchUsuariosFiltrados("estudiante", searchTerm, estudiantes.page);
    }
  }, [estudiantes.page, searchTerm]);

  const handleResetPassword = async (userId: number, userName: string) => {
    setResettingPassword(userId);
    setMessage(null);

    try {
      const token = localStorage.getItem("token");
      const defaultPassword = "1234";
      await axios.put(`https://proyectofinal-backend-1-uqej.onrender.com/users/${userId}`, {
        password: defaultPassword,
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      setMessage({
        type: "success",
        text: `Contraseña restablecida para ${userName}. Nueva: ${defaultPassword}`,
      });
      setTimeout(() => setMessage(null), 5000);
    } catch (error) {
      console.error("Error al restablecer contraseña:", error);
      setMessage({
        type: "error",
        text: `No se pudo restablecer la contraseña de ${userName}.`,
      });
      setTimeout(() => setMessage(null), 5000);
    } finally {
      setResettingPassword(null);
    }
  };

  const profesoresFiltrados = profesores.users;
  const estudiantesFiltrados = estudiantes.users;

  const PaginationControls = ({ 
    tipo, 
    state, 
    setState 
  }: { 
    tipo: string;
    state: PaginationState;
    setState: React.Dispatch<React.SetStateAction<PaginationState>>;
  }) => (
    <div className="flex flex-col sm:flex-row justify-center items-center gap-2 sm:gap-4 mt-4">
      <button
        onClick={() => setState(prev => ({ ...prev, page: Math.max(prev.page - 1, 0) }))}
        disabled={state.page === 0}
        className={`w-full sm:w-auto px-4 py-2 rounded-md shadow text-sm ${
          state.page === 0
            ? "bg-gray-300 cursor-not-allowed"
            : "bg-teal-600 hover:bg-teal-700 text-white"
        }`}
      >
        ◀ Anterior {tipo}
      </button>

      <span className="px-4 py-2 text-sm text-gray-600 text-center">
        Página {state.page + 1} de {Math.ceil(state.total / limit)} ({state.total} total)
      </span>

      <button
        onClick={() => setState(prev => ({ 
          ...prev, 
          page: (prev.page + 1) * limit < prev.total ? prev.page + 1 : prev.page 
        }))}
        disabled={(state.page + 1) * limit >= state.total}
        className={`w-full sm:w-auto px-4 py-2 rounded-md shadow text-sm ${
          (state.page + 1) * limit >= state.total
            ? "bg-gray-300 cursor-not-allowed"
            : "bg-teal-600 hover:bg-teal-700 text-white"
        }`}
      >
        Siguiente {tipo} ▶
      </button>
    </div>
  );

  const UserTable = ({ usuarios, titulo }: { usuarios: Usuario[]; titulo: string }) => (
    <div className="mb-8">
      <h3 className="text-xl font-semibold text-teal-700 mb-4">{titulo}</h3>
      {usuarios.length === 0 ? (
        <p className="text-gray-500 text-center py-4">No hay {titulo.toLowerCase()} para mostrar</p>
      ) : (
        <>
          {/* Vista de tabla para desktop */}
          <div className="hidden lg:block overflow-x-auto">
            <table className="w-full bg-white border rounded-md shadow">
              <thead className="bg-teal-100 text-teal-800">
                <tr>
                  <th className="py-2 px-4 text-left">Nombre</th>
                  <th className="py-2 px-4 text-left">Apellido</th>
                  <th className="py-2 px-4 text-left">DNI</th>
                  <th className="py-2 px-4 text-left">Email</th>
                  <th className="py-2 px-4 text-left">Usuario</th>
                  <th className="py-2 px-4 text-left">Tipo</th>
                  <th className="py-2 px-4 text-left">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {usuarios.map((u) => (
                  <tr key={u.id} className="border-t hover:bg-gray-50">
                    <td className="py-2 px-4">{u.firstName}</td>
                    <td className="py-2 px-4">{u.lastName}</td>
                    <td className="py-2 px-4">{u.dni}</td>
                    <td className="py-2 px-4">{u.email}</td>
                    <td className="py-2 px-4">{u.username}</td>
                    <td className="py-2 px-4 capitalize">{u.type}</td>
                    <td className="py-2 px-4">
                      {resettingPassword === u.id ? (
                        <div className="space-y-1">
                          <p className="text-sm text-gray-700">
                            ¿Confirmar restablecimiento?
                          </p>
                          <div className="flex gap-2">
                            <button
                              onClick={() =>
                                handleResetPassword(
                                  u.id,
                                  `${u.firstName} ${u.lastName}`
                                )
                              }
                              className="bg-red-600 text-white px-3 py-1 rounded hover:bg-red-700 text-sm"
                            >
                              Sí
                            </button>
                            <button
                              onClick={() => setResettingPassword(null)}
                              className="bg-gray-400 text-white px-3 py-1 rounded hover:bg-gray-500 text-sm"
                            >
                              No
                            </button>
                          </div>
                        </div>
                      ) : (
                        <span
                          onClick={() => setResettingPassword(u.id)}
                          className="text-red-600 cursor-pointer hover:underline text-sm"
                        >
                          Restablecer Contraseña
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Vista de cards para móvil */}
          <div className="block lg:hidden space-y-4">
            {usuarios.map((u) => (
              <div key={u.id} className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="font-semibold">Nombre:</span>
                    <span>{u.firstName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-semibold">Apellido:</span>
                    <span>{u.lastName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-semibold">DNI:</span>
                    <span>{u.dni}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-semibold">Email:</span>
                    <span className="text-sm break-all">{u.email}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-semibold">Usuario:</span>
                    <span>{u.username}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-semibold">Tipo:</span>
                    <span className="capitalize">{u.type}</span>
                  </div>
                  <div className="pt-2 border-t">
                    {resettingPassword === u.id ? (
                      <div className="space-y-2">
                        <p className="text-sm text-gray-700 text-center">
                          ¿Confirmar restablecimiento?
                        </p>
                        <div className="flex gap-2 justify-center">
                          <button
                            onClick={() =>
                              handleResetPassword(
                                u.id,
                                `${u.firstName} ${u.lastName}`
                              )
                            }
                            className="bg-red-600 text-white px-3 py-1 rounded hover:bg-red-700 text-sm"
                          >
                            Sí
                          </button>
                          <button
                            onClick={() => setResettingPassword(null)}
                            className="bg-gray-400 text-white px-3 py-1 rounded hover:bg-gray-500 text-sm"
                          >
                            No
                          </button>
                        </div>
                      </div>
                    ) : (
                      <button
                        onClick={() => setResettingPassword(u.id)}
                        className="w-full bg-red-600 text-white px-3 py-2 rounded hover:bg-red-700 text-sm"
                      >
                        Restablecer Contraseña
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );

  if (profesores.loading && estudiantes.loading) {
    return (
      <p className="text-center text-lg text-gray-600 mt-10">
        Cargando usuarios...
      </p>
    );
  }

  return (
    <motion.div
      className="w-full px-4 sm:px-6 bg-white rounded-lg shadow"
      initial={{ opacity: 0, x: -50 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 50 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
    >
      <div className="py-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <h2 className="text-xl sm:text-2xl font-bold text-teal-800">Panel de Usuarios</h2>
          <button
            onClick={() => navigate("/registro")}
            className="w-full sm:w-auto bg-teal-600 hover:bg-teal-700 text-white px-4 py-2 rounded-md shadow text-sm sm:text-base"
          >
            + Agregar Usuario
          </button>
        </div>

        {message && (
          <div
            className={`p-4 mb-4 rounded-lg border text-sm ${
              message.type === "success"
                ? "bg-green-100 text-green-800 border-green-300"
                : "bg-red-100 text-red-800 border-red-300"
            }`}
          >
            <div className="flex justify-between items-center">
              <span>{message.text}</span>
              <button onClick={() => setMessage(null)} className="font-bold px-2">
                ×
              </button>
            </div>
          </div>
        )}

        <div className="mb-6">
          <div className="flex flex-col sm:flex-row gap-2 justify-center items-center">
            <input
              type="text"
              placeholder="Buscar por nombre o apellido..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setProfesores(prev => ({ ...prev, page: 0 }));
                setEstudiantes(prev => ({ ...prev, page: 0 }));
              }}
              className="w-full sm:max-w-sm px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-400"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm("")}
                className="w-full sm:w-auto bg-gray-500 text-white px-4 py-2 rounded-md text-sm"
              >
                Limpiar
              </button>
            )}
          </div>
        </div>

        {searchTerm && (
          <p className="text-center text-gray-600 mb-4">
            Mostrando resultados para: "{searchTerm}" 
            (Profesores: {profesores.users.length}, Estudiantes: {estudiantes.users.length})
          </p>
        )}

        {/* Sección Profesores */}
        <UserTable usuarios={profesoresFiltrados} titulo="Profesores" />
        <PaginationControls 
          tipo="Profesores" 
          state={profesores} 
          setState={setProfesores} 
        />

        {/* Sección Estudiantes */}
        <UserTable usuarios={estudiantesFiltrados} titulo="Estudiantes" />
        <PaginationControls 
          tipo="Estudiantes" 
          state={estudiantes} 
          setState={setEstudiantes} 
        />
      </div>
    </motion.div>
  );
}
