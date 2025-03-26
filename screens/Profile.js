import { View, Text, TextInput, Button, TouchableOpacity, TouchableWithoutFeedback, StyleSheet, ImageBackground, Image, Alert, Modal } from 'react-native';
import React, { useState, useEffect } from 'react';
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from '@react-navigation/native';
import * as ImagePicker from 'expo-image-picker';
import * as FileSystem from 'expo-file-system';
import { supabase } from '../supabase';

export default function Profile() {
    const avatar = { uri: ('https://i.pinimg.com/236x/41/76/b9/4176b9b864c1947320764e82477c168f.jpg') }
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [location, setLocation] = useState('');
    const [contact, setContact] = useState('');
    const [profilePicture, setProfilePicture] = useState('');
    const [errorMessage, setErrorMessage] = useState('');
    const [modalVisible, setModalVisible] = useState(false);
    const [newPassword, setNewPassword] = useState('');
    const [loading, setLoading] = useState(false);




    const navigation = useNavigation();

    const convertToBlob = async (uri) => {
        const response = await fetch(uri); // Fetch the local file
        const blob = await response.blob(); // Convert to Blob
        return blob;
    };

    const uploadImage = async (imgUri, userEmail) => {
        try {
            const fileExt = imgUri.split('.').pop();
            const filePath = `${userEmail}/${Date.now()}.${fileExt}`;

            const formData = new FormData();
            formData.append('file', { uri: imgUri, name: `upload.${fileExt}`, type: `image/${fileExt}` });

            const { data, error } = await supabase.storage
                .from('profilepictures')
                .upload(filePath, formData, {
                    contentType: `image/${fileExt}`,
                    cacheControl: '3600',
                    upsert: true,
                });

            if (error) throw error;

            // Get the full public URL
            const { data: imageUrlData } = supabase.storage
                .from('profilepictures')
                .getPublicUrl(filePath);

            const imageUrl = imageUrlData.publicUrl;

            // Store the file path in the users_details table
            const { error: updateError } = await supabase
                .from('users_details')
                .update({ profile_picture: imageUrl })
                .eq('email', userEmail);

            if (updateError) throw updateError;

            setProfilePicture(imageUrl);
            setErrorMessage('Image uploaded successfully!');
        } catch (error) {
            setErrorMessage('Error in uploadImage: ' + error.message);
        }
    };
    const onSelectImage = async () => {
        const { data: sessionData, error: sessionError } = await supabase.auth.getSession();

        if (sessionError || !sessionData?.session?.user) {
            return;
        }

        const user = sessionData.session.user;

        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            quality: 1,
        });

        if (!result.canceled) {
            const imgUri = result.assets[0].uri;

            // Upload the image
            const imageUrl = await uploadImage(imgUri, user.email);
            const response = await fetch(imgUri);

            if (imageUrl) {
                setProfilePicture(imageUrl);
            }
        }
    };

    const changePassword = async () => {
        if (!newPassword) {
            Alert.alert("Failed", "Please enter a new password");
            return;
        }
        const { error } = await supabase.auth.updateUser({
            password: newPassword,
        });

        if (error) {
            Alert.alert("Failed", error.message);
        } else {
            Alert.alert("Success", "Password changed successfully!");
            setModalVisible(false);
            setNewPassword('');
        }
    };

    useEffect(() => {
        const fetchUserProfile = async () => {
            setLoading(true);

            const { data: { user }, error: authError } = await supabase.auth.getUser();
            if (authError || !user) {
                Alert.alert("Error", "User not authenticated");
                setLoading(false);
                return;
            }

            setUsername(user.user_metadata?.username || "No Username");
            setEmail(user.email || "No Email");

            // Fetch user details excluding profile picture
            const { data, error } = await supabase
                .from('users_details')
                .select('location, contact, profile_picture')
                .eq('email', user.email)
                .single();

            if (error) throw error;

            setLocation(data?.location || "Not specified");
            setContact(data?.contact || "No contact info");

            // Fetch the latest profile picture from storage
            const { data: files, error: storageError } = await supabase
                .storage
                .from('profilepictures')
                .list(user.email + "/", { limit: 1, sortBy: { column: "created_at", order: "desc" } });

            if (!storageError && files && files.length > 0) {
                const latestImagePath = user.email + "/" + files[0].name;
                const { data: imageUrl } = supabase.storage.from('profilepictures').getPublicUrl(latestImagePath);
                setProfilePicture(imageUrl.publicUrl);
                setLoading(false);
            }
        };

        fetchUserProfile();
    }, []);


    const handleLogout = async () => {

        const { error } = await supabase.auth.signOut();
        if (error) throw error;
        navigation.replace("Login");
    };


    return (
        <ImageBackground source={{ uri: 'https://i.pinimg.com/474x/72/2b/1a/722b1a5309a144eeaf83c414693450f6.jpg' }}
            resizeMode="cover" style={styles.backgroundImage}>
            <View style={styles.overlay} />
            {loading ? (
                <View style={styles.loaderContainer}>
                    <Text style={styles.loadingText}>Loading...</Text>
                </View>
            ) : (

                <View style={styles.container}>

                    {/* Profile Section */}
                    <View style={styles.profileContainer}>
                        <View style={styles.profileWrapper}>
                            <Image source={profilePicture ? { uri: profilePicture } : avatar} style={styles.profileImage} />
                            <TouchableOpacity style={styles.cameraButton} onPress={onSelectImage}>
                                <Ionicons name="camera-outline" size={30} color={"#fff"} />
                            </TouchableOpacity>
                        </View>
                        <Text style={styles.username}>{username}</Text>
                    </View>

                    {/* User Info Section */}
                    <View style={styles.bioContainer}>
                        <View style={{ justifyContent: 'center', alignItems: "center" }}>
                            <Text style={styles.bioTitle}>About</Text>
                        </View>
                        <Text style={styles.bioText}><Text style={styles.label}>Email:</Text> {email}</Text>
                        <Text style={styles.bioText}><Text style={styles.label}>Location:</Text> {location}</Text>
                        <Text style={styles.bioText}><Text style={styles.label}>Contact:</Text> {contact}</Text>

                    </View>

                    <View style={styles.updateView}>
                        <Modal transparent={true} visible={modalVisible}>
                            <TouchableWithoutFeedback onPress={() => setModalVisible(false)}>
                                <View style={styles.modalOverlay}>
                                    <View style={styles.modalContainer}>
                                        <Text style={styles.modalTitle}>Enter New Password</Text>
                                        <TextInput
                                            secureTextEntry
                                            placeholder="New password"
                                            value={newPassword}
                                            onChangeText={setNewPassword}
                                            style={styles.input}
                                        />
                                        <TouchableOpacity style={styles.modalButton} onPress={changePassword}>
                                            <Text style={styles.modalButtonText}>Submit</Text>
                                        </TouchableOpacity>
                                        <TouchableOpacity style={styles.cancelButton} onPress={() => setModalVisible(false)}>
                                            <Text style={styles.cancelButtonText}>Cancel</Text>
                                        </TouchableOpacity>
                                    </View>
                                </View>
                            </TouchableWithoutFeedback>
                        </Modal>
                        <TouchableOpacity onPress={() => { navigation.navigate('UpdateProfile') }}>
                            <Text style={styles.update}>Update Info</Text>
                        </TouchableOpacity>
                    </View>
                    <TouchableOpacity style={styles.checkoutButton} onPress={() => navigation.navigate("OrderScreen")}
                    >
                        <Text style={styles.checkoutText}>View Orders</Text>
                    </TouchableOpacity>

                    {/* Buttons Section */}

                    {/* Error Message */}
                    {errorMessage ? <Text style={styles.errorText}>{errorMessage}</Text> : null}
                    <View>
                        <View style={styles.buttonWrapper}>
                            <TouchableOpacity style={styles.button} onPress={() => setModalVisible(true)}>
                                <Text style={styles.buttonText}>Change Password</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={styles.button} onPress={handleLogout}>
                                <Text style={styles.buttonText}>Logout</Text>
                            </TouchableOpacity>
                        </View>

                    </View>
                </View>
            )}
        </ImageBackground>
    );
};

