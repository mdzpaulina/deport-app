import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import electron from 'vite-plugin-electron'
import renderer from 'vite-plugin-electron-renderer'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    electron([
      {
        entry: 'electron/main.ts',
        onstart(options) {
          options.startup()
        },
        vite: {
          build: {
            rollupOptions: {
              external: [
                'sqlite3', 
                'sequelize',
                'electron-squirrel-startup',
                'better-sqlite3'
              ]
            },
          },
        },
      },
      {
        entry: 'electron/preload.ts',
        onstart(options) {
          options.reload()
        },
        vite: {
          build: {
            rollupOptions: {
              external: ['electron']
            }
          }
        }
      },
    ]),
    renderer()
  ],
  build: {
    rollupOptions: {
      external: [
        'sqlite3', 
        'sequelize',
        'electron-squirrel-startup',
        'better-sqlite3'
      ]
    }
  }
})