import {defineConfig} from 'vite';
import {resolve} from 'node:path';
export default defineConfig({build:{cssCodeSplit:false,rollupOptions:{input:{main:resolve('index.html'),style:resolve('style-tile.html'),mobile:resolve('mobile-preview.html')}}}});
