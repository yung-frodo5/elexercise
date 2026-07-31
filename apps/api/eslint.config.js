import js from '@eslint/js';
import tseslint from 'typescript-eslint';

export default tseslint.config(
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    rules: {
      // deliberate pattern: req.userId! after requireAuth, env vars
      // checked at startup — not worth annotating every call site
      '@typescript-eslint/no-non-null-assertion': 'off',
      'no-console': 'off',
      // `declare global { namespace Express { ... } }` is the only way to
      // augment Express's Request type — ES module syntax can't express it
      '@typescript-eslint/no-namespace': 'off',
    },
  },
  { ignores: ['dist/**'] },
);
