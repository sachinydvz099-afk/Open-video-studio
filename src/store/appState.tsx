import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import {
  GenerationRequest,
  JobStatusResponse,
} from '../providers/types';
import { ProviderType, providerManager } from '../providers/providerRegistry';
import {
  CreationRecord,
  loadCreations,
  addCreation,
  toggleFavoriteCreation,
  deleteCreation,
  clearAllCreations,
} from './generationHistory';

export type AppTab =
  | 'studio-t2v'
  | 'studio-i2v'
  | 'gallery'
  | 'models'
  | 'settings'
  | 'about';

export interface ToastMessage {
  id: string;
  type: 'info' | 'success' | 'warning' | 'error';
  title: string;
  message?: string;
  durationMs?: number;
}

interface StudioContextType {
  activeTab: AppTab;
  setActiveTab: (tab: AppTab) => void;
  activeProviderType: ProviderType;
  setActiveProviderType: (type: ProviderType) => void;

  // Active Job State
  currentJob: JobStatusResponse | null;
  activeRequest: GenerationRequest | null;
  isGenerating: boolean;
  submitGeneration: (request: GenerationRequest) => Promise<boolean>;
  cancelGeneration: () => Promise<void>;
  retryGeneration: () => Promise<void>;

  // Reuse prompt / settings transfer
  prefillRequest: Partial<GenerationRequest> | null;
  reuseSettings: (record: CreationRecord) => void;
  clearPrefill: () => void;

  // Gallery History
  creations: CreationRecord[];
  refreshCreations: () => void;
  toggleFavorite: (id: string) => void;
  removeCreation: (id: string) => void;
  clearHistory: () => void;

  // Toast System
  toasts: ToastMessage[];
  addToast: (toast: Omit<ToastMessage, 'id'>) => void;
  removeToast: (id: string) => void;
}

const StudioContext = createContext<StudioContextType | undefined>(undefined);

