import { View, Text, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { supabase } from "../../supabase";

const BottomBar = ({ productId }) => {
    const navigation = useNavigation();
    const addToCart = async (email, productId, quantity) => {
        console.log("Adding to cart - Product ID:", productId); // Debugging log

        const { data: { user } } = await supabase.auth.getUser(); // Get logged-in user

        if (!user) {
            console.error("No authenticated user.");
            return;
        }

        const { data, error } = await supabase.from("cart").insert([{ email, productId, quantity }]).select();
        if (error) {
            console.log('Error adding to cart', error.message)
        } else {
            console.log("added to cart", data);
        }
    }


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
            {/* Home Button */}
            <TouchableOpacity onPress={() => navigation.navigate("Home")}>
                <Ionicons name="home-outline" size={30}>
                </Ionicons>

            </TouchableOpacity>

            {/* Call Button */}
            <TouchableOpacity onPress={() => alert("Call 0790790406")}>
                <Ionicons name="call-outline" size={30}></Ionicons>
            </TouchableOpacity>

            {/* Add to Cart Button */}
            <TouchableOpacity style={{
                backgroundColor: "orange",
                paddingVertical: 10,
                paddingHorizontal: 20,
                borderRadius: 5,
                width: "60%"
            }}
                onPress={() => addToCart("otilomu@gmail.com", productId, 1)} >
                <Ionicons name="cart-outline" size={30}>
                </Ionicons>
            </TouchableOpacity>
        </View>
    );
};

export default BottomBar;
