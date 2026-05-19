import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  // PŘÍKLAD: Pokud je tvůj odkaz github.com/steva/skola-nexa, napíšeš sem '/skola-nexa/'
  base: '/neca-c/', 
})
