import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select } from '@/components/ui/select';

export const CleanComponent = () => {
  return (
    <div>
      <Button>Shadcn Button</Button>
      <Button variant="outline" size="sm">Another Shadcn Button</Button>
      <Input placeholder="Enter text" />
      <Textarea placeholder="Enter long text" />
      <Select />
    </div>
  );
};
