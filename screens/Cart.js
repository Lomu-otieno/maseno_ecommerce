import React, { useEffect, useState } from "react";
import {
    View, Text, FlatList, TouchableOpacity, StyleSheet, ActivityIndicator
} from "react-native";
import { supabase } from "../supabase";
import { Ionicons } from "@expo/vector-icons";

const CartScreen = () => {
    const [cartItems, setCartItems] = useState([]);
    const [userEmail, setUserEmail] = useState(null);
    const [totalCost, setTotalCost] = useState(0);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const getUserEmail = async () => {
            const { data: { session }, error } = await supabase.auth.getSession();
            if (error) return;
            if (session?.user) {
                setUserEmail(session.user.email);
            }
        };

        getUserEmail();
    }, []);

    useEffect(() => {
        if (userEmail) {
            fetchCartItems();

            const channel = supabase
                .channel("cart-updates")
                .on("postgres_changes", { event: "*", schema: "public", table: "cart" }, (payload) => {
                    console.log("Real-time update received:", payload);
                    fetchCartItems();
                })
                .subscribe();

            return () => {
                supabase.removeChannel(channel);
            };
        }
    }, [userEmail]);


    const fetchCartItems = async () => {
        try {
            if (!userEmail) return;
            setLoading(true);

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

            setCartItems(data);
            const total = data.reduce((sum, item) => sum + item.quantity * item.products.price, 0);
            setTotalCost(total);
        } catch (error) {
            console.error("Error fetching cart items:", error.message);
        } finally {
            setLoading(false);
        }
    };

    const removeFromCart = async (id) => {
        try {
            const { data, error } = await supabase.from("cart").delete().eq("id", id).select();

            // Update UI by removing item from state
            setCartItems(prevItems => prevItems.filter(item => item.id !== id));
            fetchCartItems();
        } catch (error) {
            console.error("Unexpected error:", error);
        }
    };


    const increaseQuantity = async (id, currentQuantity) => {

        const { data: existingData, error: fetchError } = await supabase
            .from("cart")
            .select("*")
            .eq("id", id)
            .eq("email", userEmail);
        if (!existingData || existingData.length === 0) {
            console.error("Item not found in the database!");
            return;
        }
        const newQuantity = existingData[0].quantity + 1;

        const { data, error } = await supabase
            .from("cart")
            .update({ quantity: newQuantity })
            .eq("id", id)
            .eq("email", userEmail)
            .neq("quantity", newQuantity) // Force update only if quantity is different
            .select();
        fetchCartItems(); // Refresh UI with updated data
    };






    const decreaseQuantity = async (id, currentQuantity) => {

        if (currentQuantity <= 1) {
            console.log("Quantity is 1, removing item from cart instead.");
            await removeFromCart(id);
            return;
        }
        const { data, error } = await supabase
            .from("cart")
            .update({ quantity: currentQuantity - 1 })
            .eq("id", id)
            .eq("email", userEmail)
            .select();
        fetchCartItems(); // Refresh UI with updated data

    };


    return (
        <View style={styles.container}>
            <Text style={styles.header}>Shopping Cart</Text>

            {loading ? (
                <ActivityIndicator size="large" color="#ff6600" style={styles.loader} />
            ) : cartItems.length === 0 ? (
                <Text style={styles.emptyCartText}>Your cart is empty.</Text>
            ) : (
                <FlatList
                    data={cartItems}
                    keyExtractor={(item) => item.id.toString()}
                    renderItem={({ item }) => (
                        <View style={styles.cartItem}>
                            <View style={{ marginRight: 10 }}>
                                <Text style={styles.itemText}>x{item.quantity}</Text>
                            </View>
                            <Text style={styles.itemText}>{item.products?.name}</Text>
                            <Text style={styles.itemText}>Kshs. {item.products?.price}</Text>
                            <View style={styles.touch}>
                                <TouchableOpacity onPress={() => decreaseQuantity(item.id, item.quantity)}>
                                    <Ionicons name="remove-outline" size={24} color="orange" style={{ paddingRight: 25 }} />
                                </TouchableOpacity>

                                <TouchableOpacity onPress={() => increaseQuantity(item.id, item.quantity)}>
                                    <Ionicons name="add-outline" size={24} color="green" style={{ paddingRight: 35 }} />
                                </TouchableOpacity>

                                <TouchableOpacity onPress={() => removeFromCart(item.id)}>
                                    <Ionicons name="trash-outline" size={24} color="red" />
                                </TouchableOpacity>
                            </View>
                        </View>
                    )}
                />
            )}

            <View style={styles.totalContainer}>
                <Text style={styles.totalText}>Total:</Text>
                <Text style={styles.totalText}> Kshs. {totalCost.toFixed(2)}</Text>
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
    loader: { marginTop: 50 },
    emptyCartText: { textAlign: "center", marginTop: 20, fontSize: 18, color: "gray" },
    cartItem: {
        flexDirection: "row",
        justifyContent: "space-around",
        padding: 15,
        backgroundColor: "#fff",
        borderRadius: 5,
        marginBottom: 10,
        elevation: 5,
    },
    touch: {
        flexDirection: "row",
    },
    itemText: { fontSize: 16, flex: 1 },
    checkoutButton: {
        backgroundColor: "#ff6600",
        padding: 15,
        borderRadius: 5,
        alignItems: "center",
        marginTop: 20,
    },
    checkoutText: { color: "#fff", fontSize: 18, fontWeight: "bold" },
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
    totalText: { fontSize: 20, fontWeight: "bold", color: "#333" },
});

export default CartScreen;
