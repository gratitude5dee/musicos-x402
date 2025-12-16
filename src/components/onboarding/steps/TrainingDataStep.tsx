import React, { useCallback, useEffect, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { Button } from '@/components/ui/button';
import { ArrowLeft, ArrowRight, UploadCloud, File, Video, Mic, CheckCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import { useOnboardingNavigation } from '@/hooks/useOnboardingNavigation';
import { useOnboarding } from '@/context/OnboardingContext';
import { useContentManager } from '@/hooks/useContentManager';
import { useToast } from '@/hooks/use-toast';
import NavigationHint from '../NavigationHint';

// Holographic File Card
const HolographicFileCard = ({ file, status, index }) => {
  const getFileIcon = (type) => {
    const iconClass = "h-5 w-5 mr-3";
    if (type === 'image') return <File className={`${iconClass} text-cyan-400`}/>;
    if (type === 'video') return <Video className={`${iconClass} text-purple-400`}/>;
    if (type === 'voice') return <Mic className={`${iconClass} text-orange-400`}/>;
    return <File className={`${iconClass} text-white/40`}/>;
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: -30 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.05, type: "spring", stiffness: 200 }}
      className="relative bg-white/[0.02] border border-white/[0.06] p-4 rounded-xl"
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          {getFileIcon(file.type)}
          <span className="text-white/80 font-medium text-sm">{file.name}</span>
        </div>
        
        {status?.error ? (
          <span className="text-sm text-red-400">Failed</span>
        ) : !status?.completed ? (
          <div className="w-20 h-1.5 bg-white/10 rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-gradient-to-r from-cyan-400 to-purple-400 rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${status?.progress ?? 0}%` }}
            />
          </div>
        ) : (
          <CheckCircle className="h-5 w-5 text-cyan-400"/>
        )}
      </div>
    </motion.div>
  );
};

type LocalUpload = { id: string; name: string; type: 'image' | 'video' | 'voice' };
type FileStatus = { progress: number; completed: boolean; error?: boolean };

