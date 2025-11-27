import { View, Text, TextInput, StyleSheet } from 'react-native';
import React from 'react';

interface Step4Props {
  precio: string;
  capacidad: string;
  onPrecioChange: (precio: string) => void;
  onCapacidadChange: (capacidad: string) => void;
}

export default function Step4({
  precio,
  capacidad,
  onPrecioChange,
  onCapacidadChange,
}: Step4Props) {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Detalles del Escenario</Text>
      <Text style={styles.subtitle}>
        Información sobre precio y capacidad
      </Text>

      <View style={styles.fieldContainer}>
        <Text style={styles.label}>Precio por Hora</Text>
        <View style={styles.inputWrapper}>
          <Text style={styles.currency}>$</Text>
          <TextInput
            style={styles.input}
            placeholder="0.00"
            value={precio}
            onChangeText={(text) => {
              // Solo permite números y punto decimal
              const cleanText = text.replace(/[^0-9.]/g, '');
              onPrecioChange(cleanText);
            }}
            keyboardType="decimal-pad"
            placeholderTextColor="#999"
          />
        </View>
        <Text style={styles.hint}>Precio por hora de alquiler</Text>
      </View>

      <View style={styles.fieldContainer}>
        <Text style={styles.label}>Capacidad</Text>
        <View style={styles.inputWrapper}>
          <TextInput
            style={styles.input}
            placeholder="10"
            value={capacidad}
            onChangeText={(text) => {
              // Solo permite números
              const cleanText = text.replace(/[^0-9]/g, '');
              onCapacidadChange(cleanText);
            }}
            keyboardType="number-pad"
            placeholderTextColor="#999"
          />
          <Text style={styles.unit}>personas</Text>
        </View>
        <Text style={styles.hint}>Número máximo de personas</Text>
      </View>
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
    marginBottom: 30,
  },
  fieldContainer: {
    marginBottom: 25,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 10,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingHorizontal: 15,
  },
  currency: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#4CAF50',
    marginRight: 5,
  },
  unit: {
    fontSize: 14,
    color: '#666',
    marginLeft: 5,
  },
  input: {
    flex: 1,
    padding: 15,
    fontSize: 16,
    color: '#333',
  },
  hint: {
    marginTop: 8,
    fontSize: 14,
    color: '#999',
    fontStyle: 'italic',
  },
});
