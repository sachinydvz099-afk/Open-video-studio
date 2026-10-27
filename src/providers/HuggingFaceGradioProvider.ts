import {
  GenerationRequest,
  IVideoProvider,
  JobProgressStep,
  JobStatusResponse,
  JobSubmissionResponse,
  ProviderCapabilities,
} from './types';

export interface HuggingFaceConfig {
  spaceId: string; // e.g. "Wan-AI/Wan2.1-T2V-14B" or custom space
  userToken?: string; // Optional read-only token stored in session memory only
  customEndpointUrl?: string; // Optional direct URL e.g. https://wan-ai-wan2-1-t2v-14b.hf.space
}

interface ActiveHuggingFaceJob {
  request: GenerationRequest;
  sessionHash: string;
  endpointUrl: string;
  status: 'queued' | 'running' | 'succeeded' | 'failed' | 'cancelled';
  step: JobProgressStep;
  videoUrl?: string;
  error?: any;
  controller: AbortController;
  pollingTimer?: any;
}

export class HuggingFaceGradioProvider implements IVideoProvider {
  public readonly id = 'huggingface-gradio';
  public readonly name = 'Hugging Face Gradio Spaces';

  private config: HuggingFaceConfig;
  private activeJobs = new Map<string, ActiveHuggingFaceJob>();

  constructor(config: HuggingFaceConfig) {
    this.config = {
      spaceId: config.spaceId || 'Wan-AI/Wan2.1-T2V-14B',
      userToken: config.userToken,
      customEndpointUrl: config.customEndpointUrl,
    };
  }

  public updateConfig(newConfig: Partial<HuggingFaceConfig>) {
    this.config = { ...this.config, ...newConfig };
  }

  public getConfig(): HuggingFaceConfig {
    return { ...this.config };
  }

  async getCapabilities(): Promise<ProviderCapabilities> {
    return {
      id: this.id,
      name: this.name,
      badge: 'ZeroGPU / Spaces',
      description:
        'Connects directly to Hugging Face Spaces Gradio queue API (e.g. Wan2.1 ZeroGPU spaces). Subject to queue wait times, cold starts, and community quota limits.',
      supportedModes: ['text-to-video', 'image-to-video'],
      supportedModels: [
        'wan2.1-t2v-14b',
        'wan2.1-t2v-1.3b',
        'wan2.1-i2v-14b-720p',
        'ltx-video-0.9.1',
      ],
      supportsNegativePrompt: true,
      supportsCancel: true,
      supportsCustomSeed: true,
      supportsCustomSteps: true,
      supportsGuidanceScale: true,
      supportsCameraMotion: false,
      requiresAuth: false, // Optional token for higher queue priority
      isRealInference: true,
      isFreeTier: true,
      notes:
        'Free public Hugging Face Spaces operate under community ZeroGPU limits. During high traffic or cold starts, inference requests may queue or time out.',
    };
  }

  /**
   * Resolves the direct HTTPS endpoint URL for a Hugging Face Space ID.
   */
  private resolveEndpointUrl(): string {
    if (this.config.customEndpointUrl && this.config.customEndpointUrl.trim().length > 0) {
      return this.config.customEndpointUrl.replace(/\/+$/, '');
    }

    // Convert "Owner/Space-Name" into "https://owner-space-name.hf.space"
    const cleaned = this.config.spaceId.trim();
    if (cleaned.startsWith('http://') || cleaned.startsWith('https://')) {
      return cleaned.replace(/\/+$/, '');
    }

    const parts = cleaned.split('/');
    if (parts.length === 2) {
      const owner = parts[0].toLowerCase().replace(/[^a-z0-9_-]/g, '');
      const space = parts[1].toLowerCase().replace(/[^a-z0-9_-]/g, '');
      return `https://${owner}-${space}.hf.space`;
    }

    return `https://${cleaned.toLowerCase().replace(/[^a-z0-9_-]/g, '')}.hf.space`;
  }

