
import React from "react";
import { View, Text, StyleSheet, FlatList, Image, ScrollView, TouchableOpacity, PixelRatio } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { StatusBar } from "expo-status-bar";
import { Dimensions } from "react-native";
import { supabase } from "../supabase";
import { useState, useEffect } from "react";

const { width } = Dimensions.get("window");
const stories = [
    { id: "1", image: "https://i.pinimg.com/236x/ed/20/5a/ed205aff1fb33c28ddd8bfc7f3e7ff29.jpg", username: "You" },
    { id: "2", image: "https://picsum.photos/101", username: "Emily" },
    { id: "3", image: "https://picsum.photos/102", username: "Emma" },
    { id: "4", image: "https://picsum.photos/103", username: "Olivia" },
    { id: "5", image: "https://picsum.photos/104", username: "Michael" },
];

// const posts = [
//     { id: "1", image: "https://i.pinimg.com/474x/fb/d0/a7/fbd0a78875801bd026a85bdf80cd6f85.jpg", username: "Amelia John", likes: "12.5K", comments: "6.8K" },
//     { id: "2", image: "https://i.pinimg.com/474x/1e/e1/fc/1ee1fc4d681f56f9a2ab96fc9df42148.jpg", username: "Shekel Afeni", likes: "8.2K", comments: "5.1K" },
//     { id: "3", image: "https://i.pinimg.com/474x/73/4a/25/734a251b61723478b09a4bb241822cad.jpg", username: "Jane Snow", likes: "2.2K", comments: "1.5K" },
// ];

const HomeScreen = () => {
    const [posts, setPosts] = useState([]);

    useEffect(() => {
        fetchImages();
    }, []);

    const fetchImages = async () => {
        try {
            // Fetch user details (with profile picture URLs)
            const { data: users, error: userError } = await supabase
                .from("users_details")
                .select("username, profile_picture");

            if (userError) {
                //console.error("Error fetching user details:", userError);
                return;
            }

            //console.log("Users:", JSON.stringify(users, null, 2));

            let allImages = [];

            // Loop through each user and fetch their stored images
            for (const user of users) {
                if (!user.profile_picture) continue; // Skip if no profile picture

                // Extract the folder name from the URL
                const folderName = user.profile_picture.split("/").slice(-2, -1)[0];

                // Fetch images from that specific folder
                const { data: images, error: imageError } = await supabase
                    .storage
                    .from("profile_pictures")
                    .list(folderName);

                if (imageError) {
                    // console.error(`Error fetching images for ${folderName}:`, imageError);
                    continue;
                }

                //console.log(`Images in ${folderName}:`, images);

                // Append folder name to images to get full paths
                const imagesWithPath = images.map((img) => ({
                    name: `${folderName}/${img.name}`, // Ensure full path
                }));

                allImages = [...allImages, ...imagesWithPath];
            }

            //console.log("Final Images List:", JSON.stringify(allImages, null, 2));

            // Fix: Use allImages instead of undefined images variable
            const imagePosts = allImages.map((file) => {
                const imageUrl = supabase.storage.from("profile_pictures").getPublicUrl(file.name).data.publicUrl;
                //console.log(`Generated Image URL for ${file.name}:`, imageUrl);

                // Extract the user's email from the file path (folder name)
                const userFolder = file.name.split("/")[0]; // e.g., "lomuotieno@gmail.com"

                // Find the user whose folder (email) matches, ensuring profile_picture is not null
                const matchingUser = users.find((u) => u.profile_picture && u.profile_picture.includes(userFolder));

                //console.log(`Matched User for Image ${file.name}:`, matchingUser ? matchingUser.username : "Unknown User");

                return {
                    id: file.name,
                    image: imageUrl,
                    username: matchingUser ? matchingUser.username : "Unknown User",
                    likes: `${Math.floor(Math.random() * 500)} Likes`,
                    comments: `${Math.floor(Math.random() * 500)} Comments`,
                };
            });




            setPosts(imagePosts);
        } catch (error) {
            // console.error("Error fetching data");
        }
    };
    return (
        <>
            <StatusBar style="auto" />
            <View style={styles.container}>
                {/* Header Section */}
                <View style={styles.header}>
                    <TouchableOpacity>
                        <Ionicons name="menu" size={28} color="black" />
                    </TouchableOpacity>
                    <Text style={styles.title}>MasenOline</Text>
                    <TouchableOpacity>
                        <Ionicons name="notifications-outline" size={28} color="black" />
                    </TouchableOpacity>
                </View>
                {/* Feed Section */}
                <FlatList
                    data={posts}
                    keyExtractor={(item) => item.id}
                    initialNumToRender={5}
                    windowSize={3}
                    showsVerticalScrollIndicator={false}
                    renderItem={({ item }) => (
                        <View style={styles.post}>
                            <Text style={styles.postUsername}>{item.username}</Text>
                            <Image source={{ uri: item.image }} style={styles.postImage} resizeMode="cover" />
                            <View style={styles.postActions}>
                                <View style={styles.dollarV}>
                                    <Text style={styles.dollar}>kshs. 2200</Text>
                                </View>
                                <TouchableOpacity style={styles.actionButton}>
                                    <Ionicons name="heart-outline" size={24} color="black" />
                                    <Text>{item.likes}</Text>
                                </TouchableOpacity>
                                <TouchableOpacity style={styles.actionButton}>
                                    <Ionicons name="chatbubbles-outline" size={24} color="black" />
                                    <Text>{item.comments}</Text>
                                </TouchableOpacity>
                                {/* <TouchableOpacity>
                                    <Ionicons name="ellipsis-horizontal-outline" size={24} color="black" />
                                </TouchableOpacity> */}
                            </View>
                        </View>
                    )}
                />
            </View>
        </>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: "#fff", },

    // Header
    header: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", padding: 15, marginTop: 18 },
    title: { fontSize: 18, fontWeight: "bold", alignSelf: "center" },

    // Stories
    storyContainer: { padding: 10 },
    story: { alignItems: "center", marginRight: 15 },
    storyImage: { width: 60, height: 60, borderRadius: 30, borderWidth: 2, borderColor: "red" },
    storyUsername: { fontSize: 12, marginTop: 5, marginBottom: 15 },

    // Posts
    post: { padding: 15 },
    postUsername: { fontWeight: "bold", fontSize: 16, marginBottom: 5 },
    postImage: { width: "100%", height: width * 1.4, borderRadius: 10 },
    postActions: { flexDirection: "row", alignItems: "center", marginTop: 10, justifyContent: 'space-around' },
    actionButton: { flexDirection: "row", alignItems: "center", gap: 5 },
    dollarV: { width: "25%", padding: 5, borderRadius: 10, backgroundColor: "#000", alignItems: "center" },
    dollar: { color: "#fff" }
});

export default HomeScreen;
