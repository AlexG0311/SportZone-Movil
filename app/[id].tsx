import { Text, View, Image, StyleSheet, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { useLocalSearchParams } from 'expo-router';
import Screen from './Screen';
import { useEffect, useState } from 'react';
import { Escenario } from '../types/types';
import { ActivityIndicator } from 'react-native';

export default function Detail() {
    const { id } = useLocalSearchParams();
    const router = useRouter();

const [loading, setLoading] = useState(true);
   const [escenarios, setEscenarios] = useState<Escenario[]>([]);
    
    useEffect(() => {
        fetch('http://192.168.100.147:4000/api/escenario')
            .then(response => response.json())
            .then(data => setEscenarios(data))
            .finally(() => setLoading(false))
            .catch(error => console.error('Error fetching data:', error));
    }, []);

    const escenario = escenarios.find(e => e.id === Number(id));


    if(loading){
        return(
            <View style={[styles.content, { justifyContent: 'center', alignItems: 'center' }]}>
                <ActivityIndicator size="large" color="#1db322ff" />
                <Text>Cargando escenario...</Text>
            </View>
        );
    }



    if (!escenario) {
        return (
            <View style={[styles.content, { justifyContent: 'center', alignItems: 'center' }]}>
                <Text>Escenario no encontrado</Text>
            </View>
        );
    }


    return (
        <Screen>
            <View style={styles.content}>
                <View style={styles.imageContainer}>
                    
                    <Image
                        source={{ uri: escenario.imagenUrl }}
                        style={styles.image}
                        resizeMode="cover"
                        onError={(e) => console.log('Error loading image:', e.nativeEvent.error)}
                    />
                </View>
                <View style={styles.infoContainer}>
                    <Text style={styles.title}>{escenario.nombre}</Text>
                    <Text style={styles.info}>Ubicación: {escenario.direccion}</Text>
                    <Text style={styles.info}>Tipo: {escenario.tipo}</Text>
                    <Text style={styles.info}>Capacidad: {escenario.capacidad}</Text>
                </View>
                
                <View style={styles.buttonContainer}>
                    <TouchableOpacity 
                        style={[styles.button, { backgroundColor: '#68a459ff' }]} 
                        onPress={() => router.push(`/reservar?escenarioId=${id}`)}
                    >
                        <Text style={styles.buttonText}>Reservar</Text>
                    </TouchableOpacity>

                    <TouchableOpacity 
                        style={[styles.button, { backgroundColor: '#ff0606ff' }]} 
                        onPress={() => router.push(`/reportar?escenarioId=${id}`)}
                    >
                        <Text style={styles.buttonText}>Reportar Daño</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </Screen>
    );
}

const styles = StyleSheet.create({
 
    content: {
        flex: 1,
        padding: 16,
    },
    imageContainer: { 
        width: '100%',
        height: 250,
        borderRadius: 8,
        overflow: 'hidden',
        marginBottom: 16,
    },
    image: {
        width: '100%',
        height: '100%',
    },
    infoContainer: {
        padding: 16,
        borderWidth: 1,
        borderColor: "#ffffffff",
        borderRadius: 8,
        backgroundColor: '#ffffffff',
    },
    title: {
        fontSize: 20,
        fontWeight: 'bold',
        marginBottom: 12,
    },
    info: {
        fontSize: 16,
        marginBottom: 8,
    },
    buttonContainer: {
        marginTop: 20,
        gap: 10,
    },
    button: {
        padding: 15,
        borderRadius: 8,
        alignItems: 'center',
        elevation: 3, // Android shadow
        shadowColor: '#000', // iOS shadow
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
    },
    buttonText: {
        color: 'white',
        fontSize: 16,
        fontWeight: 'bold',
    }
});