import path from 'path';
import { fileURLToPath } from 'url';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default defineConfig(({ mode }) => {
    const env = loadEnv(mode, '.', '');

    // Fallback values to ensure Firebase config is valid even if .env loading fails contextually
    const fbConfig = {
        apiKey: env.VITE_FIREBASE_API_KEY || "AIzaSyA8Xa9HZ8HRuAY6JTqx_zvN3hjT_1YbwQE",
        authDomain: env.VITE_FIREBASE_AUTH_DOMAIN || "bloombook.firebaseapp.com",
        projectId: env.VITE_FIREBASE_PROJECT_ID || "bloombook",
        storageBucket: env.VITE_FIREBASE_STORAGE_BUCKET || "bloombook.firebasestorage.app",
        messagingSenderId: env.VITE_FIREBASE_MESSAGING_SENDER_ID || "1036124411351",
        appId: env.VITE_FIREBASE_APP_ID || "1:1036124411351:web:fb498ee0951ae76f3e2792"
    };

    return {
      base: './', // Use relative base path for maximum compatibility
      server: {
        port: 3000,
        host: '0.0.0.0',
      },
      plugins: [react()],
      define: {
        // Only polyfill process.env.API_KEY for Gemini SDK/EmailJS which specifically ask for process.env
        'process.env.API_KEY': JSON.stringify(env.GEMINI_API_KEY),
        'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY),
        'process.env.EMAILJS_SERVICE_ID': JSON.stringify(env.EMAILJS_SERVICE_ID),
        'process.env.EMAILJS_TEMPLATE_ID': JSON.stringify(env.EMAILJS_TEMPLATE_ID),
        'process.env.EMAILJS_PUBLIC_KEY': JSON.stringify(env.EMAILJS_PUBLIC_KEY),
        
        // Define Global Firebase Config Object to avoid process.env runtime access issues
        '__FIREBASE_CONFIG__': JSON.stringify(fbConfig)
      },
      resolve: {
        alias: {
          '@': path.resolve(__dirname, '.'),
        }
      }
    };
});