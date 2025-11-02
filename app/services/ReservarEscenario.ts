

export async function ReservarEscenario( {fecha, horaInicio, horaFin, escenarioId, usuarioId} : {fecha: string, horaInicio: string, horaFin: string, escenarioId: number, usuarioId: number} ) {

    try{

const res = await fetch('http://192.168.100.147:4000/api/reserva', {
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
    },
    body: JSON.stringify({
        fecha,
        horaInicio,
        horaFin,
        escenarioId,
        usuarioId,
        estadoId: 6  // Asumiendo que 6 es el ID para "Pendiente"
    }),

    });

    if (!res.ok) {
        throw new Error("Error en la solicitud de reserva");
    }

    const data = await res.json();
    return { res, data };


    
    }catch(error){
        console.error("Error en la solicitud de reserva:", error);
        return { res: null, data: null };
    }




}