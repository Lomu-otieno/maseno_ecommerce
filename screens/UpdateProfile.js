import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert, ActivityIndicator, ImageBackground } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { supabase } from '../supabase'; // Ensure Supabase is initialized

const UpdateProfile = () => {
    const navigation = useNavigation();

    const image = { uri: 'https://images.pexels.com/photos/6169022/pexels-photo-6169022.jpeg?auto=compress&cs=tinysrgb&w=300' }
    //https://i.pinimg.com/236x/ca/7f/e3/ca7fe301cc4e70dfe0f3fe1ae93cc02c.jpg
    //https://i.pinimg.com/236x/2f/32/42/2f3242ec97af6ba316a0de5d5e9ecc83.jpg
    const [location, setLocation] = useState('');
    const [contact, setContact] = useState('');
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [userEmail, setUserEmail] = useState(null);

    useEffect(() => {
        getUserEmail(); // First, get the authenticated user's email
    }, []);

    // Get authenticated user's email
    const getUserEmail = async () => {
        const { data, error } = await supabase.auth.getUser();

        if (error || !data?.user?.email) {
            Alert.alert('Error', 'Failed to get user email.');
            setLoading(false);
            return;
        }

        setUserEmail(data.user.email);
        fetchUserDetails(data.user.email); // Fetch user details after getting email
    };

    // Fetch user details from Supabase
    const fetchUserDetails = async (email) => {
        try {
            const { data, error } = await supabase
                .from('users_details')
                .select('location,contact')
                .eq('email', email)
                .maybeSingle();

            if (error) throw error;

            if (data) {
                setLocation(data.location || '');
                setContact(data.contact || '');
            }
        } catch (error) {
            Alert.alert('Error', error.message);
        } finally {
            setLoading(false); // Stop loading
        }
    };

    // Update user details in Supabase
    const updateProfile = async () => {
        if (!userEmail) {
            Alert.alert('Error', 'User email is missing.');
            return;
        }

        if (!location || !contact) {
            Alert.alert('Error', 'All fields are required.');
            return;
        }

        setSaving(true);
        try {
            const { error } = await supabase
                .from('users_details')
                .update({ location, contact })
                .eq('email', userEmail);

            if (error) throw error;

            Alert.alert('Success', 'Profile updated successfully!');
            navigation.goBack();
        } catch (error) {
            Alert.alert('Update Failed', error.message);
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <View style={styles.loader}>
                <ActivityIndicator size="large" color="#007bff" />
            </View>
        );
    }

    return (
        <ImageBackground source={image} style={{ flex: 1, justifyContent: 'center' }} resizeMode={'cover'}>

            <View style={styles.container}>
                <Text style={styles.title}>Update <Text style={{ color: "#fff" }}>Profile</Text></Text>

                <TextInput
                    placeholder="location (e.g Across, Nyawita, Luanda"
                    value={location}
                    onChangeText={setLocation}
                    style={styles.input}
                />

                <TextInput
                    placeholder="Contact"
                    value={contact}
                    onChangeText={setContact}
                    keyboardType="phone-pad"
                    style={styles.input}
                />

                <TouchableOpacity style={styles.button} onPress={updateProfile} disabled={saving}>
                    <Text style={styles.buttonText}>{saving ? 'Saving...' : 'Save Changes'}</Text>
                </TouchableOpacity>
            </View>
        </ImageBackground>
    );
};

const styles = {
    container: {
        flex: 1,
        padding: 20,
        justifyContent: 'center',

    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 20,
        color: '#000'
    },
    input: {
        borderWidth: 1,
        padding: 10,
        marginBottom: 10,
        borderRadius: 5,
        backgroundColor: '#fff',
    },
    button: {
        backgroundColor: '#007bff',
        padding: 15,
        borderRadius: 5,
        alignItems: 'center',
    },
    buttonText: {
        color: 'white',
        fontWeight: 'bold',
    },
    loader: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
};

export default UpdateProfile;
