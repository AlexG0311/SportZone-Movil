import { View, Text, StyleSheet, ScrollView, Image } from 'react-native';
import React from 'react';

interface ImagenData {
  uri: string;
  isPrincipal: boolean;
}

interface Step6Props {
  nombre: string;
  descripcion: string;
  direccion: string;
  latitud: number | null;
  longitud: number | null;
  precio: string;
  capacidad: string;
  imagenes: ImagenData[];
}

export default function Step6({
  nombre,
  descripcion,
  direccion,
  latitud,
  longitud,
  precio,
  capacidad,
  imagenes,
}: Step6Props) {
  const imagenPrincipal = imagenes.find((img) => img.isPrincipal) || imagenes[0];

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Resumen del Escenario</Text>
      <Text style={styles.subtitle}>
        Revisa la información antes de crear tu escenario
      </Text>

      {imagenPrincipal && (
        <View style={styles.imageContainer}>
          <Image source={{ uri: imagenPrincipal.uri }} style={styles.image} />
          <View style={styles.principalBadge}>
            <Text style={styles.principalText}>⭐ Imagen Principal</Text>
          </View>
        </View>
      )}

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>📝 Información Básica</Text>
        <View style={styles.field}>
          <Text style={styles.label}>Nombre:</Text>
          <Text style={styles.value}>{nombre || 'No especificado'}</Text>
        </View>
        <View style={styles.field}>
          <Text style={styles.label}>Descripción:</Text>
          <Text style={styles.value}>{descripcion || 'No especificada'}</Text>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>📍 Ubicación</Text>
        <View style={styles.field}>
          <Text style={styles.label}>Dirección:</Text>
          <Text style={styles.value}>{direccion || 'No especificada'}</Text>
        </View>
        {latitud && longitud && (
          <View style={styles.field}>
            <Text style={styles.label}>Coordenadas:</Text>
            <Text style={styles.value}>
              {latitud.toFixed(6)}, {longitud.toFixed(6)}
            </Text>
          </View>
        )}
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>💰 Detalles</Text>
        <View style={styles.detailsRow}>
          <View style={styles.detailCard}>
            <Text style={styles.detailLabel}>Precio/hora</Text>
            <Text style={styles.detailValue}>${precio || '0'}</Text>
          </View>
          <View style={styles.detailCard}>
            <Text style={styles.detailLabel}>Capacidad</Text>
            <Text style={styles.detailValue}>{capacidad || '0'} personas</Text>
          </View>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>📷 Imágenes</Text>
        <View style={styles.field}>
          <Text style={styles.label}>Total de imágenes:</Text>
          <Text style={styles.value}>{imagenes.length}</Text>
        </View>
        {imagenes.length > 1 && (
          <Text style={styles.hint}>
            Se subirán {imagenes.length} imágenes al crear el escenario
          </Text>
        )}
      </View>

      <View style={styles.warningBox}>
        <Text style={styles.warningText}>
          ⚠️ Asegúrate de que toda la información sea correcta antes de continuar
        </Text>
      </View>
    </ScrollView>
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
  imageContainer: {
    position: 'relative',
    marginBottom: 20,
    borderRadius: 8,
    overflow: 'hidden',
  },
  image: {
    width: '100%',
    height: 250,
    resizeMode: 'cover',
  },
  principalBadge: {
    position: 'absolute',
    top: 15,
    right: 15,
    backgroundColor: '#FFC107',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 15,
  },
  principalText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  section: {
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 8,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
  },
  field: {
    marginBottom: 12,
  },
  label: {
    fontSize: 14,
    color: '#666',
    marginBottom: 5,
  },
  value: {
    fontSize: 16,
    color: '#333',
    fontWeight: '500',
  },
  detailsRow: {
    flexDirection: 'row',
    gap: 10,
  },
  detailCard: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
  },
  detailLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 5,
  },
  detailValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#4CAF50',
  },
  hint: {
    fontSize: 12,
    color: '#999',
    fontStyle: 'italic',
    marginTop: 5,
  },
  warningBox: {
    backgroundColor: '#FFF3CD',
    padding: 15,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#FFC107',
    marginBottom: 20,
  },
  warningText: {
    fontSize: 14,
    color: '#856404',
    textAlign: 'center',
  },
});
