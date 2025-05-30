import { defineConfig } from 'vite';

export default defineConfig({
    root: '.',
    publicDir: 'public',
    build: {
        outDir: 'dist',
        assetsDir: 'assets',
        sourcemap: true,
        minify: 'terser',
        rollupOptions: {
            input: {
                main: './index.html'
            },
            output: {
                manualChunks: {
                    game: ['./src/js/game.js'],
                    entities: ['./src/js/entities/index.js'],
                    systems: ['./src/js/systems/index.js'],
                    utils: ['./src/js/utils/index.js']
                }
            }
        }
    },
    server: {
        port: 3000,
        host: true,
        open: true,
        hmr: {
            overlay: true
        }
    },
    preview: {
        port: 3000,
        host: true
    },
    assetsInclude: ['**/*.png', '**/*.jpg', '**/*.gif', '**/*.svg', '**/*.mp3', '**/*.wav', '**/*.ogg'],
    optimizeDeps: {
        exclude: []
    }
}); 