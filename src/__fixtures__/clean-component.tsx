import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { RadioGroup } from '@/components/ui/radio-group';
import { Select } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';

export const CleanComponent = () => {
  return (
    <div>
      <Button>Shadcn Button</Button>
      <Button variant="outline" size="sm">
        Another Shadcn Button
      </Button>
      <Input placeholder="Enter text" />
      <Textarea placeholder="Enter long text" />
      <Select />
      <Checkbox />
      <Switch />
      <RadioGroup />
    </div>
  );
};
