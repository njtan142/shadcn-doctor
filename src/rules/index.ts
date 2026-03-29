import type { Rule } from '../types.js';
import { preferShadcnAlert } from './prefer-shadcn-alert.js';
import { preferShadcnAvatar } from './prefer-shadcn-avatar.js';
import { preferShadcnBadge } from './prefer-shadcn-badge.js';
import { preferShadcnButton } from './prefer-shadcn-button.js';
import { preferShadcnCard } from './prefer-shadcn-card.js';
import { preferShadcnCheckbox } from './prefer-shadcn-checkbox.js';
import { preferShadcnDialog } from './prefer-shadcn-dialog.js';
import { preferShadcnInput } from './prefer-shadcn-input.js';
import { preferShadcnRadioGroup } from './prefer-shadcn-radio-group.js';
import { preferShadcnSelect } from './prefer-shadcn-select.js';
import { preferShadcnSwitch } from './prefer-shadcn-switch.js';
import { preferShadcnTable } from './prefer-shadcn-table.js';
import { preferShadcnTabs } from './prefer-shadcn-tabs.js';
import { preferShadcnTextarea } from './prefer-shadcn-textarea.js';

export const ALL_RULES: Rule[] = [
  preferShadcnButton,
  preferShadcnCard,
  preferShadcnInput,
  preferShadcnTextarea,
  preferShadcnSelect,
  preferShadcnCheckbox,
  preferShadcnSwitch,
  preferShadcnRadioGroup,
  preferShadcnTable,
  preferShadcnDialog,
  preferShadcnAlert,
  preferShadcnBadge,
  preferShadcnAvatar,
  preferShadcnTabs,
];

export * from '../types.js';
export {
  preferShadcnAlert,
  preferShadcnAvatar,
  preferShadcnBadge,
  preferShadcnButton,
  preferShadcnCard,
  preferShadcnCheckbox,
  preferShadcnDialog,
  preferShadcnInput,
  preferShadcnRadioGroup,
  preferShadcnSelect,
  preferShadcnSwitch,
  preferShadcnTable,
  preferShadcnTabs,
  preferShadcnTextarea,
};