export const StudioProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [activeTab, setActiveTab] = useState<AppTab>('studio-t2v');
  const [activeProviderType, setActiveProviderTypeState] = useState<ProviderType>(providerManager.getActiveType());
  const [currentJob, setCurrentJob] = useState<JobStatusResponse | null>(null);
  const [activeRequest, setActiveRequest] = useState<GenerationRequest | null>(null);
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [prefillRequest, setPrefillRequest] = useState<Partial<GenerationRequest> | null>(null);
  const [creations, setCreations] = useState<CreationRecord[]>([]);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const pollingRef = useRef<any>(null);

  // Load history on mount
  useEffect(() => {
    setCreations(loadCreations());
  }, []);

  const addToast = useCallback((toast: Omit<ToastMessage, 'id'>) => {
    const id = Math.random().toString(36).substring(2, 9);
    const newToast: ToastMessage = { ...toast, id };
    setToasts((prev) => [...prev, newToast]);

    const duration = toast.durationMs || 4500;
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, duration);
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const setActiveProviderType = useCallback((type: ProviderType) => {
    providerManager.setActiveType(type);
    setActiveProviderTypeState(type);
    const provider = providerManager.getActiveProvider();
    addToast({
      type: 'info',
      title: `Switched Provider: ${provider.name}`,
      message:
        type === 'realistic-ai'
          ? 'Photorealistic AI diffusion & temporal motion active.'
          : type === 'demo'
          ? '100% offline simulated GPU generation active.'
          : 'Connected to live inference adapter.',
    });
  }, [addToast]);

  const refreshCreations = useCallback(() => {
    setCreations(loadCreations());
  }, []);

  const toggleFavorite = useCallback((id: string) => {
    const updated = toggleFavoriteCreation(id);
    setCreations(updated);
  }, []);

  const removeCreation = useCallback((id: string) => {
    const updated = deleteCreation(id);
    setCreations(updated);
    addToast({
      type: 'info',
      title: 'Creation Removed',
      message: 'Item deleted from browser history.',
    });
  }, [addToast]);

  const clearHistory = useCallback(() => {
    clearAllCreations();
    setCreations([]);
    addToast({
      type: 'warning',
      title: 'History Cleared',
      message: 'All saved creations have been removed.',
    });
  }, [addToast]);

  const reuseSettings = useCallback((record: CreationRecord) => {
    setPrefillRequest({
      mode: record.mode,
      modelId: record.modelId,
      prompt: record.prompt,
      negativePrompt: record.negativePrompt,
      aspectRatio: record.aspectRatio,
      resolution: record.resolution,
      durationSeconds: record.durationSeconds,
      fps: record.fps,
      seed: record.seed,
      motionStrength: record.motionStrength,
    });
    setActiveTab(record.mode === 'text-to-video' ? 'studio-t2v' : 'studio-i2v');
    addToast({
      type: 'success',
      title: 'Settings Applied',
      message: `Loaded prompt & parameters from "${record.title}".`,
    });
  }, [addToast]);

  const clearPrefill = useCallback(() => {
    setPrefillRequest(null);
  }, []);

  const cancelGeneration = useCallback(async () => {
    if (!currentJob || !activeRequest) return;
    const provider = providerManager.getActiveProvider();
    try {
      await provider.cancelJob(currentJob.jobId);
      if (pollingRef.current) clearInterval(pollingRef.current);
      setIsGenerating(false);
      setCurrentJob((prev) => (prev ? { ...prev, status: 'cancelled' } : null));
      addToast({
        type: 'warning',
        title: 'Generation Cancelled',
        message: 'Job was terminated by user request.',
      });
    } catch (err: any) {
      addToast({
        type: 'error',
        title: 'Cancellation Error',
        message: err.message || 'Could not cancel job.',
      });
    }
  }, [currentJob, activeRequest, addToast]);

  const submitGeneration = useCallback(
    async (request: GenerationRequest): Promise<boolean> => {
      if (isGenerating) {
        addToast({
          type: 'warning',
          title: 'Job Already Running',
          message: 'Please wait for the current generation to finish or cancel it.',
        });
        return false;
      }

      const provider = providerManager.getActiveProvider();
      setIsGenerating(true);
      setActiveRequest(request);

      try {
        const submission = await provider.submitJob(request);
        const initialStatus: JobStatusResponse = {
          jobId: submission.jobId,
          status: submission.status,
          step: submission.initialStep,
          isSimulated: provider.id === 'demo-provider',
        };
        setCurrentJob(initialStatus);

        addToast({
          type: 'info',
          title: 'Job Queued',
          message: submission.message || `Generating with ${request.modelId}...`,
        });

        // Start polling for progressive status updates
        if (pollingRef.current) clearInterval(pollingRef.current);

        pollingRef.current = setInterval(async () => {
          try {
            const statusResponse = await provider.getJobStatus(submission.jobId);
            setCurrentJob(statusResponse);

            if (statusResponse.status === 'succeeded') {
              clearInterval(pollingRef.current);
              setIsGenerating(false);

              // Save to history
              if (statusResponse.videoUrl) {
                const newCreation: CreationRecord = {
                  id: statusResponse.jobId,
                  title: request.prompt.slice(0, 40) + (request.prompt.length > 40 ? '...' : ''),
                  mode: request.mode,
                  modelId: request.modelId,
                  prompt: request.prompt,
                  negativePrompt: request.negativePrompt,
                  sourceImageUrl: request.sourceImage?.dataUrl,
                  aspectRatio: request.aspectRatio,
                  resolution: request.resolution,
                  durationSeconds: request.durationSeconds,
                  fps: request.fps,
                  videoUrl: statusResponse.videoUrl,
                  createdAt: Date.now(),
                  isFavorite: false,
                  providerId: provider.id,
                  isSimulated: statusResponse.isSimulated,
                  seed: request.seed,
                  motionStrength: request.motionStrength,
                };
                const updated = addCreation(newCreation);
                setCreations(updated);
              }

              addToast({
                type: 'success',
                title: statusResponse.isSimulated ? 'Demo Video Ready' : 'Video Generated Successfully!',
                message: statusResponse.isSimulated
                  ? 'Sample preview rendered. Check the playback card below.'
                  : 'AI inference completed.',
                durationMs: 6000,
              });
            } else if (statusResponse.status === 'failed' || statusResponse.status === 'cancelled') {
              clearInterval(pollingRef.current);
              setIsGenerating(false);
              addToast({
                type: 'error',
                title: 'Generation Failed',
                message: statusResponse.error?.message || 'An error occurred during inference.',
                durationMs: 7000,
              });
            }
          } catch (err: any) {
            console.error('Polling error', err);
          }
        }, 800);

        return true;
      } catch (err: any) {
        setIsGenerating(false);
        addToast({
          type: 'error',
          title: 'Submission Error',
          message: err.message || 'Failed to submit job to provider.',
        });
        return false;
      }
    },
    [isGenerating, addToast]
  );

  const retryGeneration = useCallback(async () => {
    if (activeRequest) {
      await submitGeneration({
        ...activeRequest,
        id: `job-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
        createdAt: Date.now(),
      });
    }
  }, [activeRequest, submitGeneration]);

  return (
    <StudioContext.Provider
      value={{
        activeTab,
        setActiveTab,
        activeProviderType,
        setActiveProviderType,
        currentJob,
        activeRequest,
        isGenerating,
        submitGeneration,
        cancelGeneration,
        retryGeneration,
        prefillRequest,
        reuseSettings,
        clearPrefill,
        creations,
        refreshCreations,
        toggleFavorite,
        removeCreation,
        clearHistory,
        toasts,
        addToast,
        removeToast,
      }}
    >
      {children}
    </StudioContext.Provider>
  );
};

export function useStudio(): StudioContextType {
  const context = useContext(StudioContext);
  if (!context) {
    throw new Error('useStudio must be used within a StudioProvider');
  }
  return context;
}
