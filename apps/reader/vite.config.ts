import { defineConfig } from 'vite';
import solidPlugin from 'vite-plugin-solid';
import devtools from 'solid-devtools/vite';
import UnocssPlugin from '@unocss/vite';
import { fileURLToPath, URL } from 'node:url'

export default defineConfig({
    resolve: {
        alias: {
            '@': fileURLToPath(new URL('./src', import.meta.url)),
        }
    },
    plugins: [
        solidPlugin(),
        UnocssPlugin({
            // your config or in uno.config.ts
        }),
    ],
    server: {
        port: 3000,
    },
    build: {
        target: 'esnext',
    },
});
