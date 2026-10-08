import { baseConfig } from '@acme/config/eslint/base.mjs';
import {
  FORBID_DIRECT_PLATFORM_UI,
  FORBID_REACT_NATIVE_VISUAL_PATH,
  FORBID_WEB_RENDERING_FROM_NATIVE,
} from '@acme/config/eslint/boundaries.mjs';

export default [
  ...baseConfig(FORBID_DIRECT_PLATFORM_UI),
  {
    files: ['**/*.ts', '**/*.tsx'],
    rules: {
      'no-restricted-imports': [
        'error',
        { paths: [FORBID_REACT_NATIVE_VISUAL_PATH], patterns: FORBID_DIRECT_PLATFORM_UI },
      ],
    },
  },
  {
    files: ['**/*.native.ts', '**/*.native.tsx', 'native-session.tsx'],
    rules: {
      'no-restricted-imports': [
        'error',
        {
          paths: [FORBID_REACT_NATIVE_VISUAL_PATH],
          patterns: [...FORBID_DIRECT_PLATFORM_UI, ...FORBID_WEB_RENDERING_FROM_NATIVE],
        },
      ],
    },
  },
];
