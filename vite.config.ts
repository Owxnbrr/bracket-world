import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import { existsSync, readdirSync } from 'node:fs';

const logoDirectory = new URL('./public/logos/', import.meta.url);
const availableLogos = existsSync(logoDirectory)
  ? readdirSync(logoDirectory).filter((name) => name.endsWith('.png')).map((name) => `/logos/${name}`)
  : [];

export default defineConfig({
  plugins: [react()],
  define: { __AVAILABLE_LOGOS__: JSON.stringify(availableLogos) },
  test: { include: ['src/**/*.test.ts'] },
});
