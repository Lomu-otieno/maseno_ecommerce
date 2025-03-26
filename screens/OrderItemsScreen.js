import React, { useEffect, useState } from "react";
import { View, Text, FlatList, TouchableOpacity, StyleSheet, ActivityIndicator } from "react-native";
import { supabase } from "../supabase";
import { useNavigation, useRoute } from "@react-navigation/native";
import { Picker } from "@react-native-picker/picker";

const OrderItemsScreen = () => {
    const navigation = useNavigation();
    const route = useRoute();
    const { cartItems, totalCost } = route.params;
    const [pickupLocation, setPickupLocation] = useState('');
    const [loading, setLoading] = useState(false);
    const [userEmail, setUserEmail] = useState(null);

    console.log("Received cartItems:", cartItems);
    console.log("Received totalCost:", totalCost);

    useEffect(() => {
        const getUserEmail = async () => {
            const { data: { session }, error } = await supabase.auth.getSession();
            if (session?.user) {
                setUserEmail(session.user.email);
            }
        };
        getUserEmail();
    }, []);

    const placeOrder = async () => {
        if (!userEmail) return;
        setLoading(true);

        // Insert order into 'orders' table
        const { data: order, error } = await supabase.from("orders").insert([{
            email: userEmail,
            total_price: totalCost,
            pickup_location: pickupLocation,
            status: "Pending"
        }]).select();

        if (error) {
            console.error("Order placement failed", error);
            setLoading(false);
            return;
        }

        const orderId = order[0].id;

        // Insert order items into 'order_items' table
        const orderItems = cartItems.map(item => ({
            order_id: orderId,
            product_id: item.productId,
            quantity: item.quantity,
            price: item.products.price
        }));

        const { error: orderItemsError } = await supabase.from("order_items").insert(orderItems);

        if (orderItemsError) {
            console.error("Failed to insert order items", orderItemsError);
        } else {
            // **Clear the cart in Supabase**
            await supabase.from("cart").delete().eq("email", userEmail);

            // **Clear the cart in the UI (state)**
            setCartItems([]);

            alert("Order placed successfully!");
            navigation.navigate("OrdersScreen");
        }
        setLoading(false);
    };


    return (
        <View style={styles.container}>
            <Text style={styles.header}>Review Your Order</Text>

            <View style={styles.pickerContainer}>
                <Text style={styles.pickerLabel}>Select Pickup Location:</Text>
                <Picker
                    selectedValue={pickupLocation}
                    onValueChange={(itemValue) => setPickupLocation(itemValue)}
                    style={styles.picker}
                >
                    <Picker.Item label="Mash Electronics Opposite ACK Maseno" value="Mash Electronics" />
                    <Picker.Item label="Maseno Bazaar Nyawita Opposite Mama Shamim" value="Maseno Bazaar" />
                    <Picker.Item label="Action Centre Mabungo" value="Action Centre" />
                </Picker>
            </View>

            <FlatList
                data={cartItems}
                keyExtractor={(item) => item.id.toString()}
                renderItem={({ item }) => (
                    <View style={styles.itemContainer}>
                        <Text style={styles.itemText}>{item.products.name} x{item.quantity}</Text>
                        <Text style={styles.priceText}>Kshs. {item.products.price * item.quantity}</Text>
                    </View>
                )}
            />

            <Text style={styles.totalText}>Total: Kshs. {totalCost.toFixed(2)}</Text>

            <TouchableOpacity
                style={styles.button}
                onPress={() => {
                    placeOrder();
                    navigation.navigate("OrderScreen");
                }}
                disabled={loading}
            >
                {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Confirm Order</Text>}
            </TouchableOpacity>

        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 20,
        backgroundColor: "#f9f9f9",
    },
    header: {
        fontSize: 24,
        fontWeight: "bold",
        marginBottom: 50,
        marginTop: 50,
        textAlign: "center",
        color: "#333",
        padding: 0,
        borderBottomWidth: 3,
    },
    pickerContainer: {
        marginBottom: 20,
        backgroundColor: "#fff",
        borderRadius: 8,
        paddingVertical: 8,
        paddingHorizontal: 12,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 2,
    },
    pickerLabel: {
        fontSize: 16,
        fontWeight: "500",
        color: "#555",
        marginBottom: 4,
    },
    picker: {
        height: 50,
        color: "#333",
    },
    itemContainer: {
        flexDirection: "row",
        justifyContent: "space-between",
        padding: 15,
        borderBottomWidth: 1,
        borderBottomColor: "#ddd",
        backgroundColor: "#fff",
        borderRadius: 6,
        marginBottom: 10,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 3,
        elevation: 1,
    },
    itemText: {
        fontSize: 16,
        fontWeight: "500",
        color: "#333",
    },
    priceText: {
        fontSize: 16,
        fontWeight: "bold",
        color: "#ff6600",
    },
    totalText: {
        fontSize: 20,
        fontWeight: "bold",
        textAlign: "center",
        marginVertical: 20,
        color: "#000",
        borderBottomWidth: 2,
    },
    button: {
        backgroundColor: "#ff6600",
        padding: 15,
        borderRadius: 8,
        alignItems: "center",
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 2,
    },
    buttonText: {
        color: "#fff",
        fontSize: 18,
        fontWeight: "bold",
    },
});

export default OrderItemsScreen;