  private getAuthHeaders(): Record<string, string> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      Accept: 'application/json',
    };
    if (this.config.userToken && this.config.userToken.trim().length > 0) {
      headers['Authorization'] = `Bearer ${this.config.userToken.trim()}`;
    }
    return headers;
  }

  async testConnection(): Promise<{ success: boolean; message: string; latencyMs: number }> {
    const endpoint = this.resolveEndpointUrl();
    const startTime = performance.now();

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 12000);

      const response = await fetch(`${endpoint}/info`, {
        method: 'GET',
        headers: this.getAuthHeaders(),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);
      const latencyMs = Math.round(performance.now() - startTime);

      if (response.ok) {
        const info = await response.json();
        const namedEndpoints = info?.named_endpoints ? Object.keys(info.named_endpoints) : [];
        return {
          success: true,
          message: `Connected to Space successfully! Detected endpoints: ${
            namedEndpoints.length > 0 ? namedEndpoints.join(', ') : 'Gradio queue active'
          }`,
          latencyMs,
        };
      } else if (response.status === 503) {
        return {
          success: false,
          message:
            'Hugging Face Space is currently sleeping or starting up. Visit the Space page to wake it.',
          latencyMs,
        };
      } else if (response.status === 401 || response.status === 403) {
        return {
          success: false,
          message:
            'Access restricted: Space requires a valid Hugging Face Access Token with read permissions.',
          latencyMs,
        };
      } else {
        return {
          success: false,
          message: `Space responded with HTTP ${response.status}: ${response.statusText}`,
          latencyMs,
        };
      }
    } catch (err: any) {
      const latencyMs = Math.round(performance.now() - startTime);
      if (err.name === 'AbortError') {
        return {
          success: false,
          message:
            'Connection timed out after 12s. The Space may be paused, cold starting, or restricted by CORS.',
          latencyMs,
        };
      }
      return {
        success: false,
        message: `Network or CORS error connecting to ${endpoint}. (If accessing a private space, verify token or use Demo Mode).`,
        latencyMs,
      };
    }
  }

  async submitJob(request: GenerationRequest): Promise<JobSubmissionResponse> {
    const endpoint = this.resolveEndpointUrl();
    const sessionHash = Math.random().toString(36).substring(2, 13);
    const controller = new AbortController();

    const initialStep: JobProgressStep = {
      phase: 'queued',
      currentStep: 1,
      totalSteps: 5,
      message: `Connecting to Hugging Face Space: ${this.config.spaceId}...`,
      progressPercent: 5,
      etaSeconds: 45,
    };

    const jobRecord: ActiveHuggingFaceJob = {
      request,
      sessionHash,
      endpointUrl: endpoint,
      status: 'queued',
      step: initialStep,
      controller,
    };

    this.activeJobs.set(request.id, jobRecord);

    // Launch background execution
    this.executeGradioJob(jobRecord);

    return {
      jobId: request.id,
      status: 'queued',
      initialStep,
      estimatedWaitTimeSeconds: 45,
      queuePosition: 1,
      message: `Submitted to ${this.config.spaceId}`,
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
          message: 'Job not found in provider memory',
          progressPercent: 0,
        },
        error: {
          code: 'PROVIDER_ERROR',
          message: 'Job ID not found in Hugging Face provider memory.',
          retryable: false,
        },
      };
    }

    return {
      jobId,
      status: job.status,
      step: job.step,
      videoUrl: job.videoUrl,
      videoMetadata: job.videoUrl
        ? {
            duration: job.request.durationSeconds || 5,
            width: job.request.resolution === '720p' ? 1280 : 832,
            height: job.request.resolution === '720p' ? 720 : 480,
            fps: job.request.fps || 16,
            format: 'mp4',
          }
        : undefined,
      error: job.error,
      isSimulated: false,
      completedAt: job.status === 'succeeded' ? Date.now() : undefined,
    };
  }

  async cancelJob(jobId: string): Promise<boolean> {
    const job = this.activeJobs.get(jobId);
    if (!job || job.status === 'succeeded' || job.status === 'failed') {
      return false;
    }

    job.controller.abort();
    if (job.pollingTimer) {
      clearInterval(job.pollingTimer);
    }

    job.status = 'cancelled';
    job.step = {
      phase: 'failed',
      currentStep: 0,
      totalSteps: 5,
      message: 'Job cancelled by user',
      progressPercent: 0,
    };
    job.error = {
      code: 'CANCELLED',
      message: 'Job execution was cancelled.',
      retryable: true,
    };

    return true;
  }

  private async executeGradioJob(job: ActiveHuggingFaceJob) {
    const { request, endpointUrl, sessionHash, controller } = job;

    try {
      // 1. Prepare data payload according to Gradio parameter format
      const dataPayload: any[] = [
        request.prompt,
        request.negativePrompt || '',
        request.seed !== undefined ? request.seed : Math.floor(Math.random() * 2147483647),
        request.inferenceSteps || 30,
        request.guidanceScale || 5.0,
      ];

      if (request.mode === 'image-to-video' && request.sourceImage) {
        // Image is passed as first or conditioning input in I2V Gradio endpoints
        dataPayload.unshift(request.sourceImage.dataUrl);
      }

      job.step = {
        phase: 'queued',
        currentStep: 1,
        totalSteps: 5,
        message: 'Joining Gradio queue runner on Hugging Face...',
        progressPercent: 10,
        etaSeconds: 40,
      };

      // 2. Submit to /queue/join
      const joinResponse = await fetch(`${endpointUrl}/queue/join`, {
        method: 'POST',
        headers: this.getAuthHeaders(),
        body: JSON.stringify({
          data: dataPayload,
          event_data: null,
          fn_index: 0,
          trigger_id: null,
          session_hash: sessionHash,
        }),
        signal: controller.signal,
      });

      if (!joinResponse.ok) {
        if (joinResponse.status === 429) {
          throw {
            code: 'RATE_LIMIT',
            message: 'Hugging Face ZeroGPU daily quota exceeded. Switch to Demo Mode or provide a personal HF token.',
            retryable: true,
          };
        }
        if (joinResponse.status === 503) {
          throw {
            code: 'SPACE_SLEEPING',
            message: 'Target Hugging Face Space is currently sleeping. Please visit the space in a browser to restart it.',
            retryable: true,
          };
        }
        throw {
          code: 'PROVIDER_ERROR',
          message: `Gradio queue rejected submission (HTTP ${joinResponse.status})`,
          retryable: true,
        };
      }

      // 3. Listen to SSE /queue/data stream
      job.status = 'running';
      job.step = {
        phase: 'denoising_latents',
        currentStep: 2,
        totalSteps: 5,
        message: 'Job accepted by remote GPU worker. Processing latents...',
        progressPercent: 25,
      };

      const sseResponse = await fetch(`${endpointUrl}/queue/data?session_hash=${sessionHash}`, {
        method: 'GET',
        headers: this.getAuthHeaders(),
        signal: controller.signal,
      });

      if (!sseResponse.ok || !sseResponse.body) {
        throw {
          code: 'NETWORK_ERROR',
          message: `Failed to open Gradio event stream (HTTP ${sseResponse.status})`,
          retryable: true,
        };
      }

      const reader = sseResponse.body.getReader();
      const decoder = new TextDecoder();
      let buffer = '';

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n\n');
        buffer = lines.pop() || '';

        for (const block of lines) {
          const match = block.match(/data:\s*(.*)/);
          if (!match) continue;

          try {
            const parsed = JSON.parse(match[1]);

            if (parsed.msg === 'estimation') {
              const rank = parsed.rank ?? 1;
              const queueSize = parsed.queue_size ?? 1;
              job.step = {
                phase: 'queued',
                currentStep: 1,
                totalSteps: 5,
                message: `In Hugging Face Queue: position ${rank} of ${queueSize}`,
                progressPercent: 15,
                etaSeconds: parsed.rank_eta || 30,
              };
            } else if (parsed.msg === 'progress') {
              const progData = parsed.progress_data?.[0];
              const pPercent = progData?.index && progData?.length
                ? Math.round((progData.index / progData.length) * 60) + 25
                : 50;

              job.step = {
                phase: 'denoising_latents',
                currentStep: 3,
                totalSteps: 5,
                message: progData?.desc || `Denoising latents (${pPercent}%)...`,
                progressPercent: pPercent,
              };
            } else if (parsed.msg === 'process_completed') {
              if (parsed.success && parsed.output?.data) {
                // Parse video output
                const outputData = parsed.output.data;
                let foundUrl = '';

                // Search for video url or file object
                for (const item of outputData) {
                  if (typeof item === 'string' && (item.endsWith('.mp4') || item.includes('/file='))) {
                    foundUrl = item.startsWith('http') ? item : `${endpointUrl}/file=${item}`;
                    break;
                  } else if (item && typeof item === 'object') {
                    if (item.video?.url) {
                      foundUrl = item.video.url.startsWith('http') ? item.video.url : `${endpointUrl}/file=${item.video.url}`;
                      break;
                    } else if (item.url) {
                      foundUrl = item.url.startsWith('http') ? item.url : `${endpointUrl}/file=${item.url}`;
                      break;
                    }
                  }
                }

                if (foundUrl) {
                  job.videoUrl = foundUrl;
                  job.status = 'succeeded';
                  job.step = {
                    phase: 'completed',
                    currentStep: 5,
                    totalSteps: 5,
                    message: 'AI video generation completed by Hugging Face Space!',
                    progressPercent: 100,
                  };
                  return;
                } else {
                  throw {
                    code: 'PROVIDER_ERROR',
                    message: 'Gradio process finished without returning a valid video file URL.',
                    retryable: true,
                  };
                }
              } else {
                throw {
                  code: 'PROVIDER_ERROR',
                  message: parsed.output?.error || 'Inference execution failed on remote Space.',
                  retryable: true,
                };
              }
            }
          } catch (e: any) {
            if (e.code) throw e;
            // Ignore non-json SSE heartbeats
          }
        }
      }
    } catch (err: any) {
      if (job.status === 'cancelled') return;

      job.status = 'failed';
      job.error = {
        code: err.code || 'PROVIDER_ERROR',
        message: err.message || 'Remote inference execution encountered an error.',
        details: err.details || `Check Hugging Face Space "${this.config.spaceId}" status.`,
        retryable: err.retryable ?? true,
      };
      job.step = {
        phase: 'failed',
        currentStep: 0,
        totalSteps: 5,
        message: `Failed: ${job.error.message}`,
        progressPercent: 0,
      };
    }
  }
}
