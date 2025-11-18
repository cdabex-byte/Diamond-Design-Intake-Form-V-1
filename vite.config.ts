import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  base: '/Diamond-Design-Intake-Form-V-1/', // specific repo base URL
});