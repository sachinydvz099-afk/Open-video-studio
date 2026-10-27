import {
  GenerationRequest,
  IVideoProvider,
  JobProgressStep,
  JobStatusResponse,
  JobSubmissionResponse,
  ProviderCapabilities,
} from './types';
import { SAMPLE_VIDEOS, generateProceduralDemoVideo } from '../assets/samples/samplesData';
import { getModelById } from '../models/registry';

interface ActiveDemoJob {
  request: GenerationRequest;
  submittedAt: number;
  durationMs: number;
  status: 'queued' | 'running' | 'succeeded' | 'failed' | 'cancelled';
  currentStep: JobProgressStep;
  videoUrl?: string;
  videoBlob?: Blob;
  error?: any;
  timerId?: any;
}

export type DemoSimulationSpeed = 'fast' | 'normal' | 'realistic';
export type SimulatedErrorType = 'none' | 'oom' | 'content_policy' | 'timeout';

export class DemoProvider implements IVideoProvider {
  public readonly id = 'demo-provider';
  public readonly name = 'Open Studio Demo Engine';

  private activeJobs = new Map<string, ActiveDemoJob>();
  private simulationSpeed: DemoSimulationSpeed = 'normal';
  private errorSimulation: SimulatedErrorType = 'none';

  constructor(speed: DemoSimulationSpeed = 'normal', errorSim: SimulatedErrorType = 'none') {
    this.simulationSpeed = speed;
    this.errorSimulation = errorSim;
  }

  public setSimulationSpeed(speed: DemoSimulationSpeed) {
    this.simulationSpeed = speed;
  }

  public setErrorSimulation(error: SimulatedErrorType) {
    this.errorSimulation = error;
  }

  async getCapabilities(): Promise<ProviderCapabilities> {
    return {
      id: this.id,
      name: this.name,
      badge: 'Zero GPU / Demo',
      description:
        'Local simulated environment with authentic sample video generation and full offline support. Zero API key, token, or GPU required.',
      supportedModes: ['text-to-video', 'image-to-video'],
      supportedModels: [
        'wan2.1-t2v-1.3b',
        'wan2.1-t2v-14b',
        'wan2.1-i2v-14b-720p',
        'wan2.1-i2v-14b-480p',
        'ltx-video-0.9.1',
        'cogvideox-5b',
      ],
      supportsNegativePrompt: true,
      supportsCancel: true,
      supportsCustomSeed: true,
      supportsCustomSteps: true,
      supportsGuidanceScale: true,
      supportsCameraMotion: true,
      requiresAuth: false,
      isRealInference: false,
      isFreeTier: true,
      notes:
        'All results produced by Demo Provider are generated sample demonstrations, not live cloud AI inferences. They are clearly labeled for transparency.',
    };
  }

  async submitJob(request: GenerationRequest): Promise<JobSubmissionResponse> {
    const totalDurationMs =
      this.simulationSpeed === 'fast' ? 4000 : this.simulationSpeed === 'realistic' ? 14000 : 7000;

    const initialStep: JobProgressStep = {
      phase: 'queued',
      currentStep: 1,
      totalSteps: 6,
      message: 'Job submitted to Open Studio virtual runner queue (Position #1)',
      progressPercent: 5,
      etaSeconds: Math.ceil(totalDurationMs / 1000),
    };

    const jobRecord: ActiveDemoJob = {
      request,
      submittedAt: Date.now(),
      durationMs: totalDurationMs,
      status: 'queued',
      currentStep: initialStep,
    };

    this.activeJobs.set(request.id, jobRecord);

    // Kick off progressive simulation stages
    this.runJobSimulation(request.id, totalDurationMs);

    return {
      jobId: request.id,
      status: 'queued',
      initialStep,
      estimatedWaitTimeSeconds: Math.ceil(totalDurationMs / 1000),
      queuePosition: 1,
      message: 'Demo generation simulated job scheduled',
    };
  }

