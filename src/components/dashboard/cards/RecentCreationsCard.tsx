'use client';

import { Music, ExternalLink, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { useContentManager } from '@/hooks/useContentManager';
import { VinylStrip } from './VinylStrip';
import { useNavigate } from 'react-router-dom';

export function RecentCreationsCard() {
  const { contentItems, loading } = useContentManager();
  const navigate = useNavigate();

  // Map content items to vinyl format
  const vinylItems = contentItems.slice(0, 8).map(item => ({
    id: item.id,
    title: item.title,
    subtitle: item.file_type,
    image: item.signed_url || item.thumbnail_url || undefined,
  }));

  // Mock data for empty state
  const mockItems = [
    { id: '1', title: 'Track 1', subtitle: 'audio' },
    { id: '2', title: 'Design', subtitle: 'image' },
    { id: '3', title: 'Video', subtitle: 'video' },
    { id: '4', title: 'Document', subtitle: 'document' },
    { id: '5', title: 'Music', subtitle: 'audio' },
  ];

  const displayItems = vinylItems.length > 0 ? vinylItems : mockItems;

  const handleSelect = (item: { id: string }) => {
    navigate(`/asset-library?item=${item.id}`);
  };

  return (
    <motion.div
      initial={{ opacity: 1 }}
      className="liquid-glass-card p-4 md:p-6 h-full"
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-lg bg-primary/10">
            <Music className="w-4 h-4 text-primary" />
          </div>
          <h3 className="font-semibold text-foreground">Recent Creations</h3>
        </div>
        <button
          onClick={() => navigate('/asset-library')}
          className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1 transition-colors"
        >
          View All
          <ExternalLink className="w-3 h-3" />
        </button>
      </div>

      {/* Content */}
      {loading ? (
        <div className="flex items-center justify-center py-8">
          <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
        </div>
      ) : (
        <div className="pt-2 pb-6">
          <VinylStrip items={displayItems} onSelect={handleSelect} />
        </div>
      )}

      {/* Empty state hint */}
      {!loading && vinylItems.length === 0 && (
        <p className="text-xs text-muted-foreground text-center mt-2">
          Upload content to see your creations here
        </p>
      )}
    </motion.div>
  );
}
