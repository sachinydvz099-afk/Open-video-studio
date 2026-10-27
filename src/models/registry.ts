import { AspectRatio, JobMode } from '../providers/types';

export interface ModelVariant {
  id: string;
  name: string;
  shortName: string;
  family: 'Wan2.1' | 'LTX-Video' | 'CogVideoX' | 'Stable Video';
  providerCreator: string;
  parameters: string;
  architecture: string;
  license: string;
  licenseUrl: string;
  commercialUse: boolean;
  supportedModes: JobMode[];
  nativeResolutions: ('480p' | '720p' | '1080p')[];
  defaultResolution: '480p' | '720p' | '1080p';
  supportedAspectRatios: AspectRatio[];
  maxFrames: number;
  nativeFps: number;
  durationSeconds: number;
  vramRequirements: {
    minimumVramGb: number;
    recommendedVramGb: number;
    quantizedNote: string;
  };
  description: string;
  recommendedPrompts: string[];
  huggingFaceRepo: string;
  paperUrl?: string;
  isPopular?: boolean;
}

export const MODEL_REGISTRY: ModelVariant[] = [
  {
    id: 'wan2.1-t2v-1.3b',
    name: 'Wan2.1 Text-to-Video 1.3B',
    shortName: 'Wan2.1 1.3B',
    family: 'Wan2.1',
    providerCreator: 'Wan-AI (Alibaba Cloud)',
    parameters: '1.3 Billion',
    architecture: 'Flow Matching DiT + 3D VAE + UMT5-XXL',
    license: 'Apache 2.0',
    licenseUrl: 'https://www.apache.org/licenses/LICENSE-2.0',
    commercialUse: true,
    supportedModes: ['text-to-video'],
    nativeResolutions: ['480p'],
    defaultResolution: '480p',
    supportedAspectRatios: ['16:9', '9:16', '1:1', '4:3'],
    maxFrames: 81,
    nativeFps: 16,
    durationSeconds: 5,
    vramRequirements: {
      minimumVramGb: 8.2,
      recommendedVramGb: 12,
      quantizedNote: 'Runs smoothly on consumer GPUs (RTX 3060 12GB / RTX 4070) with FP8 or INT8 quantization in ComfyUI/Diffusers.',
    },
    description:
      'Ultra-efficient open video model by Alibaba Cloud. Incredible motion dynamics, high temporal consistency, and exceptionally light memory footprint compared to 14B.',
    recommendedPrompts: [
      'Cinematic close-up of a cybernetic tiger walking in neon rain, volumetric fog, reflection in puddles, 8k masterpiece',
      'Hyper-detailed macro video of morning dew dropping on an emerald moss petal, slow motion 60fps cinematic lighting',
    ],
    huggingFaceRepo: 'Wan-AI/Wan2.1-T2V-1.3B',
    paperUrl: 'https://github.com/Wan-Video/Wan2.1',
    isPopular: true,
  },
  {
    id: 'wan2.1-t2v-14b',
    name: 'Wan2.1 Text-to-Video 14B',
    shortName: 'Wan2.1 14B',
    family: 'Wan2.1',
    providerCreator: 'Wan-AI (Alibaba Cloud)',
    parameters: '14 Billion',
    architecture: 'High-Capacity Diffusion Transformer with 3D Spatial-Temporal Autoencoder',
    license: 'Apache 2.0',
    licenseUrl: 'https://www.apache.org/licenses/LICENSE-2.0',
    commercialUse: true,
    supportedModes: ['text-to-video'],
    nativeResolutions: ['720p', '480p'],
    defaultResolution: '720p',
    supportedAspectRatios: ['16:9', '9:16', '1:1', '4:3', '21:9'],
    maxFrames: 81,
    nativeFps: 16,
    durationSeconds: 5,
    vramRequirements: {
      minimumVramGb: 24,
      recommendedVramGb: 32,
      quantizedNote: 'Requires 24GB VRAM in FP8 (RTX 3090 / 4090) or 48GB+ for native BF16 inference.',
    },
    description:
      'Flagship open weights video model offering photorealistic lighting, physics simulation, complex human motion, and deep prompt alignment matching commercial video engines.',
    recommendedPrompts: [
      'A majestic ancient wooden galleon sailing through a glowing nebula in deep space, star dust trails, IMAX cinematography, 35mm lens',
      'Studio portrait of a woman smiling as gentle autumn leaves drift past, warm golden hour sunbeams, shallow depth of field',
    ],
    huggingFaceRepo: 'Wan-AI/Wan2.1-T2V-14B',
    paperUrl: 'https://github.com/Wan-Video/Wan2.1',
    isPopular: true,
  },
  {
    id: 'wan2.1-i2v-14b-720p',
    name: 'Wan2.1 Image-to-Video 14B (720P)',
    shortName: 'Wan2.1 I2V 720P',
    family: 'Wan2.1',
    providerCreator: 'Wan-AI (Alibaba Cloud)',
    parameters: '14 Billion',
    architecture: 'Latent Conditioning Video DiT',
    license: 'Apache 2.0',
    licenseUrl: 'https://www.apache.org/licenses/LICENSE-2.0',
    commercialUse: true,
    supportedModes: ['image-to-video'],
    nativeResolutions: ['720p'],
    defaultResolution: '720p',
    supportedAspectRatios: ['16:9', '9:16', '1:1', '4:3'],
    maxFrames: 81,
    nativeFps: 16,
    durationSeconds: 5,
    vramRequirements: {
      minimumVramGb: 24,
      recommendedVramGb: 32,
      quantizedNote: 'Requires 24GB VRAM with FP8 torch compile offloading.',
    },
    description:
      'Premier open image-to-video generator capable of animating static photos with natural fluid physics, cinematic camera motion, and precise identity preservation.',
    recommendedPrompts: [
      'The subject slowly blinks and looks toward the camera with a gentle warm smile, soft breeze blowing hair',
      'Cinematic slow drone pull back revealing the vast epic landscape surrounding the scene, golden hour lighting',
    ],
    huggingFaceRepo: 'Wan-AI/Wan2.1-I2V-14B-720P',
    paperUrl: 'https://github.com/Wan-Video/Wan2.1',
    isPopular: true,
  },
  {
    id: 'wan2.1-i2v-14b-480p',
    name: 'Wan2.1 Image-to-Video 14B (480P)',
    shortName: 'Wan2.1 I2V 480P',
    family: 'Wan2.1',
    providerCreator: 'Wan-AI (Alibaba Cloud)',
    parameters: '14 Billion',
    architecture: 'Latent Conditioning Video DiT (480P Optimized)',
    license: 'Apache 2.0',
    licenseUrl: 'https://www.apache.org/licenses/LICENSE-2.0',
    commercialUse: true,
    supportedModes: ['image-to-video'],
    nativeResolutions: ['480p'],
    defaultResolution: '480p',
    supportedAspectRatios: ['16:9', '9:16', '1:1', '4:3'],
    maxFrames: 81,
    nativeFps: 16,
    durationSeconds: 5,
    vramRequirements: {
      minimumVramGb: 16,
      recommendedVramGb: 24,
      quantizedNote: 'Optimized for faster generation and lower VRAM footprints (~16GB with block offloading).',
    },
    description:
      'Fast image animation variant ideal for rapid previewing and social formats with high fidelity.',
    recommendedPrompts: [
      'Gentle camera pan to the right with ambient atmospheric smoke drifting past',
    ],
    huggingFaceRepo: 'Wan-AI/Wan2.1-I2V-14B-480P',
    paperUrl: 'https://github.com/Wan-Video/Wan2.1',
  },
  {
    id: 'ltx-video-0.9.1',
    name: 'LTX-Video 0.9.1',
    shortName: 'LTX-Video',
    family: 'LTX-Video',
    providerCreator: 'Lightricks',
    parameters: '~2 Billion',
    architecture: 'Real-time Latent DiT',
    license: 'OpenRAIL-M',
    licenseUrl: 'https://huggingface.co/Lightricks/LTX-Video/blob/main/LICENSE.txt',
    commercialUse: true,
    supportedModes: ['text-to-video', 'image-to-video'],
    nativeResolutions: ['480p', '720p'],
    defaultResolution: '480p',
    supportedAspectRatios: ['16:9', '9:16', '1:1'],
    maxFrames: 97,
    nativeFps: 24,
    durationSeconds: 4,
    vramRequirements: {
      minimumVramGb: 12,
      recommendedVramGb: 16,
      quantizedNote: 'Extremely fast inference speed; can generate 4 seconds of video in under 10 seconds on high-end GPUs.',
    },
    description:
      'High-speed real-time video generation model by Lightricks, pioneering rapid generation and camera trajectory control.',
    recommendedPrompts: [
      'First-person POV walking inside a futuristic cyberpunk market with holographic neon signs',
    ],
    huggingFaceRepo: 'Lightricks/LTX-Video',
    paperUrl: 'https://github.com/Lightricks/LTX-Video',
  },
  {
    id: 'cogvideox-5b',
    name: 'CogVideoX 5B',
    shortName: 'CogVideoX',
    family: 'CogVideoX',
    providerCreator: 'THUDM / Zhipu AI',
    parameters: '5 Billion',
    architecture: '3D Expert Diffusion Transformer',
    license: 'Apache 2.0',
    licenseUrl: 'https://www.apache.org/licenses/LICENSE-2.0',
    commercialUse: true,
    supportedModes: ['text-to-video'],
    nativeResolutions: ['480p'],
    defaultResolution: '480p',
    supportedAspectRatios: ['16:9', '9:16'],
    maxFrames: 49,
    nativeFps: 8,
    durationSeconds: 6,
    vramRequirements: {
      minimumVramGb: 12,
      recommendedVramGb: 18,
      quantizedNote: 'Requires ~12GB VRAM with INT8/FP4 quantization in Diffusers.',
    },
    description:
      'Acclaimed open-source video generation model featuring exceptional temporal smoothness and semantic adherence.',
    recommendedPrompts: [
      'A cozy wooden cabin during a gentle snowstorm at twilight, warm smoke rising from the chimney',
    ],
    huggingFaceRepo: 'THUDM/CogVideoX-5b',
    paperUrl: 'https://github.com/THUDM/CogVideo',
  },
];

export function getModelById(id: string): ModelVariant | undefined {
  return MODEL_REGISTRY.find((m) => m.id === id);
}

export function getModelsForMode(mode: JobMode): ModelVariant[] {
  return MODEL_REGISTRY.filter((m) => m.supportedModes.includes(mode));
}
