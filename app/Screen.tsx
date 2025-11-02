import { View } from "react-native";


export default function Screen({children}: {children: React.ReactNode}) {
    return <View style={{flex: 1,backgroundColor: "#d6d8d6ff", paddingTop:10}}>{children}</View>;
}
