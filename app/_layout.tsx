import { Stack } from 'expo-router';
import { AuthProvider } from './context/AuthContext';

export default function Layout() {
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


      <Stack.Screen name="(tabs)" options={{
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
            </Stack>
        </AuthProvider>
    );
}