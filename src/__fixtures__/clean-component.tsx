import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Switch } from '@/components/ui/switch';
import { RadioGroup } from '@/components/ui/radio-group';

export const CleanComponent = () => {
  return (
    <div>
      <Button>Shadcn Button</Button>
      <Button variant="outline" size="sm">Another Shadcn Button</Button>
      <Input placeholder="Enter text" />
      <Textarea placeholder="Enter long text" />
      <Select />
      <Checkbox />
      <Switch />
      <RadioGroup />
    </div>
  );
};
