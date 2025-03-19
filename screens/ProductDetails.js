import React, { useEffect, useState } from "react";
import { View, Text, Image, StyleSheet, Button, ActivityIndicator } from "react-native";
import { useRoute, useNavigation } from "@react-navigation/native";
import BottomBar from "./components/BottomBar";
import { supabase } from "../supabase"; // Import your Supabase client

const ProductDetails = () => {
    const route = useRoute();
    const navigation = useNavigation();
    const { productId } = route.params || {}; // Handle missing params
    const [product, setProduct] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (!productId) {
            setError("Invalid product ID.");
            setLoading(false);
            return;
        }

        fetchProductDetails();
    }, [productId]);

    const fetchProductDetails = async () => {
        try {
            const { data, error } = await supabase
                .from("products")
                .select("id, name, price, description, image_url")
                .eq("id", productId)
                .single(); // Fetch a single product

            if (error) throw error;

            setProduct(data);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <View style={styles.container}>
                <ActivityIndicator size="large" color="blue" />
                <Text>Loading...</Text>
            </View>
        );
    }

    if (error || !product) {
        return (
            <View style={styles.container}>
                <Text style={styles.errorText}>{error || "Product not found"}</Text>
                <Button title="Go Back" onPress={() => navigation.goBack()} />
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <Image source={{ uri: product.image_url }} style={styles.image} />
            <Text style={styles.title}>{product.name}</Text>
            <Text style={styles.description}>{product.description}</Text>
            <Text style={styles.price}>Kshs. {product.price.toFixed(2)}</Text>
            <BottomBar productId={product.id} />
        </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, alignItems: "center", justifyContent: "center", padding: 20 },
    image: { width: 450, height: 450, resizeMode: "contain", marginBottom: 20 },
    title: { fontSize: 24, fontWeight: "bold", marginBottom: 10 },
    description: { fontSize: 18, color: "gray", textAlign: "center", marginBottom: 10 },
    price: { fontSize: 20, color: "#fff", fontWeight: "bold", marginBottom: 20, padding: 20, backgroundColor: "green", borderRadius: 10 },
    errorText: { fontSize: 20, color: "red", marginBottom: 10 },
});

export default ProductDetails;
