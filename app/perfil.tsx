import { View, Text, StyleSheet, Pressable, ScrollView } from 'react-native';
import { icons } from './(tabs)/icons';
import { useRouter } from 'expo-router';

export default function Perfil() {
    const router = useRouter();

    return (
        <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
            {/* Header con avatar */}
            <View style={styles.header}>
                <View style={styles.avatar}>
                    <Text style={styles.avatarText}>JP</Text>
                </View>
                <Text style={styles.userName}>Juan Pérez</Text>
                <Text style={styles.userEmail}>juan.perez@example.com</Text>
            </View>

            {/* Información personal */}
            <View style={styles.card}>
                <Text style={styles.sectionTitle}>Información Personal</Text>
                <View style={styles.infoRow}>
                    <Text style={styles.label}>Nombre:</Text>
                    <Text style={styles.value}>Juan Pérez</Text>
                </View>
                <View style={styles.infoRow}>
                    <Text style={styles.label}>Email:</Text>
                    <Text style={styles.value}>juan.perez@example.com</Text>
                </View>
                <View style={styles.infoRow}>
                    <Text style={styles.label}>Teléfono:</Text>
                    <Text style={styles.value}>+57 300 123 4567</Text>
                </View>
            </View>

      

            <Pressable style={styles.menuItem} onPress={() => {router.push('/CrearScenario')}}>
                <View style={styles.menuContent}>
                    {icons.escenarios({color: '#10B981', size: 24})}
                    <View style={styles.menuTextContainer}>
                        <Text style={styles.menuTitle}>Crear Escenario</Text>
                        <Text style={styles.menuSubtitle}>Agregar nuevo escenario</Text>
                    </View>
                    <Text style={styles.arrow}>›</Text>
                </View>
            </Pressable>

               <Pressable style={styles.menuItem} onPress={() => {router.push('/miEscenario')}}>
                <View style={styles.menuContent}>
                    {icons.miEscenario({color: '#15c8e8ff', size: 24})}
                    <View style={styles.menuTextContainer}>
                        <Text style={styles.menuTitle}>Mis Escenarios</Text>
                        <Text style={styles.menuSubtitle}>Ver todos mis escenarios</Text>
                    </View>
                    <Text style={styles.arrow}>›</Text>
                </View>
            </Pressable>

       

            {/* Botón de cerrar sesión */}
            <Pressable style={styles.logoutButton} onPress={() => {}}>
                <Text style={styles.logoutText}>Cerrar Sesión</Text>
            </Pressable>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F8FAFC',
        paddingHorizontal: 20,
    },
    header: {
        alignItems: 'center',
        paddingVertical: 40,
        paddingTop: 60,
    },
    avatar: {
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: '#3B82F6',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 16,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 4,
    },
    avatarText: {
        fontSize: 32,
        fontWeight: 'bold',
        color: '#FFFFFF',
    },
    userName: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#1F2937',
        marginBottom: 4,
    },
    userEmail: {
        fontSize: 16,
        color: '#6B7280',
    },
    card: {
        backgroundColor: '#FFFFFF',
        padding: 20,
        borderRadius: 16,
        marginBottom: 20,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.05,
        shadowRadius: 8,
        elevation: 2,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: '#1F2937',
        marginBottom: 16,
    },
    infoRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 8,
        borderBottomWidth: 1,
        borderBottomColor: '#F3F4F6',
    },
    label: {
        fontSize: 16,
        color: '#6B7280',
        fontWeight: '500',
    },
    value: {
        fontSize: 16,
        color: '#1F2937',
        fontWeight: '400',
        flex: 1,
        textAlign: 'right',
    },
    menuItem: {
        backgroundColor: '#FFFFFF',
        borderRadius: 12,
        marginBottom: 12,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 1,
        },
        shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 1,
    },
    menuContent: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
    },
    menuTextContainer: {
        flex: 1,
        marginLeft: 16,
    },
    menuTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: '#1F2937',
        marginBottom: 2,
    },
    menuSubtitle: {
        fontSize: 14,
        color: '#6B7280',
    },
    arrow: {
        fontSize: 20,
        color: '#D1D5DB',
        fontWeight: 'bold',
    },
    logoutButton: {
        backgroundColor: '#EF4444',
        paddingVertical: 16,
        borderRadius: 12,
        alignItems: 'center',
        marginTop: 20,
        marginBottom: 40,
    },
    logoutText: {
        fontSize: 16,
        fontWeight: '600',
        color: '#FFFFFF',
    },
});

