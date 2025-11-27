import { Stack } from 'expo-router';
import { AuthProvider } from './context/AuthContext';
import { Pressable, View } from 'react-native';
import { useRouter } from 'expo-router';
import { StyleSheet } from 'react-native';
import { Text } from 'react-native';

export default function Layout() {

  const router = useRouter();
    return (
        <AuthProvider>
        <Stack>
        <Stack.Screen name="index" options={{
        headerShown: false,
        title: 'Escenarios Deportivos',
        headerStyle: { backgroundColor: '#5f725aff' },
        headerTitleStyle: { color: '#fff' }

      }} />

        <Stack.Screen name="register" options={{
        headerShown: false,
        title: 'Escenarios Deportivos',
        headerStyle: { backgroundColor: '#5f725aff' },
        headerTitleStyle: { color: '#fff' }
          
      }} />

      <Stack.Screen name="[id]"  options={{
        headerShown: true,
        title: 'Detalle del Escenario',
        headerStyle: { backgroundColor: '#5f725aff' },
        headerTitleStyle: { color: '#fff' }
      }}/>
       <Stack.Screen name="reportar/[id]"  options={{
        headerShown: true,
        title: 'Detalle del Escenario',
        headerStyle: { backgroundColor: '#5f725aff' },
        headerTitleStyle: { color: '#fff' }
      }}/>

       <Stack.Screen name="editarEscenario/[id]"  options={{
        headerShown: true,
        title: 'Editar Escenario',
        headerStyle: { backgroundColor: '#72ef53ff' },
        headerTitleStyle: { color: '#fff' }
      }}/>

      <Stack.Screen name="Maps" options={{
        headerShown: false,
        title: 'Mapa',
        headerStyle: { backgroundColor: '#5f725aff' },
        headerTitleStyle: { color: '#fff' }
      }}/>

      <Stack.Screen name="miEscenario" options={{ 
        headerShown: true,
        title: 'Mis Escenarios',
        headerStyle: { backgroundColor: '#10B981' },
        headerTitleStyle: { color: '#fff' },
       
    
        
      }}/>

      <Stack.Screen name="perfil" options={{
        headerShown: true,
        title: 'Perfil',
   
      }}/>

      




            </Stack>
        </AuthProvider>
    );
}

const styles = StyleSheet.create({
   addButton: {
    width: 40,
    height: 40,
    backgroundColor: "#3B82F6",
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  addButtonText: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#FFFFFF",
  }});