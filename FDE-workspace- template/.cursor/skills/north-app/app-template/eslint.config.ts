import config from '@workspace/eslint-config';
import { defineConfig } from 'eslint/config';

export default defineConfig(config, {
  ignores: ['next-env.d.ts'],
});
