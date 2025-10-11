import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    host: true, // ✅ Allows external access
    port: 5173, // ✅ Optional, you can change it if needed
    strictPort: true, // ✅ Ensures Vite uses this exact port
    allowedHosts: [
      "6303-2409-40c1-4000-e778-99b-9785-47b0-7626.ngrok-free.app", // ✅ Add your ngrok URL
    ],
    cors: true, // ✅ Enable CORS
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
})
