import {
  StyleSheet,
  View,
  Image,
  Text,
  FlatList,
  TextInput,
  TouchableOpacity,
  Button,
} from "react-native";
import MapView, {
  Marker,
  Callout,
  Region,
  PROVIDER_GOOGLE,
} from "react-native-maps";
import { GestureHandlerRootView, Pressable, ScrollView } from "react-native-gesture-handler";
import BottomSheet, {
  BottomSheetView,
  BottomSheetFlatList,
} from "@gorhom/bottom-sheet";
import { useCallback, useRef, useMemo, useEffect, useState } from "react";
import { router, useNavigation } from "expo-router";
import { Escenario } from "../types/types";
import { Ionicons } from '@expo/vector-icons'; // Importa iconos

export default function Maps() {
  const navigation = useNavigation();
  // ref
  const bottomSheetRef = useRef<BottomSheet>(null);
  const mapRef = useRef<MapView>(null);

  // State
  const [escenarios, setEscenarios] = useState<Escenario[]>([]);
  const [filteredEscenarios, setFilteredEscenarios] = useState<Escenario[]>([]);
  const [searchText, setSearchText] = useState("");

  // variables
  const snapPoints = useMemo(() => ["45%", "80%"], []);

  // callbacks
  const handleSheetChanges = useCallback((index: number) => {
    console.log("handleSheetChans", index);
  }, []);

  // Fetch escenarios from API
  useEffect(() => {
    fetch("https://backend-sportzone-production.up.railway.app/api/escenario")
      .then((response) => response.json())
      .then((data) => {
        // Convertir coordenadas a números
        const escenariosProcesados = data.map((escenario: any) => ({
          ...escenario,
          latitud: parseFloat(escenario.latitud) || 0,
          longitud: parseFloat(escenario.longitud) || 0,
        }));

        setEscenarios(escenariosProcesados);
        setFilteredEscenarios(escenariosProcesados);
      })
      .catch((error) => console.error("Error fetching data:", error));
  }, []);

  // Filter escenarios based on search
  useEffect(() => {
    if (searchText.trim() === "") {
      setFilteredEscenarios(escenarios);
    } else {
      const filtered = escenarios.filter(
        (escenario) =>
          escenario.nombre.toLowerCase().includes(searchText.toLowerCase()) ||
          escenario.direccion
            ?.toLowerCase()
            .includes(searchText.toLowerCase()) ||
          escenario.tipo?.toLowerCase().includes(searchText.toLowerCase())
      );
      setFilteredEscenarios(filtered);
    }
  }, [searchText, escenarios]);

  const initialRegion: Region = {
    latitude: 9.3175,
    longitude: -75.394,
    latitudeDelta: 0.01,
    longitudeDelta: 0.01,
  };

  // Función para navegar al escenario en el mapa
  const navigateToEscenario = (escenario: Escenario) => {
    // Convertir a números por seguridad
    const lat =
      typeof escenario.latitud === "string"
        ? parseFloat(escenario.latitud)
        : escenario.latitud;
    const lng =
      typeof escenario.longitud === "string"
        ? parseFloat(escenario.longitud)
        : escenario.longitud;

    // Verificar que sean números válidos
    if (isNaN(lat) || isNaN(lng)) {
      console.warn(
        "Coordenadas inválidas para el escenario:",
        escenario.nombre
      );
      return;
    }

    mapRef.current?.animateToRegion(
      {
        latitude: lat,
        longitude: lng,
        latitudeDelta: 0.005,
        longitudeDelta: 0.005,
      },
      1000
    );

    bottomSheetRef.current?.snapToIndex(0);
  };

  const renderEscenarioItem = ({ item }: { item: Escenario }) => (
    <TouchableOpacity
      style={styles.escenarioCard}
      onPress={() => navigateToEscenario(item)}
      activeOpacity={0.7}
    >
      <Image
        source={{ uri: item.imagenes[0]?.url }}
        style={styles.escenarioImage}
        resizeMode="cover"
      />
      <View style={styles.escenarioContent}>
        <Text style={styles.escenarioTitle}>{item.nombre}</Text>
        <Text style={styles.escenarioDescription} numberOfLines={2}>
          {item.direccion}
        </Text>
        <View style={styles.escenarioDetails}>
          <Text style={styles.escenarioDetailText}>Tipo: {item.tipo}</Text>
          <Text style={styles.escenarioDetailText}>
            Capacidad: {item.capacidad}
          </Text>
        </View>
      </View>
      {/* Indicador visual de que es tocable */}
      <View style={styles.navigationIcon}>
        <TouchableOpacity 
    style={styles.detailButton}
    onPress={() => router.push(`/${item.id}`)}
    activeOpacity={0.8}
  >
    <Text style={styles.detailButtonText}>Ver Detalle</Text>
  </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );

  return (
    <GestureHandlerRootView style={styles.container}>
      <MapView
        ref={mapRef}
        style={styles.mapa}
        initialRegion={initialRegion}
        provider={PROVIDER_GOOGLE}
      >
        {escenarios.map((escenario) => {
          // Convertir coordenadas a números
          const lat =
            typeof escenario.latitud === "string"
              ? parseFloat(escenario.latitud)
              : escenario.latitud;
          const lng =
            typeof escenario.longitud === "string"
              ? parseFloat(escenario.longitud)
              : escenario.longitud;

          // Verificar que las coordenadas sean válidas
          if (isNaN(lat) || isNaN(lng) || lat === 0 || lng === 0) {
            return null;
          }

          return (
            <Marker
              key={escenario.id}
              coordinate={{
                latitude: lat,
                longitude: lng,
              }}
              title={escenario.nombre}
              description={escenario.direccion}
            >
              <Image
                source={require("./icons/placeholder.png")}
                style={{ width: 45, height: 35 }}
                resizeMode="contain"
              />
            </Marker>
          );
        })}
      </MapView>

      {/* Botón flotante de perfil */}
      <TouchableOpacity 
        style={styles.floatingProfileButton}
        onPress={() => router.push('/perfil')}
        activeOpacity={0.8}
      >
        <Ionicons name="person-circle" size={32} color="#FFFFFF" />
      </TouchableOpacity>

      {/* Botón flotante de reservas */}
      <TouchableOpacity 
        style={styles.floatingReservasButton}
        onPress={() => router.push('/reservas')} // O la ruta que uses para reservas
        activeOpacity={0.8}
      >
        <Ionicons name="calendar" size={28} color="#FFFFFF" />
      </TouchableOpacity>

      <BottomSheet
        ref={bottomSheetRef}
        onChange={handleSheetChanges}
        snapPoints={snapPoints}
        backgroundStyle={styles.bottomSheetBackground}
        handleIndicatorStyle={styles.handleIndicator}
      >
        <BottomSheetView style={styles.contentContainer}>
          <TextInput
            style={styles.searchInput}
            placeholder="Buscar escenario..."
            value={searchText}
            onChangeText={setSearchText}
          />
        
          <BottomSheetFlatList<Escenario>
            data={filteredEscenarios}
            scrollEnabled={true}
            renderItem={renderEscenarioItem}
            keyExtractor={(item: Escenario) => item.id.toString()}
            contentContainerStyle={styles.listContainer}
            showsVerticalScrollIndicator={false}
          />
        
        </BottomSheetView>
      
      </BottomSheet>
 
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  mapa: {
    width: "100%",
    height: "100%",
  },
  popup: {
    backgroundColor: "white",
    flexDirection: "column",
    padding: 15,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#ffffffff",
    alignItems: "center",
    width: 150,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  imagen: {
    width: 80,
    height: 60,
    borderRadius: 8,
    marginTop: 10,
  },
  nombre: {
    fontWeight: "bold",
    textAlign: "center",
    fontSize: 14,
    color: "#333",
  },
  bottomSheetBackground: {
    backgroundColor: "white",
    borderTopLeftRadius: 40,
    borderTopRightRadius: 40,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: -3,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 8,
  },
  handleIndicator: {
    backgroundColor: "#D1D5DB",
    width: 40,
    height: 4,
  },
  contentContainer: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  searchInput: {
    height: 40,
    borderColor: "#E5E7EB",
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    marginBottom: 16,
    backgroundColor: "#F9FAFB",
  },
  listContainer: {
    paddingBottom: 20,
  },
  escenarioCard: {
    flexDirection: "row",
    backgroundColor: "white",
    borderRadius: 12,
    marginBottom: 12,
    padding: 12,
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
  },
  escenarioImage: {
    width: 80,
    height: 80,
    borderRadius: 8,
    backgroundColor: "#F3F4F6",
  },
  escenarioContent: {
    flex: 1,
    marginLeft: 12,
    justifyContent: "space-between",
  },
  escenarioTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#111827",
    marginBottom: 4,
  },
  escenarioDescription: {
    fontSize: 14,
    color: "#6B7280",
    lineHeight: 20,
    marginBottom: 8,
  },
  escenarioDetails: {
    gap: 2,
  },
  escenarioDetailText: {
    fontSize: 12,
    color: "#9CA3AF",
  },
  navigationIcon: {
    justifyContent: "center",
    alignItems: "center",
    paddingLeft: 8,
  },
  detailButton: {
    backgroundColor: "#10B981", // Verde
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#059669", // Verde más oscuro para el borde
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  detailButtonText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "600",
    textAlign: "center",
  },
  floatingProfileButton: {
    position: 'absolute',
    top: 50,
    left: 15,
    width: 46,
    height: 46,
    borderRadius: 28,
    backgroundColor: '#10B981',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 3,
    },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    zIndex: 1,
  },
  floatingReservasButton: {
    position: 'absolute',
    top: 50,
    right: 15, // Posicionado a la derecha
    width: 46,
    height: 46,
    borderRadius: 28,
    backgroundColor: '#3B82F6', // Azul para diferenciarlo
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 3,
    },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    zIndex: 1,
  },
});