  async getJobStatus(jobId: string): Promise<JobStatusResponse> {
    const job = this.activeJobs.get(jobId);
    if (!job) {
      return {
        jobId,
        status: 'failed',
        isSimulated: true,
        step: {
          phase: 'failed',
          currentStep: 0,
          totalSteps: 6,
          message: 'Job not found in studio session',
          progressPercent: 0,
        },
        error: {
          code: 'PROVIDER_ERROR',
          message: `Job ID "${jobId}" not found in current browser session.`,
          retryable: false,
        },
      };
    }

    return {
      jobId,
      status: job.status,
      step: job.currentStep,
      videoUrl: job.videoUrl,
      videoMetadata: job.videoUrl
        ? {
            duration: job.request.durationSeconds || 5,
            width: job.request.resolution === '720p' ? 1280 : 832,
            height: job.request.resolution === '720p' ? 720 : 480,
            fps: job.request.fps || 16,
            format: 'webm',
          }
        : undefined,
      error: job.error,
      isSimulated: true,
      completedAt: job.status === 'succeeded' ? Date.now() : undefined,
    };
  }

  async cancelJob(jobId: string): Promise<boolean> {
    const job = this.activeJobs.get(jobId);
    if (!job || job.status === 'succeeded' || job.status === 'failed') {
      return false;
    }

    if (job.timerId) {
      clearTimeout(job.timerId);
    }

    job.status = 'cancelled';
    job.currentStep = {
      phase: 'failed',
      currentStep: 0,
      totalSteps: 6,
      message: 'Job cancelled by user',
      progressPercent: 0,
    };
    job.error = {
      code: 'CANCELLED',
      message: 'Job was cancelled before inference completion.',
      retryable: true,
    };

    return true;
  }

  async testConnection(): Promise<{ success: boolean; message: string; latencyMs: number }> {
    const start = performance.now();
    await new Promise((r) => setTimeout(r, 80));
    return {
      success: true,
      message: 'Demo Engine operational. Ready for instant offline video creation.',
      latencyMs: Math.round(performance.now() - start),
    };
  }

  private runJobSimulation(jobId: string, totalDurationMs: number) {
    const steps: {
      phase: JobProgressStep['phase'];
      progress: number;
      message: string;
      delayRatio: number;
    }[] = [
      {
        phase: 'allocating_resources',
        progress: 15,
        message: 'Allocating GPU VRAM (simulating FP8 quantized DiT weights)...',
        delayRatio: 0.15,
      },
      {
        phase: 'loading_weights',
        progress: 30,
        message: 'Computing prompt text embeddings with UMT5-XXL...',
        delayRatio: 0.3,
      },
      {
        phase: 'denoising_latents',
        progress: 55,
        message: 'Denoising latents: Flow Matching Step 15/30 (50%)...',
        delayRatio: 0.55,
      },
      {
        phase: 'interpolating_frames',
        progress: 80,
        message: 'Synthesizing 81 temporal frames at 16 FPS via 3D VAE...',
        delayRatio: 0.8,
      },
      {
        phase: 'encoding_mp4',
        progress: 95,
        message: 'Encoding H.264 video stream & writing metadata...',
        delayRatio: 0.95,
      },
    ];

    const startTime = Date.now();

    const scheduleNext = (index: number) => {
      const job = this.activeJobs.get(jobId);
      if (!job || job.status === 'cancelled') return;

      // Handle simulated error injection if requested
      if (this.errorSimulation !== 'none' && index === 2) {
        this.injectSimulatedError(job, this.errorSimulation);
        return;
      }

      if (index < steps.length) {
        const step = steps[index];
        const targetTime = startTime + totalDurationMs * step.delayRatio;
        const delay = Math.max(0, targetTime - Date.now());

        job.timerId = setTimeout(() => {
          if (job.status === 'cancelled') return;
          job.status = 'running';
          job.currentStep = {
            phase: step.phase,
            currentStep: index + 2,
            totalSteps: 6,
            message: step.message,
            progressPercent: step.progress,
            etaSeconds: Math.max(1, Math.round((totalDurationMs * (1 - step.delayRatio)) / 1000)),
          };
          scheduleNext(index + 1);
        }, delay);
      } else {
        // Final completion stage
        const targetTime = startTime + totalDurationMs;
        const delay = Math.max(0, targetTime - Date.now());

        job.timerId = setTimeout(async () => {
          if (job.status === 'cancelled') return;
          await this.completeJobWithSampleVideo(job);
        }, delay);
      }
    };

    scheduleNext(0);
  }

