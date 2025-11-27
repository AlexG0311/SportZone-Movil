export async function ReservarEscenario({
  fecha,
  horaInicio,
  horaFin,
  escenarioId,
  usuarioId,
  estadoId
}: {
  fecha: string;
  horaInicio: string;
  horaFin: string;
  escenarioId: number;
  usuarioId: number;
  estadoId: number;
}) {
  try {
    console.log("=== DATOS ENVIADOS A LA API ===");
    console.log({
      fecha,
      horaInicio,  // ✅ Enviar directamente como HH:MM
      horaFin,     // ✅ Enviar directamente como HH:MM
      escenarioId,
      usuarioId,
      estadoId
    });

    const res = await fetch("https://backend-sportzone-production.up.railway.app/api/reserva/", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        fecha,
        horaInicio,  // ✅ String HH:MM (igual que React Web)
        horaFin,     // ✅ String HH:MM (igual que React Web)
        escenarioId,
        usuarioId,
        estadoId
      }),
    });

    console.log("=== RESPUESTA DE LA API ===");
    console.log("Status:", res.status);

    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
      console.error("Error de la API:", errorData);
      
      // ✅ Retornar el objeto con error como lo hace React Web
      return { 
        ok: false, 
        error: errorData.error || "Error en la solicitud de reserva" 
      };
    }

    const data = await res.json();
    console.log("✅ Reserva creada exitosamente:", data);
    
    // ✅ Retornar en el mismo formato que React Web
    return { ok: true, data };
    
  } catch (error) {
    console.error("❌ Error en la solicitud de reserva:", error);
    return { 
      ok: false, 
      error: error instanceof Error ? error.message : "Error desconocido" 
    };
  }
}