const TrainingDataStep = ({ onNext, onBack }) => {
  const [uploadedFiles, setUploadedFiles] = useState<LocalUpload[]>([]);
  const [fileStatuses, setFileStatuses] = useState<Record<string, FileStatus>>({});
  const { uploadedFiles: onboardingFiles, addUploadedFile } = useOnboarding();
  const { uploadFile } = useContentManager();
  const { toast } = useToast();
  const { handleAreaClick } = useOnboardingNavigation({
    onNext,
    onBack,
    disabled: false
  });

  useEffect(() => {
    if (onboardingFiles.length === 0) return;

    setUploadedFiles(prev => {
      if (prev.length > 0) return prev;
      return onboardingFiles.map(file => ({
        id: file.storagePath || `${file.name}-${file.uploadedAt}`,
        name: file.name,
        type: file.type
      }));
    });

    setFileStatuses(prev => {
      if (Object.keys(prev).length > 0) return prev;
      return onboardingFiles.reduce((acc, file) => {
        const key = file.storagePath || `${file.name}-${file.uploadedAt}`;
        acc[key] = { progress: 100, completed: true, error: false };
        return acc;
      }, {} as Record<string, FileStatus>);
    });
  }, [onboardingFiles]);

  const mapToTrainingType = (mimeType: string) => {
    if (mimeType.startsWith('image')) return 'image';
    if (mimeType.startsWith('video')) return 'video';
    return 'voice';
  };

  const normalizeContentType = (type: 'audio' | 'video' | 'image' | 'document') => {
    if (type === 'audio') return 'voice';
    if (type === 'video') return 'video';
    if (type === 'image') return 'image';
    return 'voice';
  };

  const onDrop = useCallback(async (acceptedFiles) => {
    for (const file of acceptedFiles) {
      const trainingType = mapToTrainingType(file.type);
      const fileId = `${Date.now()}-${Math.random().toString(36).slice(2)}-${file.name}`;

      setUploadedFiles(prev => {
        if (prev.some(existing => existing.id === fileId)) return prev;
        return [...prev, { id: fileId, name: file.name, type: trainingType }];
      });
      setFileStatuses(prev => ({
        ...prev,
        [fileId]: { progress: 10, completed: false, error: false }
      }));

      try {
        setFileStatuses(prev => ({
          ...prev,
          [fileId]: { ...(prev[fileId] || {}), progress: 50, completed: false, error: false }
        }));

        const uploadResult = await uploadFile(file);

        if (!uploadResult) {
          throw new Error('Upload failed');
        }

        const normalizedType = normalizeContentType(uploadResult.fileType);

        addUploadedFile({
          name: file.name,
          type: normalizedType,
          size: file.size,
          url: uploadResult.signedUrl ?? '',
          storagePath: uploadResult.filePath,
          mimeType: file.type,
          uploadedAt: new Date().toISOString()
        });

        setFileStatuses(prev => ({
          ...prev,
          [fileId]: { progress: 100, completed: true, error: false }
        }));
      } catch (error) {
        console.error('Error uploading training file', error);
        setFileStatuses(prev => ({
          ...prev,
          [fileId]: { progress: 0, completed: false, error: true }
        }));
        toast({
          title: 'Upload failed',
          description: 'We could not upload this file. Please try again.',
          variant: 'destructive'
        });
      }
    }
  }, [addUploadedFile, toast, uploadFile]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {'image/*':[], 'video/*':[], 'audio/*':[]}
  });

  return (
    <div 
      className="relative p-8 lg:p-10 rounded-3xl bg-white/[0.03] backdrop-blur-2xl border border-white/[0.08] shadow-2xl max-w-3xl mx-auto cursor-pointer"
      onClick={handleAreaClick}
      role="button"
      tabIndex={0}
    >
      {/* Subtle gradient overlay */}
      <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-purple-500/5 via-transparent to-cyan-500/5 pointer-events-none" />
      
      <div className="relative">
        <div className="text-center mb-8">
          <h2 className="text-2xl lg:text-3xl font-bold text-white mb-2">Training Data Upload</h2>
          <p className="text-white/50">Upload files to train your AI agent, or skip this step</p>
        </div>

        {/* Upload Area */}
        <div
          {...getRootProps()}
          className={`
            border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all duration-300 dropzone
            ${isDragActive 
              ? 'border-cyan-400/50 bg-cyan-400/5' 
              : 'border-white/10 hover:border-white/20 bg-white/[0.01]'
            }
          `}
          data-interactive="true"
          onClick={(e) => e.stopPropagation()}
        >
          <input {...getInputProps()} />
          <UploadCloud className="h-10 w-10 text-white/30 mx-auto mb-4" />
          <p className="text-white/70 mb-2">
            {isDragActive ? 'Drop files here...' : 'Drag & drop files here, or click to select'}
          </p>
          <p className="text-white/40 text-sm">Supports images, videos, and audio files</p>
        </div>

        {/* Uploaded Files */}
        {uploadedFiles.length > 0 && (
          <div className="mt-6">
            <h3 className="text-sm font-medium text-white/60 mb-3">Uploaded Files</h3>
            <div className="space-y-2">
              {uploadedFiles.map((file, index) => (
                <HolographicFileCard
                  key={file.id || file.name}
                  file={file}
                  status={fileStatuses[file.id || file.name] || { progress: 0, completed: false }}
                  index={index}
                />
              ))}
            </div>
          </div>
        )}

        {/* Navigation */}
        <div className="flex justify-between items-center mt-8 pt-6 border-t border-white/[0.06]">
          <Button
            variant="ghost"
            onClick={(e) => { e.stopPropagation(); onBack(); }}
            className="text-white/60 hover:text-white hover:bg-white/5"
          >
            <ArrowLeft className="mr-2 h-4 w-4" /> Back
          </Button>
          <Button
            onClick={(e) => { e.stopPropagation(); onNext(); }}
            className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white border-0"
          >
            {uploadedFiles.length > 0 ? 'Next' : 'Skip'} <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
        
        <NavigationHint showBack className="mt-6" />
      </div>
    </div>
  );
};

export default TrainingDataStep;
