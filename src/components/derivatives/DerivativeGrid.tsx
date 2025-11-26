import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search, GitBranch, ExternalLink, CheckCircle2, Clock, XCircle } from 'lucide-react';
import type { DerivativeWork } from '@/types/derivative';

interface DerivativeGridProps {
  derivatives: DerivativeWork[];
  onSelect: (derivative: DerivativeWork) => void;
}

export function DerivativeGrid({ derivatives, onSelect }: DerivativeGridProps) {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all');

  const filteredDerivatives = derivatives.filter((d) => {
    const matchesSearch = d.name.toLowerCase().includes(search.toLowerCase()) ||
      d.description.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === 'all' || d.status === statusFilter;
    const matchesType = typeFilter === 'all' || d.derivativeType === typeFilter;
    return matchesSearch && matchesStatus && matchesType;
  });

  const getStatusIcon = (status: DerivativeWork['status']) => {
    switch (status) {
      case 'active':
        return <CheckCircle2 className="h-4 w-4" />;
      case 'pending':
        return <Clock className="h-4 w-4" />;
      case 'rejected':
        return <XCircle className="h-4 w-4" />;
      default:
        return null;
    }
  };

  const getStatusColor = (status: DerivativeWork['status']) => {
    switch (status) {
      case 'active':
        return 'bg-green-500/10 text-green-500 border-green-500/20';
      case 'pending':
        return 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20';
      case 'rejected':
        return 'bg-red-500/10 text-red-500 border-red-500/20';
      default:
        return 'bg-gray-500/10 text-gray-500 border-gray-500/20';
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search derivatives..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-full sm:w-[180px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="rejected">Rejected</SelectItem>
          </SelectContent>
        </Select>
        <Select value={typeFilter} onValueChange={setTypeFilter}>
          <SelectTrigger className="w-full sm:w-[180px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            <SelectItem value="remix">Remix</SelectItem>
            <SelectItem value="adaptation">Adaptation</SelectItem>
            <SelectItem value="translation">Translation</SelectItem>
            <SelectItem value="compilation">Compilation</SelectItem>
            <SelectItem value="other">Other</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {filteredDerivatives.length === 0 ? (
        <Card className="p-12 text-center">
          <GitBranch className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
          <p className="text-muted-foreground">No derivatives found</p>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredDerivatives.map((derivative) => (
            <Card key={derivative.id} className="p-4 hover:shadow-lg transition-shadow">
              <div className="space-y-3">
                <div className="flex items-start justify-between">
                  <Badge variant="outline" className="capitalize">
                    {derivative.derivativeType}
                  </Badge>
                  <Badge variant="outline" className={getStatusColor(derivative.status)}>
                    <span className="flex items-center gap-1">
                      {getStatusIcon(derivative.status)}
                      {derivative.status}
                    </span>
                  </Badge>
                </div>

                <div>
                  <h3 className="font-semibold text-lg">{derivative.name}</h3>
                  <p className="text-sm text-muted-foreground line-clamp-2 mt-1">
                    {derivative.description}
                  </p>
                </div>

                {derivative.metadata.originalWork && (
                  <div className="text-sm">
                    <span className="text-muted-foreground">Original:</span>{' '}
                    <span className="font-medium">{derivative.metadata.originalWork}</span>
                  </div>
                )}

                <div className="flex items-center justify-between text-sm">
                  <div>
                    <span className="text-muted-foreground">Royalty Share:</span>{' '}
                    <span className="font-semibold">{derivative.royaltyShare}%</span>
                  </div>
                  {derivative.commercialUse && (
                    <Badge variant="secondary" className="text-xs">
                      Commercial Use
                    </Badge>
                  )}
                </div>

                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => onSelect(derivative)}
                >
                  View Details
                  <ExternalLink className="h-4 w-4 ml-2" />
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
