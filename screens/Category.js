import React, { useEffect, useState } from "react";
import { View, Text, FlatList, Image, TouchableOpacity, StyleSheet, ActivityIndicator } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { supabase } from "../supabase";

const CategoryScreen = () => {
    const navigation = useNavigation();
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchCategories();
    }, []);

    const fetchCategories = async () => {
        try {
            const { data, error } = await supabase.from("categories").select("id, name, image");
            if (error) throw error;

            setCategories(data);
        } catch (error) {
            // console.error("Error fetching categories:", error.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <View style={styles.container}>
            <Text style={styles.header}>Categories</Text>

            {loading ? (
                // <ActivityIndicator size="large" color="#000" />
                <View style={styles.loaderContainer}>
                    <Text style={styles.loadingText}> Loading categories...</Text>
                </View>
            ) : (
                <FlatList
                    data={categories}
                    numColumns={2}
                    keyExtractor={(item) => item.id.toString()}
                    renderItem={({ item }) => (
                        <TouchableOpacity
                            style={styles.categoryCard}
                            onPress={() => navigation.navigate("ProductScreen", { categoryId: item.id, categoryName: item.name })}
                        >
                            <Image source={{ uri: item.image }} style={styles.categoryImage} />
                            <Text style={styles.categoryName}>{item.name}</Text>
                        </TouchableOpacity>
                    )}
                />
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        padding: 20,
        backgroundColor: "#fff",
        flex: 1,
    },
    header: {
        fontSize: 28,
        fontWeight: "bold",
        marginBottom: 10,
        textAlign: "center",
        color: "#333",
        padding: 10
    },
    categoryCard: {
        flex: 1,
        margin: 10,
        backgroundColor: "#f9f9f9",
        padding: 10,
        borderRadius: 10,
        alignItems: "center",
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
        elevation: 3,
    },
    categoryImage: {
        width: "100%",
        height: 80,
        borderRadius: 10,
        resizeMode: "cover",
    },
    categoryName: {
        fontSize: 16,
        fontWeight: "bold",
        marginTop: 5,
        textAlign: "center",
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

export default CategoryScreen;
