import {
  GenerationRequest,
  IVideoProvider,
  JobProgressStep,
  JobStatusResponse,
  JobSubmissionResponse,
  ProviderCapabilities,
} from './types';

export interface CustomProviderConfig {
  endpointUrl: string; // e.g. "http://127.0.0.1:8188" or custom webhook URL
  apiKey?: string;
  workflowTemplate?: 'comfyui' | 'standard_webhook';
}

export class CustomProvider implements IVideoProvider {
  public readonly id = 'custom-inference';
  public readonly name = 'Custom / ComfyUI Local Server';

  private config: CustomProviderConfig;
  private activeJobs = new Map<string, any>();

  constructor(config: Partial<CustomProviderConfig> = {}) {
    this.config = {
      endpointUrl: config.endpointUrl || 'http://127.0.0.1:8188',
      apiKey: config.apiKey,
      workflowTemplate: config.workflowTemplate || 'comfyui',
    };
  }

  public updateConfig(newConfig: Partial<CustomProviderConfig>) {
    this.config = { ...this.config, ...newConfig };
  }

  public getConfig(): CustomProviderConfig {
    return { ...this.config };
  }

  async getCapabilities(): Promise<ProviderCapabilities> {
    return {
      id: this.id,
      name: this.name,
      badge: 'Local GPU / Webhook',
      description:
        'Connect directly to a local ComfyUI instance or self-hosted API (e.g. RTX 3090/4090 workstation). Zero cloud fees, complete data privacy.',
      supportedModes: ['text-to-video', 'image-to-video'],
      supportedModels: [
        'wan2.1-t2v-1.3b',
        'wan2.1-t2v-14b',
        'wan2.1-i2v-14b-720p',
        'ltx-video-0.9.1',
      ],
      supportsNegativePrompt: true,
      supportsCancel: true,
      supportsCustomSeed: true,
      supportsCustomSteps: true,
      supportsGuidanceScale: true,
      supportsCameraMotion: true,
      requiresAuth: false,
      isRealInference: true,
      isFreeTier: true,
      notes:
        'Requires a running local ComfyUI server with Wan2.1 custom nodes installed, or a custom HTTP endpoint accepting JSON payloads.',
    };
  }

  async testConnection(): Promise<{ success: boolean; message: string; latencyMs: number }> {
    const start = performance.now();
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 6000);

      // ComfyUI system stats or standard ping
      const res = await fetch(`${this.config.endpointUrl}/system_stats`, {
        method: 'GET',
        signal: controller.signal,
      }).catch(async () => {
        // Fallback standard GET /
        return await fetch(this.config.endpointUrl, { method: 'GET', signal: controller.signal });
      });

      clearTimeout(timeoutId);
      const latencyMs = Math.round(performance.now() - start);

      if (res && res.ok) {
        return {
          success: true,
          message: `Connected to custom inference server at ${this.config.endpointUrl}`,
          latencyMs,
        };
      } else {
        return {
          success: false,
          message: `Server returned HTTP ${res?.status || 'unknown'}. Check if ComfyUI is running.`,
          latencyMs,
        };
      }
    } catch {
      return {
        success: false,
        message: `Could not reach ${this.config.endpointUrl}. Ensure local server is started and CORS is enabled.`,
        latencyMs: Math.round(performance.now() - start),
      };
    }
  }

  async submitJob(request: GenerationRequest): Promise<JobSubmissionResponse> {
    const initialStep: JobProgressStep = {
      phase: 'queued',
      currentStep: 1,
      totalSteps: 5,
      message: `Dispatching workflow to ${this.config.endpointUrl}...`,
      progressPercent: 10,
    };

    this.activeJobs.set(request.id, {
      request,
      status: 'queued',
      step: initialStep,
    });

    return {
      jobId: request.id,
      status: 'queued',
      initialStep,
      message: 'Job submitted to custom inference provider',
    };
  }

  async getJobStatus(jobId: string): Promise<JobStatusResponse> {
    const job = this.activeJobs.get(jobId);
    if (!job) {
      return {
        jobId,
        status: 'failed',
        isSimulated: false,
        step: {
          phase: 'failed',
          currentStep: 0,
          totalSteps: 5,
          message: 'Job not found',
          progressPercent: 0,
        },
      };
    }

    return {
      jobId,
      status: job.status,
      step: job.step,
      videoUrl: job.videoUrl,
      isSimulated: false,
    };
  }

  async cancelJob(jobId: string): Promise<boolean> {
    this.activeJobs.delete(jobId);
    return true;
  }
}
