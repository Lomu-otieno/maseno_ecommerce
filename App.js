import React, { useEffect, useRef } from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { Ionicons } from "@expo/vector-icons";
import { Linking } from "react-native";

// Import Screens
import SignupScreen from "./screens/Signup";
import LoginScreen from "./screens/Login";
import ForgotPassScreen from "./screens/ForgotPassScreen";
import HomeScreen from "./screens/Home";
import Chat from "./screens/Chat";
import Cart from "./screens/Cart";
import Category from "./screens/Category";
import Profile from "./screens/Profile";
import UpdateProfile from "./screens/UpdateProfile";

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

// ✅ Bottom Tabs Navigator
function HomeTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ color, size }) => {
          let iconName;

          if (route.name === "Home") iconName = "home-outline";
          if (route.name === "Chat") iconName = "chatbubble-outline";
          if (route.name === "Category") iconName = "list-outline";
          if (route.name === "Cart") iconName = "cart-outline";
          if (route.name === "Profile") iconName = "person-outline";

          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: "tomato",
        tabBarInactiveTintColor: "gray",
        headerShown: false, // Hide top header
      })}
    >
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="Category" component={Category} />
      <Tab.Screen name="Chat" component={Chat} />
      <Tab.Screen name="Cart" component={Cart} />
      <Tab.Screen name="Profile" component={Profile} />
    </Tab.Navigator>
  );
}

// ✅ Main Stack Navigator
export default function App() {
  const navigationRef = useRef(null);

  useEffect(() => {
    const handleDeepLink = (event) => {
      const { url } = event;
      console.log("Deep link opened:", url);

      if (url.includes("reset-password") && navigationRef.current) {
        navigationRef.current.navigate("ForgotPassScreen");
      }
    };
    // Linking.addEventListener("url", handleDeepLink);
    // return () => Linking.removeEventListener("url", handleDeepLink);
  }, []);

  return (
    <NavigationContainer ref={navigationRef}>
      <Stack.Navigator initialRouteName="Login" screenOptions={{ headerShown: false }}>
        <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen name="Signup" component={SignupScreen} />
        <Stack.Screen name="ForgotPassScreen" component={ForgotPassScreen} />
        <Stack.Screen name="Home" component={HomeTabs} />
        <Stack.Screen name="Profile" component={Profile} />
        <Stack.Screen name="UpdateProfile" component={UpdateProfile} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}