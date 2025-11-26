import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Play,
  Pause,
  SkipForward,
  SkipBack,
  Volume2,
  Heart,
  MoreHorizontal,
  Plus,
  Mic,
  Upload,
  Sparkles,
  Download,
  Clock,
  Radio,
  Loader2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Slider } from '@/components/ui/slider';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import type { Database } from '@/integrations/supabase/types';
import { useAuth } from '@/context/AuthContext';

interface PodcastOutlineSection {
  title: string;
  description?: string;
  talkingPoints?: string[];
}

interface PodcastSegmentMeta {
  title: string;
  summary: string;
  script: string;
}

interface Podcast {
  id: string;
  user_id: string;
  title: string;
  description: string | null;
  script: string | null;
  audio_url: string;
  audio_signed_url?: string | null;
  audio_format: string | null;
  voice_id: string | null;
  style: string | null;
  duration_seconds: number | null;
  file_size: number | null;
  show_notes: string | null;
  outline: PodcastOutlineSection[] | null;
  segments: PodcastSegmentMeta[] | null;
  created_at: string;
  updated_at: string;
}

type PodcastRow = Database['public']['Tables']['podcasts']['Row'];

interface PodcastFunctionResponse {
  success: boolean;
  error?: string;
  podcast?: PodcastRow;
}

const parseOutline = (value: PodcastRow['outline']): PodcastOutlineSection[] | null => {
  const rawValue = value as unknown;
  if (!rawValue || !Array.isArray(rawValue)) {
    return null;
  }

  const sections = (rawValue as unknown[])
    .map((item) => {
      if (!item || typeof item !== 'object') {
        return null;
      }

      const section = item as Record<string, unknown>;
      const talkingPointsRaw = section.talkingPoints;

      return {
        title: typeof section.title === 'string' ? section.title : 'Section',
        description: typeof section.description === 'string' ? section.description : undefined,
        talkingPoints: Array.isArray(talkingPointsRaw)
          ? talkingPointsRaw.filter((point): point is string => typeof point === 'string')
          : undefined,
      } as PodcastOutlineSection;
    })
    .filter((section): section is NonNullable<typeof section> => section !== null);

  return sections;
};

const parseSegments = (value: PodcastRow['segments']): PodcastSegmentMeta[] | null => {
  const rawValue = value as unknown;
  if (!rawValue || !Array.isArray(rawValue)) {
    return null;
  }

  return (rawValue as unknown[])
    .map((item) => {
      if (!item || typeof item !== 'object') {
        return null;
      }

      const segment = item as Record<string, unknown>;
      const title = typeof segment.title === 'string' ? segment.title : 'Segment';
      const summary = typeof segment.summary === 'string' ? segment.summary : '';
      const script = typeof segment.script === 'string' ? segment.script : '';

      return { title, summary, script } satisfies PodcastSegmentMeta;
    })
    .filter((item): item is PodcastSegmentMeta => Boolean(item));
};

const normalizePodcast = (row: PodcastRow): Podcast => ({
  id: row.id,
  user_id: row.user_id,
  title: row.title,
  description: row.description,
  script: row.script,
  audio_url: row.audio_url,
  audio_signed_url: row.audio_signed_url ?? null,
  audio_format: row.audio_format ?? null,
  voice_id: row.voice_id,
  style: row.style,
  duration_seconds: row.duration_seconds ?? null,
  file_size: row.file_size,
  show_notes: row.show_notes ?? null,
  outline: parseOutline(row.outline),
  segments: parseSegments(row.segments),
  created_at: row.created_at,
  updated_at: row.updated_at ?? row.created_at,
});

interface Voice {
  voice_id: string;
  name: string;
  category: string;
  description?: string;
  labels: Record<string, string>;
}

