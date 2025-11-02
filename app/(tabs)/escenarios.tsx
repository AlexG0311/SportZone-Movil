import { Text, View, FlatList, StyleSheet, TextInput, Image, Pressable, RefreshControl } from 'react-native';
import { useRouter } from 'expo-router';
import { Escenario } from '../../types/types';
import Screen from '../Screen';
import { useEffect, useState } from 'react';
import { icons } from './icons';

export default function Escenarios() {
    const router = useRouter();
    const [escenarios, setEscenarios] = useState<Escenario[]>([]);
    const [filteredEscenarios, setFilteredEscenarios] = useState<Escenario[]>([]);
    const [searchText, setSearchText] = useState('');
    const [refreshing, setRefreshing] = useState(false); // Estado para el refresh

    // Función para cargar los escenarios
    const loadEscenarios = async () => {
        try {
            const response = await fetch('http://192.168.100.147:4000/api/escenario');
            const data = await response.json();
            setEscenarios(data);
            setFilteredEscenarios(data);
        } catch (error) {
            console.error('Error fetching data:', error);
        }
    };

    useEffect(() => { 
        loadEscenarios();
    }, []);

    // Función para manejar el pull-to-refresh
    const onRefresh = async () => {
        setRefreshing(true);
        
        try {
            await loadEscenarios();
            
            // Opcional: agregar un pequeño delay para mejor UX
            await new Promise(resolve => setTimeout(resolve, 500));
            
        } catch (error) {
            console.error('Error refreshing data:', error);
        } finally {
            setRefreshing(false);
        }
    };

    // Función de búsqueda
    const handleSearch = (text: string) => {
        setSearchText(text);
        if (text.trim() === '') {
            setFilteredEscenarios(escenarios);
        } else {
            const filtered = escenarios.filter(escenario =>
                escenario.nombre.toLowerCase().includes(text.toLowerCase()) ||
                escenario.direccion?.toLowerCase().includes(text.toLowerCase()) ||
                escenario.tipo?.toLowerCase().includes(text.toLowerCase())
            );
            setFilteredEscenarios(filtered);
        }
    };

    const renderItem = ({ item }: { item: Escenario }) => (
        <Pressable 
            style={styles.card} 
            onPress={() => router.push(`/${item.id}`)}
            android_ripple={{ color: '#e3f2fd' }}
        >
            <View style={styles.imageContainer}>
                <Image 
                    source={{ uri: item.imagenUrl }}
                    style={styles.cardImage}
                    resizeMode="cover"
                />
                <View style={styles.imageOverlay}>
                    <View style={styles.typeTag}>
                        <Text style={styles.typeText}>{item.tipo}</Text>
                    </View>
                </View>
            </View>
            
            <View style={styles.cardContent}>
                <Text style={styles.cardTitle} numberOfLines={2}>{item.nombre}</Text>
                
                <View style={styles.infoRow}>
                    {icons.escenarios({ color: '#6B7280', size: 16 })}
                    <Text style={styles.infoText} numberOfLines={1}>{item.direccion}</Text>
                </View>
                
                <View style={styles.infoRow}>
                    {icons.reservas({ color: '#6B7280', size: 16 })}
                    <Text style={styles.infoText}>Capacidad: {item.capacidad}</Text>
                </View>
                
                <View style={styles.cardFooter}>
                    <Text style={styles.viewMoreText}>Ver detalles</Text>
                    <Text style={styles.arrow}>→</Text>
                </View>
            </View>
        </Pressable>
    );

    return (
        <Screen>
            {/* Header con perfil y búsqueda */}
            <View style={styles.header}>
                <Pressable 
                    onPress={() => router.push('/perfil')} 
                    style={styles.profileButton}
                >
                    {icons.perfil({ color: '#3B82F6', size: 24 })}
                </Pressable>
                
                <View style={styles.headerContent}>
                    <Text style={styles.headerTitle}>Escenarios Deportivos</Text>
                    <Text style={styles.headerSubtitle}>
                        {filteredEscenarios.length} escenarios disponibles
                    </Text>
                </View>
            </View>

            {/* Barra de búsqueda mejorada */}
            <View style={styles.searchContainer}>
                <View style={styles.searchInputContainer}>
                    {icons.escenarios({ color: '#9CA3AF', size: 20 })}
                    <TextInput
                        style={styles.searchInput}
                        placeholder="Buscar escenarios..."
                        value={searchText}
                        onChangeText={handleSearch}
                        placeholderTextColor="#9CA3AF"
                    />
                    {searchText.length > 0 && (
                        <Pressable onPress={() => handleSearch('')}>
                            <Text style={styles.clearButton}>✕</Text>
                        </Pressable>
                    )}
                </View>
            </View>

            {/* Lista de escenarios con RefreshControl */}
            <FlatList
                data={filteredEscenarios}
                renderItem={renderItem}
                keyExtractor={(item) => item.id.toString()}
                contentContainerStyle={styles.list}
                showsVerticalScrollIndicator={false}
                initialNumToRender={5}
                maxToRenderPerBatch={10}
                windowSize={5}
                removeClippedSubviews={true}
                refreshControl={
                    <RefreshControl
                        refreshing={refreshing}
                        onRefresh={onRefresh}
                        colors={['#3B82F6']} // Android
                        tintColor="#3B82F6" // iOS
                        title="Actualizando..." // iOS
                        titleColor="#6B7280" // iOS
                    />
                }
                ListEmptyComponent={
                    <View style={styles.emptyContainer}>
                        <Text style={styles.emptyText}>No se encontraron escenarios</Text>
                        <Text style={styles.emptySubtext}>Intenta con otros términos de búsqueda</Text>
                    </View>
                }
            />
        </Screen>
    );
}

