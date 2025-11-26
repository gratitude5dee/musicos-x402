import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useDerivatives } from '@/hooks/useDerivatives';
import { toast } from 'sonner';
import type { DerivativeRequest } from '@/types/derivative';
import type { Address } from 'viem';

interface CreateDerivativeDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CreateDerivativeDialog({ open, onOpenChange }: CreateDerivativeDialogProps) {
  const { templates } = useDerivatives();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<Partial<DerivativeRequest>>({
    derivativeType: 'remix',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // TODO: Implement actual derivative creation
      toast.success('Derivative work created successfully!');
      onOpenChange(false);
      setFormData({ derivativeType: 'remix' });
    } catch (error) {
      toast.error('Failed to create derivative work');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create Derivative Work</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="parentIpId">Parent IP Asset ID</Label>
            <Input
              id="parentIpId"
              placeholder="0x..."
              value={formData.parentIpId || ''}
              onChange={(e) => setFormData({ ...formData, parentIpId: e.target.value as Address })}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="name">Derivative Name</Label>
            <Input
              id="name"
              placeholder="My Derivative Work"
              value={formData.name || ''}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              placeholder="Describe your derivative work..."
              value={formData.description || ''}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={4}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="type">Derivative Type</Label>
            <Select
              value={formData.derivativeType}
              onValueChange={(value: any) => setFormData({ ...formData, derivativeType: value })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="remix">Remix</SelectItem>
                <SelectItem value="adaptation">Adaptation</SelectItem>
                <SelectItem value="translation">Translation</SelectItem>
                <SelectItem value="compilation">Compilation</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="licenseTemplate">License Template</Label>
            <Select
              value={formData.licenseTermsId}
              onValueChange={(value) => setFormData({ ...formData, licenseTermsId: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select a license template" />
              </SelectTrigger>
              <SelectContent>
                {templates.map((template) => (
                  <SelectItem key={template.id} value={template.id}>
                    {template.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="modifications">Modifications (optional)</Label>
            <Textarea
              id="modifications"
              placeholder="List key modifications made..."
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="mediaUrl">Media URL (optional)</Label>
            <Input
              id="mediaUrl"
              type="url"
              placeholder="https://..."
            />
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Creating...' : 'Create Derivative'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
