import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { ArrowLeft, ArrowRight, Upload, CheckCircle } from 'lucide-react';
import { DISPUTE_TAGS } from '@/types/dispute';
import { type Address } from 'viem';
import { motion, AnimatePresence } from 'framer-motion';

interface RaiseDisputeWizardProps {
  preSelectedIpId?: Address;
  onSuccess: (disputeId: string) => void;
  onCancel: () => void;
}

export function RaiseDisputeWizard({
  preSelectedIpId,
  onSuccess,
  onCancel,
}: RaiseDisputeWizardProps) {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    targetIpId: preSelectedIpId || ('' as Address),
    disputeTag: '',
    evidenceFile: null as File | null,
    evidenceDescription: '',
    bondAmount: '0.1',
    livenessPeriod: '3600',
  });

  const steps = [
    { number: 1, title: 'Select Target IP' },
    { number: 2, title: 'Choose Dispute Type' },
    { number: 3, title: 'Upload Evidence' },
    { number: 4, title: 'Set Parameters' },
    { number: 5, title: 'Review & Submit' },
  ];

  const handleNext = () => {
    if (step < 5) setStep(step + 1);
  };

  const handleBack = () => {
    if (step > 1) setStep(step - 1);
  };

  const handleSubmit = async () => {
    // TODO: Implement actual dispute raising
    const mockDisputeId = Math.random().toString(36).substring(7);
    onSuccess(mockDisputeId);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFormData({ ...formData, evidenceFile: e.target.files[0] });
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      {/* Progress Steps */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          {steps.map((s, index) => (
            <React.Fragment key={s.number}>
              <div className="flex flex-col items-center">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-colors ${
                    step >= s.number
                      ? 'bg-primary border-primary text-white'
                      : 'bg-background border-border text-text-secondary'
                  }`}
                >
                  {step > s.number ? (
                    <CheckCircle className="w-5 h-5" />
                  ) : (
                    s.number
                  )}
                </div>
                <span className="text-xs text-text-secondary mt-2">{s.title}</span>
              </div>
              {index < steps.length - 1 && (
                <div
                  className={`flex-1 h-0.5 mx-4 transition-colors ${
                    step > s.number ? 'bg-primary' : 'bg-border'
                  }`}
                />
              )}
            </React.Fragment>
          ))}
        </div>
      </div>

      {/* Step Content */}
      <Card className="p-6 glass-card border border-border/50 min-h-[400px]">
        <AnimatePresence mode="wait">
          {step === 1 && (
            <motion.div
              key="step1"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-4"
            >
              <h3 className="text-xl font-semibold text-text-primary">
                Select Target IP Asset
              </h3>
              <p className="text-sm text-text-secondary">
                Enter the IP asset ID that you believe is infringing
              </p>
              <div className="space-y-2">
                <Label>Target IP Asset ID</Label>
                <Input
                  placeholder="0x..."
                  value={formData.targetIpId}
                  onChange={(e) =>
                    setFormData({ ...formData, targetIpId: e.target.value as Address })
                  }
                />
              </div>
            </motion.div>
          )}

          {step === 2 && (
            <motion.div
              key="step2"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-4"
            >
              <h3 className="text-xl font-semibold text-text-primary">
                Choose Dispute Type
              </h3>
              <p className="text-sm text-text-secondary">
                Select the type of infringement or violation
              </p>
              <div className="space-y-2">
                <Label>Dispute Tag</Label>
                <Select
                  value={formData.disputeTag}
                  onValueChange={(value) =>
                    setFormData({ ...formData, disputeTag: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a dispute type" />
                  </SelectTrigger>
                  <SelectContent>
                    {DISPUTE_TAGS.map((tag) => (
                      <SelectItem key={tag.value} value={tag.value}>
                        <div>
                          <div className="font-medium">{tag.label}</div>
                          <div className="text-xs text-text-secondary">
                            {tag.description}
                          </div>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </motion.div>
          )}

          {step === 3 && (
            <motion.div
              key="step3"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-4"
            >
              <h3 className="text-xl font-semibold text-text-primary">
                Upload Evidence
              </h3>
              <p className="text-sm text-text-secondary">
                Provide evidence to support your claim (will be stored on IPFS)
              </p>
              <div className="space-y-4">
                <div className="border-2 border-dashed border-border rounded-lg p-8 text-center">
                  <input
                    type="file"
                    onChange={handleFileChange}
                    className="hidden"
                    id="evidence-file"
                  />
                  <label htmlFor="evidence-file" className="cursor-pointer">
                    <Upload className="w-12 h-12 mx-auto text-text-secondary mb-2" />
                    <p className="text-sm text-text-primary font-medium">
                      {formData.evidenceFile
                        ? formData.evidenceFile.name
                        : 'Click to upload evidence'}
                    </p>
                    <p className="text-xs text-text-secondary mt-1">
                      PDF, Image, Video, or Document (max 20MB)
                    </p>
                  </label>
                </div>
                <div className="space-y-2">
                  <Label>Evidence Description</Label>
                  <Textarea
                    placeholder="Describe the evidence and why it supports your claim..."
                    value={formData.evidenceDescription}
                    onChange={(e) =>
                      setFormData({ ...formData, evidenceDescription: e.target.value })
                    }
                    rows={4}
                  />
                </div>
              </div>
            </motion.div>
          )}

          {step === 4 && (
            <motion.div
              key="step4"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-4"
            >
              <h3 className="text-xl font-semibold text-text-primary">
                Set Parameters
              </h3>
              <p className="text-sm text-text-secondary">
                Configure UMA oracle parameters
              </p>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Bond Amount (ETH)</Label>
                  <Input
                    type="number"
                    step="0.01"
                    value={formData.bondAmount}
                    onChange={(e) =>
                      setFormData({ ...formData, bondAmount: e.target.value })
                    }
                  />
                  <p className="text-xs text-text-secondary">
                    Bond required to raise dispute. Returned if claim is valid.
                  </p>
                </div>
                <div className="space-y-2">
                  <Label>Liveness Period (seconds)</Label>
                  <Input
                    type="number"
                    value={formData.livenessPeriod}
                    onChange={(e) =>
                      setFormData({ ...formData, livenessPeriod: e.target.value })
                    }
                  />
                  <p className="text-xs text-text-secondary">
                    Challenge period before dispute auto-resolves (recommended: 3600 = 1
                    hour)
                  </p>
                </div>
              </div>
            </motion.div>
          )}

          {step === 5 && (
            <motion.div
              key="step5"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-4"
            >
              <h3 className="text-xl font-semibold text-text-primary">
                Review & Submit
              </h3>
              <p className="text-sm text-text-secondary">
                Review your dispute details before submitting
              </p>
              <div className="space-y-3 p-4 rounded-lg bg-background/50">
                <div>
                  <p className="text-sm text-text-secondary">Target IP</p>
                  <p className="text-sm text-text-primary font-mono">
                    {formData.targetIpId}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-text-secondary">Dispute Type</p>
                  <p className="text-sm text-text-primary">
                    {DISPUTE_TAGS.find((t) => t.value === formData.disputeTag)
                      ?.label || formData.disputeTag}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-text-secondary">Evidence</p>
                  <p className="text-sm text-text-primary">
                    {formData.evidenceFile?.name || 'No file uploaded'}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-text-secondary">Bond Amount</p>
                  <p className="text-sm text-text-primary">{formData.bondAmount} ETH</p>
                </div>
                <div>
                  <p className="text-sm text-text-secondary">Liveness Period</p>
                  <p className="text-sm text-text-primary">
                    {formData.livenessPeriod} seconds
                  </p>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </Card>

      {/* Navigation Buttons */}
      <div className="flex items-center justify-between mt-6">
        <Button variant="outline" onClick={step === 1 ? onCancel : handleBack}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          {step === 1 ? 'Cancel' : 'Back'}
        </Button>

        {step < 5 ? (
          <Button onClick={handleNext} className="bg-primary hover:bg-primary/80">
            Next
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        ) : (
          <Button
            onClick={handleSubmit}
            className="bg-primary hover:bg-primary/80"
          >
            Submit Dispute
          </Button>
        )}
      </div>
    </div>
  );
}
