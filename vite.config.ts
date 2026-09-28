import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { VitePWA } from 'vite-plugin-pwa'

// Configuração do Vite: React + Tailwind + PWA (app instalável e offline).
export default defineConfig({
  base: './', // caminhos relativos: funciona em qualquer hospedagem estática
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['icone.svg'],
      manifest: {
        name: 'Estudos UnB',
        short_name: 'Estudos',
        description: 'Acompanhamento pessoal de estudos da faculdade',
        lang: 'pt-BR',
        theme_color: '#0f766e',
        background_color: '#faf8f5',
        display: 'standalone',
        start_url: './',
        scope: './',
        icons: [
          { src: 'icone-192.png', sizes: '192x192', type: 'image/png' },
          { src: 'icone-512.png', sizes: '512x512', type: 'image/png' },
          { src: 'icone-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
        ],
      },
    }),
  ],
})
