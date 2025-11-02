
import { Text } from 'react-native';
import Screen from './Screen';
import { useLocalSearchParams } from 'expo-router';
export default function Reportar() {
    const { escenarioId } = useLocalSearchParams();


    return (
        <Screen>
            <Text>Reportar Daño {escenarioId}</Text>
        </Screen>
    );
}
