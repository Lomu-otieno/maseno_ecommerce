import { StatusBar } from 'expo-status-bar';
import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, ImageBackground, Alert, TouchableOpacity } from 'react-native';
import { supabase } from '../supabase'; // Ensure this file has your Supabase config
import * as Linking from 'expo-linking'

const image = { uri: 'https://i.pinimg.com/736x/40/4d/4a/404d4ab5b34c6a97c0c31666ec1c33db.jpg' };

const ForgotPassScreen = ({ navigation }) => {
    const [email, setEmail] = useState('');
    const [focusedInput, setFocusedInput] = useState(null);
    const [errorMessage, setErrorMessage] = useState('');

    const linking = {
        prefixes: ["real://", "exp://192.168.100.9:8081"],
        config: {
            screens: {
                ResetPasswordScreen: "reset-password",
            },
        },
    };

    const handleResetPassword = async () => {
        setErrorMessage('');

        if (!email.trim()) {
            setErrorMessage("Please enter your email to reset your password.");
            return;
        }

        try {
            const deepLink = Linking.createURL("reset-password");

            const { error } = await supabase.auth.resetPasswordForEmail(email, {
                redirectTo: deepLink,
            });

            if (error) throw error;

            Alert.alert("Success", "A password reset link has been sent to your email.", [
                { text: "OK", onPress: () => navigation.goBack() }
            ]);
        } catch (error) {
            setErrorMessage(error.message || "Check your internet connection and try again.");
        }
    };



    return (
        <>
            <StatusBar style='dark' />
            <ImageBackground source={image} resizeMode='cover' style={styles.backgroundImage}>
                <View style={styles.container}>
                    <Text style={styles.header}>Forgot Password?</Text>
                    <View style={styles.subcontainer}>
                        <Text style={styles.text}>Enter email</Text>
                        <TextInput
                            style={[styles.input, { color: focusedInput === 'input1' ? 'yellow' : '#000' }]}
                            value={email}
                            placeholder='example@gmail.com'
                            onChangeText={setEmail}
                            onFocus={() => setFocusedInput('input1')}
                            onBlur={() => setFocusedInput(null)}
                            keyboardType='email-address'
                            autoCapitalize='none'
                        />
                        {errorMessage ? <Text style={styles.errorMessage}>{errorMessage}</Text> : null}
                    </View>

                    <TouchableOpacity onPress={handleResetPassword} style={styles.button}>
                        <Text style={styles.buttonText}>Reset Password</Text>
                    </TouchableOpacity>

                    <TouchableOpacity onPress={() => navigation.goBack()} style={{ padding: 10, marginTop: 5 }}>
                        <Text style={{ color: "#000", fontSize: 20, fontWeight: "bold" }}>Log in</Text>
                    </TouchableOpacity>
                </View>
            </ImageBackground>
        </>
    );
};

export default ForgotPassScreen;

const styles = StyleSheet.create({
    backgroundImage: { flex: 1, justifyContent: "center" },
    container: { flex: 1, justifyContent: "center", alignItems: 'center' },
    header: {
        marginBottom: 40, color: "#2f3061", width: "80%", backgroundColor: "#000",
        height: 40, textAlign: 'center', fontSize: 25, borderRadius: 5, padding: 4
    },
    input: { fontSize: 18, height: 40, borderWidth: 1, padding: 10, borderRadius: 5, marginBottom: 25, borderColor: "#000" },
    text: { color: "#000", fontSize: 18 },
    subcontainer: { width: "80%", padding: 15 },
    button: { alignItems: 'center', justifyContent: 'center', width: 200, backgroundColor: "blue", borderRadius: 10, padding: 10 },
    buttonText: { fontSize: 20, fontWeight: '600', color: "#fff" },
    errorMessage: { color: "red", fontSize: 18, textAlign: 'center', marginTop: 5, backgroundColor: "white", borderRadius: 5 }
});
