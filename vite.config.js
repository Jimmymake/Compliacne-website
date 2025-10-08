import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// // https://vite.dev/config/
// export default defineConfig({
//   plugins: [react()],
// })
export default {
  server: {
    allowedHosts: [
      '08ef9183b62c.ngrok-free.app' // 👈 Add your ngrok domain here
    ],
  },
};
