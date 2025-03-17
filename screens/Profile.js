import { View, Text, TextInput, Button, TouchableOpacity, TouchableWithoutFeedback, StyleSheet, ImageBackground, Image, Alert, Modal } from 'react-native';
import React, { useState, useEffect } from 'react';
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from '@react-navigation/native';
import * as ImagePicker from 'expo-image-picker';
import * as FileSystem from 'expo-file-system';
import { supabase, SUPABASE_URL, SUPABASE_ANON_KEY } from '../supabase';
import { decode } from 'base-64';
import { FileObject } from '@supabase/storage-js'


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
                .from('profile_pictures')
                .upload(filePath, formData, {
                    contentType: `image/${fileExt}`,
                    cacheControl: '3600',
                    upsert: true,
                });

            if (error) throw error;

            // Get the full public URL
            const { data: imageUrlData } = supabase.storage
                .from('profile_pictures')
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
            console.error('User not found:', sessionError?.message);
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
            console.log('📸 Selected Image URI:', imgUri);

            // Test network
            try {
                const testResponse = await fetch('https://www.google.com');
                console.log('✅ Network Test Successful:', testResponse.status);
            } catch (error) {
                console.error('❌ Network error:', error);
                return;
            }

            // Upload the image
            const imageUrl = await uploadImage(imgUri, user.email);
            const response = await fetch(imgUri);
            console.log('🔍 Fetch response:', response);

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
            setModalVisible(false); // Close modal after success
            setNewPassword(''); // Reset input
        }
    };

    useEffect(() => {
        const fetchUserProfile = async () => {
            const { data: { user }, error: authError } = await supabase.auth.getUser();
            if (authError || !user) {
                Alert.alert("Error", "User not authenticated");
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

            if (data) {
                setLocation(data.location || "Not specified");
                setContact(data.contact || "No contact info");
            } else if (error) {
                Alert.alert("Error", error.message);
            }

            // Fetch the latest profile picture from storage
            const { data: files, error: storageError } = await supabase
                .storage
                .from('profile_pictures')
                .list(user.email + "/", { limit: 1, sortBy: { column: "created_at", order: "desc" } });

            if (storageError || !files || files.length === 0) {
                //Alert.alert("Alert", "profile picture required");
            } else {
                const latestImagePath = user.email + "/" + files[0].name;
                const { data: imageUrl } = supabase.storage.from('profile_pictures').getPublicUrl(latestImagePath);
                setProfilePicture(imageUrl.publicUrl);
            }
        };

        fetchUserProfile();
    }, []);

    const handleLogout = async () => {
        try {
            const { error } = await supabase.auth.signOut();
            if (error) throw error;
            navigation.replace("Login"); // Redirect to login screen after logout
        } catch (error) {
            console.error("Logout Error:", error.message);
        }
    };


    // fetch user dat from supabse a tbale named users_details 
    // with records interests, gender and contact

    return (
        <ImageBackground source={{ uri: 'https://i.pinimg.com/474x/72/2b/1a/722b1a5309a144eeaf83c414693450f6.jpg' }}
            resizeMode="cover" style={styles.backgroundImage}>
            <View style={styles.overlay} />
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
                        <Text style={styles.bioTitle}>About User</Text>
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
                                    <Text style={styles.modalTitle}>Enter New</Text>
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

                </View>
            </View>
        </ImageBackground>
    );
};

const styles = StyleSheet.create({
    backgroundImage: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    overlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(0, 0, 0, 0.6)',
    },
    container: {
        width: '90%',
        backgroundColor: 'rgba(255, 255, 255, 0.15)',
        borderRadius: 20,
        padding: 25,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.3,
        shadowRadius: 20
    },
    profileContainer: {
        alignItems: 'center',
        marginBottom: 20,
    },
    profileWrapper: {
        position: 'relative',
        borderRadius: 100,
    },
    profileImage: {
        width: 120,
        height: 120,
        borderRadius: 60,
        borderWidth: 2,
        borderColor: '#fff'
    },
    cameraButton: {
        position: 'absolute',
        bottom: 5,
        right: 5,
        backgroundColor: '#ff6b6b',
        borderRadius: 20,
        padding: 6
    },
    username: {
        fontSize: 24,
        fontWeight: 'bold',
        marginTop: 10,
        color: '#fff'
    },
    bioContainer: {
        width: '100%',
        backgroundColor: 'rgba(255, 255, 255, 0.2)',
        padding: 20,
        borderRadius: 15,
        marginBottom: 20
    },
    bioTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        marginBottom: 10,
        color: '#000',
        textAlign: 'center',
    },
    bioText: {
        fontSize: 16,
        marginBottom: 8,
        color: '#fff',
        textAlign: 'center',
    },
    label: {
        fontWeight: 'bold',
        color: '#ffcc00',
    },
    buttonWrapper: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        width: '100%',
    },
    updateView: {
        width: "50%",
        backgroundColor: "blue",
        justifyContent: "center",
        alignItems: "center",
        borderRadius: 10,
    },
    update: {
        color: "#fff",
        fontSize: 20,
        paddingVertical: 12,
        borderRadius: 30,
        alignItems: 'center',
        marginHorizontal: 8,
        width: 150,
    },
    button: {
        flex: 1,
        marginTop: 25,
        backgroundColor: '#4a90e2', // Blue color
        paddingVertical: 12,
        borderRadius: 30,
        alignItems: 'center',
        marginHorizontal: 8,
    },
    changePassword: {
        backgroundColor: '#ff6b6b',
    },
    buttonText: {
        color: '#fff',
        fontSize: 18,
        fontWeight: 'bold',
    },
    errorText: {
        color: '#ff6b6b',
        marginTop: 10,
        textAlign: 'center',
        fontSize: 16,
        fontWeight: 'bold',
    },
    modalOverlay: {
        flex: 0.99,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "rgba(0, 0, 0, 0.5)", // Semi-transparent overlay
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
        elevation: 10, // Android shadow
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
        color: "#ff6b6b'",
        fontSize: 16,
        fontWeight: "bold",
    },
});