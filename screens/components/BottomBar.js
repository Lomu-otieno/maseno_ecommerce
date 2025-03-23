import { View, Text, TouchableOpacity, Alert } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { supabase } from "../../supabase";

const BottomBar = ({ productId }) => {
    const navigation = useNavigation();
    const addToCart = async (productId, quantity) => {
        if (!productId) {
            console.error("Error: Product ID is undefined!");
            return;
        }

        // Get the logged-in user's email from the session
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();

        if (sessionError) {
            console.error("Error fetching session:", sessionError.message);
            return;
        }

        const userEmail = session?.user?.email;

        if (!userEmail) {
            console.error("No authenticated user or email found.");
            return;
        }


        // Insert item into the cart with the retrieved email
        const { data, error } = await supabase
            .from("cart")
            .insert([{ email: userEmail, productId, quantity }]);

        if (error) {
            console.error("Error adding to cart:", error.message);
        } else {
            console.log("Added to cart:", data);
        }
    };




    return (
        <View style={{
            position: "absolute",
            bottom: 0,
            left: 0,
            right: 0,
            backgroundColor: "#fff",
            flexDirection: "row",
            justifyContent: "space-around",
            alignItems: "center",
            paddingVertical: 10,
            borderTopWidth: 1,
            borderColor: "#ddd",
        }}>
            <TouchableOpacity onPress={() => navigation.navigate("Home")}>
                <Ionicons name="home-outline" size={30}>
                </Ionicons>

            </TouchableOpacity>

            <TouchableOpacity onPress={() => alert("Call 0790790406")}>
                <Ionicons name="call-outline" size={30}></Ionicons>
            </TouchableOpacity>

            <TouchableOpacity style={{
                backgroundColor: "orange",
                paddingVertical: 10,
                paddingHorizontal: 20,
                borderRadius: 5,
                width: "60%"
            }}
                onPress={() => {
                    addToCart(productId, 1)
                    Alert.alert("Success", "Item added to Cart")
                }} >
                <Ionicons name="cart-outline" size={30}>
                </Ionicons>
            </TouchableOpacity>
        </View >
    );
};

export default BottomBar;
