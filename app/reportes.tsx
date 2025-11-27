import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Image,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  Alert,
} from "react-native";
import { useState, useEffect } from "react";
import { useRouter, Stack } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useAuth } from "./context/AuthContext";

interface Reporte {
  id: number;
  descripcion: string;
  imagenUrl: string | null;
  fechaReporte: string; // ✅ Cambio: createdAt -> fechaReporte
  usuario: {
    id: number;
    nombre: string;
    email: string;
  };
  escenario: {
    id: number;
    nombre: string;
    direccion: string;
  };
}

export default function MisReportes() {
  const router = useRouter();
  const { user } = useAuth();

  const [reportes, setReportes] = useState<Reporte[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    if (user) {
      fetchReportes();
    }
  }, [user]);

  const fetchReportes = async () => {
    if (!user) return;

    try {
      // Obtener escenarios del usuario
      const escenariosResponse = await fetch(
        `https://backend-sportzone-production.up.railway.app/api/escenario/usuario/${user.id}`
      );
      
      if (!escenariosResponse.ok) {
        throw new Error('Error al obtener escenarios');
      }
      
      const escenarios = await escenariosResponse.json();

      console.log('Escenarios del usuario:', escenarios); // ✅ Debug

      if (!escenarios || escenarios.length === 0) {
        setReportes([]);
        setLoading(false);
        return;
      }

      // Obtener reportes de todos los escenarios del usuario
      const reportesPromises = escenarios.map(async (escenario: any) => {
        try {
          const response = await fetch(
            `https://backend-sportzone-production.up.railway.app/api/reportar/escenario/${escenario.id}`
          );
          if (!response.ok) {
            console.warn(`Error al obtener reportes del escenario ${escenario.id}`);
            return [];
          }
          const data = await response.json();
          console.log(`Reportes del escenario ${escenario.id}:`, data); // ✅ Debug
          return data;
        } catch (error) {
          console.warn(`Error en escenario ${escenario.id}:`, error);
          return [];
        }
      });

      const reportesArrays = await Promise.all(reportesPromises);
      const todosLosReportes = reportesArrays.flat();

      console.log('Total de reportes:', todosLosReportes); // ✅ Debug

      // ✅ Filtrar reportes válidos (con escenario y usuario)
      const reportesValidos = todosLosReportes.filter(
        (reporte) => reporte.escenario && reporte.usuario
      );

      // Ordenar por fecha más reciente
      reportesValidos.sort(
        (a, b) =>
          new Date(b.fechaReporte).getTime() - new Date(a.fechaReporte).getTime() // ✅ Cambio
      );

      setReportes(reportesValidos);
    } catch (error) {
      console.error("Error al cargar reportes:", error);
      Alert.alert("Error", "No se pudieron cargar los reportes");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchReportes();
  };

  const formatearFecha = (fecha: string) => {
    const date = new Date(fecha);
    const ahora = new Date();
    const diff = ahora.getTime() - date.getTime();
    const dias = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (dias === 0) return "Hoy";
    if (dias === 1) return "Ayer";
    if (dias < 7) return `Hace ${dias} días`;

    return date.toLocaleDateString("es-ES", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  const verDetalleReporte = (reporte: Reporte) => {
    Alert.alert(
      "Detalle del Reporte",
      `Escenario: ${reporte.escenario.nombre}\n\nReportado por: ${reporte.usuario.nombre}\n\nFecha: ${formatearFecha(
        reporte.fechaReporte // ✅ Cambio
      )}\n\nDescripción:\n${reporte.descripcion}`,
      [
        {
          text: "Cerrar",
          style: "cancel",
        },
        {
          text: "Ver Escenario",
          onPress: () => router.push(`/${reporte.escenario.id}`),
        },
      ]
    );
  };

  const renderReporte = ({ item }: { item: Reporte }) => {
    // ✅ Validación adicional de seguridad
    if (!item.escenario || !item.usuario) {
      console.warn('Reporte con datos incompletos:', item);
      return null;
    }

    return (
      <TouchableOpacity
        style={styles.reporteCard}
        onPress={() => verDetalleReporte(item)}
        activeOpacity={0.7}
      >
        <View style={styles.reporteHeader}>
          <View style={styles.headerLeft}>
            <Ionicons name="alert-circle" size={24} color="#371d1dff" />
            <View style={styles.headerInfo}>
              <Text style={styles.escenarioNombre} numberOfLines={1}>
                {item.escenario.nombre}
              </Text>
              <Text style={styles.fecha}>{formatearFecha(item.fechaReporte)}</Text> 
            </View>
          </View>
          <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
        </View>

        <View style={styles.reporteContent}>
          {item.imagenUrl ? (
            <Image
              source={{ uri: item.imagenUrl }}
              style={styles.reporteImagen}
              resizeMode="cover"
            />
          ) : (
            <View style={[styles.reporteImagen, styles.noImage]}>
              <Ionicons name="image-outline" size={40} color="#9CA3AF" />
            </View>
          )}
          <View style={styles.reporteInfo}>
            <Text style={styles.descripcion} numberOfLines={3}>
              {item.descripcion}
            </Text>
            <View style={styles.usuarioInfo}>
              <Ionicons name="person-circle-outline" size={16} color="#6B7280" />
              <Text style={styles.usuarioNombre} numberOfLines={1}>
                {item.usuario.nombre}
              </Text>
            </View>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  const renderEmpty = () => (
    <View style={styles.emptyContainer}>
      <Ionicons name="checkmark-circle-outline" size={80} color="#D1D5DB" />
      <Text style={styles.emptyTitle}>No hay reportes</Text>
      <Text style={styles.emptyText}>
        Tus escenarios no tienen reportes de daños en este momento
      </Text>
    </View>
  );

  if (loading) {
    return (
      <View style={[styles.container, styles.centered]}>
        <Stack.Screen
          options={{
            title: "Reportes de Mis Escenarios",
            headerStyle: {
              backgroundColor: "#10B981",
            },
            headerTintColor: "#fff",
            headerTitleStyle: {
              fontWeight: "bold",
            },
          }}
        />
        <ActivityIndicator size="large" color="#10B981" />
        <Text style={styles.loadingText}>Cargando reportes...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Stack.Screen
        options={{
          title: "Reportes de Mis Escenarios",
          headerStyle: {
            backgroundColor: "#10B981",
          },
          headerTintColor: "#fff",
          headerTitleStyle: {
            fontWeight: "bold",
          },
        }}
      />

      <View style={styles.statsContainer}>
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>{reportes.length}</Text>
          <Text style={styles.statLabel}>Reportes Totales</Text>
        </View>
        <View style={[styles.statCard, styles.statCardDanger]}>
          <Ionicons name="warning" size={32} color="#EF4444" />
          <Text style={styles.statLabel}>Requieren Atención</Text>
        </View>
      </View>

      <FlatList
        data={reportes}
        renderItem={renderReporte}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={["#10B981"]}
            tintColor="#10B981"
          />
        }
        ListEmptyComponent={renderEmpty}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F9FAFB",
  },
  centered: {
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: "#6B7280",
  },
  statsContainer: {
    flexDirection: "row",
    padding: 16,
    gap: 12,
  },
  statCard: {
    flex: 1,
    backgroundColor: "#fff",
    padding: 16,
    borderRadius: 12,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statCardDanger: {
    backgroundColor: "#FEF2F2",
  },
  statNumber: {
    fontSize: 32,
    fontWeight: "bold",
    color: "#10B981",
  },
  statLabel: {
    fontSize: 12,
    color: "#6B7280",
    marginTop: 4,
    textAlign: "center",
  },
  listContent: {
    padding: 16,
    paddingTop: 0,
  },
  reporteCard: {
    backgroundColor: "#fff",
    borderRadius: 12,
    marginBottom: 16,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  reporteHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    backgroundColor: "#FEF2F2",
    borderBottomWidth: 1,
    borderBottomColor: "#FEE2E2",
  },
  headerLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  headerInfo: {
    marginLeft: 12,
    flex: 1,
  },
  escenarioNombre: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#111827",
  },
  fecha: {
    fontSize: 12,
    color: "#6B7280",
    marginTop: 2,
  },
  reporteContent: {
    flexDirection: "row",
    padding: 16,
  },
  reporteImagen: {
    width: 100,
    height: 100,
    borderRadius: 8,
  },
  noImage: {
    backgroundColor: "#F3F4F6",
    justifyContent: "center",
    alignItems: "center",
  },
  reporteInfo: {
    flex: 1,
    marginLeft: 12,
    justifyContent: "space-between",
  },
  descripcion: {
    fontSize: 14,
    color: "#374151",
    lineHeight: 20,
  },
  usuarioInfo: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 8,
    gap: 6,
  },
  usuarioNombre: {
    fontSize: 12,
    color: "#6B7280",
    flex: 1,
  },
  emptyContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 60,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#374151",
    marginTop: 16,
  },
  emptyText: {
    fontSize: 14,
    color: "#9CA3AF",
    marginTop: 8,
    textAlign: "center",
    paddingHorizontal: 40,
  },
});