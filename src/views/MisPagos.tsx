import VistaPagos from "../views/VistaPagos";

export default function MisPagos() {
  const userRaw = localStorage.getItem("user");

  if (!userRaw) {
    return <p>Error: usuario no logueado</p>;
  }

  try {
    const user = JSON.parse(userRaw);

    if (!user.username || !user.type) {
      return <p>Error: usuario inválido</p>;
    }

    return <VistaPagos username={user.username} type={user.type} />;
  } catch (err) {
    return <p>Error: datos corruptos en localStorage</p>;
  }
}