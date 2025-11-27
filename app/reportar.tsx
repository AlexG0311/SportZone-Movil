import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Image,
  Alert,
  ScrollView,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { useState, useEffect } from "react";
import { useRouter, useLocalSearchParams, Stack } from "expo-router";
import * as ImagePicker from "expo-image-picker";
import { Ionicons } from "@expo/vector-icons";
import { useAuth } from "./context/AuthContext";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { useSafeAreaInsets } from "react-native-safe-area-context";
                         
interface Escenario {
  id: number;
  nombre: string;
  tipo: string;
  direccion: string;
}

export default function Reportes() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { escenarioId } = useLocalSearchParams();
  const { user } = useAuth();

  const [descripcion, setDescripcion] = useState("");
  const [imagenUri, setImagenUri] = useState<string | null>(null);
  const [escenario, setEscenario] = useState<Escenario | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // Cloudinary config
  const CLOUDINARY_CLOUD_NAME = "dyxwkzchf";
  const CLOUDINARY_UPLOAD_PRESET = "mediaescenarios";

  useEffect(() => {
    if (escenarioId) {
      fetchEscenario();
    }
  }, [escenarioId]);

  const fetchEscenario = async () => {
    try {
      const id = Array.isArray(escenarioId) ? escenarioId[0] : escenarioId;
      const response = await fetch(
        `https://backend-sportzone-production.up.railway.app/api/escenario/${id}`
      );
      const data = await response.json();
      setEscenario(data);
    } catch (error) {
      console.error("Error al cargar escenario:", error);
      Alert.alert("Error", "No se pudo cargar la información del escenario");
    } finally {
      setLoading(false);
    }
  };

  const seleccionarImagen = async () => {
    try {
      const { status } =
        await ImagePicker.requestMediaLibraryPermissionsAsync();

      if (status !== "granted") {
        Alert.alert(
          "Permisos necesarios",
          "Se necesitan permisos para acceder a la galería"
        );
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ["images"],
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      });

      if (!result.canceled) {
        setImagenUri(result.assets[0].uri);
      }
    } catch (error) {
      console.error("Error al seleccionar imagen:", error);
      Alert.alert("Error", "No se pudo seleccionar la imagen");
    }
  };

  const tomarFoto = async () => {
    try {
      const { status } = await ImagePicker.requestCameraPermissionsAsync();

      if (status !== "granted") {
        Alert.alert(
          "Permisos necesarios",
          "Se necesitan permisos para acceder a la cámara"
        );
        return;
      }

      const result = await ImagePicker.launchCameraAsync({
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      });

      if (!result.canceled) {
        setImagenUri(result.assets[0].uri);
      }
    } catch (error) {
      console.error("Error al tomar foto:", error);
      Alert.alert("Error", "No se pudo tomar la foto");
    }
  };

  const subirImagenACloudinary = async (uri: string): Promise<string> => {
    const formData = new FormData();
    formData.append("file", {
      uri,
      type: "image/jpeg",
      name: "reporte.jpg",
    } as any);
    formData.append("upload_preset", CLOUDINARY_UPLOAD_PRESET);

    const response = await fetch(
      `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`,
      {
        method: "POST",
        body: formData,
      }
    );

    const data = await response.json();
    if (!response.ok) {
      throw new Error("Error al subir imagen");
    }

    return data.secure_url;
  };

  const mostrarOpcionesImagen = () => {
    Alert.alert(
      "Agregar Imagen",
      "Selecciona una opción",
      [
        {
          text: "Tomar Foto",
          onPress: tomarFoto,
        },
        {
          text: "Elegir de Galería",
          onPress: seleccionarImagen,
        },
        {
          text: "Cancelar",
          style: "cancel",
        },
      ],
      { cancelable: true }
    );
  };

  const handleSubmit = async () => {
    // Validaciones
    if (!user) {
      Alert.alert("Error", "Debes iniciar sesión para reportar un daño");
      return;
    }

    if (!descripcion.trim()) {
      Alert.alert("Error", "Por favor describe el daño encontrado");
      return;
    }

    if (!imagenUri) {
      Alert.alert("Error", "Por favor agrega una imagen del daño");
      return;
    }

    if (!escenarioId) {
      Alert.alert("Error", "No se pudo identificar el escenario");
      return;
    }

    setSubmitting(true);

    try {
      // 1. Subir imagen a Cloudinary
      console.log("Subiendo imagen a Cloudinary...");
      const imagenUrl = await subirImagenACloudinary(imagenUri);
      console.log("Imagen subida:", imagenUrl);

      // 2. Enviar reporte al backend
      const escenarioIdNumber = Array.isArray(escenarioId)
        ? parseInt(escenarioId[0])
        : parseInt(escenarioId);

      const reporteData = {
        usuarioId: user.id,
        escenarioId: escenarioIdNumber,
        descripcion: descripcion.trim(),
        imagenUrl: imagenUrl,
      };

      console.log("Enviando reporte:", reporteData);

      const response = await fetch("https://backend-sportzone-production.up.railway.app/api/reportar/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(reporteData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Error al enviar el reporte");
      }

      const data = await response.json();
      console.log("Reporte creado exitosamente:", data);

      Alert.alert(
        "Reporte Enviado",
        "Tu reporte ha sido enviado correctamente. Gracias por ayudarnos a mantener los escenarios en buen estado.",
        [
          {
            text: "OK",
            onPress: () => router.back(),
          },
        ]
      );
    } catch (error) {
      console.error("Error al enviar reporte:", error);
      Alert.alert(
        "Error",
        error instanceof Error
          ? error.message
          : "No se pudo enviar el reporte. Intenta nuevamente."
      );
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <View style={[styles.container, styles.centered]}>
        <ActivityIndicator size="large" color="#10B981" />
        <Text style={styles.loadingText}>Cargando...</Text>
      </View>
    );
  }

  return (
    <>
      <Stack.Screen
        options={{
          title: "Reportar Daño",
          headerStyle: {
            backgroundColor: "#10B981",
          },
          headerTintColor: "#fff",
          headerTitleStyle: {
            fontWeight: "bold",
          },
        }}
      />

      <SafeAreaProvider>
        <View style={[styles.safeArea, { paddingBottom: insets.bottom }]}>
          <KeyboardAvoidingView
            style={[styles.container]}
            behavior={Platform.OS === "ios" ? "padding" : "height"}
          >
          <ScrollView
            style={styles.scrollView}
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
          >
            {/* Información del escenario */}
            {escenario && (
              <View style={styles.escenarioInfo}>
                <Ionicons name="location" size={24} color="#10B981" />
                <View style={styles.escenarioTexts}>
                  <Text style={styles.escenarioNombre}>{escenario.nombre}</Text>
                  <Text style={styles.escenarioDireccion}>
                    {escenario.direccion}
                  </Text>
                </View>
              </View>
            )}

            {/* Descripción del daño */}
            <View style={styles.section}>
              <Text style={styles.label}>
                Descripción del Daño <Text style={styles.required}>*</Text>
              </Text>
              <TextInput
                style={styles.textArea}
                placeholder="Describe detalladamente el daño que encontraste..."
                placeholderTextColor="#9CA3AF"
                multiline
                numberOfLines={5}
                textAlignVertical="top"
                value={descripcion}
                onChangeText={setDescripcion}
                maxLength={500}
              />
              <Text style={styles.charCount}>{descripcion.length}/500</Text>
            </View>

            {/* Imagen del daño */}
            <View style={styles.section}>
              <Text style={styles.label}>
                Evidencia Fotográfica <Text style={styles.required}>*</Text>
              </Text>

              {imagenUri ? (
                <View style={styles.imagePreviewContainer}>
                  <Image
                    source={{ uri: imagenUri }}
                    style={styles.imagePreview}
                    resizeMode="cover"
                  />
                  <TouchableOpacity
                    style={styles.removeImageButton}
                    onPress={() => setImagenUri(null)}
                  >
                    <Ionicons name="close-circle" size={32} color="#EF4444" />
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.changeImageButton}
                    onPress={mostrarOpcionesImagen}
                  >
                    <Ionicons name="camera" size={20} color="#fff" />
                    <Text style={styles.changeImageText}>Cambiar Imagen</Text>
                  </TouchableOpacity>
                </View>
              ) : (
                <TouchableOpacity
                  style={styles.addImageButton}
                  onPress={mostrarOpcionesImagen}
                >
                  <Ionicons name="camera-outline" size={48} color="#9CA3AF" />
                  <Text style={styles.addImageText}>
                    Agregar Foto del Daño
                  </Text>
                  <Text style={styles.addImageSubtext}>
                    Toca para tomar una foto o seleccionar de galería
                  </Text>
                </TouchableOpacity>
              )}
            </View>

            {/* Nota informativa */}
            <View style={styles.infoBox}>
              <Ionicons name="information-circle" size={24} color="#3B82F6" />
              <Text style={styles.infoText}>
                Tu reporte ayuda a mantener los escenarios en óptimas condiciones
                para todos los usuarios. Gracias por tu colaboración.
              </Text>
            </View>
          </ScrollView>

          {/* Botón de enviar */}
          <View style={styles.footer}>
            <TouchableOpacity
              style={[
                styles.submitButton,
                (!descripcion.trim() || !imagenUri || submitting) &&
                  styles.submitButtonDisabled,
              ]}
              onPress={handleSubmit}
              disabled={!descripcion.trim() || !imagenUri || submitting}
            >
              {submitting ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <>
                  <Ionicons name="send" size={20} color="#fff" />
                  <Text style={styles.submitButtonText}>Enviar Reporte</Text>
                </>
              )}
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
</View>
      </SafeAreaProvider>
    </>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#ffffffff",
  },
  container: {
    flex: 1,
    backgroundColor: "#ffffffff",
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
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 100,
  },
  escenarioInfo: {
    backgroundColor: "#fff",
    padding: 16,
    borderRadius: 12,
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
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
  escenarioNombre: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#111827",
  },
  escenarioDireccion: {
    fontSize: 14,
    color: "#6B7280",
    marginTop: 4,
  },
  section: {
    marginBottom: 24,
  },
  label: {
    fontSize: 16,
    fontWeight: "600",
    color: "#374151",
    marginBottom: 8,
  },
  required: {
    color: "#EF4444",
  },
  textArea: {
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#D1D5DB",
    borderRadius: 12,
    padding: 16,
    fontSize: 15,
    color: "#111827",
    minHeight: 120,
  },
  charCount: {
    textAlign: "right",
    fontSize: 12,
    color: "#9CA3AF",
    marginTop: 4,
  },
  addImageButton: {
    backgroundColor: "#fff",
    borderWidth: 2,
    borderColor: "#D1D5DB",
    borderStyle: "dashed",
    borderRadius: 12,
    padding: 32,
    alignItems: "center",
    justifyContent: "center",
  },
  addImageText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#374151",
    marginTop: 12,
  },
  addImageSubtext: {
    fontSize: 13,
    color: "#9CA3AF",
    marginTop: 4,
    textAlign: "center",
  },
  imagePreviewContainer: {
    position: "relative",
    borderRadius: 12,
    overflow: "hidden",
  },
  imagePreview: {
    width: "100%",
    height: 250,
    borderRadius: 12,
  },
  removeImageButton: {
    position: "absolute",
    top: 12,
    right: 12,
    backgroundColor: "#fff",
    borderRadius: 16,
  },
  changeImageButton: {
    position: "absolute",
    bottom: 12,
    right: 12,
    backgroundColor: "rgba(0, 0, 0, 0.7)",
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    gap: 6,
  },
  changeImageText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "600",
  },
  infoBox: {
    backgroundColor: "#EFF6FF",
    padding: 16,
    borderRadius: 12,
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 12,
  },
  infoText: {
    flex: 1,
    fontSize: 14,
    color: "#1E40AF",
    lineHeight: 20,
  },
  footer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "#fff",
    padding: 20,
    paddingBottom: 10,
    borderTopWidth: 1,
    borderTopColor: "#E5E7EB",
  },
  submitButton: {
    backgroundColor: "#10B981",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: 16,
    borderRadius: 12,
    gap: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  submitButtonDisabled: {
    backgroundColor: "#D1D5DB",
    opacity: 0.6,
  },
  submitButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
});