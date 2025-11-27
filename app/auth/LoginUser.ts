export async function LoginUser({
  email,
  contrasena,
}: {
  email: string;
  contrasena: string; 
}) {
  try {
    const res = await fetch("https://backend-sportzone-production.up.railway.app/api/usuario/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email,
        contrasena,
      }),
    });

    if (!res.ok) {
      throw new Error(`HTTP error! status: ${res.status}`);
    }

    const data = await res.json();

    return { res, data };
  } catch (error) {
    console.error("Error en la solicitud de inicio de sesión:", error);
    return { res: null, data: null };
  }
}
