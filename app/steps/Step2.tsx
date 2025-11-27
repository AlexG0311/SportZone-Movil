import { View, Text, TextInput, StyleSheet } from 'react-native';
import React from 'react';

interface Step2Props {
  descripcion: string;
  onDescripcionChange: (descripcion: string) => void;
}

export default function Step2({ descripcion, onDescripcionChange }: Step2Props) {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Descripción del Escenario</Text>
      <Text style={styles.subtitle}>
        Cuéntanos más sobre tu escenario deportivo
      </Text>
      
      <TextInput
        style={styles.input}
        placeholder="Describe las características, servicios disponibles, superficie, iluminación, etc."
        value={descripcion}
        onChangeText={onDescripcionChange}
        multiline
        numberOfLines={8}
        textAlignVertical="top"
        placeholderTextColor="#999"
      />
      
      <Text style={styles.hint}>
        {descripcion.length} caracteres
      </Text>
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
  input: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 15,
    fontSize: 16,
    color: '#333',
    minHeight: 150,
  },
  hint: {
    marginTop: 10,
    fontSize: 14,
    color: '#999',
    fontStyle: 'italic',
  },
});
