import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { 
  PlayCircle, Shield, Archive, Plus, FolderOpen, 
  Layers, Briefcase, Link2, ShoppingCart, Landmark, FileText 
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { motion } from "framer-motion";

const CommandCenter = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isScanning, setIsScanning] = useState(false);

  const handleHealthCheck = async () => {
    setIsScanning(true);
    toast({ title: 'Running health check...', description: 'Scanning all systems' });
    
    // Simulate health check
    setTimeout(() => {
      setIsScanning(false);
      toast({ 
        title: 'Health check complete', 
        description: 'All systems operational',
        variant: 'default'
      });
    }, 2000);
  };

  const handleSecurityScan = async () => {
    setIsScanning(true);
    toast({ title: 'Security scan initiated...', description: 'Checking vulnerabilities' });
    
    setTimeout(() => {
      setIsScanning(false);
      toast({ 
        title: 'Security scan complete', 
        description: 'No threats detected',
        variant: 'default'
      });
    }, 2000);
  };

  const handleCreateBackup = async () => {
    toast({ title: 'Creating backup...', description: 'Saving current state' });
    
    setTimeout(() => {
      toast({ 
        title: 'Backup created', 
        description: 'System snapshot saved successfully',
        variant: 'default'
      });
    }, 1500);
  };

  const quickActions = [
    { icon: Plus, label: 'Create Agent', path: '/create-agent', color: 'text-blue-500' },
    { icon: FolderOpen, label: 'Asset Library', path: '/library', color: 'text-purple-500' },
    { icon: Layers, label: 'Collection', path: '/collection', color: 'text-green-500' },
    { icon: Briefcase, label: 'Projects', path: '/projects', color: 'text-orange-500' },
    { icon: Link2, label: 'Bridge', path: '/bridge', color: 'text-cyan-500' },
    { icon: ShoppingCart, label: 'Marketplace', path: '/marketplace', color: 'text-pink-500' },
    { icon: FileText, label: 'IP Portal', path: '/rights', color: 'text-indigo-500' },
    { icon: Landmark, label: 'Treasury', path: '/treasury', color: 'text-yellow-500' }
  ];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Action Buttons */}
      <Card className="glass-card lg:col-span-1">
        <CardHeader>
          <CardTitle className="text-[hsl(var(--text-primary))]">System Actions</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <Button 
            onClick={handleHealthCheck}
            disabled={isScanning}
            className="w-full justify-start"
            variant="outline"
          >
            <PlayCircle className="w-4 h-4 mr-2" />
            Run Health Check
          </Button>
          
          <Button 
            onClick={handleSecurityScan}
            disabled={isScanning}
            className="w-full justify-start"
            variant="outline"
          >
            <Shield className="w-4 h-4 mr-2" />
            Security Scan
          </Button>
          
          <Button 
            onClick={handleCreateBackup}
            className="w-full justify-start"
            variant="outline"
          >
            <Archive className="w-4 h-4 mr-2" />
            Create Backup
          </Button>
        </CardContent>
      </Card>

      {/* Quick Access Grid */}
      <Card className="glass-card lg:col-span-2">
        <CardHeader>
          <CardTitle className="text-[hsl(var(--text-primary))]">Quick Access</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {quickActions.map((action, idx) => {
              const Icon = action.icon;
              return (
                <motion.button
                  key={action.label}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.2, delay: idx * 0.05 }}
                  onClick={() => navigate(action.path)}
                  className="flex flex-col items-center justify-center p-4 rounded-lg border border-border hover:bg-accent transition-all hover-scale group"
                >
                  <Icon className={`w-8 h-8 mb-2 ${action.color} group-hover:scale-110 transition-transform`} />
                  <span className="text-sm font-medium text-center text-[hsl(var(--text-primary))]">{action.label}</span>
                </motion.button>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default CommandCenter;
