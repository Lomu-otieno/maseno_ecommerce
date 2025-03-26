import React, { useEffect, useState } from "react";
import { View, Text, FlatList, TouchableOpacity, StyleSheet, ActivityIndicator } from "react-native";
import { supabase } from "../supabase";
import { useNavigation } from "@react-navigation/native";

const OrdersScreen = () => {
    const navigation = useNavigation();
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [userEmail, setUserEmail] = useState(null);

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
            fetchOrders();
        }
    }, [userEmail]);

    const fetchOrders = async () => {
        setLoading(true);
        const { data, error } = await supabase
            .from("orders")
            .select("id, total_price, status, created_at, order_items (product_id, quantity, products (name, price))")
            .eq("email", userEmail)
            .order("created_at", { ascending: false });

        if (error) console.error(error);
        else setOrders(data);
        setLoading(false);
    };

    return (
        <View style={styles.container}>
            <Text style={styles.header}>My Orders</Text>
            {loading ? (
                <ActivityIndicator size="large" color="#ff6600" />
            ) : orders.length === 0 ? (
                <Text style={styles.emptyText}>No orders yet.</Text>
            ) : (
                <FlatList
                    data={orders}
                    keyExtractor={(item) => item.id.toString()}
                    renderItem={({ item }) => (
                        <View style={styles.orderItem}>
                            <Text style={styles.orderId}>Order ID: {item.id}</Text>
                            <Text style={styles.status}>Status: <Text style={styles.statusValue}>{item.status}</Text></Text>
                            <Text style={styles.total}>Total: <Text style={styles.price}>Kshs. {item.total_price.toFixed(2)}</Text></Text>
                            <Text style={styles.date}>Date: {new Date(item.created_at).toLocaleString()}</Text>
                        </View>
                    )}
                />
            )}
            <TouchableOpacity style={styles.checkoutButton} onPress={() => navigation.navigate("Home")}
            >
                <Text style={styles.checkoutText}>Continue Shopping</Text>
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
        fontSize: 26,
        fontWeight: "bold",
        marginBottom: 20,
        marginTop: 40,
        borderBottomWidth: 2,
        color: "#333",
    },
    emptyText: {
        textAlign: "center",
        marginTop: 20,
        fontSize: 18,
        color: "gray",
    },
    orderItem: {
        backgroundColor: "#fff",
        padding: 15,
        marginVertical: 10,
        borderRadius: 8,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
        borderLeftWidth: 5,
        borderLeftColor: "#ff6600",
    },
    orderId: {
        fontWeight: "bold",
        fontSize: 16,
        color: "#333",
    },
    status: {
        fontSize: 16,
        marginTop: 5,
    },
    statusValue: {
        fontWeight: "bold",
        color: "#ff6600",
    },
    total: {
        fontSize: 16,
        marginTop: 5,
    },
    price: {
        fontWeight: "bold",
        color: "#ff6600",
    },
    date: {
        fontSize: 14,
        color: "gray",
        marginTop: 5,
    },
    checkoutButton: {
        backgroundColor: "#ff6600",
        padding: 15,
        borderRadius: 5,
        alignItems: "center",
        marginTop: 20,
    },
    checkoutText: { color: "#fff", fontSize: 18, fontWeight: "bold" },
});

export default OrdersScreen;
