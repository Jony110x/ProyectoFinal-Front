import { useEffect, useRef, useState } from "react";
import axios from "axios";
import { FaPaperclip, FaTrash, FaTimes } from "react-icons/fa";
import { motion } from "framer-motion";

interface Message {
  id: number;
  sender_id: number;
  receiver_id: number;
  content: string;
  timestamp: string;
  sender_name: string;
  file_url?: string;
}

interface UsuarioChat {
  id: number;
  nombre: string;
  type: string;
}

export default function BandejaMensajes() {
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const [mensajes, setMensajes] = useState<Message[]>([]);
  const [usuarios, setUsuarios] = useState<UsuarioChat[]>([]);
  const [conversacionSeleccionada, setConversacionSeleccionada] = useState<number | null>(null);
  const [nuevoMensaje, setNuevoMensaje] = useState("");
  const [mostrarNuevaConv, setMostrarNuevaConv] = useState(false);
  const [nuevoDestinatario, setNuevoDestinatario] = useState("");
  const [usuariosBusqueda, setUsuariosBusqueda] = useState<UsuarioChat[]>([]);
  const [searchChat, setSearchChat] = useState("");
  const [archivoAdjunto, setArchivoAdjunto] = useState<File | null>(null);

  // Estados para infinite scroll
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const observerRef = useRef<HTMLDivElement | null>(null);

  const mensajeRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const fetchMensajes = async () => {
    try {
      const res = await axios.get(`https://proyectofinal-backend-1-uqej.onrender.com/messages/${user.id}`);
      setMensajes(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchUsuarios = async () => {
    try {
      const res = await axios.get(`https://proyectofinal-backend-1-uqej.onrender.com/messages/available/${user.id}`);
      setUsuarios(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const buscarUsuarios = async (termino: string, pageNum = 1) => {
    if (!termino.trim()) {
      setUsuariosBusqueda([]);
      setHasMore(false);
      return;
    }

    try {
      const res = await axios.get(
        `https://proyectofinal-backend-1-uqej.onrender.com/messages/available/${user.id}?search=${encodeURIComponent(
          termino
        )}&page=${pageNum}&limit=10`
      );

      if (pageNum === 1) {
        setUsuariosBusqueda(res.data);
      } else {
        setUsuariosBusqueda((prev) => [...prev, ...res.data]);
      }

      setHasMore(res.data.length > 0);
    } catch (err) {
      console.error("Error buscando usuarios:", err);
      setHasMore(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      setPage(1);
      buscarUsuarios(nuevoDestinatario, 1);
    }, 300);

    return () => clearTimeout(timer);
  }, [nuevoDestinatario]);

  useEffect(() => {
    if (!hasMore) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && nuevoDestinatario.trim()) {
          setPage((prev) => prev + 1);
        }
      },
      { threshold: 1.0 }
    );

    if (observerRef.current) observer.observe(observerRef.current);

    return () => {
      if (observerRef.current) observer.unobserve(observerRef.current);
    };
  }, [hasMore, nuevoDestinatario]);

  useEffect(() => {
    if (page > 1) {
      buscarUsuarios(nuevoDestinatario, page);
    }
  }, [page]);

  useEffect(() => {
    fetchMensajes();
    fetchUsuarios();
  }, [user.id]);

  useEffect(() => {
    if (mensajeRef.current) {
      mensajeRef.current.scrollTop = mensajeRef.current.scrollHeight;
    }
  }, [conversacionSeleccionada, mensajes]);

  const enviarMensaje = async () => {
    if (!conversacionSeleccionada || (!nuevoMensaje.trim() && !archivoAdjunto)) return;

    const formData = new FormData();
    formData.append("sender_id", user.id.toString());
    formData.append("receiver_id", conversacionSeleccionada.toString());
    formData.append("content", nuevoMensaje.trim());
    if (archivoAdjunto) {
      formData.append("file", archivoAdjunto);
    }

    try {
      await axios.post("https://proyectofinal-backend-1-uqej.onrender.com/messages/send", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setNuevoMensaje("");
      setArchivoAdjunto(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
      fetchMensajes();
    } catch (error) {
      console.error("Error enviando mensaje:", error);
    }
  };

  const eliminarMensaje = async (id: number, timestamp: string) => {
    const ahora = new Date();
    const enviado = new Date(timestamp);
    if ((ahora.getTime() - enviado.getTime()) / 60000 > 10) {
      alert("Solo se pueden eliminar mensajes de los últimos 10 minutos");
      return;
    }
    try {
      await axios.delete(`https://proyectofinal-backend-1-uqej.onrender.com/messages/${id}`);
      fetchMensajes();
    } catch (err) {
      console.error(err);
    }
  };

  const eliminarChat = async () => {
    if (!conversacionSeleccionada) return;
    if (!confirm("¿Seguro querés eliminar todo el chat?")) return;
    try {
      await axios.delete(`https://proyectofinal-backend-1-uqej.onrender.com/messages/chat/${user.id}/${conversacionSeleccionada}`);
      fetchMensajes();
    } catch (err) {
      console.error(err);
    }
  };

  const manejarSeleccionArchivo = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    setArchivoAdjunto(file);
  };

  const removerArchivo = () => {
    setArchivoAdjunto(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const obtenerNombreArchivo = (url: string) => {
    return url.split("/").pop() || "archivo";
  };

  const formatearTamano = (bytes: number) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  const conversacionesConMensajes: (UsuarioChat & { ultimoMensaje: string; timestamp: string })[] =
    usuarios
      .map((u) => {
        const mensajesCon = mensajes.filter(
          (m) => m.sender_id === u.id || m.receiver_id === u.id
        );
        if (mensajesCon.length === 0) return null;

        const ultimo = mensajesCon.sort(
          (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
        )[0];

        return {
          ...u,
          ultimoMensaje: ultimo?.content || "📎 Archivo adjunto",
          timestamp: ultimo?.timestamp || "",
        };
      })
      .filter((c): c is UsuarioChat & { ultimoMensaje: string; timestamp: string } => c !== null)
      .filter((c) => c.nombre.toLowerCase().includes(searchChat.toLowerCase()));

  const usuariosSinConversacion = usuarios.filter(
    (u) => !conversacionesConMensajes.find((c) => c.id === u.id)
  );

  const iniciarConversacion = (id: number) => {
    setConversacionSeleccionada(id);
    setMostrarNuevaConv(false);
    setNuevoDestinatario("");
    setUsuariosBusqueda([]);
  };

  return (
    <motion.div
      className="w-full px-4 sm:px-6 bg-white rounded-lg shadow"
      initial={{ opacity: 0, x: -50 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 50 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
    >
      <div className="min-h-screen bg-gray-100 py-4 px-2 sm:px-4">
        <div className="flex flex-col lg:flex-row gap-4 h-[85vh]">
          {/* Conversaciones */}
          <div className="w-full lg:w-1/3 bg-white shadow-md rounded-lg p-3 sm:p-4 flex flex-col">
            <div className="flex justify-between items-center mb-3">
              <h2 className="text-lg font-bold text-teal-800">Conversaciones</h2>
              <button
                onClick={() => setMostrarNuevaConv(!mostrarNuevaConv)}
                className="text-green-700 hover:underline text-sm"
              >
                Nueva +
              </button>
            </div>

            <input
              type="text"
              placeholder="Buscar chat..."
              value={searchChat}
              onChange={(e) => setSearchChat(e.target.value)}
              className="mb-3 px-2 py-2 border rounded w-full text-sm"
            />

            {mostrarNuevaConv && (
              <div className="mb-3 flex flex-col gap-2">
                <input
                  type="text"
                  placeholder="Buscar usuario..."
                  value={nuevoDestinatario}
                  onChange={(e) => setNuevoDestinatario(e.target.value)}
                  className="border p-2 rounded w-full text-sm"
                />
                <div className="border max-h-40 overflow-y-auto">
                  {nuevoDestinatario.trim() ? (
                    usuariosBusqueda.length > 0 ? (
                      <>
                        {usuariosBusqueda.map((u) => (
                          <div
                            key={u.id}
                            onClick={() => iniciarConversacion(u.id)}
                            className="p-2 cursor-pointer hover:bg-teal-100 text-sm"
                          >
                            {u.nombre} ({u.type})
                          </div>
                        ))}
                        {hasMore && <div ref={observerRef} className="h-8" />}
                      </>
                    ) : (
                      <div className="p-2 text-gray-500 text-sm">
                        {nuevoDestinatario.length < 2
                          ? "Escribí al menos 2 caracteres..."
                          : "No se encontraron usuarios"}
                      </div>
                    )
                  ) : (
                    usuariosSinConversacion.map((u) => (
                      <div
                        key={u.id}
                        onClick={() => iniciarConversacion(u.id)}
                        className="p-2 cursor-pointer hover:bg-teal-100 text-sm"
                      >
                        {u.nombre} ({u.type})
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}

            <div className="overflow-y-auto flex-grow">
              {conversacionesConMensajes.map((conv) => (
                <div
                  key={conv.id}
                  onClick={() => setConversacionSeleccionada(conv.id)}
                  className={`flex items-center gap-3 p-2 mb-1 rounded cursor-pointer hover:bg-teal-100 ${
                    conversacionSeleccionada === conv.id ? "bg-teal-200" : ""
                  }`}
                >
                  <div className="w-8 h-8 sm:w-10 sm:h-10 flex items-center justify-center bg-teal-600 text-white rounded-full text-sm sm:text-lg font-bold">
                    {conv.nombre.charAt(0)}
                  </div>
                  <div className="flex-grow min-w-0">
                    <div className="font-semibold text-teal-800 text-sm sm:text-base truncate">
                      {conv.nombre}
                    </div>
                    <div className="text-xs text-gray-600 truncate">
                      {conv.ultimoMensaje}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Mensajes */}
          <div className="w-full lg:flex-1 bg-white shadow-md rounded-lg p-3 sm:p-4 flex flex-col">
            {conversacionSeleccionada ? (
              <>
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 mb-3">
                  <h3 className="font-bold text-teal-800 text-lg">Chat</h3>
                  <button
                    onClick={eliminarChat}
                    className="text-red-600 hover:underline flex items-center gap-1 text-sm"
                  >
                    <FaTrash className="text-xs" /> Eliminar chat
                  </button>
                </div>

                <div
                  ref={mensajeRef}
                  className="flex-grow overflow-y-auto mb-3 p-2 border rounded"
                  style={{ maxHeight: "400px" }}
                >
                  {mensajes
                    .filter(
                      (msg) =>
                        (msg.sender_id === conversacionSeleccionada && msg.receiver_id === user.id) ||
                        (msg.sender_id === user.id && msg.receiver_id === conversacionSeleccionada)
                    )
                    .sort(
                      (a, b) =>
                        new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
                    )
                    .map((msg) => (
                      <div
                        key={msg.id}
                        className={`p-2 my-1 rounded-lg max-w-xs sm:max-w-md relative ${
                          msg.sender_id === user.id
                            ? "bg-teal-100 ml-auto"
                            : "bg-gray-100"
                        }`}
                      >
                        <strong className="text-sm">{msg.sender_id === user.id ? "Yo" : msg.sender_name}</strong>
                        {msg.file_url && (
                          <div className="mt-1 mb-1">
                            <a
                              href={msg.file_url}
                              target="_blank"
                              rel="noreferrer"
                              className="text-blue-600 underline flex items-center gap-1 text-xs"
                            >
                              <FaPaperclip />
                              {obtenerNombreArchivo(msg.file_url)}
                            </a>
                          </div>
                        )}
                        {msg.content && <div className="mt-1 text-sm">{msg.content}</div>}
                        <div className="text-xs text-gray-500 mt-1">
                          {new Date(msg.timestamp).toLocaleString()}
                        </div>
                        {msg.sender_id === user.id && (
                          <button
                            onClick={() => eliminarMensaje(msg.id, msg.timestamp)}
                            className="absolute top-1 right-1 text-red-500 text-xs hover:underline"
                          >
                            Eliminar
                          </button>
                        )}
                      </div>
                    ))}
                </div>

                {archivoAdjunto && (
                  <div className="mb-3 p-2 bg-blue-50 border border-blue-200 rounded-lg">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <FaPaperclip className="text-blue-600 text-sm" />
                        <div>
                          <div className="text-sm font-medium text-blue-800">
                            {archivoAdjunto.name}
                          </div>
                          <div className="text-xs text-blue-600">
                            {formatearTamano(archivoAdjunto.size)}
                          </div>
                        </div>
                      </div>
                      <button
                        onClick={removerArchivo}
                        className="text-red-500 hover:text-red-700 p-1"
                        title="Quitar archivo"
                      >
                        <FaTimes />
                      </button>
                    </div>
                  </div>
                )}

                <div className="flex flex-col sm:flex-row gap-2">
                  <input
                    type="text"
                    value={nuevoMensaje}
                    onChange={(e) => setNuevoMensaje(e.target.value)}
                    placeholder="Escribí un mensaje..."
                    className="flex-grow p-2 border border-gray-300 rounded text-sm"
                    onKeyPress={(e) => {
                      if (e.key === "Enter") {
                        enviarMensaje();
                      }
                    }}
                  />
                  <div className="flex gap-2">
                    <label className="bg-gray-200 p-2 rounded cursor-pointer hover:bg-gray-300 flex items-center text-sm">
                      <FaPaperclip />
                      <input
                        ref={fileInputRef}
                        type="file"
                        className="hidden"
                        onChange={manejarSeleccionArchivo}
                        accept="*/*"
                      />
                    </label>
                    <button
                      onClick={enviarMensaje}
                      className="bg-teal-600 text-white px-4 py-2 rounded hover:bg-teal-700 disabled:bg-gray-400 text-sm"
                      disabled={!nuevoMensaje.trim() && !archivoAdjunto}
                    >
                      Enviar
                    </button>
                  </div>
                </div>
              </>
            ) : (
              <p className="text-gray-600 text-center mt-10 text-sm">
                Seleccioná una conversación o iniciá una nueva.
              </p>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
}