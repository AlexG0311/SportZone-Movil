import { View, Text, TextInput, StyleSheet } from 'react-native';
import React, { use } from 'react';
import { SafeAreaProvider, useSafeAreaInsets } from 'react-native-safe-area-context';

interface Step1Props {
  nombre: string;
  onNombreChange: (nombre: string) => void;
}

export default function Step1({ nombre, onNombreChange }: Step1Props) {

const insets = useSafeAreaInsets();





  return (
    <SafeAreaProvider>
    <View style={[styles.container, { paddingTop: insets.top, paddingBottom: insets.bottom }]}>
      <Text style={styles.title}>Nombre del Escenario</Text>
      <Text style={styles.subtitle}>
        ¿Cómo se llama tu escenario deportivo?
      </Text>
      
      <TextInput
        style={styles.input}
        placeholder="Ej: Cancha de Fútbol Los Pinos"
        value={nombre}
        onChangeText={onNombreChange}
        placeholderTextColor="#999"
      />
      
      <Text style={styles.hint}>
        Elige un nombre descriptivo y fácil de recordar
      </Text>
    </View>
    </SafeAreaProvider>
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
  input: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 15,
    fontSize: 16,
    color: '#333',
  },
  hint: {
    marginTop: 10,
    fontSize: 14,
    color: '#999',
    fontStyle: 'italic',
  },
});
