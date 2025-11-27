import { useState, useEffect } from "react";
import {
  Text,
  StyleSheet,
  View,
  TouchableOpacity,
  Platform,
  Alert,
  ScrollView,
} from "react-native";
import DateTimePicker from "@react-native-community/datetimepicker";
import { useLocalSearchParams } from "expo-router";
import { ReservarEscenario } from "./services/ReservarEscenario";
import { useAuth } from "./context/AuthContext";
import { useRouter } from "expo-router";

export default function Reservar() {
  const router = useRouter();
  const { user } = useAuth();
  const { escenarioId } = useLocalSearchParams();
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [startTime, setStartTime] = useState(new Date());
  const [endTime, setEndTime] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showStartTimePicker, setShowStartTimePicker] = useState(false);
  const [showEndTimePicker, setShowEndTimePicker] = useState(false);

  // Nuevos estados para el precio
  const [precioPorHora, setPrecioPorHora] = useState<number>(0);
  const [precioTotal, setPrecioTotal] = useState<number>(0);
  const [duracionHoras, setDuracionHoras] = useState<number>(0);

  // Función para obtener el precio del escenario
  const obtenerPrecioEscenario = async () => {
    try {
      // ✅ Convertir escenarioId a número antes de usarlo
      const escenarioIdNumber = Array.isArray(escenarioId)
        ? parseInt(escenarioId[0])
        : parseInt(escenarioId as string);

      console.log("=== ESCENARIO ID DEBUG ===");
      console.log("escenarioId raw:", escenarioId);
      console.log("escenarioIdNumber:", escenarioIdNumber);

      const response = await fetch(
        `https://backend-sportzone-production.up.railway.app/api/escenario/${escenarioIdNumber}`
      );

      console.log("=== API RESPONSE DEBUG ===");
      console.log(
        "URL llamada:",
        `https://backend-sportzone-production.up.railway.app/api/escenario/${escenarioIdNumber}`
      );
      console.log("Response status:", response.status);

      if (response.ok) {
        const escenario = await response.json();
        console.log("Escenario obtenido:", escenario);
        console.log("Precio del escenario:", escenario.precio);

        const precioNumerico = parseFloat(escenario.precio);
        console.log("Precio convertido a número:", precioNumerico);

        setPrecioPorHora(precioNumerico || 1000); // Default a 1000 si no hay precio
      } else {
        console.error(
          "Error en la respuesta:",
          response.status,
          response.statusText
        );
        const errorText = await response.text();
        console.error("Error details:", errorText);

        // Establecer precio por defecto si hay error
        setPrecioPorHora(1000);
      }
    } catch (error) {
      console.error("Error obteniendo precio del escenario:", error);
      // Establecer precio por defecto si hay error
      setPrecioPorHora(1000);
    }
  };

  // Función para calcular la duración en horas
  const calcularDuracion = (inicio: Date, fin: Date): number => {
    const diffMs = fin.getTime() - inicio.getTime();
    const diffHours = diffMs / (1000 * 60 * 60); // Convertir ms a horas
    return Math.max(0, diffHours); // Evitar valores negativos
  };

  // Función para calcular el precio total
  const calcularPrecioTotal = () => {
    const duracion = calcularDuracion(startTime, endTime);
    setDuracionHoras(duracion);
    setPrecioTotal(precioPorHora * duracion);
  };

  // Obtener precio del escenario al cargar el componente
  useEffect(() => {
    if (escenarioId) {
      obtenerPrecioEscenario();
    }
  }, [escenarioId]);

  // Recalcular precio cuando cambien las horas o el precio por hora
  useEffect(() => {
    calcularPrecioTotal();
  }, [startTime, endTime, precioPorHora]);

  const onDateChange = (event: any, selectedDate?: Date) => {
    const currentDate = selectedDate || new Date();
    setShowDatePicker(Platform.OS === "ios");
    setSelectedDate(currentDate);
  };

  const onStartTimeChange = (event: any, selectedTime?: Date) => {
    const currentTime = selectedTime || startTime;
    setShowStartTimePicker(Platform.OS === "ios");
    setStartTime(currentTime);

    // Si la hora de fin es anterior a la de inicio, ajustarla
    if (currentTime >= endTime) {
      const newEndTime = new Date(currentTime.getTime() + 60 * 60 * 1000); // +1 hora
      setEndTime(newEndTime);
    }
  };

  const onEndTimeChange = (event: any, selectedTime?: Date) => {
    const currentTime = selectedTime || endTime;
    setShowEndTimePicker(Platform.OS === "ios");

    // Validar que la hora de fin sea posterior a la de inicio
    if (currentTime <= startTime) {
      Alert.alert(
        "Error",
        "La hora de fin debe ser posterior a la hora de inicio"
      );
      return;
    }

    setEndTime(currentTime);
  };

  // Función para formatear duración
  const formatearDuracion = (horas: number): string => {
    const horasEnteras = Math.floor(horas);
    const minutos = Math.round((horas - horasEnteras) * 60);

    if (horasEnteras === 0) {
      return `${minutos} minutos`;
    } else if (minutos === 0) {
      return `${horasEnteras} ${horasEnteras === 1 ? "hora" : "horas"}`;
    } else {
      return `${horasEnteras}h ${minutos}min`;
    }
  };

  const handleReservar = async () => {
    // Validar que hay usuario logueado
    if (!user) {
      Alert.alert("Error", "Debes estar logueado para hacer una reserva");
      return;
    }

    // Validar duración mínima (por ejemplo, 30 minutos)
    if (duracionHoras < 0.5) {
      Alert.alert(
        "Error",
        "La reserva debe tener una duración mínima de 30 minutos"
      );
      return;
    }

    // Formatear fecha como AAAA-MM-DD
    const fechaFormateada = selectedDate.toISOString().split("T")[0];

    // Formatear horas como HH:MM (sin convertir a ISO)
    const horaInicio = startTime.toTimeString().substring(0, 5);
    const horaFin = endTime.toTimeString().substring(0, 5);

    if (!escenarioId) {
      Alert.alert("Error", "ID del escenario no proporcionado.");
      return;
    }

    const escenarioIdNumber = Array.isArray(escenarioId)
      ? parseInt(escenarioId[0])
      : parseInt(escenarioId);

    try {
      console.log("=========ENVIANDO RESERVA==========", {
        fecha: fechaFormateada,
        horaInicio: horaInicio,
        horaFin: horaFin,
        escenarioId: escenarioIdNumber,
        usuarioId: user.id,
        estadoId: 4,
      });

      const result = await ReservarEscenario({
        fecha: fechaFormateada,
        horaInicio: horaInicio,
        horaFin: horaFin,
        escenarioId: escenarioIdNumber,
        usuarioId: user.id,
        estadoId: 4,
      });

      console.log("=== RESULTADO DE LA RESERVA ===", result);

      // ✅ Manejar respuesta igual que React Web
      if (result.ok) {
        console.log("✅ Reserva exitosa");

        Alert.alert(
          "Reserva Exitosa",
          `¡Reserva realizada correctamente!\n\nDetalles:\n• Fecha: ${selectedDate.toLocaleDateString()}\n• Hora: ${horaInicio} - ${horaFin}\n• Duración: ${formatearDuracion(
            duracionHoras
          )}\n• Precio Total: $${precioTotal.toLocaleString()}`,
          [
            {
              text: "OK",
              onPress: () => {
                // Navegar a la lista de reservas
                // router.push('/reservas');
                router.back();
              },
            },
          ]
        );
      } else {
        // Si la API devuelve un error específico
        console.error("❌ Error de la API:", result.error);
        Alert.alert("Error", result.error || "Error al realizar la reserva");
      }
    } catch (error: any) {
      console.error("❌ Error al reservar:", error);
      Alert.alert(
        "Error",
        "Error al realizar la reserva. Por favor, intenta de nuevo."
      );
    }
  };

  return (
    <View style={styles.container}>
      <ScrollView>
        {user && <Text style={styles.title}>Reservar Escenario </Text>}

        <View style={styles.sectionContainer}>
          <Text style={styles.subtitle}>Fecha de Reserva</Text>
          <TouchableOpacity
            style={styles.dateButton}
            onPress={() => setShowDatePicker(true)}
          >
            <Text style={styles.dateButtonText}>
              {selectedDate.toDateString()}
            </Text>
          </TouchableOpacity>

          {showDatePicker && (
            <DateTimePicker
              testID="datePicker"
              value={selectedDate}
              mode="date"
              is24Hour={true}
              display="default"
              onChange={onDateChange}
              minimumDate={new Date()}
            />
          )}
        </View>

        <View style={styles.sectionContainer}>
          <Text style={styles.subtitle}>Hora de Inicio</Text>
          <TouchableOpacity
            style={styles.timeButton}
            onPress={() => setShowStartTimePicker(true)}
          >
            <Text style={styles.timeButtonText}>
              {startTime.toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
              })}
            </Text>
          </TouchableOpacity>

          {showStartTimePicker && (
            <DateTimePicker
              testID="startTimePicker"
              value={startTime}
              mode="time"
              is24Hour={true}
              display="spinner"
              onChange={onStartTimeChange}
            />
          )}
        </View>

        <View style={styles.sectionContainer}>
          <Text style={styles.subtitle}>Hora de Fin</Text>
          <TouchableOpacity
            style={styles.timeButton}
            onPress={() => setShowEndTimePicker(true)}
          >
            <Text style={styles.timeButtonText}>
              {endTime.toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
              })}
            </Text>
          </TouchableOpacity>

          {showEndTimePicker && (
            <DateTimePicker
              testID="endTimePicker"
              value={endTime}
              mode="time"
              is24Hour={true}
              display="spinner"
              onChange={onEndTimeChange}
            />
          )}
        </View>

        {/* Sección de resumen de precio */}
        <View style={styles.priceContainer}>
          <Text style={styles.priceTitle}>Resumen de Reserva</Text>

          <View style={styles.priceRow}>
            <Text style={styles.priceLabel}>Duración:</Text>
            <Text style={styles.priceValue}>
              {formatearDuracion(duracionHoras)}
            </Text>
          </View>

          <View style={styles.priceRow}>
            <Text style={styles.priceLabel}>Precio por hora:</Text>
            <Text style={styles.priceValue}>
              ${precioPorHora.toLocaleString()}
            </Text>
          </View>

          <View style={[styles.priceRow, styles.totalRow]}>
            <Text style={styles.totalLabel}>Precio Total:</Text>
            <Text style={styles.totalValue}>
              ${precioTotal.toLocaleString()}
            </Text>
          </View>
        </View>

        <TouchableOpacity
          style={[
            styles.reservarButton,
            duracionHoras < 0.5 && styles.reservarButtonDisabled,
          ]}
          onPress={handleReservar}
          disabled={duracionHoras < 0.5}
        >
          <Text style={styles.reservarButtonText}>
            Reservar por ${precioTotal.toLocaleString()}
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    padding: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 30,
    textAlign: "center",
    color: "#333",
  },
  sectionContainer: {
    marginBottom: 25,
  },
  subtitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 10,
    color: "#333",
  },
  dateButton: {
    backgroundColor: "#f8f8f8",
    padding: 15,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#ddd",
    alignItems: "center",
  },
  dateButtonText: {
    fontSize: 16,
    color: "#333",
  },
  timeButton: {
    backgroundColor: "#f8f8f8",
    padding: 15,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#ddd",
    alignItems: "center",
  },
  timeButtonText: {
    fontSize: 16,
    color: "#333",
  },
  priceContainer: {
    backgroundColor: "#f0f8ff",
    padding: 20,
    borderRadius: 12,
    marginVertical: 20,
    borderWidth: 1,
    borderColor: "#2196F3",
  },
  priceTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#2196F3",
    marginBottom: 15,
    textAlign: "center",
  },
  priceRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  priceLabel: {
    fontSize: 16,
    color: "#666",
  },
  priceValue: {
    fontSize: 16,
    color: "#333",
    fontWeight: "500",
  },
  totalRow: {
    borderTopWidth: 1,
    borderTopColor: "#ddd",
    paddingTop: 12,
    marginTop: 12,
  },
  totalLabel: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#2196F3",
  },
  totalValue: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#2196F3",
  },
  reservarButton: {
    backgroundColor: "#2196F3",
    padding: 15,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 30,
  },
  reservarButtonDisabled: {
    backgroundColor: "#ccc",
  },
  reservarButtonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
  },
});
