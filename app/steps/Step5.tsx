import {
  View,
  Text,
  StyleSheet,
  Pressable,
  Image,
  ScrollView,
  Alert,
} from 'react-native';
import React from 'react';
import * as ImagePicker from 'expo-image-picker';

interface ImagenData {
  uri: string;
  isPrincipal: boolean;
}

interface Step5Props {
  imagenes: ImagenData[];
  onImagenesChange: (imagenes: ImagenData[]) => void;
}

export default function Step5({ imagenes, onImagenesChange }: Step5Props) {
  const seleccionarImagen = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Error', 'Se necesitan permisos para acceder a la galería');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      allowsEditing: true,
      aspect: [16, 9],
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      const nuevaImagen: ImagenData = {
        uri: result.assets[0].uri,
        isPrincipal: imagenes.length === 0, // Primera imagen es principal por defecto
      };
      onImagenesChange([...imagenes, nuevaImagen]);
    }
  };

  const marcarComoPrincipal = (index: number) => {
    const nuevasImagenes = imagenes.map((img, i) => ({
      ...img,
      isPrincipal: i === index,
    }));
    onImagenesChange(nuevasImagenes);
  };

  const eliminarImagen = (index: number) => {
    const nuevasImagenes = imagenes.filter((_, i) => i !== index);
    
    // Si eliminamos la principal y hay otras imágenes, hacer la primera como principal
    if (imagenes[index].isPrincipal && nuevasImagenes.length > 0) {
      nuevasImagenes[0].isPrincipal = true;
    }
    
    onImagenesChange(nuevasImagenes);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Imágenes del Escenario</Text>
      <Text style={styles.subtitle}>
        Agrega fotos de tu escenario deportivo
      </Text>

      <Pressable style={styles.addButton} onPress={seleccionarImagen}>
        <Text style={styles.addButtonText}>📷 Agregar Imagen</Text>
      </Pressable>

      {imagenes.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>
            No has agregado imágenes aún
          </Text>
          <Text style={styles.emptyHint}>
            Agrega al menos una imagen principal
          </Text>
        </View>
      ) : (
        <ScrollView style={styles.imagesList}>
          {imagenes.map((imagen, index) => (
            <View key={index} style={styles.imageCard}>
              <Image source={{ uri: imagen.uri }} style={styles.image} />
              
              <View style={styles.imageInfo}>
                {imagen.isPrincipal && (
                  <View style={styles.principalBadge}>
                    <Text style={styles.principalText}>⭐ Principal</Text>
                  </View>
                )}
                
                <View style={styles.imageActions}>
                  {!imagen.isPrincipal && (
                    <Pressable
                      style={styles.actionButton}
                      onPress={() => marcarComoPrincipal(index)}
                    >
                      <Text style={styles.actionButtonText}>
                        Marcar como principal
                      </Text>
                    </Pressable>
                  )}
                  
                  <Pressable
                    style={[styles.actionButton, styles.deleteButton]}
                    onPress={() => eliminarImagen(index)}
                  >
                    <Text style={styles.deleteButtonText}>🗑️ Eliminar</Text>
                  </Pressable>
                </View>
              </View>
            </View>
          ))}
        </ScrollView>
      )}

      <Text style={styles.footerHint}>
        {imagenes.length > 0
          ? `${imagenes.length} imagen${imagenes.length > 1 ? 'es' : ''} agregada${imagenes.length > 1 ? 's' : ''}`
          : 'Agrega al menos una imagen'}
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
    marginBottom: 20,
  },
  addButton: {
    backgroundColor: '#2196F3',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 20,
  },
  addButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  emptyText: {
    fontSize: 18,
    color: '#999',
    marginBottom: 10,
    textAlign: 'center',
  },
  emptyHint: {
    fontSize: 14,
    color: '#bbb',
    textAlign: 'center',
  },
  imagesList: {
    flex: 1,
  },
  imageCard: {
    backgroundColor: '#fff',
    borderRadius: 8,
    marginBottom: 15,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#ddd',
  },
  image: {
    width: '100%',
    height: 200,
    resizeMode: 'cover',
  },
  imageInfo: {
    padding: 15,
  },
  principalBadge: {
    backgroundColor: '#FFC107',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 15,
    alignSelf: 'flex-start',
    marginBottom: 10,
  },
  principalText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  imageActions: {
    flexDirection: 'row',
    gap: 10,
    flexWrap: 'wrap',
  },
  actionButton: {
    backgroundColor: '#4CAF50',
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 5,
  },
  actionButtonText: {
    color: '#fff',
    fontSize: 14,
  },
  deleteButton: {
    backgroundColor: '#f44336',
  },
  deleteButtonText: {
    color: '#fff',
    fontSize: 14,
  },
  footerHint: {
    marginTop: 15,
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    fontStyle: 'italic',
  },
});
