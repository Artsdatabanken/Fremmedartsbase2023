import react from '@vitejs/plugin-react-swc';
import commonjs from '@rollup/plugin-commonjs';
import { defineConfig, loadEnv } from 'vite';


export default defineConfig(({ command, mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  return {
    plugins: [react(), commonjs()],
    define: {
      'process.env': {}
    }
  }
});