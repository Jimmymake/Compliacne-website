import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// // https://vite.dev/config/
// export default defineConfig({
//   plugins: [react()],
// })
export default {
  server: {
    allowedHosts: [
      'b9cb3a1d5f0e.ngrok-free.app' // 👈 Add your ngrok domain here
    ],
  },
};
