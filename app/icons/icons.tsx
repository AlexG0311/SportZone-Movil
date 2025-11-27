import FontAwesome from '@expo/vector-icons/FontAwesome';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import Feather from '@expo/vector-icons/Feather';
import AntDesign from '@expo/vector-icons/AntDesign';


export const icons = {
    escenarios: ({color, size}: {color: string, size: number}) => (
        <FontAwesome name="th-list" size={size} color={color} />     
    ),
    reportes: ({color, size}: {color: string, size: number}) => (
        <MaterialIcons name="report-problem" size={size} color={color} />
    ),  
    reservas: ({color, size}: {color: string, size: number}) => (
        <MaterialCommunityIcons name="calendar-check" size={size} color={color} />
    ),
    maps: ({color, size}: {color: string, size: number}) => (
       <MaterialCommunityIcons name="google-maps" size={size} color={color} />
    ),
    perfil: ({color, size}: {color: string, size: number}) => (
        <Feather name="user" size={size} color={color} />
    ),
    misReservas: ({color, size}: {color: string, size: number}) => (
        <MaterialCommunityIcons name="calendar-check" size={size} color={color} />
    ),
    miEscenario: ({color, size}: {color: string, size: number}) => (
        <AntDesign name="home" size={size} color={color} />
    ),

}