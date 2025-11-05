import path from "path"
import tailwindcss from "@tailwindcss/vite"
import react from "@vitejs/plugin-react"
import { defineConfig } from "vite"

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(), 
    tailwindcss()
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    rollupOptions: {
      input: {
        main: './index.html',
        // Add entry for SSR
        server: './src/entry-server.tsx'
      }
    }
  },
  ssr: {
    // Don't externalize these for SSR
    noExternal: ['react-helmet-async']
  }
})