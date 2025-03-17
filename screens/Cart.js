import React, { useEffect, useState } from "react";
import { View, Text, FlatList, TouchableOpacity, StyleSheet } from "react-native";
import { supabase } from "../supabase";
import { Ionicons } from "@expo/vector-icons";

const CartScreen = () => {
    const [cartItems, setCartItems] = useState([]);
    const [userEmail, setUserEmail] = useState(null);
    const [totalCost, setTotalCost] = useState(0); // Store total cost

    useEffect(() => {
        const getUserEmail = async () => {
            const { data: { session }, error } = await supabase.auth.getSession();
            if (error) {
                // console.error("Error fetching session:", error.message);
                return;
            }
            if (session?.user) {
                setUserEmail(session.user.email);
            }
        };

        getUserEmail();
    }, []);

    useEffect(() => {
        if (userEmail) {
            fetchCartItems();
        }
    }, [userEmail]);

    const fetchCartItems = async () => {
        try {
            if (!userEmail) return;

            console.log("Fetching cart items for:", userEmail);

            const { data, error } = await supabase
                .from("cart")
                .select(`
                    id, 
                    productId, 
                    quantity, 
                    products (name, price)
                `)
                .eq("email", userEmail);

            if (error) throw error;

            console.log("Cart Items Fetched:", data);

            setCartItems(data);

            // **Calculate Total Cost**
            const total = data.reduce((sum, item) => sum + item.quantity * item.products.price, 0);
            setTotalCost(total); // Update state
        } catch (error) {
            // console.error("Error fetching cart items:", error.message);
        }
    };
    // 🚀 Function to remove item from cart
    const removeFromCart = async (id) => {
        try {
            // console.log("Removing item with ID:", id);

            const { error } = await supabase.from("cart").delete().eq("id", id);

            if (error) throw error;

            // Update state after deletion
            setCartItems(cartItems.filter(item => item.id !== id));
            // console.log("Item removed successfully!");
        } catch (error) {
            // console.error("Error removing item:", error.message);
        }
    };

    // 🚀 Function to increase quantity
    const increaseQuantity = async (id, currentQuantity) => {
        try {
            // console.log("Increasing quantity for item ID:", id);

            const { error } = await supabase
                .from("cart")
                .update({ quantity: currentQuantity + 1 })
                .eq("id", id);

            if (error) throw error;

            // console.log("Quantity increased successfully!");

            // Refresh cart items
            fetchCartItems();
        } catch (error) {
            // console.error("Error increasing quantity:", error.message);
        }
    };
    const decreaseQuantity = async (id, currentQuantity) => {
        if (currentQuantity > 1) {
            await supabase.from("cart").update({ quantity: currentQuantity - 1 }).eq("id", id);
            fetchCartItems(); // Refresh UI
        } else {
            removeFromCart(id); // If quantity is 1, remove item instead
        }
    };

    return (
        <View style={styles.container}>
            <Text style={styles.header}>Shopping Cart</Text>

            {cartItems.length === 0 ? (
                <Text style={{ textAlign: "center", marginTop: 20, fontSize: 18 }}>
                    Your cart is empty.
                </Text>
            ) : (
                <FlatList
                    data={cartItems}
                    keyExtractor={(item) => item.id.toString()}
                    renderItem={({ item }) => (
                        <View style={styles.cartItem}>
                            <Text style={styles.itemText}>x{item.quantity}</Text>
                            <Text style={styles.itemText}>{item.products?.name}</Text>
                            <Text style={styles.itemText}>${item.products?.price}</Text>

                            <TouchableOpacity onPress={() => decreaseQuantity(item.id, item.quantity)}>
                                <Ionicons name="remove-outline" size={24} color="orange" />
                            </TouchableOpacity>

                            {/* Increase quantity button */}
                            <TouchableOpacity onPress={() => increaseQuantity(item.id, item.quantity)}>
                                <Ionicons name="add-outline" size={24} color="green" />
                            </TouchableOpacity>

                            {/* Remove item button */}
                            <TouchableOpacity onPress={() => removeFromCart(item.id)}>
                                <Ionicons name="trash-outline" size={24} color="red" />
                            </TouchableOpacity>

                        </View>
                    )}
                />
            )}
            <View style={styles.totalContainer}>
                <Text style={styles.totalText}>Total:</Text>
                <Text style={styles.totalText}> ${totalCost.toFixed(2)}</Text>
            </View>

            <TouchableOpacity style={styles.checkoutButton} onPress={() => alert("Proceeding to Checkout")}>
                <Text style={styles.checkoutText}>Checkout</Text>
            </TouchableOpacity>
        </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, padding: 20, backgroundColor: "#f9f9f9" },
    header: { fontSize: 24, fontWeight: "bold", marginBottom: 20, padding: 30 },
    cartItem: {
        flexDirection: "row",
        justifyContent: "space-between",
        padding: 15,
        backgroundColor: "#fff",
        borderRadius: 5,
        marginBottom: 10,
        elevation: 2,
    },
    itemText: { fontSize: 18 },
    checkoutButton: {
        backgroundColor: "#ff6600",
        padding: 15,
        borderRadius: 5,
        alignItems: "center",
        marginTop: 20,
    },
    checkoutText: {
        color: "#fff",
        fontSize: 18,
        fontWeight: "bold"
    },
    totalContainer: {
        marginTop: 10,
        padding: 15,
        backgroundColor: "#fff",
        borderRadius: 5,
        alignItems: "center",
        elevation: 10,
        flexDirection: "row",
        justifyContent: "space-between",
    },
    totalText: {
        fontSize: 20,
        fontWeight: "bold",
        color: "#333",
    },
});

export default CartScreen;
