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
import {  Stack, useLocalSearchParams } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useAuth } from "../context/AuthContext";

interface Reporte {
  id: number;
  descripcion: string;
  imagenUrl: string | null;
  fechaReporte: string;
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

export default function ReportesEscenario() {
  
  const { user } = useAuth();
  const { id } = useLocalSearchParams(); // ✅ Ahora usa 'id'

  const [reportes, setReportes] = useState<Reporte[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [escenario, setEscenario] = useState<any>(null);

  useEffect(() => {
    if (user && id) {
      fetchReportesEscenario();
    }
  }, [user, id]);

 
  const fetchReportesEscenario = async () => {
    if (!user || !id) return;

    try {
      const escenarioId = Array.isArray(id) ? id[0] : id; // ✅ Usa 'id'

      // 1. Obtener datos del escenario
      const escenarioResponse = await fetch(
        `https://backend-sportzone-production.up.railway.app/api/escenario/${escenarioId}`
      );

      if (!escenarioResponse.ok) {
        throw new Error('Error al obtener escenario');
      }

      const escenarioData = await escenarioResponse.json();
      setEscenario(escenarioData);

      // 2. Obtener reportes de este escenario
      const reportesResponse = await fetch(
        `https://backend-sportzone-production.up.railway.app/api/reportar/escenario/${escenarioId}`
      );

      if (!reportesResponse.ok) {
        throw new Error('Error al obtener reportes');
      }

      const reportesData = await reportesResponse.json();

      console.log('Reportes del escenario:', reportesData);

      // 3. Enriquecer con datos del escenario
      const reportesEnriquecidos = reportesData.map((reporte: any) => ({
        ...reporte,
        escenario: {
          id: escenarioData.id,
          nombre: escenarioData.nombre,
          direccion: escenarioData.direccion || 'Sin dirección'
        }
      }));

      // 4. Filtrar válidos y ordenar
      const reportesValidos = reportesEnriquecidos.filter(
        (reporte: any) => reporte.escenario && reporte.usuario
      );

      reportesValidos.sort(
        (a: any, b: any) =>
          new Date(b.fechaReporte).getTime() - new Date(a.fechaReporte).getTime()
      );

      setReportes(reportesValidos);
    } catch (error) {
      console.error("Error al cargar reportes:", error);
      Alert.alert("Error", "No se pudieron cargar los reportes del escenario");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchReportesEscenario();
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
        reporte.fechaReporte
      )}\n\nDescripción:\n${reporte.descripcion}`,
      [
        {
          text: "Cerrar",
          style: "cancel",
        },
        {
          text: "Ver Imagen Completa",
          onPress: () => {
            if (reporte.imagenUrl) {
              // Puedes abrir la imagen en modal o navegador
              Alert.alert("Imagen", reporte.imagenUrl);
            }
          },
        },
      ]
    );
  };

  const renderReporte = ({ item }: { item: Reporte }) => {
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
            <Ionicons name="alert-circle" size={24} color="#EF4444" />
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
        Este escenario no tiene reportes de daños
      </Text>
    </View>
  );

  if (loading) {
    return (
      <View style={[styles.container, styles.centered]}>
        <Stack.Screen
          options={{
            title: "Reportes del Escenario",
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
          title: escenario ? `Reportes - ${escenario.nombre}` : "Reportes",
          headerStyle: {
            backgroundColor: "#10B981",
          },
          headerTintColor: "#fff",
          headerTitleStyle: {
            fontWeight: "bold",
          },
        }}
      />

      {/* Info del escenario */}
      {escenario && (
        <View style={styles.escenarioInfo}>
          <Ionicons name="location" size={24} color="#10B981" />
          <View style={styles.escenarioTexts}>
            <Text style={styles.infoNombre}>{escenario.nombre}</Text>
            <Text style={styles.infoDireccion}>{escenario.direccion}</Text>
          </View>
        </View>
      )}

      <View style={styles.statsContainer}>
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>{reportes.length}</Text>
          <Text style={styles.statLabel}>Reportes Totales</Text>
        </View>
        <View style={[styles.statCard, styles.statCardDanger]}>
          <Ionicons name="warning" size={32} color="#EF4444" />
          <Text style={styles.statLabel}>
            {reportes.length > 0 ? "Requieren Atención" : "Sin Reportes"}
          </Text>
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
  escenarioInfo: {
    backgroundColor: "#fff",
    padding: 16,
    marginHorizontal: 16,
    marginTop: 16,
    borderRadius: 12,
    flexDirection: "row",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  escenarioTexts: {
    flex: 1,
    marginLeft: 12,
  },
  infoNombre: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#111827",
  },
  infoDireccion: {
    fontSize: 14,
    color: "#6B7280",
    marginTop: 4,
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