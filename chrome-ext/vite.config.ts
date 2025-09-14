import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'
import path from 'node:path'

export default defineConfig(({ mode }) => ({
  plugins: [react()],
  publicDir: 'public',
  build: {
    outDir: 'dist',
    sourcemap: true,
    emptyOutDir: true,
    rollupOptions: {
      input: {
        popup: path.resolve(__dirname, 'src/popup/index.html'),
        options: path.resolve(__dirname, 'src/options/index.html'),
        sidepanel: path.resolve(__dirname, 'src/sidepanel/index.html'),
        background: path.resolve(__dirname, 'src/background.ts'),
      },
      output: {
        entryFileNames: (chunk) =>
          chunk.name === 'background' ? '[name].js' : 'assets/[name].js',
        chunkFileNames: 'assets/[name].js',
        assetFileNames: 'assets/[name][extname]',
      },
    },
  },
  resolve: {
    alias: [
      { find: '@ext', replacement: path.resolve(__dirname, 'src') },
      // Map Next.js absolute alias in reused components to the `toby/` source.
      { find: '@', replacement: path.resolve(__dirname, '../toby') },
      { find: 'lucide-react', replacement: path.resolve(__dirname, 'src/shims/lucide-react.tsx') },
    ],
    dedupe: ['react', 'react-dom'],
  },
  // Ensure React picks correct build based on mode
  define: {
    'process.env.NODE_ENV': JSON.stringify(mode === 'development' ? 'development' : 'production'),
  },
}))
