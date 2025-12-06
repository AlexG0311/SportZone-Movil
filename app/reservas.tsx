import {
  Text,
  View,
  FlatList,
  StyleSheet,
  Image,
  Pressable,
} from "react-native";

import { useEffect, useState } from "react";
import { icons } from "./icons/icons";
import { useAuth } from "./context/AuthContext";
import { ActivityIndicator } from "react-native";

type Imagen = {
  id: number;
  url: string;
  alt?: string;
};

type Reserva = {
  id: number;
  usuarioId: number;
  escenarioId: number;
  fecha: string;
  horaInicio: string;
  horaFin: string;
  estadoId: number;
  escenario: {
    id: number;
    nombre: string;
    tipo: string;
    direccion: string;
    precio: number;
    imagenes: Imagen[];
  };
  estado: {
    id: number;
    nombre: string;
  } | null; // 
  usuario: {
    id: number;
    nombre: string;
    email: string;
  };
};

export default function Reservas() {
  const [loading, setLoading] = useState(true);
  const [reservas, setReservas] = useState<Reserva[]>([]);
  const { user } = useAuth();

  if (!user) {
    return (
    
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>No has iniciado sesión</Text>
          <Text style={styles.emptySubtext}>
            Por favor, inicia sesión para ver tus reservas.
          </Text>
        </View>
      
    );
  }

  const obtenerReservas = async () => {
    try {
      const response = await fetch(
        `https://backend-sportzone-production.up.railway.app/api/reserva/usuario/${user.id}`
      );
      const data = await response.json();
      console.log("Reservas obtenidas:", data); // ✅ Para debugging
      setLoading(false);
      setReservas(data);
    } catch (error) {
      console.error("Error al obtener reservas:", error);
    }finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    obtenerReservas();
  }, []);

  const getEstadoColor = (estado: string | null) => {
    if (!estado) return "#6B7280"; // 
    switch (estado.toLowerCase()) {
      case "completada":
      case "activa":
        return "#10B981";
      case "pendiente":
        return "#F59E0B";
      case "cancelada":
      case "inactiva":
        return "#EF4444";
      default:
        return "#6B7280";
    }
  };

  const getEstadoTexto = (estado: string | null) => {
    if (!estado) return "Sin estado"; // 

    switch (estado.toLowerCase()) {
      case "completada":
        return "Completada";
      case "pendiente":
        return "Pendiente";
      case "cancelada":
        return "Cancelada";
      case "activa":
        return "Activa";
      case "inactiva":
        return "Inactiva";
      default:
        return estado;
    }
  };

  const formatearFecha = (fecha: string) => {
    const date = new Date(fecha);
    return date.toLocaleDateString("es-ES", {
      weekday: "short",
      day: "numeric",
      month: "short",
    });
  };

  const formatearHora = (hora: string) => {
    const date = new Date(hora);
    return date.toLocaleTimeString("es-ES", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatearPrecio = (precio: number) => {
    return new Intl.NumberFormat("es-CO", {
      style: "currency",
      currency: "COP",
      minimumFractionDigits: 0,
    }).format(precio);
  };

  const renderReservaItem = ({ item }: { item: Reserva }) => (
    <Pressable style={styles.reservaCard}>
      <View style={styles.cardHeader}>
        <Image
          source={{
            uri:
              item.escenario?.imagenes[0]?.url ||
              "https://via.placeholder.com/80x60?text=Sin+Imagen",
          }}
          style={styles.escenarioImage}
          resizeMode="cover"
        />
        <View style={styles.headerContent}>
          <Text style={styles.escenarioNombre} numberOfLines={2}>
            {item.escenario?.nombre || "Sin nombre"}
          </Text>
          <View style={styles.estadoContainer}>
            <View
              style={[
                styles.estadoBadge,
                {
                  backgroundColor: getEstadoColor(item.estado?.nombre || null),
                },
              ]}
            >
              <Text style={styles.estadoTexto}>
                {getEstadoTexto(item.estado?.nombre || null)}
              </Text>
            </View>
          </View>
        </View>
      </View>

      <View style={styles.cardBody}>
        <View style={styles.infoRow}>
          {icons.reservas({ color: "#6B7280", size: 16 })}
          <Text style={styles.infoText}>
            {formatearFecha(item.fecha)} • {formatearHora(item.horaInicio)} -{" "}
            {formatearHora(item.horaFin)}
          </Text>
        </View>

        <View style={styles.infoRow}>
          {icons.escenarios({ color: "#6B7280", size: 16 })}
          <Text style={styles.infoText}>
            {item.escenario?.direccion || "Sin dirección"}
          </Text>
        </View>

        <View style={styles.infoRow}>
          {icons.reportes({ color: "#6B7280", size: 16 })}
          <Text style={styles.infoText}>
            Tipo: {item.escenario?.tipo || "Sin tipo"}
          </Text>
        </View>
      </View>

      <View style={styles.cardFooter}>
        <Text style={styles.precioTexto}>
          {formatearPrecio(item.escenario?.precio || 0)}
        </Text>
        <Pressable style={styles.accionButton}>
          <Text style={styles.accionTexto}>Ver detalles</Text>
        </Pressable>
      </View>
    </Pressable>
  );

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" color="#0000ff"  /> 
        <Text>Cargando reservas...</Text>
      </View>
    );
  }

 
  return (
    <FlatList
        data={reservas}
        renderItem={renderReservaItem}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No tienes reservas{user.id}</Text>
            <Text style={styles.emptySubtext}>¡Haz tu primera reserva!</Text>
          </View>
        }
      />
    
  );
}

// ...existing styles...

const styles = StyleSheet.create({
  header: {
    paddingHorizontal: 16,
    paddingTop: 50,
    paddingBottom: 16,
    backgroundColor: "#FFFFFF",
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#1F2937",
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 16,
    color: "#6B7280",
  },
  statsContainer: {
    flexDirection: "row",
    paddingHorizontal: 16,
    paddingBottom: 16,
    gap: 12,
  },
  statCard: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    padding: 16,
    borderRadius: 12,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  statNumber: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#1F2937",
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: "#6B7280",
    textAlign: "center",
  },
  list: {
    padding: 16,
    paddingTop: 8,
  },
  reservaCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
    overflow: "hidden",
  },
  cardHeader: {
    flexDirection: "row",
    padding: 16,
    alignItems: "flex-start",
  },
  escenarioImage: {
    width: 80,
    height: 60,
    borderRadius: 8,
    backgroundColor: "#F3F4F6",
  },
  headerContent: {
    flex: 1,
    marginLeft: 12,
  },
  escenarioNombre: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#1F2937",
    marginBottom: 8,
  },
  estadoContainer: {
    alignItems: "flex-start",
  },
  estadoBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  estadoTexto: {
    fontSize: 12,
    color: "#FFFFFF",
    fontWeight: "600",
  },
  cardBody: {
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  infoText: {
    fontSize: 14,
    color: "#6B7280",
    marginLeft: 8,
    flex: 1,
  },
  cardFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: "#F9FAFB",
    borderTopWidth: 1,
    borderTopColor: "#F3F4F6",
  },
  precioTexto: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#10B981",
  },
  accionButton: {
    backgroundColor: "#3B82F6",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  accionTexto: {
    fontSize: 14,
    color: "#FFFFFF",
    fontWeight: "600",
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 40,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#6B7280",
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: "#9CA3AF",
    textAlign: "center",
  },
});