const styles = StyleSheet.create({
    backgroundImage: {
        flex: 1,
        justifyContent: "center",
    },
    overlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: "rgba(0, 0, 0, 0.5)",
    },
    container: {
        flex: 1,
        padding: 20,
        justifyContent: "center",
        alignItems: "center",
    },
    profileContainer: {
        alignItems: "center",
        marginBottom: 20,
    },
    profileWrapper: {
        position: "relative",
    },
    profileImage: {
        width: 120,
        height: 120,
        borderRadius: 60,
        borderWidth: 3,
        borderColor: "#fff",
    },
    cameraButton: {
        position: "absolute",
        bottom: 0,
        right: 0,
        backgroundColor: "#007bff",
        padding: 8,
        borderRadius: 20,
    },
    username: {
        fontSize: 22,
        fontWeight: "bold",
        color: "#fff",
        marginTop: 10,
    },
    bioContainer: {
        backgroundColor: "#fff",
        padding: 15,
        borderRadius: 10,
        width: "100%",
        shadowColor: "#000",
        shadowOpacity: 0.2,
        shadowRadius: 5,
        elevation: 5,
    },
    bioTitle: {
        fontSize: 18,
        fontWeight: "bold",
        color: "#333",
        marginBottom: 10,
    },
    bioText: {
        fontSize: 16,
        color: "#666",
        marginBottom: 5,
    },
    label: {
        fontWeight: "bold",
        color: "#222",
    },
    updateView: {
        marginVertical: 10,
    },
    update: {
        fontSize: 20,
        fontWeight: "bold",
        backgroundColor: "#007bff",
        color: "#fff",
        textAlign: "center",
        padding: 5,
        borderRadius: 2,
    },
    buttonWrapper: {
        flexDirection: "row",
        justifyContent: "space-between",
        width: "100%",
        marginTop: 20,
    },
    button: {
        backgroundColor: "#007bff",
        paddingVertical: 12,
        paddingHorizontal: 20,
        borderRadius: 8,
        alignItems: "center",
        flex: 1,
        marginHorizontal: 5,
    },
    buttonText: {
        color: "#fff",
        fontSize: 16,
        fontWeight: "bold",
    },
    modalOverlay: {
        flex: 0.99,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "rgba(0, 0, 0, 0.5)",
        marginTop: 10,
    },
    modalContainer: {
        width: '80%',
        backgroundColor: '#fff',
        padding: 20,
        borderRadius: 15,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.25,
        shadowRadius: 10,
        elevation: 10,
    },
    modalTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        marginBottom: 15,
        color: '#333',
    },
    input: {
        width: "100%",
        borderBottomWidth: 1,
        borderBottomColor: "#ccc",
        padding: 8,
        marginBottom: 20,
        textAlign: "center",
    },
    modalButton: {
        width: '100%',
        backgroundColor: '#007AFF',
        paddingVertical: 12,
        borderRadius: 10,
        alignItems: 'center',
        marginBottom: 10,
    },
    modalButtonText: {
        color: '#fff',
        fontSize: 18,
        fontWeight: 'bold',
    },
    cancelButton: {
        marginTop: 10,
    },
    cancelButtonText: {
        color: "#007bff",
        fontWeight: "bold",
    },
    loaderContainer: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
    },
    loadingText: {
        marginTop: 10,
        fontSize: 16,
        color: "#fff",
    },
    checkoutButton: {
        backgroundColor: "#007bff",
        padding: 15,
        borderRadius: 5,
        alignItems: "center",
        width: "100%"
    },
    checkoutText: { color: "#fff", fontSize: 18, fontWeight: "bold" },
});
