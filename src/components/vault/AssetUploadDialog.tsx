import React, { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useIPVault } from '@/hooks/useIPVault';
import { CreateAssetParams, IPAsset } from '@/types/vault';
import { Upload, Loader2 } from 'lucide-react';

interface AssetUploadDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function AssetUploadDialog({ open, onOpenChange }: AssetUploadDialogProps) {
  const { createAsset, isLoading } = useIPVault();
  const [file, setFile] = useState<File | null>(null);
  const [formData, setFormData] = useState<Partial<CreateAssetParams>>({
    name: '',
    type: 'copyright',
    description: '',
    tags: [],
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      setFile(selectedFile);
      if (!formData.name) {
        setFormData((prev) => ({ ...prev, name: selectedFile.name }));
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.type || !formData.description) {
      return;
    }

    const params: CreateAssetParams = {
      name: formData.name,
      type: formData.type as IPAsset['type'],
      description: formData.description,
      file: file || undefined,
      tags: formData.tags,
    };

    const result = await createAsset(params);
    if (result) {
      onOpenChange(false);
      // Reset form
      setFile(null);
      setFormData({
        name: '',
        type: 'copyright',
        description: '',
        tags: [],
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Upload IP Asset</DialogTitle>
          <DialogDescription>
            Add a new intellectual property asset to your secure vault
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="file">File (Optional)</Label>
            <div className="flex items-center gap-2">
              <Input
                id="file"
                type="file"
                onChange={handleFileChange}
                disabled={isLoading}
              />
              {file && <Upload className="h-4 w-4 text-primary" />}
            </div>
            <p className="text-xs text-muted-foreground">
              Upload supporting documents (PDF, images, etc.)
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="name">Asset Name *</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="e.g., Song Copyright - 'Midnight Dreams'"
              required
              disabled={isLoading}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="type">Asset Type *</Label>
            <Select
              value={formData.type}
              onValueChange={(value) => setFormData({ ...formData, type: value as IPAsset['type'] })}
              disabled={isLoading}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="copyright">Copyright</SelectItem>
                <SelectItem value="trademark">Trademark</SelectItem>
                <SelectItem value="patent">Patent</SelectItem>
                <SelectItem value="trade_secret">Trade Secret</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description *</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Describe your IP asset..."
              rows={4}
              required
              disabled={isLoading}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="tags">Tags (comma-separated)</Label>
            <Input
              id="tags"
              value={formData.tags?.join(', ')}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  tags: e.target.value.split(',').map((t) => t.trim()).filter(Boolean),
                })
              }
              placeholder="music, original, 2024"
              disabled={isLoading}
            />
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Create Asset
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
