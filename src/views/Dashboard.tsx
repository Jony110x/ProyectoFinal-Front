//#region IMPORTACIONES
import { useNavigate } from "react-router-dom";
import logo from "../assets/LogoPNGtransparente.png";
import {
  FaMoneyBillWave,
  FaEnvelope,
  FaBook,
  FaUserPlus,
} from "react-icons/fa";
import { motion } from "framer-motion";
//#endregion

//#region COMPONENTE PRINCIPAL DASHBOARD
function Dashboard() {
  //#region ESTADOS Y HOOKS
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const { firstName, lastName, type } = user;

  const handleNavigation = (path: string, section: string) => {
    console.log("redirigue ---> ", section);
    setTimeout(() => {
      navigate(path);
    }, 300);
  };

  //#endregion

  //#region RENDER
  return (
    <>
      <motion.div
        className="min-h-screen bg-gradient-to-r from-teal-100 to-white w-full"
        initial={{ opacity: 0, x: -50 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: 50 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
      >
        <div className="w-full px-4 sm:px-6 py-4 sm:py-8">
          {/* Sección de bienvenida */}
          <div className="text-center mb-6 sm:mb-10">
            <img
              src={logo}
              alt="Logo universidad"
              className="h-24 sm:h-32 mx-auto mb-2 object-contain"
            />
            <h1 className="text-xl sm:text-3xl font-bold text-teal-800">
              Bienvenido/a, {firstName} {lastName}
            </h1>
            <p className="text-lg sm:text-xl text-gray-600 mt-2 capitalize">
              Rol: {type}
            </p>
          </div>

          {/* Panel de accesos rápidos */}
          <div className="w-full flex justify-center">
            <div
              className="flex flex-wrap justify-center gap-5 sm:gap-7"
              style={{ maxWidth: "1100px" }}
            >
              {/* 🔹 *Componente TARJETA — Reutilizable* */}
              {type === "estudiante" && (
                <>
                  {/* Pagos */}
                  <Card
                    icon={<FaMoneyBillWave size={34} />}
                    title="Pagos recientes"
                    description="Consultá tus últimos pagos y su estado."
                    onClick={() => handleNavigation("/vistaPagos", "Pagos")}
                  />

                  {/* Mensajes */}
                  <Card
                    icon={<FaEnvelope size={34} />}
                    title="Mensajes"
                    description="Revisá tus conversaciones con profesores y administración."
                    onClick={() => handleNavigation("/mensajes", "Mensajes")}
                  />

                  {/* Materias */}
                  <Card
                    icon={<FaBook size={34} />}
                    title="Materias"
                    description="Accedé a tus materias y a la información de cursado."
                    onClick={() => handleNavigation("/career", "Materias")}
                  />
                </>
              )}

              {type === "profesor" && (
                <>
                  {/* Mensajes */}
                  <Card
                    icon={<FaEnvelope size={34} />}
                    title="Mensajes"
                    description="Gestioná comunicaciones con estudiantes y administración."
                    onClick={() => handleNavigation("/mensajes", "Mensajes")}
                  />

                  {/* Materias */}
                  <Card
                    icon={<FaBook size={34} />}
                    title="Materias"
                    description="Visualizá tus materias y cargá notas fácilmente."
                    onClick={() =>
                      handleNavigation("/users/:userId/materias", "Materias")
                    }
                  />
                </>
              )}

              {type === "admin" && (
                <>
                  <Card
                    icon={<FaEnvelope size={34} />}
                    title="Mensajes"
                    description="Enviá y recibí mensajes con usuarios del sistema."
                    onClick={() => handleNavigation("/mensajes", "Mensajes")}
                  />

                  <Card
                    icon={<FaMoneyBillWave size={34} />}
                    title="Realizar Pagos"
                    description="Registrá y administrá pagos de estudiantes."
                    onClick={() => handleNavigation("/pagos", "Pagos")}
                  />

                  <Card
                    icon={<FaBook size={34} />}
                    title="Carreras recientes"
                    description="Gestioná carreras, materias y asignaciones."
                    onClick={() => handleNavigation("/career", "Carreras")}
                  />

                  <Card
                    icon={<FaUserPlus size={34} />}
                    title="Usuarios nuevos"
                    description="Registrá nuevos usuarios y administrá sus perfiles."
                    onClick={() => handleNavigation("/registro", "Registro")}
                  />
                </>
              )}
            </div>
          </div>
        </div>
      </motion.div>
    </>
  );
}

// 🔹 Card Reutilizable con diseño pro
const Card = ({
  icon,
  title,
  description,
  onClick,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
  onClick: () => void;
}) => (
  <motion.div
    whileHover={{ scale: 1.03, y: -2 }}
    transition={{ duration: 0.2 }}
    onClick={onClick}
    className="bg-white shadow-lg hover:shadow-xl rounded-xl w-full sm:w-56 px-6 py-7
               flex flex-col items-center justify-center cursor-pointer transition-all border border-gray-100"
  >
    <motion.div
      initial={{ scale: 0.85, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ duration: 0.25 }}
      className="text-teal-600 mb-4"
    >
      {icon}
    </motion.div>

    <h3 className="text-lg font-semibold text-teal-800 mb-1 text-center">
      {title}
    </h3>

    <p className="text-sm text-gray-500 text-center leading-tight">
      {description}
    </p>
  </motion.div>
);

export default Dashboard;
//#endregion