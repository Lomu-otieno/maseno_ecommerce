import React from "react";
import { View, Text, FlatList, TouchableOpacity, StyleSheet } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";

const CartScreen = ({ route }) => {
    const navigation = useNavigation();
    const { productId } = route.params || {}; // Get productId if passed

    // Dummy cart items (Replace with actual state management like Redux or Context API)
    const cartItems = [
        { id: "1", name: "Product A", price: "$10" },
        { id: "2", name: "Product B", price: "$15" },
        { id: "3", name: "Product C", price: "$20" },
    ];

    return (
        <View style={styles.container}>
            <Text style={styles.header}>Shopping Cart</Text>

            {/* Display Added Product ID if Available */}
            {productId && <Text style={styles.info}>Added Product ID: {productId}</Text>}

            {/* Cart Items List */}
            <FlatList
                data={cartItems}
                keyExtractor={(item) => item.id}
                renderItem={({ item }) => (
                    <View style={styles.cartItem}>
                        <Text style={styles.itemText}>{item.name} - {item.price}</Text>
                        <TouchableOpacity>
                            <Ionicons name="add-outline" size={24} color="green" />
                        </TouchableOpacity>
                        <TouchableOpacity>
                            <Ionicons name="trash-outline" size={24} color="red" />
                        </TouchableOpacity>
                    </View>
                )}
            />

            {/* Checkout Button */}
            <TouchableOpacity style={styles.checkoutButton} onPress={() => alert("Proceeding to Checkout")}>
                <Text style={styles.checkoutText}>Checkout</Text>
            </TouchableOpacity>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 30,
        backgroundColor: "#f9f9f9",
    },
    header: {
        fontSize: 24,
        padding: 20,
        fontWeight: "bold",
        marginBottom: 20,
    },
    info: {
        fontSize: 16,
        color: "gray",
        marginBottom: 10,
    },
    cartItem: {
        flexDirection: "row",
        justifyContent: "space-between",
        padding: 30,
        backgroundColor: "#fff",
        borderRadius: 5,
        marginBottom: 10,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.2,
        shadowRadius: 1.41,
        elevation: 2,
    },
    itemText: {
        fontSize: 18,
    },
    checkoutButton: {
        backgroundColor: "#ff6600",
        paddingVertical: 15,
        borderRadius: 5,
        alignItems: "center",
        marginTop: 20,
    },
    checkoutText: {
        color: "#fff",
        fontSize: 18,
        fontWeight: "bold",
    },
});

export default CartScreen;