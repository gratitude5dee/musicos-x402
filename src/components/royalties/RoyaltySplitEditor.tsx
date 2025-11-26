import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Plus, Trash2, AlertCircle } from 'lucide-react';
import { type Address } from 'viem';
import { RoyaltySplit } from '@/types/royalty';

interface RoyaltySplitEditorProps {
  onSave: (splits: RoyaltySplit[]) => Promise<void>;
  initialSplits?: RoyaltySplit[];
}

export function RoyaltySplitEditor({ onSave, initialSplits = [] }: RoyaltySplitEditorProps) {
  const [splits, setSplits] = useState<RoyaltySplit[]>(
    initialSplits.length > 0 ? initialSplits : [
      { ipId: '' as Address, percentage: 100, name: 'Primary Recipient' }
    ]
  );
  const [isSaving, setIsSaving] = useState(false);

  const totalPercentage = splits.reduce((sum, split) => sum + split.percentage, 0);
  const isValid = totalPercentage === 100 && splits.every(s => s.ipId && s.percentage > 0);

  const updateSplit = (index: number, field: keyof RoyaltySplit, value: any) => {
    const newSplits = [...splits];
    newSplits[index] = { ...newSplits[index], [field]: value };
    setSplits(newSplits);
  };

  const addSplit = () => {
    setSplits([...splits, { ipId: '' as Address, percentage: 0, name: '' }]);
  };

  const removeSplit = (index: number) => {
    setSplits(splits.filter((_, i) => i !== index));
  };

  const handleSave = async () => {
    if (!isValid) return;
    
    setIsSaving(true);
    try {
      await onSave(splits);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Card className="p-6 glass-card border border-border/50">
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-text-primary mb-2">
          Royalty Split Configuration
        </h3>
        <p className="text-sm text-text-secondary">
          Define how royalties should be distributed across IP assets
        </p>
      </div>

      <div className="space-y-4 mb-6">
        {splits.map((split, index) => (
          <div
            key={index}
            className="p-4 rounded-lg bg-background/50 border border-border/30 space-y-3"
          >
            <div className="flex items-start justify-between">
              <div className="flex-1 space-y-3">
                <div>
                  <Label className="text-sm text-text-secondary">IP Asset ID</Label>
                  <Input
                    placeholder="0x..."
                    value={split.ipId}
                    onChange={(e) => updateSplit(index, 'ipId', e.target.value as Address)}
                    className="mt-1"
                  />
                </div>
                
                <div>
                  <Label className="text-sm text-text-secondary">Name (Optional)</Label>
                  <Input
                    placeholder="e.g., Co-creator, Studio"
                    value={split.name || ''}
                    onChange={(e) => updateSplit(index, 'name', e.target.value)}
                    className="mt-1"
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between mb-2">
                    <Label className="text-sm text-text-secondary">Percentage</Label>
                    <span className="text-lg font-semibold text-text-primary">
                      {split.percentage}%
                    </span>
                  </div>
                  <Slider
                    value={[split.percentage]}
                    onValueChange={([value]) => updateSplit(index, 'percentage', value)}
                    max={100}
                    step={1}
                    className="mt-2"
                  />
                </div>
              </div>

              {splits.length > 1 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => removeSplit(index)}
                  className="ml-2 text-destructive hover:text-destructive/80"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              )}
            </div>
          </div>
        ))}
      </div>

      <Button
        variant="outline"
        onClick={addSplit}
        className="w-full mb-4"
      >
        <Plus className="w-4 h-4 mr-2" />
        Add Recipient
      </Button>

      <div className="pt-4 border-t border-border/50">
        <div className="flex items-center justify-between mb-4">
          <span className="text-sm text-text-secondary">Total Allocation</span>
          <span className={`text-lg font-semibold ${totalPercentage === 100 ? 'text-accent-green' : 'text-destructive'}`}>
            {totalPercentage}%
          </span>
        </div>

        {totalPercentage !== 100 && (
          <div className="flex items-start gap-2 p-3 rounded-lg bg-destructive/10 border border-destructive/20 mb-4">
            <AlertCircle className="w-4 h-4 text-destructive mt-0.5" />
            <div className="text-sm text-destructive">
              Total must equal 100%. {totalPercentage < 100 ? `Add ${100 - totalPercentage}%` : `Remove ${totalPercentage - 100}%`}
            </div>
          </div>
        )}

        <Button
          className="w-full bg-primary hover:bg-primary/80"
          onClick={handleSave}
          disabled={!isValid || isSaving}
        >
          {isSaving ? 'Saving...' : 'Save Royalty Split'}
        </Button>
      </div>
    </Card>
  );
}