  private injectSimulatedError(job: ActiveDemoJob, errorType: SimulatedErrorType) {
    job.status = 'failed';
    if (errorType === 'oom') {
      job.error = {
        code: 'GPU_OOM',
        message: 'CUDA out of memory: Tried to allocate 14.80 GiB (GPU 0; 11.76 GiB total capacity).',
        details: 'Tip: Lower the resolution to 480p, reduce duration to 3s, or switch to Wan2.1-1.3B.',
        retryable: true,
      };
    } else if (errorType === 'content_policy') {
      job.error = {
        code: 'CONTENT_POLICY',
        message: 'Generation blocked: prompt triggered provider automated safety filter.',
        details: 'Please adjust your prompt to comply with open model safety guidelines.',
        retryable: false,
      };
    } else {
      job.error = {
        code: 'COLD_START_TIMEOUT',
        message: 'Remote inference worker timed out during GPU container spinup.',
        details: 'Provider node took longer than 120s to respond. Please retry.',
        retryable: true,
      };
    }

    job.currentStep = {
      phase: 'failed',
      currentStep: 0,
      totalSteps: 6,
      message: `Failed: ${job.error.message}`,
      progressPercent: 0,
    };
  }

  private async completeJobWithSampleVideo(job: ActiveDemoJob) {
    const model = getModelById(job.request.modelId);
    const modelName = model?.name || 'Wan2.1';

    // Pick closest matching theme
    const p = job.request.prompt.toLowerCase();
    let theme: 'cyberpunk' | 'nebula' | 'ocean' | 'nature' | 'portrait' | 'abstract' = 'cyberpunk';

    if (p.includes('space') || p.includes('star') || p.includes('galaxy') || p.includes('nebula')) {
      theme = 'nebula';
    } else if (p.includes('water') || p.includes('ocean') || p.includes('sea') || p.includes('jellyfish')) {
      theme = 'ocean';
    } else if (p.includes('forest') || p.includes('tree') || p.includes('mountain') || p.includes('nature')) {
      theme = 'nature';
    } else if (p.includes('portrait') || p.includes('woman') || p.includes('man') || p.includes('face') || job.request.mode === 'image-to-video') {
      theme = 'portrait';
    } else if (p.includes('abstract') || p.includes('sculpture') || p.includes('3d') || p.includes('liquid')) {
      theme = 'abstract';
    }

    try {
      // Procedurally generate real video blob in browser
      const blob = await generateProceduralDemoVideo(
        theme,
        job.request.prompt,
        modelName,
        job.request.durationSeconds || 4,
        job.request.fps || 16
      );

      const objectUrl = URL.createObjectURL(blob);
      job.videoUrl = objectUrl;
      job.videoBlob = blob;
      job.status = 'succeeded';
      job.currentStep = {
        phase: 'completed',
        currentStep: 6,
        totalSteps: 6,
        message: 'Demo generation complete! (Simulated sample)',
        progressPercent: 100,
        etaSeconds: 0,
      };
    } catch {
      // Fallback to sample catalog remote URL if canvas recording is unsupported in environment
      const matchingSample = SAMPLE_VIDEOS.find((s) => s.generatorTheme === theme) || SAMPLE_VIDEOS[0];
      job.videoUrl = matchingSample.remoteUrl;
      job.status = 'succeeded';
      job.currentStep = {
        phase: 'completed',
        currentStep: 6,
        totalSteps: 6,
        message: 'Demo generation complete! (Sample catalog playback)',
        progressPercent: 100,
        etaSeconds: 0,
      };
    }
  }
}
