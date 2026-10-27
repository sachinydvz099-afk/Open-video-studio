/**
 * Core type definitions for Open Video Studio provider architecture.
 */

export type JobMode = 'text-to-video' | 'image-to-video';

export type JobStatus = 'queued' | 'running' | 'succeeded' | 'failed' | 'cancelled';

export type JobPhase =
  | 'queued'
  | 'allocating_resources'
  | 'loading_weights'
  | 'denoising_latents'
  | 'interpolating_frames'
  | 'encoding_mp4'
  | 'finalizing'
  | 'completed'
  | 'failed';

export interface JobProgressStep {
  phase: JobPhase;
  currentStep: number;
  totalSteps: number;
  message: string;
  progressPercent: number; // 0 to 100
  etaSeconds?: number;
}

export type AspectRatio = '16:9' | '9:16' | '1:1' | '4:3' | '21:9';

export type CameraMotion = 'static' | 'pan_left' | 'pan_right' | 'zoom_in' | 'zoom_out' | 'orbit';

export interface SourceImageData {
  dataUrl: string;
  name: string;
  sizeBytes: number;
  type: string;
  width?: number;
  height?: number;
}

export interface GenerationRequest {
  id: string;
  mode: JobMode;
  modelId: string;
  prompt: string;
  negativePrompt?: string;
  sourceImage?: SourceImageData;
  aspectRatio: AspectRatio;
  durationSeconds: number;
  resolution: '480p' | '720p' | '1080p';
  fps: number;
  seed?: number;
  guidanceScale?: number;
  inferenceSteps?: number;
  motionStrength?: number; // 1 to 10
  cameraMotion?: CameraMotion;
  createdAt: number;
}

export interface JobSubmissionResponse {
  jobId: string;
  status: JobStatus;
  initialStep: JobProgressStep;
  estimatedWaitTimeSeconds?: number;
  queuePosition?: number;
  message?: string;
}

export interface JobError {
  code:
    | 'RATE_LIMIT'
    | 'GPU_OOM'
    | 'COLD_START_TIMEOUT'
    | 'INVALID_INPUT'
    | 'PROVIDER_ERROR'
    | 'CONTENT_POLICY'
    | 'NETWORK_ERROR'
    | 'CANCELLED'
    | 'SPACE_SLEEPING';
  message: string;
  details?: string;
  retryable: boolean;
}

export interface VideoMetadata {
  duration: number;
  width: number;
  height: number;
  fps: number;
  format: 'mp4' | 'webm';
  fileSizeBytes?: number;
}

export interface JobStatusResponse {
  jobId: string;
  status: JobStatus;
  step: JobProgressStep;
  videoUrl?: string;
  videoMetadata?: VideoMetadata;
  error?: JobError;
  isSimulated: boolean;
  completedAt?: number;
}

export interface ProviderCapabilities {
  id: string;
  name: string;
  badge: string;
  description: string;
  supportedModes: JobMode[];
  supportedModels: string[];
  supportsNegativePrompt: boolean;
  supportsCancel: boolean;
  supportsCustomSeed: boolean;
  supportsCustomSteps: boolean;
  supportsGuidanceScale: boolean;
  supportsCameraMotion: boolean;
  requiresAuth: boolean;
  isRealInference: boolean;
  isFreeTier: boolean;
  notes: string;
}

/**
 * Standard interface that all inference adapters (Demo, Hugging Face, ComfyUI/Custom) must implement.
 */
export interface IVideoProvider {
  readonly id: string;
  readonly name: string;

  /**
   * Returns supported capabilities, models, and limits for this provider.
   */
  getCapabilities(): Promise<ProviderCapabilities>;

  /**
   * Submits a generation request to the provider queue.
   */
  submitJob(request: GenerationRequest): Promise<JobSubmissionResponse>;

  /**
   * Retrieves the current execution status and progressive state.
   */
  getJobStatus(jobId: string): Promise<JobStatusResponse>;

  /**
   * Cancels a running or queued job if supported by the provider.
   */
  cancelJob(jobId: string): Promise<boolean>;

  /**
   * Validates provider connectivity, credentials (if any), and remote availability.
   */
  testConnection?(): Promise<{ success: boolean; message: string; latencyMs?: number }>;
}
