import React from 'react';
import {NavigationContainer} from '@react-navigation/native';
import {createStackNavigator} from '@react-navigation/stack';
import QRCodeDisplay from './components/QRCodeDisplay';
import Tracking from './components/tracking'; // This loads iosTracking or androidTracking automatically
import 'react-native-gesture-handler';
import {GestureHandlerRootView} from 'react-native-gesture-handler';

const Stack = createStackNavigator();

export default function App() {
  return (
    <GestureHandlerRootView style={{flex: 1}}>
      <NavigationContainer>
        <Stack.Navigator
          initialRouteName="QRCodeDisplay"
          screenOptions={{headerShown: false}}>
          <Stack.Screen name="QRCodeDisplay" component={QRCodeDisplay} />
          <Stack.Screen name="StartTracking" component={Tracking} />
        </Stack.Navigator>
      </NavigationContainer>
    </GestureHandlerRootView>
  );
}
