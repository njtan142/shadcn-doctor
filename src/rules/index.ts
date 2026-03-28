import { preferShadcnButton } from './prefer-shadcn-button.js';
import { preferShadcnInput } from './prefer-shadcn-input.js';
import { preferShadcnTextarea } from './prefer-shadcn-textarea.js';
import { preferShadcnSelect } from './prefer-shadcn-select.js';
import type { Rule } from '../types.js';

export const ALL_RULES: Rule[] = [
  preferShadcnButton,
  preferShadcnInput,
  preferShadcnTextarea,
  preferShadcnSelect,
];

export * from '../types.js';
export { preferShadcnButton };
export { preferShadcnInput };
export { preferShadcnTextarea };
export { preferShadcnSelect };
