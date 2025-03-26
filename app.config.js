import 'dotenv/config';

export default {
    expo: {
        name: "SmartMaseno",
        slug: "smartmaseno",
        android: {
            package: "com.lomu.smartmaseno" // Change this to a unique package name
        },
        version: "1.0.0",
        extra: {
            eas: {
                projectId: "e4c12814-c483-4120-8e60-f74c51651bef"
            },
            SUPABASE_URL: process.env.SUPABASE_URL,
            SUPABASE_ANON_KEY: process.env.SUPABASE_ANON_KEY,

        },
    },

};