const GenerativePodcastsInterface = () => {
  const [currentPodcast, setCurrentPodcast] = useState<Podcast | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [volume, setVolume] = useState(0.8);
  const [podcasts, setPodcasts] = useState<Podcast[]>([]);
  const [voices, setVoices] = useState<Voice[]>([]);
  const [isLoadingPodcasts, setIsLoadingPodcasts] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isLoadingVoices, setIsLoadingVoices] = useState(true);
  
  // Generation form state
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [script, setScript] = useState('');
  const [selectedVoice, setSelectedVoice] = useState('');
  const [podcastStyle, setPodcastStyle] = useState('conversational');
  
  // Voice cloning state
  const [voiceName, setVoiceName] = useState('');
  const [voiceDescription, setVoiceDescription] = useState('');
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);

  const audioRef = useRef<HTMLAudioElement>(null);
  const { toast } = useToast();
  const { user, isLoading: authLoading } = useAuth();

  const getDurationMinutes = (seconds?: number | null) => {
    if (!seconds || seconds <= 0) {
      return 0;
    }

    return Math.max(1, Math.round(seconds / 60));
  };

  const formatDurationLabel = (seconds?: number | null) => {
    if (!seconds || seconds <= 0) {
      return "0:00";
    }

    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const fetchPodcasts = useCallback(async () => {
    try {
      setIsLoadingPodcasts(true);

      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError) {
        throw userError;
      }

      if (!user) {
        setPodcasts([]);
        return;
      }

      const { data, error } = await supabase
        .from('podcasts')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) {
        throw error;
      }

      const podcastRows = (data as PodcastRow[] | null) ?? [];

      if (podcastRows.length === 0) {
        setPodcasts([]);
        return;
      }

      const audioPaths = podcastRows.map((podcast) => podcast.audio_url);
      let signedUrls: { signedUrl: string }[] | null = null;

      if (audioPaths.length > 0) {
        const { data: signedUrlData, error: signedError } = await supabase.storage
          .from('podcast-audio')
          .createSignedUrls(audioPaths, 60 * 60); // 1 hour

        if (signedError) {
          throw signedError;
        }

        signedUrls = signedUrlData ?? null;
      }

      const podcastsWithUrls: Podcast[] = podcastRows.map((row, index) => {
        const normalized = normalizePodcast(row);
        return {
          ...normalized,
          audio_signed_url: normalized.audio_signed_url ?? signedUrls?.[index]?.signedUrl ?? null,
        };
      });

      setPodcasts(podcastsWithUrls);
    } catch (error) {
      console.error('Error loading podcasts:', error);
      toast({
        title: "Error",
        description: "Failed to load podcasts. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoadingPodcasts(false);
    }
  }, [toast]);

  const ensureSignedUrl = useCallback(async (podcast: Podcast) => {
    if (podcast.audio_signed_url) {
      return podcast.audio_signed_url;
    }

    const { data, error } = await supabase.storage
      .from('podcast-audio')
      .createSignedUrl(podcast.audio_url, 60 * 60);

    if (error) {
      throw error;
    }

    const signedUrl = data?.signedUrl ?? null;

    if (signedUrl) {
      setPodcasts((prev) =>
        prev.map((item) =>
          item.id === podcast.id ? { ...item, audio_signed_url: signedUrl } : item
        )
      );

      setCurrentPodcast((prev) =>
        prev && prev.id === podcast.id
          ? { ...prev, audio_signed_url: signedUrl }
          : prev
      );
    }

    return signedUrl;
  }, []);

  useEffect(() => {
    fetchPodcasts();
  }, [fetchPodcasts]);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume;
    }
  }, [volume]);

  const loadVoices = useCallback(async () => {
    try {
      setIsLoadingVoices(true);
      const { data, error } = await supabase.functions.invoke('voice-management', {
        body: {},
      });

      if (error) throw error;
      if (!data?.success) {
        throw new Error(data?.error || 'Unable to load voices');
      }

      const authorizedVoices: Voice[] = data.voices || [];
      setVoices(authorizedVoices);
      if (authorizedVoices.length > 0) {
        setSelectedVoice(authorizedVoices[0].voice_id);
      } else {
        setSelectedVoice('');
      }
    } catch (error) {
      console.error('Error loading voices:', error);
      toast({
        title: "Error",
        description: "Failed to load voices. Please check your ElevenLabs API configuration.",
        variant: "destructive",
      });
    } finally {
      setIsLoadingVoices(false);
    }
  }, [toast]);

  // Load voices on component mount
  useEffect(() => {
    loadVoices();
  }, [loadVoices]);

  const generatePodcast = async () => {
    if (!title || !script || !selectedVoice) {
      toast({
        title: "Missing Information",
        description: "Please fill in title, script, and select a voice.",
        variant: "destructive",
      });
      return;
    }

    if (!user) {
      toast({
        title: "Authentication required",
        description: "Please sign in to generate and save podcasts.",
        variant: "destructive",
      });
      return;
    }

    setIsGenerating(true);

    try {
      const { data, error } = await supabase.functions.invoke<PodcastFunctionResponse>('podcast-generator', {
        body: {
          title,
          description,
          script,
          voiceId: selectedVoice,
          style: podcastStyle,
        },
      });

      if (error) throw error;

      const response = data as PodcastFunctionResponse | null;

      if (!response?.success || !response.podcast) {
        throw new Error(response?.error || 'Failed to generate podcast');
      }

      const normalizedPodcast = normalizePodcast(response.podcast);

      let audioSignedUrl = normalizedPodcast.audio_signed_url;
      if (!audioSignedUrl) {
        const { data: signed, error: signedError } = await supabase.storage
          .from('podcast-audio')
          .createSignedUrl(normalizedPodcast.audio_url, 60 * 60);

        if (!signedError) {
          audioSignedUrl = signed?.signedUrl ?? null;
        }
      }

      const podcastWithUrl: Podcast = {
        ...normalizedPodcast,
        audio_signed_url: audioSignedUrl ?? null,
      };

      setPodcasts((prev) => [podcastWithUrl, ...prev]);
      setCurrentPodcast(podcastWithUrl);
      setProgress(0);

      // Clear form
      setTitle('');
      setDescription('');
      setScript('');

      toast({
        title: "Podcast Generated!",
        description: `"${podcastWithUrl.title}" has been created successfully.`,
      });

    } catch (error) {
      console.error('Error generating podcast:', error);
      const message = error instanceof Error ? error.message : 'Failed to generate podcast. Please try again.';
      toast({
        title: "Generation Failed",
        description: message,
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const cloneVoice = async () => {
    if (!voiceName || uploadedFiles.length === 0) {
      toast({
        title: "Missing Information",
        description: "Please provide a voice name and upload audio samples.",
        variant: "destructive",
      });
      return;
    }

    try {
      const { data: sessionData } = await supabase.auth.getSession();
      const session = sessionData?.session;

      if (!session) {
        toast({
          title: "Authentication Required",
          description: "Please sign in to clone a voice.",
          variant: "destructive",
        });
        return;
      }

      const formData = new FormData();
      formData.append('name', voiceName);
      formData.append('description', voiceDescription);
      uploadedFiles.forEach(file => {
        formData.append('files', file);
      });

      const { data, error } = await supabase.functions.invoke('voice-management', {
        body: { 
          action: 'clone',
          name: voiceName,
          description: voiceDescription,
          files: uploadedFiles 
        },
      });

      if (error) throw error;

      if (!data?.success) {
        throw new Error(data?.error || 'Failed to clone voice');
      }

      setVoiceName('');
      setVoiceDescription('');
      setUploadedFiles([]);
      loadVoices(); // Refresh voice list

      toast({
        title: "Voice Cloned!",
        description: "Your voice has been cloned successfully.",
      });

    } catch (error) {
      console.error('Error cloning voice:', error);
      const errorMessage = error instanceof Error ? error.message : "Failed to clone voice. Please try again.";
      toast({
        title: "Cloning Failed",
        description: errorMessage,
        variant: "destructive",
      });
    }
  };

  const playPodcast = async (podcast: Podcast) => {
    try {
      const isSamePodcast = currentPodcast?.id === podcast.id;

      if (isSamePodcast && isPlaying) {
        setIsPlaying(false);
        audioRef.current?.pause();
        return;
      }

      const signedUrl = await ensureSignedUrl(podcast);

      if (!signedUrl || !audioRef.current) {
        throw new Error('Audio not available for playback.');
      }

      if (!isSamePodcast || audioRef.current.src !== signedUrl) {
        audioRef.current.src = signedUrl;
        if (!isSamePodcast) {
          audioRef.current.currentTime = 0;
          setProgress(0);
        }
      }

      audioRef.current.volume = volume;
      await audioRef.current.play();
      setIsPlaying(true);
      setCurrentPodcast({ ...podcast, audio_signed_url: signedUrl });
    } catch (error) {
      console.error('Error playing podcast:', error);
      setIsPlaying(false);
      toast({
        title: "Playback error",
        description:
          error instanceof Error
            ? error.message
            : "We couldn't play this podcast. Please try again.",
        variant: "destructive",
      });
    }
  };

  const downloadPodcast = async (podcast: Podcast) => {
    try {
      const signedUrl = await ensureSignedUrl(podcast);

      if (!signedUrl) {
        throw new Error('Audio not available for download.');
      }

      const link = document.createElement('a');
      link.href = signedUrl;
      link.download = `${podcast.title}.mp3`;
      link.rel = 'noopener';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error('Error downloading podcast:', error);
      toast({
        title: "Download failed",
        description:
          error instanceof Error
            ? error.message
            : "We couldn't download this podcast. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="h-full flex flex-col bg-gradient-to-br from-gray-900 via-black to-gray-800 text-white overflow-hidden">
      {/* Audio element for playback */}
      <audio
        ref={audioRef}
        onTimeUpdate={(e) => {
          const audio = e.target as HTMLAudioElement;
          if (audio.duration) {
            setProgress((audio.currentTime / audio.duration) * 100);
          }
        }}
        onEnded={() => {
          setIsPlaying(false);
          setProgress(0);
        }}
        onPlay={() => setIsPlaying(true)}
        onPause={() => setIsPlaying(false)}
      />

      {/* Header */}
      <div className="flex-shrink-0 p-6 border-b border-gray-800">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-green-400 to-blue-500 bg-clip-text text-transparent">
              Generative Podcasts
            </h1>
            <p className="text-gray-400 mt-1">Create AI-powered podcasts with custom voices</p>
          </div>
          
          <div className="flex gap-3">
            <Dialog>
              <DialogTrigger asChild>
                <Button className="bg-green-600 hover:bg-green-700 text-white">
                  <Plus className="w-4 h-4 mr-2" />
                  Generate Podcast
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl bg-gray-900 border-gray-700">
                <DialogHeader>
                  <DialogTitle className="text-green-400">Generate New Podcast</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="title">Podcast Title</Label>
                    <Input
                      id="title"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      placeholder="Enter podcast title"
                      className="bg-gray-800 border-gray-600"
                    />
                  </div>
                  <div>
                    <Label htmlFor="description">Description (Optional)</Label>
                    <Input
                      id="description"
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      placeholder="Brief description"
                      className="bg-gray-800 border-gray-600"
                    />
                  </div>
                  <div>
                    <Label htmlFor="script">Script or Topic</Label>
                    <Textarea
                      id="script"
                      value={script}
                      onChange={(e) => setScript(e.target.value)}
                      placeholder="Enter your podcast script or just a topic (AI will expand it)"
                      rows={4}
                      className="bg-gray-800 border-gray-600"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="voice">Voice</Label>
                      <Select value={selectedVoice} onValueChange={setSelectedVoice}>
                        <SelectTrigger className="bg-gray-800 border-gray-600">
                          <SelectValue placeholder="Select voice" />
                        </SelectTrigger>
                        <SelectContent className="bg-gray-800 border-gray-600">
                          {voices.map((voice) => (
                            <SelectItem key={voice.voice_id} value={voice.voice_id}>
                              {voice.name} ({voice.category})
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="style">Style</Label>
                      <Select value={podcastStyle} onValueChange={setPodcastStyle}>
                        <SelectTrigger className="bg-gray-800 border-gray-600">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="bg-gray-800 border-gray-600">
                          <SelectItem value="conversational">Conversational</SelectItem>
                          <SelectItem value="news">News Style</SelectItem>
                          <SelectItem value="storytelling">Storytelling</SelectItem>
                          <SelectItem value="educational">Educational</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <Button 
                    onClick={generatePodcast} 
                    disabled={isGenerating || !title || !script || !selectedVoice}
                    className="w-full bg-green-600 hover:bg-green-700"
                  >
                    {isGenerating ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />
                        Generating...
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-4 h-4 mr-2" />
                        Generate Podcast
                      </>
                    )}
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
            
            <Dialog>
              <DialogTrigger asChild>
                <Button variant="outline" className="border-gray-600 hover:bg-gray-800">
                  <Mic className="w-4 h-4 mr-2" />
                  Clone Voice
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-xl bg-gray-900 border-gray-700">
                <DialogHeader>
                  <DialogTitle className="text-blue-400">Clone Voice</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="voiceName">Voice Name</Label>
                    <Input
                      id="voiceName"
                      value={voiceName}
                      onChange={(e) => setVoiceName(e.target.value)}
                      placeholder="Enter voice name"
                      className="bg-gray-800 border-gray-600"
                    />
                  </div>
                  <div>
                    <Label htmlFor="voiceDescription">Description (Optional)</Label>
                    <Input
                      id="voiceDescription"
                      value={voiceDescription}
                      onChange={(e) => setVoiceDescription(e.target.value)}
                      placeholder="Describe the voice"
                      className="bg-gray-800 border-gray-600"
                    />
                  </div>
                  <div>
                    <Label htmlFor="audioFiles">Audio Samples</Label>
                    <div className="border-2 border-dashed border-gray-600 rounded-lg p-4 text-center">
                      <input
                        type="file"
                        multiple
                        accept="audio/*"
                        onChange={(e) => setUploadedFiles(Array.from(e.target.files || []))}
                        className="hidden"
                        id="audioFiles"
                      />
                      <label htmlFor="audioFiles" className="cursor-pointer">
                        <Upload className="w-8 h-8 mx-auto mb-2 text-gray-400" />
                        <p className="text-gray-400">Upload audio samples (MP3, WAV)</p>
                        <p className="text-xs text-gray-500 mt-1">At least 1 minute of clear audio recommended</p>
                      </label>
                      {uploadedFiles.length > 0 && (
                        <div className="mt-2">
                          <p className="text-sm text-green-400">{uploadedFiles.length} files selected</p>
                        </div>
                      )}
                    </div>
                  </div>
                  <Button 
                    onClick={cloneVoice} 
                    disabled={!voiceName || uploadedFiles.length === 0}
                    className="w-full bg-blue-600 hover:bg-blue-700"
                  >
                    <Mic className="w-4 h-4 mr-2" />
                    Clone Voice
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        <div className="flex-1 p-6 overflow-y-auto">
          {isLoadingPodcasts ? (
            <div className="flex flex-col items-center justify-center h-full text-center">
              <div className="w-12 h-12 border-4 border-gray-700 border-t-green-500 rounded-full animate-spin mb-4" />
              <p className="text-gray-400">Loading your podcasts...</p>
            </div>
          ) : podcasts.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center">
              <div className="bg-gray-800 rounded-full p-6 mb-6">
                <Radio className="w-12 h-12 text-green-400" />
              </div>
              <h3 className="text-xl font-semibold mb-2">No podcasts yet</h3>
              <p className="text-gray-400 mb-6 max-w-md">
                Create your first AI-generated podcast with custom voices and scripts
              </p>
              <Dialog>
                <DialogTrigger asChild>
                  <Button className="bg-green-600 hover:bg-green-700">
                    <Plus className="w-4 h-4 mr-2" />
                    Generate Your First Podcast
                  </Button>
                </DialogTrigger>
              </Dialog>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {podcasts.map((podcast) => {
                const durationMinutes = getDurationMinutes(podcast.duration_seconds);

                return (
                  <motion.div
                    key={podcast.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="group"
                  >
                    <Card className="bg-gray-800/50 border-gray-700 hover:bg-gray-800/70 transition-all duration-200 overflow-hidden">
                    <div className="relative">
                      <div className="aspect-square bg-gradient-to-br from-green-500/20 to-blue-500/20 flex items-center justify-center">
                        <div className="w-16 h-16 rounded-full bg-gradient-to-br from-green-400 to-blue-500 flex items-center justify-center">
                          <Radio className="w-8 h-8 text-white" />
                        </div>
                      </div>
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <Button
                          size="lg"
                          onClick={() => void playPodcast(podcast)}
                          className="rounded-full w-12 h-12 bg-green-600 hover:bg-green-700"
                        >
                          {currentPodcast?.id === podcast.id && isPlaying ? (
                            <Pause className="w-6 h-6" />
                          ) : (
                            <Play className="w-6 h-6 ml-1" />
                          )}
                        </Button>
                      </div>
                    </div>

                    <div className="p-4">
                      <h3 className="font-semibold text-white truncate mb-1">{podcast.title}</h3>
                      <p className="text-sm text-gray-400 mb-3 line-clamp-2">
                        {podcast.description || 'AI-generated podcast episode'}
                      </p>

                      <div className="flex items-center justify-between text-xs text-gray-500 mb-3">
                        <div className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {durationMinutes > 0 ? `${durationMinutes} min` : '—'}
                        </div>
                        <Badge variant="outline" className="border-gray-600 text-gray-400">
                          {podcast.style || 'custom'}
                        </Badge>
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => void playPodcast(podcast)}
                            className="hover:bg-gray-700"
                          >
                            {currentPodcast?.id === podcast.id && isPlaying ? (
                              <Pause className="w-4 h-4" />
                            ) : (
                              <Play className="w-4 h-4" />
                            )}
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => void downloadPodcast(podcast)}
                            className="hover:bg-gray-700"
                          >
                            <Download className="w-4 h-4" />
                          </Button>
                        </div>
                        <Button size="sm" variant="ghost" className="hover:bg-gray-700">
                          <MoreHorizontal className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                    </Card>
                  </motion.div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Now Playing Bar */}
      <AnimatePresence>
        {currentPodcast && (
          <motion.div
            initial={{ y: 100 }}
            animate={{ y: 0 }}
            exit={{ y: 100 }}
            className="flex-shrink-0 bg-gray-900 border-t border-gray-700 p-4"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-gradient-to-br from-green-400 to-blue-500 rounded flex items-center justify-center">
                  <Radio className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h4 className="font-medium text-white">{currentPodcast.title}</h4>
                  <p className="text-sm text-gray-400">Generated Podcast</p>
                </div>
              </div>
              
              <div className="flex items-center gap-4">
                <Button size="sm" variant="ghost" className="hover:bg-gray-800">
                  <SkipBack className="w-4 h-4" />
                </Button>
                <Button
                  size="sm"
                  onClick={() => playPodcast(currentPodcast)}
                  className="bg-green-600 hover:bg-green-700 rounded-full w-10 h-10"
                >
                  {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 ml-0.5" />}
                </Button>
                <Button size="sm" variant="ghost" className="hover:bg-gray-800">
                  <SkipForward className="w-4 h-4" />
                </Button>
              </div>
              
              <div className="flex items-center gap-4">
                <Button size="sm" variant="ghost" className="hover:bg-gray-800">
                  <Heart className="w-4 h-4" />
                </Button>
                <div className="flex items-center gap-2">
                  <Volume2 className="w-4 h-4 text-gray-400" />
                  <Slider
                    value={[volume * 100]}
                    onValueChange={(value) => setVolume(value[0] / 100)}
                    max={100}
                    step={1}
                    className="w-20"
                  />
                </div>
              </div>
            </div>
            
            <div className="mt-4">
              <div className="flex items-center justify-between text-xs text-gray-400 mb-1">
                <span>{formatDurationLabel(audioRef.current?.currentTime ?? 0)}</span>
                <span>{formatDurationLabel(currentPodcast.duration_seconds)}</span>
              </div>
              <div className="w-full bg-gray-700 rounded-full h-1">
                <div 
                  className="bg-green-500 h-1 rounded-full transition-all duration-100"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default GenerativePodcastsInterface;