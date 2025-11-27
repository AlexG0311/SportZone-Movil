import {
  View,
  Text,
  StyleSheet,
  Pressable,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import React, { useState } from 'react';
import { useRouter, Stack } from 'expo-router';
import * as Progress from 'react-native-progress';
import { useAuth } from './context/AuthContext';
import { SafeAreaProvider, useSafeAreaInsets } from 'react-native-safe-area-context';

// Importar los steps
import Step1 from './steps/Step1';
import Step2 from './steps/Step2';
import Step3 from './steps/Step3';
import Step4 from './steps/Step4';
import Step5 from './steps/Step5';
import Step6 from './steps/Step6';

interface ImagenData {
  uri: string;
  isPrincipal: boolean;
}

export default function EscenarioCreateSteps() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { user } = useAuth();
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Estado del formulario
  const [nombre, setNombre] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [direccion, setDireccion] = useState('');
  const [latitud, setLatitud] = useState<number | null>(null);
  const [longitud, setLongitud] = useState<number | null>(null);
  const [precio, setPrecio] = useState('');
  const [capacidad, setCapacidad] = useState('');
  const [imagenes, setImagenes] = useState<ImagenData[]>([]);

  const totalSteps = 6;
  const progress = currentStep / totalSteps;

  // Cloudinary config
  const CLOUDINARY_CLOUD_NAME = 'dyxwkzchf';
  const CLOUDINARY_UPLOAD_PRESET = 'mediaescenarios';

  // Validaciones por step
  const validarStep = (): boolean => {
    switch (currentStep) {
      case 1:
        if (!nombre.trim()) {
          Alert.alert('Error', 'Por favor ingresa el nombre del escenario');
          return false;
        }
        return true;
      case 2:
        if (!descripcion.trim()) {
          Alert.alert('Error', 'Por favor ingresa una descripción');
          return false;
        }
        return true;
      case 3:
        if (!direccion.trim()) {
          Alert.alert('Error', 'Por favor ingresa la dirección');
          return false;
        }
        if (!latitud || !longitud) {
          Alert.alert('Error', 'Por favor selecciona la ubicación en el mapa');
          return false;
        }
        return true;
      case 4:
        if (!precio || parseFloat(precio) <= 0) {
          Alert.alert('Error', 'Por favor ingresa un precio válido');
          return false;
        }
        if (!capacidad || parseInt(capacidad) <= 0) {
          Alert.alert('Error', 'Por favor ingresa una capacidad válida');
          return false;
        }
        return true;
      case 5:
        if (imagenes.length === 0) {
          Alert.alert('Error', 'Por favor agrega al menos una imagen');
          return false;
        }
        return true;
      default:
        return true;
    }
  };

  const handleNext = () => {
    if (validarStep()) {
      if (currentStep < totalSteps) {
        setCurrentStep(currentStep + 1);
      } else {
        handleSubmit();
      }
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const subirImagenACloudinary = async (uri: string): Promise<string> => {
    const formData = new FormData();
    formData.append('file', {
      uri,
      type: 'image/jpeg',
      name: 'escenario.jpg',
    } as any);
    formData.append('upload_preset', CLOUDINARY_UPLOAD_PRESET);

    const response = await fetch(
      `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`,
      {
        method: 'POST',
        body: formData,
      }
    );

    const data = await response.json();
    if (!response.ok) {
      throw new Error('Error al subir imagen');
    }

    return data.secure_url;
  };

  const handleSubmit = async () => {
    if (!user) {
      Alert.alert('Error', 'Debes iniciar sesión');
      return;
    }

    setIsSubmitting(true);

    try {
      // 1. Subir todas las imágenes a Cloudinary
      const imagenesUrls = await Promise.all(
        imagenes.map(async (img) => ({
          url: await subirImagenACloudinary(img.uri),
          isPrincipal: img.isPrincipal,
        }))
      );

      // 2. Crear el escenario
      const escenarioData = {
        nombre,
        tipo: 'Público',
        descripcion,
        direccion,
        latitud,
        longitud,
        precio: parseFloat(precio),
        capacidad: parseInt(capacidad),
        estadoId: 1,
        encargadoId: user.id,
      };

      const escenarioResponse = await fetch(
        'https://backend-sportzone-production.up.railway.app/api/escenario/',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(escenarioData),
        }
      );

      if (!escenarioResponse.ok) {
        throw new Error('Error al crear el escenario');
      }

      const nuevoEscenario = await escenarioResponse.json();

      // 3. Crear las imágenes asociadas al escenario
      await Promise.all(
        imagenesUrls.map(async (img, index) => {
          const imagenData = {
            escenarioId: nuevoEscenario.id,
            url: img.url,
            descripcion: img.isPrincipal ? 'Imagen principal' : 'Imagen adicional',
            orden: img.isPrincipal ? 0 : index + 1,
          };

          await fetch(`https://backend-sportzone-production.up.railway.app/api/escenario/${nuevoEscenario.id}/imagen`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(imagenData),
          });
        })
      );

      Alert.alert(
        'Éxito',
        'Escenario creado correctamente',
        [
          {
            text: 'OK',
            onPress: () => router.push('/(tabs)/escenarios'),
          },
        ]
      );
    } catch (error) {
      console.error('Error al crear escenario:', error);
      Alert.alert('Error', 'No se pudo crear el escenario. Intenta nuevamente.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return <Step1 nombre={nombre} onNombreChange={setNombre} />;
      case 2:
        return (
          <Step2 descripcion={descripcion} onDescripcionChange={setDescripcion} />
        );
      case 3:
        return (
          <Step3
            direccion={direccion}
            latitud={latitud}
            longitud={longitud}
            onDireccionChange={setDireccion}
            onUbicacionChange={(lat, lng) => {
              setLatitud(lat);
              setLongitud(lng);
            }}
          />
        );
      case 4:
        return (
          <Step4
            precio={precio}
            capacidad={capacidad}
            onPrecioChange={setPrecio}
            onCapacidadChange={setCapacidad}
          />
        );
      case 5:
        return <Step5 imagenes={imagenes} onImagenesChange={setImagenes} />;
      case 6:
        return (
          <Step6
            nombre={nombre}
            descripcion={descripcion}
            direccion={direccion}
            latitud={latitud}
            longitud={longitud}
            precio={precio}
            capacidad={capacidad}
            imagenes={imagenes}
          />
        );
      default:
        return null;
    }
  };

  const getStepTitle = () => {
    const titles = [
      'Nombre',
      'Descripción',
      'Ubicación',
      'Detalles',
      'Imágenes',
      'Resumen',
    ];
    return titles[currentStep - 1];
  };

  return (
    <>
      <Stack.Screen
        options={{
          headerShown: true,
          title: '',
          headerTitle: () => 
              <Progress.Bar
              progress={progress}
              width={null}
              height={6}
              color="#10B981"
              unfilledColor="#e0e0e0"
              borderWidth={0}
              borderRadius={3}
            />,
          headerStyle: {
            backgroundColor: '#fff',
          },
          headerShadowVisible: false,
               
        }}
      />
      
     <SafeAreaProvider>

    
        <KeyboardAvoidingView
          style={[styles.container, { paddingTop: insets.top, paddingBottom: insets.bottom }]}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
      

          <View style={styles.content}>{renderStep()}</View>

          <View style={styles.footer}>
            <Pressable
              style={[styles.button, styles.backButton, currentStep === 1 && styles.buttonDisabled]}
              onPress={handleBack}
              disabled={currentStep === 1}
            >
              <Text style={[styles.buttonText, styles.backButtonText]}>
                 Atrás
              </Text>
            </Pressable>

            <Pressable
              style={[styles.button, styles.nextButton, isSubmitting && styles.buttonDisabled]}
              onPress={handleNext}
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.buttonText}>
                  {currentStep === totalSteps ? ' Crear Escenario' : 'Siguiente '}
                </Text>
              )}
            </Pressable>
          </View>
        </KeyboardAvoidingView>
     </SafeAreaProvider>
    </>
   
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#fff',
  },
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    backgroundColor: '#fff',
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  content: {
    flex: 1,
  },
  footer: {
    flexDirection: 'row',
    padding: 20,
    paddingBottom: 10, // Reducido porque SafeAreaView ya agrega padding
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
    gap: 10,
  },
  button: {
    flex: 1,
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  backButton: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#ddd',
  },
  backButtonText: {
    color: '#666',
  },
  nextButton: {
    backgroundColor: '#10B981',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  buttonDisabled: {
    opacity: 0.5,
  },
});
