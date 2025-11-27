import { View, Text, TextInput, StyleSheet, Pressable, Alert } from 'react-native';
import React, { useState } from 'react';
import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps';
import * as Location from 'expo-location';

interface Step3Props {
  direccion: string;
  latitud: number | null;
  longitud: number | null;
  onDireccionChange: (direccion: string) => void;
  onUbicacionChange: (latitud: number, longitud: number) => void;
}

export default function Step3({
  direccion,
  latitud,
  longitud,
  onDireccionChange,
  onUbicacionChange,
}: Step3Props) {
  const [mapRegion, setMapRegion] = useState({
    latitude: latitud || 9.3175,
    longitude: longitud || -75.394,
    latitudeDelta: 0.01,
    longitudeDelta: 0.01,
  });

  const obtenerUbicacionActual = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Error', 'Permiso de ubicación denegado');
        return;
      }

      const location = await Location.getCurrentPositionAsync({});
      const { latitude, longitude } = location.coords;

      onUbicacionChange(latitude, longitude);
      setMapRegion({
        latitude,
        longitude,
        latitudeDelta: 0.005,
        longitudeDelta: 0.005,
      });

      Alert.alert('Éxito', 'Ubicación actual obtenida');
    } catch (error) {
      Alert.alert('Error', 'No se pudo obtener la ubicación');
    }
  };

  const handleMapPress = (event: any) => {
    const { latitude, longitude } = event.nativeEvent.coordinate;
    onUbicacionChange(latitude, longitude);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Ubicación del Escenario</Text>
      <Text style={styles.subtitle}>
        ¿Dónde está ubicado tu escenario?
      </Text>

      <TextInput
        style={styles.input}
        placeholder="Dirección completa"
        value={direccion}
        onChangeText={onDireccionChange}
        placeholderTextColor="#999"
      />

      <Pressable style={styles.button} onPress={obtenerUbicacionActual}>
        <Text style={styles.buttonText}>📍 Usar ubicación actual</Text>
      </Pressable>

      <Text style={styles.mapLabel}>
        Toca en el mapa para seleccionar la ubicación exacta:
      </Text>

      <View style={styles.mapContainer}>
        <MapView
          style={styles.map}
          provider={PROVIDER_GOOGLE}
          region={mapRegion}
          onPress={handleMapPress}
        >
          {latitud && longitud && (
            <Marker
              coordinate={{
                latitude: latitud,
                longitude: longitud,
              }}
              title="Tu escenario"
            />
          )}
        </MapView>
      </View>

      {latitud && longitud && (
        <Text style={styles.coordsText}>
          📍 Coordenadas: {latitud.toFixed(6)}, {longitud.toFixed(6)}
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    marginBottom: 20,
  },
  input: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 15,
    fontSize: 16,
    color: '#333',
    marginBottom: 15,
  },
  button: {
    backgroundColor: '#4CAF50',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 15,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  mapLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 10,
  },
  mapContainer: {
    height: 300,
    borderRadius: 8,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#ddd',
  },
  map: {
    flex: 1,
  },
  coordsText: {
    marginTop: 10,
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
  },
});
