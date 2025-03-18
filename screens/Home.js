import { StatusBar } from "expo-status-bar";
import React, { useEffect, useState } from "react";
import {
    View, Text, TextInput, FlatList, Image, TouchableOpacity, StyleSheet, ActivityIndicator, Animated
} from "react-native";
import { supabase } from "../supabase";
import { useNavigation } from "@react-navigation/native";

const HomeScreen = () => {
    const navigation = useNavigation();
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const fadeAnim = new Animated.Value(0); // Animation for fade-in

    useEffect(() => {
        const fetchProducts = async () => {
            setLoading(true);
            const { data, error } = await supabase.from("products").select("*");
            if (error) {
                console.error("Error fetching products:", error);
            } else {
                setProducts(data);
            }
            setLoading(false);
        };

        fetchProducts();
    }, []);

    useEffect(() => {
        if (!loading) {
            Animated.timing(fadeAnim, {
                toValue: 1,
                duration: 500, // Smooth fade-in effect
                useNativeDriver: false, // Ensure it works properly
            }).start();
        }
    }, [loading]); // Trigger only when loading is false

    return (
        <>
            <StatusBar style="dark" />
            <View style={styles.container}>
                {/* Header */}
                <Text style={styles.header}>Maseno.Mall</Text>

                {/* Search Bar */}
                <TextInput placeholder="Search for products..." style={styles.searchBar} />

                {/* Featured Products */}
                <Text style={styles.sectionTitle}>Featured Products</Text>

                {/* Show loading animation */}
                {loading ? (
                    <View style={styles.loaderContainer}>
                        <ActivityIndicator size="large" color="#3498db" />
                        <Text style={styles.loadingText}>Loading...</Text>
                    </View>
                ) : (
                    <Animated.View style={{ opacity: fadeAnim }}>
                        <FlatList
                            showsVerticalScrollIndicator={false}
                            data={products}
                            keyExtractor={(item) => item.id.toString()}
                            numColumns={2}
                            renderItem={({ item }) => (
                                <TouchableOpacity
                                    style={styles.touchable}
                                    onPress={() => navigation.navigate("ProductDetails", { productId: item.id })}
                                >
                                    <View style={styles.productCard}>
                                        <Image source={{ uri: item.image_url }} style={styles.productImage} />
                                        <Text style={styles.productName}>{item.name}</Text>
                                        <Text style={styles.productPrice}>Ksh. {item.price}</Text>
                                    </View>
                                </TouchableOpacity>
                            )}
                        />
                    </Animated.View>
                )}
            </View>
        </>
    );
};

const styles = StyleSheet.create({
    container: {
        padding: 20,
        marginTop: 15,
        backgroundColor: "#fff",
        flex: 1,
    },
    header: {
        fontSize: 28,
        fontWeight: "bold",
        marginBottom: 10,
        textAlign: "center",
        color: "#333",
    },
    searchBar: {
        padding: 10,
        backgroundColor: "#f0f0f0",
        borderRadius: 10,
        marginBottom: 20,
    },
    sectionTitle: {
        marginTop: 20,
        fontSize: 22,
        fontWeight: "bold",
        marginVertical: 15,
        color: "#555",
    },
    productCard: {
        flex: 1,
        backgroundColor: "#ffffff",
        padding: 1,
        borderRadius: 15,
        alignItems: "center",
        justifyContent: "center",
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 5,
        elevation: 3,
        margin: 5,
        minWidth: 160,
    },
    productImage: {
        width: "100%",
        height: 140,
        borderRadius: 10,
        resizeMode: "cover",
    },
    productName: {
        fontSize: 14,
        fontWeight: "bold",
        textAlign: "center",
        color: "#333",
        marginTop: 8,
    },
    productPrice: {
        fontSize: 13,
        fontWeight: "600",
        color: "#777",
        marginTop: 4,
    },
    touchable: {
        flex: 1,
        borderRadius: 15,
        overflow: "hidden",
    },
    loaderContainer: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
    },
    loadingText: {
        marginTop: 10,
        fontSize: 16,
        color: "#777",
    },
});

export default HomeScreen;
