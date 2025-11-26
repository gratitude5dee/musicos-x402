import React from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import {
  AlertTriangle,
  ExternalLink,
  FileText,
  Clock,
  User,
  Shield,
} from 'lucide-react';
import { Dispute, DisputeTimeline } from '@/types/dispute';

interface DisputeDetailViewProps {
  dispute: Dispute;
  timeline: DisputeTimeline[];
  userRole: 'initiator' | 'target' | 'observer';
  onCancel?: () => void;
  onResolve?: () => void;
  onAddEvidence?: () => void;
}

export function DisputeDetailView({
  dispute,
  timeline,
  userRole,
  onCancel,
  onResolve,
  onAddEvidence,
}: DisputeDetailViewProps) {
  const getStatusColor = (status: Dispute['status']) => {
    switch (status) {
      case 'RAISED':
        return 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20';
      case 'IN_DISPUTE':
        return 'bg-blue-500/10 text-blue-500 border-blue-500/20';
      case 'RESOLVED':
        return 'bg-green-500/10 text-green-500 border-green-500/20';
      case 'CANCELLED':
        return 'bg-gray-500/10 text-gray-500 border-gray-500/20';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="p-6 glass-card border border-border/50">
        <div className="flex items-start justify-between mb-4">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <AlertTriangle className="w-6 h-6 text-yellow-500" />
              <h2 className="text-2xl font-bold text-text-primary">
                {dispute.targetTag.replace(/_/g, ' ')}
              </h2>
              <Badge className={getStatusColor(dispute.status)}>
                {dispute.status}
              </Badge>
            </div>
            <p className="text-sm text-text-secondary">
              Dispute ID: {dispute.id}
            </p>
          </div>

          <div className="flex gap-2">
            {userRole === 'initiator' && dispute.status === 'RAISED' && (
              <Button variant="outline" onClick={onCancel}>
                Cancel Dispute
              </Button>
            )}
            {userRole === 'target' && onAddEvidence && (
              <Button variant="outline" onClick={onAddEvidence}>
                <FileText className="w-4 h-4 mr-2" />
                Add Counter-Evidence
              </Button>
            )}
            {dispute.status === 'IN_DISPUTE' && onResolve && (
              <Button className="bg-primary hover:bg-primary/80" onClick={onResolve}>
                Resolve Dispute
              </Button>
            )}
          </div>
        </div>

        <Separator className="my-4" />

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <p className="text-sm text-text-secondary mb-1">Target IP Asset</p>
            <p className="text-sm text-text-primary font-mono break-all">
              {dispute.targetIpId}
            </p>
          </div>
          <div>
            <p className="text-sm text-text-secondary mb-1">Initiated By</p>
            <div className="flex items-center gap-2">
              <User className="w-4 h-4 text-text-secondary" />
              <p className="text-sm text-text-primary font-mono">
                {dispute.initiator.slice(0, 10)}...
              </p>
            </div>
          </div>
          <div>
            <p className="text-sm text-text-secondary mb-1">Date Raised</p>
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-text-secondary" />
              <p className="text-sm text-text-primary">
                {new Date(dispute.disputeTimestamp).toLocaleString()}
              </p>
            </div>
          </div>
        </div>

        <Separator className="my-4" />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <a
            href={dispute.umaLink}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 text-sm text-primary hover:underline"
          >
            <Shield className="w-4 h-4" />
            View on UMA Oracle
            <ExternalLink className="w-3 h-3" />
          </a>
          <a
            href={`https://explorer.story.foundation/tx/${dispute.transactionHash}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 text-sm text-primary hover:underline"
          >
            View Transaction
            <ExternalLink className="w-3 h-3" />
          </a>
        </div>
      </Card>

      {/* Evidence Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="p-6 glass-card border border-border/50">
          <h3 className="text-lg font-semibold text-text-primary mb-4">
            Initial Evidence
          </h3>
          <div className="space-y-3">
            <div className="p-3 rounded-lg bg-background/50">
              <div className="flex items-center gap-2 mb-2">
                <FileText className="w-4 h-4 text-text-secondary" />
                <p className="text-sm text-text-primary font-medium">
                  Evidence Document
                </p>
              </div>
              <p className="text-xs text-text-secondary font-mono mb-2">
                IPFS: {dispute.evidenceHash}
              </p>
              <Button variant="outline" size="sm" className="w-full">
                <ExternalLink className="w-3 h-3 mr-2" />
                View on IPFS
              </Button>
            </div>
          </div>
        </Card>

        {dispute.counterEvidenceHash && (
          <Card className="p-6 glass-card border border-border/50">
            <h3 className="text-lg font-semibold text-text-primary mb-4">
              Counter-Evidence
            </h3>
            <div className="space-y-3">
              <div className="p-3 rounded-lg bg-background/50">
                <div className="flex items-center gap-2 mb-2">
                  <FileText className="w-4 h-4 text-text-secondary" />
                  <p className="text-sm text-text-primary font-medium">
                    Response Document
                  </p>
                </div>
                <p className="text-xs text-text-secondary font-mono mb-2">
                  IPFS: {dispute.counterEvidenceHash}
                </p>
                <Button variant="outline" size="sm" className="w-full">
                  <ExternalLink className="w-3 h-3 mr-2" />
                  View on IPFS
                </Button>
              </div>
            </div>
          </Card>
        )}
      </div>

      {/* Timeline */}
      <Card className="p-6 glass-card border border-border/50">
        <h3 className="text-lg font-semibold text-text-primary mb-4">
          Dispute Timeline
        </h3>
        <div className="space-y-4">
          {timeline.map((event, index) => (
            <div key={index} className="flex gap-4">
              <div className="flex flex-col items-center">
                <div className="w-3 h-3 rounded-full bg-primary" />
                {index < timeline.length - 1 && (
                  <div className="w-0.5 flex-1 bg-border mt-2" />
                )}
              </div>
              <div className="flex-1 pb-4">
                <div className="flex items-center gap-2 mb-1">
                  <p className="text-sm font-semibold text-text-primary">
                    {event.event.replace(/_/g, ' ')}
                  </p>
                  <p className="text-xs text-text-secondary">
                    {event.timestamp.toLocaleString()}
                  </p>
                </div>
                <p className="text-sm text-text-secondary mb-2">{event.details}</p>
                <div className="flex items-center gap-2 text-xs">
                  <span className="text-text-secondary">By:</span>
                  <span className="text-text-primary font-mono">
                    {event.actor.slice(0, 10)}...
                  </span>
                  <a
                    href={`https://explorer.story.foundation/tx/${event.txHash}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary hover:underline flex items-center gap-1"
                  >
                    View tx
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
