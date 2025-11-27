import {
  View,
  Text,
  StyleSheet,
  TextInput,
  ScrollView,
  Pressable,
  Alert,
  Image,
} from "react-native";
import { useState } from "react";
import { Picker } from "@react-native-picker/picker";
import * as Location from "expo-location";
import * as ImagePicker from "expo-image-picker";
import MapView, { Marker, PROVIDER_GOOGLE } from "react-native-maps";
import { useAuth } from "./context/AuthContext";
import { router } from "expo-router";

type FormData = {
  nombre: string;
  tipo: "Público" | "Privado";
  descripcion: string;
  direccion: string;
  latitud: number | null;
  longitud: number | null;
  precio: string; // Agregar el campo precio
  capacidad: string;
  imagenUrl: string | null; // URL de Cloudinary
  estadoId: number;
};

export default function CrearScenario() {
  const { user } = useAuth();
  const [imagen, setImagen] = useState<string | null>(null); // URI local de la imagen
  const [isUploading, setIsUploading] = useState(false);

  const [formData, setFormData] = useState<FormData>({
    nombre: "",
    tipo: "Público",
    descripcion: "",
    direccion: "",
    latitud: null,
    longitud: null,
    precio: "", // Inicializar precio
    capacidad: "",
    imagenUrl: null,
    estadoId: 1,
  });

  const [showMap, setShowMap] = useState(false);
  const [mapRegion, setMapRegion] = useState({
    latitude: 9.3175,
    longitude: -75.394,
    latitudeDelta: 0.01,
    longitudeDelta: 0.01,
  });

  // Configuración de Cloudinary - REEMPLAZA CON TUS DATOS
  const CLOUDINARY_CLOUD_NAME = "dyxwkzchf"; // Cambia esto
  const CLOUDINARY_UPLOAD_PRESET = "mediaescenarios"; // Cambia esto

  // Opción 1: Obtener ubicación actual del GPS
  const obtenerUbicacionActual = async () => {
    try {
      // Solicitar permisos
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        Alert.alert("Error", "Permiso de ubicación denegado");
        return;
      }

      // Obtener ubicación actual
      const location = await Location.getCurrentPositionAsync({});

      setFormData((prev) => ({
        ...prev,
        latitud: location.coords.latitude,
        longitud: location.coords.longitude,
      }));

      setMapRegion({
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
        latitudeDelta: 0.005,
        longitudeDelta: 0.005,
      });

      Alert.alert("Éxito", "Ubicación actual obtenida correctamente");
    } catch (error) {
      Alert.alert("Error", "No se pudo obtener la ubicación");
    }
  };

  // Opción 2: Buscar dirección y obtener coordenadas
  const buscarDireccion = async () => {
    if (!formData.direccion.trim()) {
      Alert.alert("Error", "Por favor ingresa una dirección");
      return;
    }

    try {
      const geocode = await Location.geocodeAsync(formData.direccion);

      if (geocode.length > 0) {
        const coords = geocode[0];
        setFormData((prev) => ({
          ...prev,
          latitud: coords.latitude,
          longitud: coords.longitude,
        }));

        setMapRegion({
          latitude: coords.latitude,
          longitude: coords.longitude,
          latitudeDelta: 0.005,
          longitudeDelta: 0.005,
        });

        Alert.alert("Éxito", "Coordenadas encontradas para la dirección");
      } else {
        Alert.alert(
          "Error",
          "No se encontraron coordenadas para esta dirección"
        );
      }
    } catch (error) {
      Alert.alert("Error", "Error al buscar la dirección");
    }
  };

  // Opción 3: Seleccionar en el mapa
  const seleccionarEnMapa = (event: any) => {
    const { latitude, longitude } = event.nativeEvent.coordinate;
    setFormData((prev) => ({
      ...prev,
      latitud: latitude,
      longitud: longitude,
    }));
  };

  // Función para seleccionar imagen
  const seleccionarImagen = () => {
    Alert.alert("Seleccionar Imagen", "Elige una opción", [
      { text: "Cancelar", style: "cancel" },
      { text: "Cámara", onPress: tomarFoto },
      { text: "Galería", onPress: seleccionarDeGaleria },
    ]);
  };

  // Tomar foto con la cámara
  const tomarFoto = async () => {
    try {
      // Solicitar permisos de cámara
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      if (status !== "granted") {
        Alert.alert("Error", "Se necesitan permisos de cámara");
        return;
      }

      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ["images"],
        allowsEditing: true,
        aspect: [16, 9],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        const imageUri = result.assets[0].uri;
        await procesarImagen(imageUri);
      }
    } catch (error) {
      Alert.alert("Error", "No se pudo tomar la foto");
    }
  };

  // Seleccionar de galería
  const seleccionarDeGaleria = async () => {
    try {
      // Solicitar permisos de galería
      const { status } =
        await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== "granted") {
        Alert.alert("Error", "Se necesitan permisos de galería");
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ["images"],
        allowsEditing: true,
        aspect: [16, 9],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        const imageUri = result.assets[0].uri;
        await procesarImagen(imageUri);
      }
    } catch (error) {
      Alert.alert("Error", "No se pudo seleccionar la imagen");
    }
  };

  // Procesar imagen: mostrar localmente y subir a Cloudinary
  const procesarImagen = async (imageUri: string) => {
    try {
      // Mostrar la imagen localmente primero
      setImagen(imageUri);
      setIsUploading(true);

      // Subir a Cloudinary y obtener URL
      const cloudinaryUrl = await subirACloudinary(imageUri);

      // Actualizar formData con la URL de Cloudinary
      setFormData((prev) => ({
        ...prev,
        imagenUrl: cloudinaryUrl,
      }));

      setIsUploading(false);
      Alert.alert("Éxito", "Imagen subida correctamente a Cloudinary");
    } catch (error) {
      setIsUploading(false);
      Alert.alert("Error", "No se pudo subir la imagen a Cloudinary");
      console.error("Error uploading to Cloudinary:", error);
    }
  };

  // Subir imagen a Cloudinary
  const subirACloudinary = async (imageUri: string): Promise<string> => {
    const data = new FormData();

    data.append("file", {
      uri: imageUri,
      type: "image/jpeg",
      name: "escenario.jpg",
    } as any);

    data.append("upload_preset", CLOUDINARY_UPLOAD_PRESET);
    data.append("cloud_name", CLOUDINARY_CLOUD_NAME);

    const response = await fetch(
      `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`,
      {
        method: "POST",
        body: data,
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }
    );

    if (!response.ok) {
      throw new Error("Error subiendo imagen a Cloudinary");
    }

    const result = await response.json();
    return result.secure_url; // URL segura de la imagen en Cloudinary
  };

  // Enviar formulario con URL de Cloudinary
  const enviarFormulario = async () => {
    // Validaciones
    if (!formData.nombre.trim()) {
      Alert.alert("Error", "El nombre es requerido");
      return;
    }
    if (!formData.descripcion.trim()) {
      Alert.alert("Error", "La descripción es requerida");
      return;
    }
    if (!formData.direccion.trim()) {
      Alert.alert("Error", "La dirección es requerida");
      return;
    }
    if (!formData.latitud || !formData.longitud) {
      Alert.alert("Error", "Por favor obtén las coordenadas del escenario");
      return;
    }
    if (!formData.precio.trim()) {
      Alert.alert("Error", "El precio es requerido");
      return;
    }
    if (!formData.capacidad.trim()) {
      Alert.alert("Error", "La capacidad es requerida");
      return;
    }
    if (isUploading) {
      Alert.alert("Espera", "La imagen se está subiendo...");
      return;
    }

    try {
      const response = await fetch("https://backend-sportzone-production.up.railway.app/api/escenario", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          nombre: formData.nombre,
          tipo: formData.tipo,
          descripcion: formData.descripcion,
          direccion: formData.direccion,
          latitud: formData.latitud,
          longitud: formData.longitud,
          precio: formData.precio, // Corregir aquí
          capacidad: formData.capacidad,
          imagenUrl: formData.imagenUrl, // URL de Cloudinary
          estadoId: formData.estadoId,
          encargadoId: user ? user.id : 1, // ID del usuario logueado o 1 por defecto
        }),
      });
      console.log("datos enviados:", {
        nombre: formData.nombre,
        tipo: formData.tipo,
        descripcion: formData.descripcion,
        direccion: formData.direccion,
        latitud: formData.latitud,
        longitud: formData.longitud,
        precio: formData.precio, // Corregir aquí
        capacidad: formData.capacidad,
        imagenUrl: formData.imagenUrl, // URL de Cloudinary
        estadoId: formData.estadoId,
        encargadoId: user ? user.id : 1,
      });
      if (response.ok) {
        Alert.alert("Éxito", "Escenario creado correctamente");
        // Limpiar formular
        setFormData({
          nombre: "",
          tipo: "Público",
          descripcion: "",
          direccion: "",
          latitud: null,
          longitud: null,
          precio: "", // Limpiar precio
          capacidad: "",
          imagenUrl: null,
          estadoId: 1,
        });
        setImagen(null);
        router.push("/miEscenario");
      } else {
        const errorData = await response.json();
        Alert.alert(
          "Error",
          errorData.message || "No se pudo crear el escenario"
        );
      }
    } catch (error) {
      Alert.alert("Error", "Error de conexión");
      console.error("Error sending form:", error);
    }
  };

  // Eliminar imagen
  const eliminarImagen = () => {
    setImagen(null);
    setFormData((prev) => ({ ...prev, imagenUrl: null }));
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Crear Nuevo Escenario </Text>
      </View>

      <View style={styles.form}>
        {/* Nombre */}
        <View style={styles.fieldContainer}>
          <Text style={styles.label}>Nombre *</Text>
          <TextInput
            style={styles.input}
            value={formData.nombre}
            onChangeText={(text) =>
              setFormData((prev) => ({ ...prev, nombre: text }))
            }
            placeholder="Ej: Estadio Municipal"
          />
        </View>

        {/* Tipo */}
        <View style={styles.fieldContainer}>
          <Text style={styles.label}>Tipo *</Text>
          <View style={styles.pickerContainer}>
            <Picker
              selectedValue={formData.tipo}
              onValueChange={(value) =>
                setFormData((prev) => ({ ...prev, tipo: value }))
              }
              style={styles.picker}
            >
              <Picker.Item label="Público" value="Público" />
              <Picker.Item label="Privado" value="Privado" />
            </Picker>
          </View>
        </View>

        {/* Descripción */}
        <View style={styles.fieldContainer}>
          <Text style={styles.label}>Descripción *</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            value={formData.descripcion}
            onChangeText={(text) =>
              setFormData((prev) => ({ ...prev, descripcion: text }))
            }
            placeholder="Describe el escenario deportivo..."
            multiline
            numberOfLines={4}
          />
        </View>

        {/* Dirección */}
        <View style={styles.fieldContainer}>
          <Text style={styles.label}>Dirección *</Text>
          <TextInput
            style={styles.input}
            value={formData.direccion}
            onChangeText={(text) =>
              setFormData((prev) => ({ ...prev, direccion: text }))
            }
            placeholder="Ej: Calle 25 #15-30, Sincelejo"
          />
        </View>

        {/* Sección de Coordenadas */}
        <View style={styles.coordSection}>
          <Text style={styles.sectionTitle}>Ubicación (Coordenadas) *</Text>

          {/* Mostrar coordenadas actuales */}
          {formData.latitud && formData.longitud && (
            <View style={styles.coordDisplay}>
              <Text style={styles.coordText}>
                📍 Lat: {formData.latitud.toFixed(6)}, Lng:{" "}
                {formData.longitud.toFixed(6)}
              </Text>
            </View>
          )}

          {/* Botones para obtener coordenadas */}
          <View style={styles.coordButtons}>
            <Pressable
              style={styles.coordButton}
              onPress={obtenerUbicacionActual}
            >
              <Text style={styles.coordButtonText}> Usar mi ubicación</Text>
            </Pressable>

            <Pressable style={styles.coordButton} onPress={buscarDireccion}>
              <Text style={styles.coordButtonText}> Buscar dirección</Text>
            </Pressable>

            <Pressable
              style={styles.coordButton}
              onPress={() => setShowMap(!showMap)}
            >
              <Text style={styles.coordButtonText}>
                {showMap ? "Ocultar mapa" : "Seleccionar en mapa"}
              </Text>
            </Pressable>
          </View>

          {/* Mapa para selección manual */}
          {showMap && (
            <View style={styles.mapContainer}>
              <Text style={styles.mapInstructions}>
                Toca en el mapa para seleccionar la ubicación exacta
              </Text>
              <MapView
                style={styles.map}
                region={mapRegion}
                provider={PROVIDER_GOOGLE}
                onPress={seleccionarEnMapa}
              >
                {formData.latitud && formData.longitud && (
                  <Marker
                    coordinate={{
                      latitude: formData.latitud,
                      longitude: formData.longitud,
                    }}
                    title="Ubicación del escenario"
                  />
                )}
              </MapView>
            </View>
          )}
        </View>

        {/* Precio - Agregar después de la sección de coordenadas y antes de Capacidad */}
        <View style={styles.fieldContainer}>
          <Text style={styles.label}>Precio por Hora *</Text>
          <TextInput
            style={styles.input}
            value={formData.precio}
            onChangeText={(text) =>
              setFormData((prev) => ({ ...prev, precio: text }))
            }
            placeholder="Ej: 50000"
            keyboardType="numeric"
          />
        </View>

        {/* Capacidad */}
        <View style={styles.fieldContainer}>
          <Text style={styles.label}>Capacidad *</Text>
          <TextInput
            style={styles.input}
            value={formData.capacidad}
            onChangeText={(text) =>
              setFormData((prev) => ({ ...prev, capacidad: text }))
            }
            placeholder="Ej: 100 personas"
            keyboardType="numeric"
          />
        </View>

        {/* Sección de Imagen */}
        <View style={styles.fieldContainer}>
          <Text style={styles.label}>
            Imagen del Escenario {isUploading && "(Subiendo...)"}
          </Text>

          {imagen ? (
            <View style={styles.imageContainer}>
              <Image
                source={{ uri: imagen }}
                style={styles.imagePreview}
                resizeMode="cover"
              />
              {isUploading && (
                <View style={styles.uploadingOverlay}>
                  <Text style={styles.uploadingText}>
                    Subiendo a Cloudinary...
                  </Text>
                </View>
              )}
              <View style={styles.imageActions}>
                <Pressable
                  style={styles.changeImageButton}
                  onPress={seleccionarImagen}
                  disabled={isUploading}
                >
                  <Text style={styles.changeImageText}>Cambiar imagen</Text>
                </Pressable>
                <Pressable
                  style={styles.removeImageButton}
                  onPress={eliminarImagen}
                  disabled={isUploading}
                >
                  <Text style={styles.removeImageText}>Eliminar</Text>
                </Pressable>
              </View>
              {formData.imagenUrl && (
                <View style={styles.cloudinaryInfo}>
                  <Text style={styles.cloudinaryText}>Imagen cargada</Text>
                </View>
              )}
            </View>
          ) : (
            <Pressable
              style={styles.addImageButton}
              onPress={seleccionarImagen}
              disabled={isUploading}
            >
              <Text style={styles.addImageIcon}>📷</Text>
              <Text style={styles.addImageText}>Agregar imagen</Text>
              <Text style={styles.addImageSubtext}>
                Toca para tomar foto o seleccionar de galería
              </Text>
            </Pressable>
          )}
        </View>

        {/* Estado ID */}
        <View style={styles.fieldContainer}>
          <Text style={styles.label}>Estado ID</Text>
          <TextInput
            style={styles.input}
            value={formData.estadoId.toString()}
            onChangeText={(text) =>
              setFormData((prev) => ({
                ...prev,
                estadoId: parseInt(text) || 1,
              }))
            }
            placeholder="1"
            keyboardType="numeric"
          />
        </View>

        {/* Botón Enviar */}
        <Pressable
          style={[
            styles.submitButton,
            (isUploading || !formData.imagenUrl) && styles.submitButtonDisabled,
          ]}
          onPress={enviarFormulario}
          disabled={isUploading}
        >
          <Text style={styles.submitText}>
            {isUploading ? "Subiendo imagen..." : "Crear Escenario"}
          </Text>
        </Pressable>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8FAFC",
  },
  header: {
    paddingHorizontal: 10,
    paddingTop: 20,
    paddingBottom: 10,
    backgroundColor: "#FFFFFF",
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#1F2937",
  },
  form: {
    padding: 16,
  },
  fieldContainer: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: "600",
    color: "#374151",
    marginBottom: 8,
  },
  input: {
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#D1D5DB",
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: "#1F2937",
  },
  textArea: {
    height: 100,
    textAlignVertical: "top",
  },
  pickerContainer: {
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#D1D5DB",
    borderRadius: 8,
  },
  picker: {
    height: 50,
  },
  coordSection: {
    marginBottom: 20,
    padding: 16,
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#1F2937",
    marginBottom: 12,
  },
  coordDisplay: {
    backgroundColor: "#F0FDF4",
    padding: 12,
    borderRadius: 8,
    marginBottom: 12,
  },
  coordText: {
    fontSize: 14,
    color: "#166534",
    fontWeight: "500",
  },
  coordButtons: {
    gap: 8,
  },
  coordButton: {
    backgroundColor: "#3B82F6",
    padding: 12,
    borderRadius: 8,
    alignItems: "center",
  },
  coordButtonText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "600",
  },
  mapContainer: {
    marginTop: 16,
  },
  mapInstructions: {
    fontSize: 14,
    color: "#6B7280",
    textAlign: "center",
    marginBottom: 8,
  },
  map: {
    height: 200,
    borderRadius: 8,
  },
  submitButton: {
    backgroundColor: "#10B981",
    padding: 16,
    borderRadius: 12,
    alignItems: "center",
    marginTop: 20,

    marginBottom: 80,
  },
  submitButtonDisabled: {
    backgroundColor: "#9CA3AF",
  },
  submitText: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "bold",
  },
  imageContainer: {
    marginBottom: 16,
    position: "relative",
  },
  imagePreview: {
    width: "100%",
    height: 200,
    borderRadius: 12,
    backgroundColor: "#F3F4F6",
  },
  uploadingOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0,0,0,0.7)",
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 12,
  },
  uploadingText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "bold",
  },
  imageActions: {
    flexDirection: "row",
    marginTop: 12,
    gap: 12,
  },
  changeImageButton: {
    flex: 1,
    backgroundColor: "#3B82F6",
    padding: 12,
    borderRadius: 8,
    alignItems: "center",
  },
  changeImageText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "600",
  },
  removeImageButton: {
    flex: 1,
    backgroundColor: "#EF4444",
    padding: 12,
    borderRadius: 8,
    alignItems: "center",
  },
  removeImageText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "600",
  },
  addImageButton: {
    backgroundColor: "#F9FAFB",
    borderWidth: 2,
    borderColor: "#D1D5DB",
    borderStyle: "dashed",
    borderRadius: 12,
    padding: 40,
    alignItems: "center",
  },
  addImageIcon: {
    fontSize: 48,
    marginBottom: 12,
  },
  addImageText: {
    fontSize: 18,
    fontWeight: "600",
    color: "#374151",
    marginBottom: 4,
  },
  addImageSubtext: {
    fontSize: 14,
    color: "#6B7280",
    textAlign: "center",
  },
  cloudinaryInfo: {
    backgroundColor: "#F0FDF4",
    padding: 8,
    borderRadius: 6,
    marginTop: 8,
  },
  cloudinaryText: {
    fontSize: 14,
    color: "#166534",
    fontWeight: "500",
    textAlign: "center",
  },
});
