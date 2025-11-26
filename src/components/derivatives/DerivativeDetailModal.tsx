import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { CheckCircle2, XCircle, ExternalLink, Calendar } from 'lucide-react';
import { format } from 'date-fns';
import { useDerivatives } from '@/hooks/useDerivatives';
import { toast } from 'sonner';
import type { DerivativeWork } from '@/types/derivative';

interface DerivativeDetailModalProps {
  derivative: DerivativeWork | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function DerivativeDetailModal({ derivative, open, onOpenChange }: DerivativeDetailModalProps) {
  const { approveDerivative, rejectDerivative } = useDerivatives();

  if (!derivative) return null;

  const handleApprove = async () => {
    try {
      await approveDerivative(derivative.id);
      toast.success('Derivative approved successfully');
      onOpenChange(false);
    } catch (error) {
      toast.error('Failed to approve derivative');
    }
  };

  const handleReject = async () => {
    try {
      await rejectDerivative(derivative.id);
      toast.error('Derivative rejected');
      onOpenChange(false);
    } catch (error) {
      toast.error('Failed to reject derivative');
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3">
            {derivative.name}
            <Badge variant="outline" className="capitalize">
              {derivative.derivativeType}
            </Badge>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          <div>
            <h3 className="font-semibold mb-2">Description</h3>
            <p className="text-muted-foreground">{derivative.description}</p>
          </div>

          <Separator />

          <div className="grid grid-cols-2 gap-4">
            <div>
              <h4 className="text-sm font-medium text-muted-foreground mb-1">Status</h4>
              <Badge variant="outline" className="capitalize">
                {derivative.status}
              </Badge>
            </div>
            <div>
              <h4 className="text-sm font-medium text-muted-foreground mb-1">Created</h4>
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <span>{format(derivative.createdAt, 'MMM d, yyyy')}</span>
              </div>
            </div>
            <div>
              <h4 className="text-sm font-medium text-muted-foreground mb-1">Royalty Share</h4>
              <span className="font-semibold">{derivative.royaltyShare}%</span>
            </div>
            <div>
              <h4 className="text-sm font-medium text-muted-foreground mb-1">Commercial Use</h4>
              <Badge variant={derivative.commercialUse ? 'default' : 'secondary'}>
                {derivative.commercialUse ? 'Allowed' : 'Not Allowed'}
              </Badge>
            </div>
          </div>

          <Separator />

          <div>
            <h3 className="font-semibold mb-3">License Terms</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">License Type:</span>
                <span className="font-medium">{derivative.licenseTerms.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Commercial Revenue Share:</span>
                <span className="font-medium">{derivative.licenseTerms.commercialRevShare}%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Derivatives Allowed:</span>
                <span className="font-medium">
                  {derivative.licenseTerms.derivativesAllowed ? 'Yes' : 'No'}
                </span>
              </div>
              {derivative.licenseTerms.derivativesAllowed && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Derivatives Revenue Share:</span>
                  <span className="font-medium">{derivative.licenseTerms.derivativesRevShare}%</span>
                </div>
              )}
            </div>
          </div>

          {derivative.metadata.originalWork && (
            <>
              <Separator />
              <div>
                <h3 className="font-semibold mb-2">Original Work</h3>
                <p className="text-muted-foreground">{derivative.metadata.originalWork}</p>
              </div>
            </>
          )}

          {derivative.metadata.modifications && derivative.metadata.modifications.length > 0 && (
            <>
              <Separator />
              <div>
                <h3 className="font-semibold mb-2">Modifications</h3>
                <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                  {derivative.metadata.modifications.map((mod, idx) => (
                    <li key={idx}>{mod}</li>
                  ))}
                </ul>
              </div>
            </>
          )}

          <Separator />

          <div>
            <h3 className="font-semibold mb-2">Blockchain Details</h3>
            <div className="space-y-2 text-sm">
              <div>
                <span className="text-muted-foreground">Parent IP ID:</span>
                <div className="flex items-center gap-2 mt-1">
                  <code className="text-xs bg-muted px-2 py-1 rounded">
                    {derivative.parentIpId.slice(0, 10)}...{derivative.parentIpId.slice(-8)}
                  </code>
                  <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                    <ExternalLink className="h-3 w-3" />
                  </Button>
                </div>
              </div>
              <div>
                <span className="text-muted-foreground">Child IP ID:</span>
                <div className="flex items-center gap-2 mt-1">
                  <code className="text-xs bg-muted px-2 py-1 rounded">
                    {derivative.childIpId.slice(0, 10)}...{derivative.childIpId.slice(-8)}
                  </code>
                  <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                    <ExternalLink className="h-3 w-3" />
                  </Button>
                </div>
              </div>
            </div>
          </div>

          {derivative.status === 'pending' && (
            <>
              <Separator />
              <div className="flex gap-3">
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={handleReject}
                >
                  <XCircle className="h-4 w-4 mr-2" />
                  Reject
                </Button>
                <Button
                  className="flex-1"
                  onClick={handleApprove}
                >
                  <CheckCircle2 className="h-4 w-4 mr-2" />
                  Approve
                </Button>
              </div>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
