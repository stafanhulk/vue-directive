import { resolve } from 'node:path';
import vue from '@vitejs/plugin-vue';
import type { PluginOption, UserConfig } from 'vite';
import { defineConfig } from 'vite';
import dts from 'vite-plugin-dts';

export default defineConfig(({ command }) => {
  const isDev = command === 'serve';

  const config: UserConfig = {
    resolve: {
      alias: {
        '@': resolve(__dirname, 'src'),
      },
    },
  };

  const plugins: PluginOption[] = [];
  if (isDev) {
    plugins.push(vue());
  } else {
    plugins.push(
      dts({
        insertTypesEntry: true,
        outDir: 'types',
        tsconfigPath: 'tsconfig.build.json',
      })
    );
  }

  config.plugins = plugins;

  if (isDev) {
    config.root = 'examples';
  } else {
    config.build = {
      lib: {
        entry: resolve(__dirname, 'src/index.ts'),
        name: 'VueDirective',
        fileName: 'vue-directive',
        formats: ['es', 'umd'],
      },
      rollupOptions: {
        external: ['vue'],
        output: {
          globals: {
            vue: 'Vue',
          },
        },
      },
    };
  }

  return config;
});
