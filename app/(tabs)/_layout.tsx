import { Tabs } from "expo-router";
import { icons } from "./icons";

export default function TabsLayout() {
  return (
    <Tabs 
      
      screenOptions={{
      headerShown: true,
      headerStyle: { backgroundColor: '#5f725aff' },
      headerTitleStyle: { color: '#fff' },
      tabBarActiveTintColor: '#83bd74ff',
      tabBarStyle: {
        backgroundColor: '#fff',  
        borderColor: '#5f725aff',
        borderWidth: 2,
      }
    }}>
      <Tabs.Screen 
       
        name="escenarios" 
        options={{
          title: 'Escenarios',
          tabBarIcon: icons.escenarios,
          headerShown: false
         
        }}
      />
        <Tabs.Screen 
        name="Maps" 
        options={{  
          title: 'Maps',
          tabBarIcon: icons.maps,
           headerShown: false
        }}
      />
    <Tabs.Screen 
            name="reservas"
            options={{
              title: 'Reservas',
              tabBarIcon: icons.reservas,
            }}
        
          />
    
    
    
    </Tabs>
  );
}