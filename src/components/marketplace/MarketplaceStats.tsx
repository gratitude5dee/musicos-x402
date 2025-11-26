import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useMarketplaceStore } from '@/stores/marketplaceStore';
import { TrendingUp, ShoppingCart, DollarSign, Users } from 'lucide-react';
import { motion } from 'framer-motion';

export function MarketplaceStats() {
  const { stats } = useMarketplaceStore();

  const statItems = [
    { title: 'Total Listings', value: stats.totalListings, subtitle: `${stats.activeListings} active`, icon: ShoppingCart },
    { title: 'Total Volume', value: `${stats.totalVolume} ETH`, subtitle: 'All-time trading volume', icon: DollarSign },
    { title: 'Average Price', value: `${stats.averagePrice} ETH`, subtitle: 'Across all listings', icon: TrendingUp },
    { title: 'Top Sellers', value: stats.topSellers.length, subtitle: 'Active sellers', icon: Users }
  ];

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {statItems.map((stat, i) => (
        <motion.div
          key={stat.title}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: i * 0.1 }}
        >
          <Card className="glass-card border border-border/50">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-[hsl(var(--text-primary))]">{stat.title}</CardTitle>
              <stat.icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-[hsl(var(--text-primary))]">{stat.value}</div>
              <p className="text-xs text-[hsl(var(--text-secondary))]">
                {stat.subtitle}
              </p>
            </CardContent>
          </Card>
        </motion.div>
      ))}
    </div>
  );
}
