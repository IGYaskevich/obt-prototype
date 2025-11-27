import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
    plugins: [react()],
    // base: '/obt-prototype/',        // <= ВАЖНО: имя репозитория
    server: { port: 5173 },
})