import { defineConfig } from 'vite'
import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react({
    babel: {
      plugins: [
        ['babel-plugin-react-compiler', {}],
      ],
    },
  }), tailwindcss()],
  server: {
    port: 5173,
    headers: {
      "Content-Security-Policy":
        "default-src 'self'; " +
        "script-src 'self' 'unsafe-inline' https://apis.google.com https://accounts.google.com; " +
        "connect-src 'self' https://*.googleapis.com; " +
        "frame-src https://accounts.google.com https://content.googleapis.com; " +
        "img-src 'self' https://lh3.googleusercontent.com data:; " + // Added image sources
        "style-src 'self' 'unsafe-inline'"
    }
  }
});