const styles = StyleSheet.create({
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingTop: 50,
        paddingBottom: 20,
        backgroundColor: '#FFFFFF',
    },
    profileButton: {
        width: 48,
        height: 48,
        backgroundColor: '#F8FAFC',
        borderRadius: 24,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    headerContent: {
        flex: 1,
    },
    headerTitle: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#1F2937',
        marginBottom: 2,
    },
    headerSubtitle: {
        fontSize: 14,
        color: '#6B7280',
    },
    searchContainer: {
        paddingHorizontal: 16,
        paddingBottom: 16,
        backgroundColor: '#FFFFFF',
    },
    searchInputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#F9FAFB',
        borderRadius: 12,
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderWidth: 1,
        borderColor: '#E5E7EB',
    },
    searchInput: {
        flex: 1,
        fontSize: 16,
        marginLeft: 8,
        color: '#1F2937',
    },
    clearButton: {
        fontSize: 16,
        color: '#9CA3AF',
        padding: 4,
    },
    list: {
        padding: 16,
        paddingTop: 8,
    },
    row: {
        justifyContent: 'space-between',
    },
    card: {
        backgroundColor: 'white',
        borderRadius: 16,
        marginBottom: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 4,
        overflow: 'hidden',
    },
    imageContainer: {
        position: 'relative',
        height: 120,
    },
    cardImage: {
        width: '100%',
        height: '100%',
    },
    imageOverlay: {
        position: 'absolute',
        top: 8,
        right: 8,
    },
    typeTag: {
        backgroundColor: 'rgba(59, 130, 246, 0.9)',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 8,
    },
    typeText: {
        color: '#FFFFFF',
        fontSize: 12,
        fontWeight: '600',
    },
    cardContent: {
        padding: 12,
    },
    cardTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#1F2937',
        marginBottom: 8,
        lineHeight: 20,
    },
    infoRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 6,
    },
    infoText: {
        fontSize: 14,
        color: '#6B7280',
        marginLeft: 6,
        flex: 1,
    },
    cardFooter: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginTop: 8,
        paddingTop: 8,
        borderTopWidth: 1,
        borderTopColor: '#F3F4F6',
    },
    viewMoreText: {
        fontSize: 14,
        color: '#3B82F6',
        fontWeight: '600',
    },
    arrow: {
        fontSize: 16,
        color: '#3B82F6',
        fontWeight: 'bold',
    },
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingVertical: 40,
    },
    emptyText: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#6B7280',
        marginBottom: 8,
    },
    emptySubtext: {
        fontSize: 14,
        color: '#9CA3AF',
        textAlign: 'center',
    },
});