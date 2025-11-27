import {
  View,
  Pressable,
  Text,
  FlatList,
  Image,
  RefreshControl,
  Alert,
} from "react-native";
import { icons } from "./icons/icons";
import { useRouter } from "expo-router";
import { StyleSheet } from "react-native";
import { useEffect, useState } from "react";
import { useAuth } from "./context/AuthContext";
import { ActivityIndicator } from "react-native";
import Screen from "./Screen";
import { Escenario } from "../types/types";
import { SafeAreaProvider } from "react-native-safe-area-context";


export default function MiEscenario() {
  
  const router = useRouter();
  const { user } = useAuth();
  const [escenarios, setEscenarios] = useState<Escenario[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);

  // Función para cargar los escenarios del usuario
  const loadMisEscenarios = async () => {
    if (!user) return;

    try {
      // Cambia esta URL por la de tu API
      const response = await fetch(
        `https://backend-sportzone-production.up.railway.app/api/escenario/usuario/${user.id}`
      );

      if (response.ok) {
        const data = await response.json();
        setEscenarios(data);
      } else {
        console.error("Error al cargar escenarios del usuario");
      }
    } catch (error) {
      console.error("Error fetching user scenarios:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMisEscenarios();
  }, [user]);

  // Función para manejar el pull-to-refresh
  const onRefresh = async () => {
    setRefreshing(true);
    try {
      await loadMisEscenarios();
      await new Promise((resolve) => setTimeout(resolve, 500));
    } catch (error) {
      console.error("Error refreshing data:", error);
    } finally {
      setRefreshing(false);
    }
  };

  // Función para eliminar escenario
  const handleDeleteEscenario = (id: number, nombre: string) => {
    Alert.alert(
      "Eliminar Escenario",
      `¿Estás seguro de que quieres eliminar "${nombre}"?`,
      [
        {
          text: "Cancelar",
          style: "cancel",
        },
        {
          text: "Eliminar",
          style: "destructive",
          onPress: () => deleteEscenario(id),
        },
      ]
    );
  };

  const deleteEscenario = async (id: number) => {
    try {
      const response = await fetch(
        `https://backend-sportzone-production.up.railway.app/api/escenario/${id}`,
        {
          method: "DELETE",
        }
      );

      if (response.ok) {
        setEscenarios((prev) =>
          prev.filter((escenario) => escenario.id !== id)
        );
        Alert.alert("Éxito", "Escenario eliminado correctamente");
      } else {
        Alert.alert("Error", "No se pudo eliminar el escenario");
      }
    } catch (error) {
      console.error("Error deleting scenario:", error);
      Alert.alert("Error", "Error de conexión");
        }
      };

      const renderEscenario = ({ item }: { item: Escenario }) => (
    <View style={styles.card}>
      {/* Imagen del escenario */}
      <View style={styles.imageContainer}>
        <Image
          source={{
            uri:
              item.imagenes[0]?.url ||
              "https://via.placeholder.com/300x200/cccccc/666666?text=Sin+Imagen",
          }}
          style={styles.cardImage}
          resizeMode="cover"
        />
        <View style={styles.imageOverlay}>
          <View style={styles.typeTag}>
            <Text style={styles.typeText}>{item.tipo}</Text>
          </View>
        </View>
      </View>

      {/* Contenido de la card */}
      <View style={styles.cardContent}>
        <Text style={styles.cardTitle} numberOfLines={2}>
          {item.nombre}
        </Text>

        <View style={styles.infoRow}>
          {icons.escenarios({ color: "#6B7280", size: 16 })}
          <Text style={styles.infoText} numberOfLines={2}>
            {item.direccion}
          </Text>
        </View>

        <View style={styles.infoRow}>
          {icons.reservas({ color: "#6B7280", size: 16 })}
          <Text style={styles.infoText}>Capacidad: {item.capacidad}</Text>
        </View>

        <View style={styles.priceContainer}>
          <Text style={styles.priceLabel}>Precio por hora:</Text>
          <Text style={styles.priceValue}>
            ${parseInt(item.precio).toLocaleString()}
          </Text>
        </View>

        {/* Botones de acción */}
        <View style={styles.actionButtons}>
          <Pressable
            style={styles.editButton}
            onPress={() => router.push(`/reportes?id=${item.id}`)}
          >
            <Text style={styles.editButtonText}>Reportes</Text>
          </Pressable>

          <Pressable
            style={styles.viewButton}
            onPress={() => router.push(`/${item.id}`)}
          >
            <Text style={styles.viewButtonText}>Ver Detalles</Text>
          </Pressable>

          <Pressable
            style={styles.deleteButton}
            onPress={() => handleDeleteEscenario(item.id, item.nombre)}
          >
            <Text style={styles.deleteButtonText}>🗑️</Text>
          </Pressable>
        </View>
      </View>
    </View>
  );

  if (!user) {
    return (
      <Screen>
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>No has iniciado sesión</Text>
          <Text style={styles.emptySubtext}>
            Por favor, inicia sesión para ver tus escenarios.
          </Text>
        </View>
      </Screen>
    );
  }

  // Mostrar ActivityIndicator mientras está cargando
  if (loading) {
    return (
      <Screen>
        {/* Loading Indicator */}
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#3B82F6" />
          <Text style={styles.loadingText}>Cargando escenarios...</Text>
        </View>
      </Screen>
    );
  }

  return (
    <View style={{ flex: 1 }}>
      <FlatList
        data={escenarios}
        renderItem={renderEscenario}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={["#3B82F6"]}
            tintColor="#3B82F6"
            title="Actualizando..."
            titleColor="#6B7280"
          />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No tienes escenarios creados</Text>
            <Text style={styles.emptySubtext}>
              Crea tu primer escenario para comenzar
            </Text>
          </View>
        }
      />

      {/* Botón flotante para crear escenario */}
      <Pressable
        onPress={() => router.push("/EscenarioCreateSteps")}
        style={styles.floatingAddButton}
      >
        <Text style={styles.floatingAddButtonText}>+</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingTop: 50,
    paddingBottom: 20,
    backgroundColor: "#FFFFFF",
  },
  backButton: {
    width: 40,
    height: 40,
    backgroundColor: "#F8FAFC",
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 16,
  },
  backButtonText: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#3B82F6",
  },
  headerContent: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#1F2937",
    marginBottom: 2,
  },
  headerSubtitle: {
    fontSize: 14,
    color: "#6B7280",
  },
  addButton: {
    width: 40,
    height: 40,
    backgroundColor: "#3B82F6",
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  addButtonText: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#FFFFFF",
  },
  list: {
    padding: 16,
    paddingTop: 8,
  },
  card: {
    backgroundColor: "white",
    borderRadius: 16,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
    overflow: "hidden",
  },
  imageContainer: {
    position: "relative",
    height: 160,
  },
  cardImage: {
    width: "100%",
    height: "100%",
  },
  imageOverlay: {
    position: "absolute",
    top: 8,
    right: 8,
  },
  typeTag: {
    backgroundColor: "rgba(59, 130, 246, 0.9)",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  typeText: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "600",
  },
  cardContent: {
    padding: 16,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#1F2937",
    marginBottom: 12,
    lineHeight: 22,
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
  priceContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#F0F9FF",
    padding: 12,
    borderRadius: 8,
    marginVertical: 12,
  },
  priceLabel: {
    fontSize: 14,
    color: "#1E40AF",
    fontWeight: "500",
  },
  priceValue: {
    fontSize: 18,
    color: "#1E40AF",
    fontWeight: "bold",
  },
  actionButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 12,
  },
  editButton: {
    backgroundColor: "#F59E0B",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    flex: 1,
    marginRight: 8,
  },
  editButtonText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "600",
    textAlign: "center",
  },
  viewButton: {
    backgroundColor: "#3B82F6",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    flex: 1,
    marginRight: 8,
  },
  viewButtonText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "600",
    textAlign: "center",
  },
  deleteButton: {
    backgroundColor: "#EF4444",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
  },
  deleteButtonText: {
    fontSize: 16,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 60,
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
    marginBottom: 20,
  },
  createButton: {
    backgroundColor: "#3B82F6",
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  createButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 60,
  },
  loadingText: {
    fontSize: 16,
    color: "#6B7280",
    marginTop: 16,
    fontWeight: "500",
  },
  floatingAddButton: {
    position: 'absolute',
    bottom: 80,
    right: 20,
    width: 60,
    height: 60,
    backgroundColor: '#10B981',
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 6,
  },
  floatingAddButtonText: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
});
