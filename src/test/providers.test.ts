import { describe, it, expect } from 'vitest';
import { RealisticAiProvider } from '../providers/RealisticAiProvider';
import { DemoProvider } from '../providers/DemoProvider';
import { HuggingFaceGradioProvider } from '../providers/HuggingFaceGradioProvider';
import { CustomProvider } from '../providers/CustomProvider';
import { GenerationRequest } from '../providers/types';

describe('Provider Architecture Tests', () => {
  const dummyRequest: GenerationRequest = {
    id: 'test-job-1',
    mode: 'text-to-video',
    modelId: 'wan2.1-t2v-14b',
    prompt: 'A futuristic cybernetic tiger running in neon rain',
    aspectRatio: '16:9',
    durationSeconds: 5,
    resolution: '720p',
    fps: 16,
    createdAt: Date.now(),
  };

  describe('RealisticAiProvider', () => {
    it('returns capabilities marked as real inference and free tier', async () => {
      const provider = new RealisticAiProvider();
      const caps = await provider.getCapabilities();

      expect(caps.isRealInference).toBe(true);
      expect(caps.isFreeTier).toBe(true);
      expect(caps.requiresAuth).toBe(false);
      expect(caps.supportedModels).toContain('wan2.1-t2v-14b');
      expect(caps.supportedModes).toContain('text-to-video');
      expect(caps.supportedModes).toContain('image-to-video');
    });

    it('submits a realistic AI job and returns queued status', async () => {
      const provider = new RealisticAiProvider();
      const sub = await provider.submitJob(dummyRequest);

      expect(sub.jobId).toBe(dummyRequest.id);
      expect(sub.status).toBe('queued');
      expect(sub.initialStep.phase).toBe('queued');

      const status = await provider.getJobStatus(dummyRequest.id);
      expect(status.jobId).toBe(dummyRequest.id);
      expect(status.isSimulated).toBe(false);
    });

    it('supports realistic AI job cancellation', async () => {
      const provider = new RealisticAiProvider();
      await provider.submitJob({ ...dummyRequest, id: 'cancel-ai-test' });

      const cancelled = await provider.cancelJob('cancel-ai-test');
      expect(cancelled).toBe(true);

      const status = await provider.getJobStatus('cancel-ai-test');
      expect(status.status).toBe('cancelled');
      expect(status.error?.code).toBe('CANCELLED');
    });

    it('tests connection successfully', async () => {
      const provider = new RealisticAiProvider();
      const test = await provider.testConnection();
      expect(test.success).toBe(true);
    });
  });

  describe('DemoProvider', () => {
    it('returns capabilities marked as simulated and free', async () => {
      const provider = new DemoProvider('fast');
      const caps = await provider.getCapabilities();

      expect(caps.isRealInference).toBe(false);
      expect(caps.isFreeTier).toBe(true);
      expect(caps.requiresAuth).toBe(false);
      expect(caps.supportedModels).toContain('wan2.1-t2v-14b');
      expect(caps.supportedModes).toContain('text-to-video');
      expect(caps.supportedModes).toContain('image-to-video');
    });

    it('submits a job and returns queued status', async () => {
      const provider = new DemoProvider('fast');
      const sub = await provider.submitJob(dummyRequest);

      expect(sub.jobId).toBe(dummyRequest.id);
      expect(sub.status).toBe('queued');
      expect(sub.initialStep.phase).toBe('queued');

      const status = await provider.getJobStatus(dummyRequest.id);
      expect(status.jobId).toBe(dummyRequest.id);
      expect(status.isSimulated).toBe(true);
    });

    it('supports job cancellation', async () => {
      const provider = new DemoProvider('normal');
      const sub = await provider.submitJob({ ...dummyRequest, id: 'cancel-test-id' });

      const cancelled = await provider.cancelJob('cancel-test-id');
      expect(cancelled).toBe(true);

      const status = await provider.getJobStatus('cancel-test-id');
      expect(status.status).toBe('cancelled');
      expect(status.error?.code).toBe('CANCELLED');
    });

    it('injects simulated errors when configured', async () => {
      const provider = new DemoProvider('fast', 'oom');
      await provider.submitJob({ ...dummyRequest, id: 'oom-test-id' });

      // Wait for simulation step 2 to trigger (at 55% progress)
      await new Promise((r) => setTimeout(r, 2500));

      const status = await provider.getJobStatus('oom-test-id');
      expect(status.status).toBe('failed');
      expect(status.error?.code).toBe('GPU_OOM');
      expect(status.error?.message).toContain('CUDA out of memory');
    });

    it('tests connection successfully', async () => {
      const provider = new DemoProvider();
      const test = await provider.testConnection();
      expect(test.success).toBe(true);
    });
  });

  describe('HuggingFaceGradioProvider', () => {
    it('initializes with default Wan2.1 space and returns capabilities', async () => {
      const provider = new HuggingFaceGradioProvider({
        spaceId: 'Wan-AI/Wan2.1-T2V-14B',
      });
      const caps = await provider.getCapabilities();

      expect(caps.isRealInference).toBe(true);
      expect(caps.isFreeTier).toBe(true);
      expect(caps.supportedModels).toContain('wan2.1-t2v-14b');
    });

    it('updates configuration dynamically without memory leaks', () => {
      const provider = new HuggingFaceGradioProvider({
        spaceId: 'Wan-AI/Wan2.1-T2V-14B',
      });

      provider.updateConfig({
        spaceId: 'Lightricks/LTX-Video',
        userToken: 'hf_test_token',
      });

      const config = provider.getConfig();
      expect(config.spaceId).toBe('Lightricks/LTX-Video');
      expect(config.userToken).toBe('hf_test_token');
    });
  });

  describe('CustomProvider', () => {
    it('defaults to localhost:8188 for ComfyUI', async () => {
      const provider = new CustomProvider();
      expect(provider.getConfig().endpointUrl).toBe('http://127.0.0.1:8188');

      const caps = await provider.getCapabilities();
      expect(caps.isRealInference).toBe(true);
      expect(caps.badge).toContain('Local GPU');
    });
  });
});
