import { FlatCompat } from '@eslint/eslintrc';
const compat = new FlatCompat({ baseDirectory: import.meta.dirname });
export default [
  ...compat.extends('next/core-web-vitals', 'next/typescript'),
  { ignores: ['.next/**', 'out/**', '.test-build/**', 'next-env.d.ts'] },
  { rules: { '@typescript-eslint/no-empty-object-type': 'off' } },
];
