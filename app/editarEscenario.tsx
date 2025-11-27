import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ScrollView,
  Image,
  ActivityIndicator,
} from "react-native";
import { useState, useEffect } from "react";
import { useLocalSearchParams, router } from "expo-router";
import { Picker } from "@react-native-picker/picker";
import * as ImagePicker from "expo-image-picker";
import * as Location from "expo-location";
import { useAuth } from "./context/AuthContext";

type FormData = {
  nombre: string;
  tipo: "Público" | "Privado";
  descripcion: string;
  direccion: string;
  latitud: number | null;
  longitud: number | null;
  precio: string;
  capacidad: string;
  imagenUrl: string | null;
  estadoId: number;
  encargadoId?: number | null;
};

export default function EditarEscenario() {
  const { user } = useAuth();
  const { id } = useLocalSearchParams();
  const [loading, setLoading] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  const [imagen, setImagen] = useState<string | null>(null);

  const [formData, setFormData] = useState<FormData>({
    nombre: "",
    tipo: "Público",
    descripcion: "",
    direccion: "",
    latitud: null,
    longitud: null,
    precio: "",
    capacidad: "",
    imagenUrl: null,
    estadoId: 1,
    encargadoId: user?.id || null,
  });

  // Cargar datos del escenario
  useEffect(() => {
    if (id) {
      cargarDatosEscenario();
    }
  }, [id]);

  const cargarDatosEscenario = async () => {
    try {
      const response = await fetch(
        `https://backend-sportzone-production.up.railway.app/api/escenario/${id}`
      );

      if (response.ok) {
        const escenario = await response.json();

        // ✅ Convertir coordenadas a números correctamente
        const latitud = escenario.latitud
          ? parseFloat(escenario.latitud)
          : null;
        const longitud = escenario.longitud
          ? parseFloat(escenario.longitud)
          : null;

        setFormData({
          nombre: escenario.nombre || "",
          tipo: escenario.tipo || "Público",
          descripcion: escenario.descripcion || "",
          direccion: escenario.direccion || "",
          latitud: latitud,
          longitud: longitud,
          precio: escenario.precio?.toString() || "",
          capacidad: escenario.capacidad?.toString() || "",
          imagenUrl: escenario.imagenUrl || null,
          estadoId: escenario.estadoId || 1,
          encargadoId: escenario.encargadoId || user?.id || null,
        });
        setImagen(escenario.imagenUrl);
      } else {
        Alert.alert("Error", "No se pudo cargar el escenario");
        router.back();
      }
    } catch (error) {
      console.error("Error cargando escenario:", error);
      Alert.alert("Error", "Error de conexión");
      router.back();
    } finally {
      setLoading(false);
    }
  };

  // Seleccionar imagen
  const seleccionarImagen = async () => {
    try {
      const { status } =
        await ImagePicker.requestMediaLibraryPermissionsAsync();

      if (status !== "granted") {
        Alert.alert(
          "Permiso requerido",
          "Se necesita permiso para acceder a la galería"
        );
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ["images"],
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        const selectedImageUri = result.assets[0].uri;
        procesarImagen(selectedImageUri);
      }
    } catch (error) {
      Alert.alert("Error", "No se pudo seleccionar la imagen");
    }
  };
  // Configuración de Cloudinary - REEMPLAZA CON TUS DATOS
  const CLOUDINARY_CLOUD_NAME = "dyxwkzchf"; // Cambia esto
  const CLOUDINARY_UPLOAD_PRESET = "mediaescenarios"; // Cambia esto

  // Procesar imagen: mostrar localmente y subir a Cloudinary
  const procesarImagen = async (imageUri: string) => {
    try {
      // Mostrar la imagen localmente primero
      setImagen(imageUri);
      setIsUploading(true);

      // Subir a Cloudinary y obtener URL
      const cloudinaryUrl = await subirImagenACloudinary(imageUri);

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
  const subirImagenACloudinary = async (imageUri: string) => {
    setIsUploading(true);

    try {
      const formData = new FormData();
      formData.append("file", {
        uri: imageUri,
        type: "image/jpeg",
        name: "escenario.jpg",
      } as any);

      formData.append("upload_preset", CLOUDINARY_UPLOAD_PRESET);

      const response = await fetch(
        `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`,
        {
          method: "POST",
          body: formData,
        }
      );

      if (!response.ok) {
        throw new Error("Error subiendo la imagen a Cloudinary");
      }

      const data = await response.json();
      if (data.secure_url) {
        setFormData((prev) => ({ ...prev, imagenUrl: data.secure_url }));
      }
      return data.secure_url;
    } catch (error) {
      console.error("Error subiendo imagen:", error);
      Alert.alert("Error", "No se pudo subir la imagen");
    } finally {
      setIsUploading(false);
    }
  };

  // Obtener coordenadas
  const obtenerCoordenadas = async () => {
    try {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        Alert.alert("Permiso requerido", "Se necesita permiso de ubicación");
        return;
      }

      let location = await Location.getCurrentPositionAsync({});
      setFormData((prev) => ({
        ...prev,
        latitud: location.coords.latitude,
        longitud: location.coords.longitude,
      }));
      Alert.alert("Éxito", "Coordenadas obtenidas correctamente");
    } catch (error) {
      Alert.alert("Error", "No se pudieron obtener las coordenadas");
    }
  };

  // Actualizar escenario
  const actualizarEscenario = async () => {
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
      console.log("Datos que se envían:", {
        nombre: formData.nombre.trim(),
        tipo: formData.tipo,
        descripcion: formData.descripcion.trim(),
        direccion: formData.direccion.trim(),
        latitud: formData.latitud, // Decimal
        longitud: formData.longitud, // Decimal
        precio: parseFloat(formData.precio), // Decimal
        capacidad: parseInt(formData.capacidad), // Int
        imagenUrl: formData.imagenUrl,
        estadoId: formData.estadoId,
        encargadoId: user?.id || null,
      });

      const response = await fetch(
        `https://backend-sportzone-production.up.railway.app/api/escenario/${id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            nombre: formData.nombre.trim(),
            tipo: formData.tipo,
            descripcion: formData.descripcion.trim(),
            direccion: formData.direccion.trim(),
            latitud: formData.latitud, // ✅ Mantener como number (Prisma lo convierte a Decimal)
            longitud: formData.longitud, // ✅ Mantener como number
            precio: parseFloat(formData.precio), // ✅ Number para Decimal
            capacidad: parseInt(formData.capacidad), // ✅ Number para Int
            imagenUrl: formData.imagenUrl,
            estadoId: formData.estadoId,
            encargadoId: user?.id || null,
          }),
        }
      );

      const responseData = await response.json();
      console.log("Response status:", response.status);
      console.log("Response data:", responseData);

      if (response.ok) {
        Alert.alert("Éxito", "Escenario actualizado correctamente", [
          {
            text: "OK",
            onPress: () => router.back(),
          },
        ]);
      } else {
        console.error("Error del servidor:", responseData);
        Alert.alert(
          "Error",
          responseData.error ||
            responseData.message ||
            "No se pudo actualizar el escenario"
        );
      }
    } catch (error) {
      console.error("Error updating scenario:", error);
      Alert.alert("Error", "Error de conexión");
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#2196F3" />
        <Text style={styles.loadingText}>Cargando escenario...</Text>
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.contentContainer}
    >
      {/* Formulario */}
      <View style={styles.form}>
        {/* Nombre */}
        <View style={styles.fieldContainer}>
          <Text style={styles.label}>Nombre del Escenario *</Text>
          <TextInput
            style={styles.input}
            value={formData.nombre}
            onChangeText={(text) =>
              setFormData((prev) => ({ ...prev, nombre: text }))
            }
            placeholder="Ej: Cancha de Fútbol Centro"
          />
        </View>

        {/* Tipo */}
        <View style={styles.fieldContainer}>
          <Text style={styles.label}>Tipo de Escenario *</Text>
          <View style={styles.pickerContainer}>
            <Picker
              selectedValue={formData.tipo}
              onValueChange={(itemValue) =>
                setFormData((prev) => ({ ...prev, tipo: itemValue }))
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
            placeholder="Describe las características del escenario..."
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
            placeholder="Ej: Calle 123 #45-67, Ciudad"
          />
        </View>

        {/* Coordenadas */}
        <View style={styles.fieldContainer}>
          <Text style={styles.label}>Coordenadas</Text>
          <TouchableOpacity
            style={styles.locationButton}
            onPress={obtenerCoordenadas}
          >
            <Text style={styles.locationButtonText}>
              {formData.latitud !== null &&
              formData.longitud !== null &&
              typeof formData.latitud === "number" &&
              typeof formData.longitud === "number"
                ? `Lat: ${formData.latitud.toFixed(
                    6
                  )}, Lng: ${formData.longitud.toFixed(6)}`
                : "Obtener Coordenadas GPS"}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Precio */}
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

        {/* Imagen */}
        <View style={styles.fieldContainer}>
          <Text style={styles.label}>Imagen del Escenario</Text>
          <TouchableOpacity
            style={styles.imageButton}
            onPress={seleccionarImagen}
          >
            <Text style={styles.imageButtonText}>Cambiar Imagen</Text>
          </TouchableOpacity>

          {imagen && (
            <View style={styles.imagePreview}>
              <Image source={{ uri: imagen }} style={styles.previewImage} />
            </View>
          )}

          {isUploading && (
            <View style={styles.uploadingContainer}>
              <ActivityIndicator size="small" color="#2196F3" />
              <Text style={styles.uploadingText}>Subiendo imagen...</Text>
            </View>
          )}
        </View>

        {/* Botones */}
        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={styles.cancelButton}
            onPress={() => router.back()}
          >
            <Text style={styles.cancelButtonText}>Cancelar</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.submitButton}
            onPress={actualizarEscenario}
          >
            <Text style={styles.submitButtonText}>Actualizar</Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8f9fa",
  },
  contentContainer: {
    paddingBottom: 30,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f8f9fa",
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: "#4a3232ff",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingTop: 50,
    paddingBottom: 20,
    backgroundColor: "#fff",
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#f0f0f0",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 16,
  },
  backButtonText: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#2196F3",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#333",
  },
  form: {
    padding: 20,
  },
  fieldContainer: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: "#fff",
  },
  textArea: {
    height: 100,
    textAlignVertical: "top",
  },
  pickerContainer: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    backgroundColor: "#fff",
  },
  picker: {
    height: 50,
  },
  locationButton: {
    backgroundColor: "#4CAF50",
    padding: 12,
    borderRadius: 8,
    alignItems: "center",
  },
  locationButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  imageButton: {
    backgroundColor: "#2196F3",
    padding: 12,
    borderRadius: 8,
    alignItems: "center",
  },
  imageButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  imagePreview: {
    marginTop: 10,
    alignItems: "center",
  },
  previewImage: {
    width: 200,
    height: 150,
    borderRadius: 8,
  },
  uploadingContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 10,
  },
  uploadingText: {
    marginLeft: 8,
    color: "#666",
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 30,
  },
  cancelButton: {
    backgroundColor: "#666",
    padding: 15,
    borderRadius: 8,
    flex: 0.45,
  },
  cancelButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
    textAlign: "center",
  },
  submitButton: {
    backgroundColor: "#4CAF50",
    padding: 15,
    borderRadius: 8,
    flex: 0.45,
  },
  submitButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
    textAlign: "center",
  },
});
