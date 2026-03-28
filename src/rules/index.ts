import { preferShadcnButton } from './prefer-shadcn-button.js';
import { preferShadcnInput } from './prefer-shadcn-input.js';
import { preferShadcnTextarea } from './prefer-shadcn-textarea.js';
import { preferShadcnSelect } from './prefer-shadcn-select.js';
import { preferShadcnCheckbox } from './prefer-shadcn-checkbox.js';
import { preferShadcnSwitch } from './prefer-shadcn-switch.js';
import { preferShadcnRadioGroup } from './prefer-shadcn-radio-group.js';
import type { Rule } from '../types.js';

export const ALL_RULES: Rule[] = [
  preferShadcnButton,
  preferShadcnInput,
  preferShadcnTextarea,
  preferShadcnSelect,
  preferShadcnCheckbox,
  preferShadcnSwitch,
  preferShadcnRadioGroup,
];

export * from '../types.js';
export { preferShadcnButton };
export { preferShadcnInput };
export { preferShadcnTextarea };
export { preferShadcnSelect };
export { preferShadcnCheckbox };
export { preferShadcnSwitch };
export { preferShadcnRadioGroup };
