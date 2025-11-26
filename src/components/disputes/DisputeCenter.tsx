import React, { useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Plus, AlertTriangle, Shield, CheckCircle, XCircle } from 'lucide-react';
import { Dispute } from '@/types/dispute';
import { useNavigate } from 'react-router-dom';
import { type Address } from 'viem';

interface DisputeCenterProps {
  userAddress: Address;
  filter: 'all' | 'initiated' | 'received' | 'resolved';
  disputes: Dispute[];
  onDisputeSelect: (disputeId: string) => void;
}

export function DisputeCenter({
  userAddress,
  filter,
  disputes,
  onDisputeSelect,
}: DisputeCenterProps) {
  const navigate = useNavigate();

  const getStatusIcon = (status: Dispute['status']) => {
    switch (status) {
      case 'RAISED':
        return <AlertTriangle className="w-4 h-4 text-yellow-500" />;
      case 'IN_DISPUTE':
        return <Shield className="w-4 h-4 text-blue-500" />;
      case 'RESOLVED':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'CANCELLED':
        return <XCircle className="w-4 h-4 text-gray-500" />;
    }
  };

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

  const filteredDisputes = disputes.filter((dispute) => {
    if (filter === 'all') return true;
    if (filter === 'initiated') return dispute.initiator === userAddress;
    if (filter === 'received') return dispute.targetIpId === userAddress;
    if (filter === 'resolved') return dispute.status === 'RESOLVED' || dispute.status === 'CANCELLED';
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-text-primary">Dispute Center</h2>
          <p className="text-sm text-text-secondary mt-1">
            Manage IP infringement claims and disputes
          </p>
        </div>
        <Button
          onClick={() => navigate('/disputes/raise')}
          className="bg-primary hover:bg-primary/80"
        >
          <Plus className="w-4 h-4 mr-2" />
          Raise Dispute
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="p-4 glass-card border border-border/50">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-yellow-500/10">
              <AlertTriangle className="w-5 h-5 text-yellow-500" />
            </div>
            <div>
              <p className="text-sm text-text-secondary">Active</p>
              <p className="text-2xl font-bold text-text-primary">
                {disputes.filter(d => d.status === 'RAISED' || d.status === 'IN_DISPUTE').length}
              </p>
            </div>
          </div>
        </Card>

        <Card className="p-4 glass-card border border-border/50">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-blue-500/10">
              <Shield className="w-5 h-5 text-blue-500" />
            </div>
            <div>
              <p className="text-sm text-text-secondary">Initiated</p>
              <p className="text-2xl font-bold text-text-primary">
                {disputes.filter(d => d.initiator === userAddress).length}
              </p>
            </div>
          </div>
        </Card>

        <Card className="p-4 glass-card border border-border/50">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-red-500/10">
              <AlertTriangle className="w-5 h-5 text-red-500" />
            </div>
            <div>
              <p className="text-sm text-text-secondary">Received</p>
              <p className="text-2xl font-bold text-text-primary">
                {disputes.filter(d => d.targetIpId === userAddress).length}
              </p>
            </div>
          </div>
        </Card>

        <Card className="p-4 glass-card border border-border/50">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-green-500/10">
              <CheckCircle className="w-5 h-5 text-green-500" />
            </div>
            <div>
              <p className="text-sm text-text-secondary">Resolved</p>
              <p className="text-2xl font-bold text-text-primary">
                {disputes.filter(d => d.status === 'RESOLVED').length}
              </p>
            </div>
          </div>
        </Card>
      </div>

      {/* Disputes List */}
      <Card className="p-6 glass-card border border-border/50">
        <h3 className="text-lg font-semibold text-text-primary mb-4">
          {filter === 'all' && 'All Disputes'}
          {filter === 'initiated' && 'Disputes I Raised'}
          {filter === 'received' && 'Disputes Against Me'}
          {filter === 'resolved' && 'Resolved Disputes'}
        </h3>

        <div className="space-y-3">
          {filteredDisputes.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-text-secondary">No disputes found</p>
            </div>
          ) : (
            filteredDisputes.map((dispute) => (
              <div
                key={dispute.id}
                onClick={() => onDisputeSelect(dispute.id)}
                className="p-4 rounded-lg bg-background/50 hover:bg-background/70 transition-colors cursor-pointer border border-border/30"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      {getStatusIcon(dispute.status)}
                      <h4 className="font-semibold text-text-primary">
                        {dispute.targetTag.replace(/_/g, ' ')}
                      </h4>
                      <Badge className={getStatusColor(dispute.status)}>
                        {dispute.status}
                      </Badge>
                    </div>
                    <div className="space-y-1 text-sm text-text-secondary">
                      <p>Target IP: {dispute.targetIpId.slice(0, 10)}...</p>
                      <p>Initiated by: {dispute.initiator.slice(0, 10)}...</p>
                      <p>
                        Date: {new Date(dispute.disputeTimestamp).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <Button variant="outline" size="sm">
                    View Details
                  </Button>
                </div>
              </div>
            ))
          )}
        </div>
      </Card>
    </div>
  );
}
