import { StatusBar } from "expo-status-bar";
import React, { useEffect, useState } from "react";
import { View, Text, TextInput, FlatList, Image, TouchableOpacity, StyleSheet } from "react-native";
import { supabase } from "../supabase";
import { useNavigation } from "@react-navigation/native";

const HomeScreen = () => {
    const navigation = useNavigation();
    const [products, setProducts] = useState([])
    const [loading, setLoading] = useState(true);


    const fetchProducts = async () => {
        setLoading(true);
        const { data, error } = await supabase.from('products').select('*');
        if (error) {
            console.log('Error fetching the products:', error)
        } else {
            setProducts(data);
            // console.log('fetched data', data);
        }
        setLoading(false);
    };
    useEffect(() => {
        fetchProducts();
    }, []);
    return (
        <>
            <StatusBar style="dark" />1
            <View style={styles.container}>
                {/* Header */}
                <Text style={styles.header}>Maseno.Mall</Text>

                {/* Search Bar */}
                <TextInput placeholder="Search for products..." style={styles.searchBar} />

                {/* Categories */}
                <FlatList
                    horizontal
                    // data={categories}
                    keyExtractor={(item) => item}
                    renderItem={({ item }) => (
                        <TouchableOpacity style={styles.categoryButton}>
                            <Text style={styles.categoryText}>{item}</Text>
                        </TouchableOpacity>
                    )}
                    showsHorizontalScrollIndicator={false}
                />

                {/* Featured Products */}
                <Text style={styles.sectionTitle}>Featured Products</Text>
                {loading ? (
                    <Text>Loading products...</Text>
                ) : (
                    <FlatList
                        showsVerticalScrollIndicator={false}
                        data={products}
                        keyExtractor={(item) => item.id.toString()}
                        numColumns={2}
                        renderItem={({ item }) => (
                            <TouchableOpacity style={styles.touchable} onPress={() => navigation.navigate("ProductDetails", { productId: item.id })}
                            >
                                <View style={styles.productCard}>
                                    <Image source={{ uri: item.image_url }} style={styles.productImage} />
                                    <Text style={styles.productName}>{item.name}</Text>
                                    <Text style={styles.productPrice}>${item.price}</Text>
                                </View>
                            </TouchableOpacity>
                        )}
                    />
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
    categoryButton: {
        marginRight: 10,
        height: 50,
        padding: 10,
        backgroundColor: "#ddd",
        borderBottomRightRadius: 30,
        borderBottomLeftRadius: 30,
        borderRadius: 10,
    },
    categoryText: {
        fontSize: 14,
        fontWeight: "bold",
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

});

export default HomeScreen;
