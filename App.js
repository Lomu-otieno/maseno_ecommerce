import React, { useEffect, useRef } from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { Ionicons } from "@expo/vector-icons";
import { createNavigationContainerRef } from "@react-navigation/native";

// Import Screens
import { navigationRef } from "./RootNavigation";
import SignupScreen from "./screens/Signup";
import LoginScreen from "./screens/Login";
import ForgotPassScreen from "./screens/ForgotPassScreen";
import HomeScreen from "./screens/Home";
import Chat from "./screens/Chat";
import CartScreen from "./screens/Cart";
import Category from "./screens/Category";
import Profile from "./screens/Profile";
import UpdateProfile from "./screens/UpdateProfile";
import ProductDetails from "./screens/ProductDetails";
import { StatusBar } from "expo-status-bar";

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();
export function navigate(name, params) {
  if (navigationRef.isReady()) {
    navigationRef.navigate(name, params);
  }
}
// ✅ Bottom Tabs Navigator
function HomeTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ color, size }) => {
          const icons = {
            Home: "home-outline",
            Chat: "chatbubble-outline",
            Category: "list-outline",
            Cart: "cart-outline",
            Profile: "person-outline",
          };
          return <Ionicons name={icons[route.name]} size={size} color={color} />;

        },
        tabBarActiveTintColor: "tomato",
        tabBarInactiveTintColor: "gray",
        headerShown: false, // Hide top header
      })}
    >
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="Category" component={Category} />
      <Tab.Screen name="Chat" component={Chat} />
      <Tab.Screen name="Cart" component={CartScreen} />
      <Tab.Screen name="Profile" component={Profile} />
    </Tab.Navigator>
  );
}

// ✅ Main Stack Navigator
export default function App() {
  return (
    <>
      <StatusBar style="light" />
      <NavigationContainer ref={navigationRef}>
        <Stack.Navigator initialRouteName="Login" screenOptions={{ headerShown: false }}>
          <Stack.Screen name="Login" component={LoginScreen} />
          <Stack.Screen name="Signup" component={SignupScreen} />
          <Stack.Screen name="ForgotPassScreen" component={ForgotPassScreen} />
          <Stack.Screen name="Home" component={HomeTabs} />
          <Stack.Screen name="UpdateProfile" component={UpdateProfile} />
          <Stack.Screen name="Cart" component={CartScreen} />
          <Stack.Screen name="ProductDetails" component={ProductDetails} />
        </Stack.Navigator>
      </NavigationContainer>
    </>
  );
}
//https://checkout.hustlesasa.shop/checkout/AVVBAYUM