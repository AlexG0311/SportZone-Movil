
import {
  Text,
  View,
  Image,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Dimensions,
  FlatList,
} from "react-native";
import { useRouter } from "expo-router";
import { useLocalSearchParams } from "expo-router";
import Screen from "./Screen";
import { useEffect, useState, useRef } from "react";
import { Escenario } from "../types/types";
import { ActivityIndicator } from "react-native";
import { Ionicons } from "@expo/vector-icons";

const { width } = Dimensions.get("window");
const IMAGE_WIDTH = width;
const IMAGE_HEIGHT = 300;

export default function Detail() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const flatListRef = useRef<FlatList>(null);

  const [loading, setLoading] = useState(true);
  const [escenarios, setEscenarios] = useState<Escenario[]>([]);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  useEffect(() => {
    fetch("https://backend-sportzone-production.up.railway.app/api/escenario")
      .then((response) => response.json())
      .then((data) => setEscenarios(data))
      .finally(() => setLoading(false))
      .catch((error) => console.error("Error fetching data:", error));
  }, []);

  const escenario = escenarios.find((e) => e.id === Number(id));

  const onViewableItemsChanged = useRef(({ viewableItems }: any) => {
    if (viewableItems.length > 0) {
      setCurrentImageIndex(viewableItems[0].index || 0);
    }
  }).current;

  const viewabilityConfig = useRef({
    itemVisiblePercentThreshold: 50,
  }).current;

  if (loading) {
    return (
      <View style={[styles.content, styles.centered]}>
        <ActivityIndicator size="large" color="#10B981" />
        <Text style={styles.loadingText}>Cargando escenario...</Text>
      </View>
    );
  }

  if (!escenario) {
    return (
      <View style={[styles.content, styles.centered]}>
        <Ionicons name="alert-circle-outline" size={64} color="#9CA3AF" />
        <Text style={styles.errorText}>Escenario no encontrado</Text>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Text style={styles.backButtonText}>Volver</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const imagenes = escenario.imagenes || [];

  return (
    <Screen>
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        {/* Carrusel de imágenes */}
        <View style={styles.carouselContainer}>
          <FlatList
            ref={flatListRef}
            data={imagenes}
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            keyExtractor={(item, index) => index.toString()}
            onViewableItemsChanged={onViewableItemsChanged}
            viewabilityConfig={viewabilityConfig}
            renderItem={({ item }) => (
              <View style={styles.imageContainer}>
                <Image
                  source={{ uri: item.url }}
                  style={styles.image}
                  resizeMode="cover"
                />
              </View>
            )}
          />

          {/* Indicadores de paginación */}
          {imagenes.length > 1 && (
            <View style={styles.pagination}>
              {imagenes.map((_, index) => (
                <View
                  key={index}
                  style={[
                    styles.paginationDot,
                    index === currentImageIndex && styles.paginationDotActive,
                  ]}
                />
              ))}
            </View>
          )}

          {/* Contador de imágenes */}
          <View style={styles.imageCounter}>
            <Text style={styles.imageCounterText}>
              {currentImageIndex + 1} / {imagenes.length}
            </Text>
          </View>
        </View>

        {/* Información del escenario */}
        <View style={styles.infoCard}>
          <Text style={styles.title}>{escenario.nombre}</Text>
          <Text style={styles.description}>{escenario.descripcion}</Text>

          {/* Detalles con iconos */}
          <View style={styles.detailsContainer}>
            <View style={styles.detailRow}>
              <Ionicons name="location" size={20} color="#10B981" />
              <Text style={styles.detailText}>{escenario.direccion}</Text>
            </View>

            <View style={styles.detailRow}>
              <Ionicons name="basketball" size={20} color="#10B981" />
              <Text style={styles.detailText}>
                Tipo: {escenario.tipo || "Deportivo"}
              </Text>
            </View>

            <View style={styles.detailRow}>
              <Ionicons name="people" size={20} color="#10B981" />
              <Text style={styles.detailText}>
                Capacidad: {escenario.capacidad} personas
              </Text>
            </View>

            <View style={styles.detailRow}>
              <Ionicons name="cash" size={20} color="#10B981" />
              <Text style={styles.detailText}>
                Precio: ${escenario.precio}/hora
              </Text>
            </View>
          </View>
        </View>

        {/* Botones de acción */}
        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={[styles.button, styles.primaryButton]}
            onPress={() => router.push(`/reservar?escenarioId=${id}`)}
          >
            <Ionicons name="calendar" size={20} color="#FFF" />
            <Text style={styles.buttonText}>Reservar Ahora</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.button, styles.secondaryButton]}
            onPress={() => router.push(`/reportar?escenarioId=${id}`)}
          >
            <Ionicons name="warning" size={20} color="#FFF" />
            <Text style={styles.buttonText}>Reportar Daño</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F9FAFB",
  },
  content: {
    flex: 1,
  },
  centered: {
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: "#6B7280",
  },
  errorText: {
    marginTop: 12,
    fontSize: 18,
    color: "#6B7280",
    fontWeight: "600",
  },
  backButton: {
    marginTop: 20,
    paddingHorizontal: 24,
    paddingVertical: 12,
    backgroundColor: "#10B981",
    borderRadius: 8,
  },
  backButtonText: {
    color: "#FFF",
    fontSize: 16,
    fontWeight: "600",
  },
  carouselContainer: {
    position: "relative",
    
  },
  imageContainer: {
    width: IMAGE_WIDTH,
    height: IMAGE_HEIGHT,
  },
  image: {
    width: "100%",
    height: "100%",
  },
  pagination: {
    position: "absolute",
    bottom: 16,
    flexDirection: "row",
    alignSelf: "center",
    gap: 6,
  },
  paginationDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "rgba(255, 255, 255, 0.5)",
  },
  paginationDotActive: {
    backgroundColor: "#FFF",
    width: 24,
  },
  imageCounter: {
    position: "absolute",
    top: 10,
    right: 16,
    backgroundColor: "rgba(0, 0, 0, 0.6)",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  imageCounterText: {
    color: "#FFF",
    fontSize: 12,
    fontWeight: "600",
  },
  infoCard: {
    backgroundColor: "#FFF",
    margin: 16,
    padding: 20,
    borderRadius: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#111827",
    marginBottom: 8,
  },
  description: {
    fontSize: 15,
    color: "#6B7280",
    lineHeight: 22,
    marginBottom: 16,
  },
  detailsContainer: {
    gap: 12,
  },
  detailRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  detailText: {
    fontSize: 15,
    color: "#374151",
    flex: 1,
  },
  buttonContainer: {
    padding: 16,
    gap: 12,
    paddingBottom: 32,
  },
  button: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: 16,
    borderRadius: 12,
    gap: 8,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  primaryButton: {
    backgroundColor: "#10B981",
  },
  secondaryButton: {
    backgroundColor: "#EF4444",
  },
  buttonText: {
    color: "#FFF",
    fontSize: 16,
    fontWeight: "bold",
  },
});