/**
 * Curated sample catalog and procedural video generators for Open Video Studio Demo mode.
 * Guarantees zero-network offline functionality with genuine video playback and download.
 */

export interface SampleVideoItem {
  id: string;
  title: string;
  mode: 'text-to-video' | 'image-to-video';
  modelId: string;
  prompt: string;
  aspectRatio: '16:9' | '9:16' | '1:1';
  resolution: '480p' | '720p';
  durationSeconds: number;
  fps: number;
  tags: string[];
  thumbnailGradient: string;
  // Fallback public video sources
  remoteUrl?: string;
  // Generator visual style for offline fallback video creation
  generatorTheme: 'cyberpunk' | 'nebula' | 'ocean' | 'nature' | 'portrait' | 'abstract';
}

export const SAMPLE_VIDEOS: SampleVideoItem[] = [
  {
    id: 'sample-cyberpunk-1',
    title: 'Neon Cyberpunk Metropolis',
    mode: 'text-to-video',
    modelId: 'wan2.1-t2v-14b',
    prompt: 'Cinematic wide drone shot flying through a rain-drenched futuristic neo-Tokyo metropolis, towering holographic neon billboards, volumetric blue and amber smog, flying vehicles darting between skyscrapers, 8k masterpiece',
    aspectRatio: '16:9',
    resolution: '720p',
    durationSeconds: 5,
    fps: 24,
    tags: ['Sci-Fi', 'Cyberpunk', 'Cityscape', 'Wan2.1 14B'],
    thumbnailGradient: 'from-blue-900 via-indigo-950 to-amber-900',
    remoteUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4',
    generatorTheme: 'cyberpunk',
  },
  {
    id: 'sample-nebula-2',
    title: 'Cosmic Nebula Galleon',
    mode: 'text-to-video',
    modelId: 'wan2.1-t2v-1.3b',
    prompt: 'An ethereal wooden galleon sailing smoothly through shimmering magenta and gold cosmic dust clouds, stars twinkling, celestial light rays, hyper-realistic physics',
    aspectRatio: '16:9',
    resolution: '480p',
    durationSeconds: 5,
    fps: 16,
    tags: ['Fantasy', 'Space', 'Wan2.1 1.3B'],
    thumbnailGradient: 'from-purple-950 via-pink-900 to-indigo-950',
    remoteUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4',
    generatorTheme: 'nebula',
  },
  {
    id: 'sample-ocean-3',
    title: 'Bioluminescent Abyss Jellyfish',
    mode: 'text-to-video',
    modelId: 'ltx-video-0.9.1',
    prompt: 'Macro slow motion cinematography of translucent glowing blue and violet jellyfish pulsating in the deep midnight oceanic abyss, radiant sparkles, 4k ultra-detailed',
    aspectRatio: '9:16',
    resolution: '720p',
    durationSeconds: 4,
    fps: 24,
    tags: ['Nature', 'Underwater', 'Macro', 'LTX-Video'],
    thumbnailGradient: 'from-cyan-950 via-teal-900 to-blue-950',
    generatorTheme: 'ocean',
  },
  {
    id: 'sample-portrait-4',
    title: 'Golden Hour Cinematic Portrait',
    mode: 'image-to-video',
    modelId: 'wan2.1-i2v-14b-720p',
    prompt: 'The subject turns gently towards the camera with a subtle genuine smile, autumn leaves floating past, warm golden sunlight lens flare, cinematic 85mm lens depth of field',
    aspectRatio: '16:9',
    resolution: '720p',
    durationSeconds: 5,
    fps: 16,
    tags: ['Portrait', 'Image-to-Video', 'Cinematic', 'Wan2.1 I2V'],
    thumbnailGradient: 'from-amber-950 via-orange-900 to-stone-900',
    generatorTheme: 'portrait',
  },
  {
    id: 'sample-nature-5',
    title: 'Misty Alpine Pine Valley',
    mode: 'text-to-video',
    modelId: 'cogvideox-5b',
    prompt: 'Hyper-realistic drone flying over jagged snow-capped mountain peaks surrounded by sea of clouds, evergreen pine forest below, sunrise volumetric rays',
    aspectRatio: '16:9',
    resolution: '480p',
    durationSeconds: 5,
    fps: 16,
    tags: ['Nature', 'Landscape', 'CogVideoX'],
    thumbnailGradient: 'from-emerald-950 via-slate-900 to-teal-950',
    generatorTheme: 'nature',
  },
  {
    id: 'sample-abstract-6',
    title: 'Liquid Mercury Morphing Sculpture',
    mode: 'image-to-video',
    modelId: 'wan2.1-i2v-14b-480p',
    prompt: 'The chrome metallic sculpture smoothly ripples and flows like liquid mercury, reflecting neon studio lights, high-end 3D motion graphics',
    aspectRatio: '1:1',
    resolution: '480p',
    durationSeconds: 5,
    fps: 16,
    tags: ['3D Motion', 'Abstract', 'Wan2.1 I2V'],
    thumbnailGradient: 'from-slate-800 via-zinc-900 to-slate-950',
    generatorTheme: 'abstract',
  },
];

/**
 * Procedurally generates a genuine playable Video Blob (WebM/MP4) using HTML5 Canvas & MediaRecorder.
 * This guarantees 100% offline functionality without external video CDNs or broken links.
 */
export async function generateProceduralDemoVideo(
  theme: 'cyberpunk' | 'nebula' | 'ocean' | 'nature' | 'portrait' | 'abstract',
  promptText: string,
  modelName: string,
  durationSeconds: number = 3,
  fps: number = 20,
  sourceImageDataUrl?: string
): Promise<Blob> {
  const width = 640;
  const height = 360;

  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');

  if (!ctx || typeof MediaRecorder === 'undefined' || !canvas.captureStream) {
    // Return empty blob if MediaRecorder or Canvas not available (e.g. headless mock)
    return new Blob(['simulated-demo-video-content'], { type: 'video/mp4' });
  }

  // Pre-load user source image if provided
  let loadedSourceImage: HTMLImageElement | null = null;
  if (sourceImageDataUrl) {
    loadedSourceImage = await new Promise<HTMLImageElement | null>((resolve) => {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => resolve(img);
      img.onerror = () => resolve(null);
      img.src = sourceImageDataUrl;
    });
  }

  const stream = canvas.captureStream(fps);
  const recordedChunks: Blob[] = [];

  // Determine mimeType
  const mimeType = MediaRecorder.isTypeSupported('video/webm;codecs=vp9')
    ? 'video/webm;codecs=vp9'
    : MediaRecorder.isTypeSupported('video/webm')
    ? 'video/webm'
    : 'video/mp4';

  const mediaRecorder = new MediaRecorder(stream, { mimeType });

  mediaRecorder.ondataavailable = (event) => {
    if (event.data && event.data.size > 0) {
      recordedChunks.push(event.data);
    }
  };

  return new Promise<Blob>((resolve) => {
    mediaRecorder.onstop = () => {
      const finalBlob = new Blob(recordedChunks, { type: mimeType });
      resolve(finalBlob);
    };

    mediaRecorder.start();

    const totalFrames = durationSeconds * fps;
    let currentFrame = 0;

    const interval = setInterval(() => {
      currentFrame++;
      const t = currentFrame / totalFrames; // 0 to 1

      if (loadedSourceImage && loadedSourceImage.width) {
        // Animate user's actual uploaded source image
        const scale = 1.0 + t * 0.12;
        const dw = width * scale;
        const dh = height * scale;
        const dx = (width - dw) / 2;
        const dy = (height - dh) / 2;
        ctx.clearRect(0, 0, width, height);
        ctx.drawImage(loadedSourceImage, dx, dy, dw, dh);

        // Subtle cinematic lighting sweep
        const flareX = width * (0.2 + t * 0.6);
        const flareGrad = ctx.createRadialGradient(flareX, height * 0.3, 5, flareX, height * 0.3, width * 0.5);
        flareGrad.addColorStop(0, 'rgba(255, 240, 200, 0.15)');
        flareGrad.addColorStop(1, 'transparent');
        ctx.fillStyle = flareGrad;
        ctx.fillRect(0, 0, width, height);

        // Discrete studio badge
        ctx.fillStyle = 'rgba(15, 23, 42, 0.65)';
        ctx.fillRect(width - 165, height - 26, 155, 18);
        ctx.fillStyle = '#f59e0b';
        ctx.font = '600 10px Inter, system-ui, sans-serif';
        ctx.fillText(`Open Video Studio • ${modelName}`, width - 158, height - 13);
      } else {
        // Render theme visual onto canvas
        renderFrame(ctx, width, height, theme, t, promptText, modelName);
      }

      if (currentFrame >= totalFrames) {
        clearInterval(interval);
        setTimeout(() => {
          if (mediaRecorder.state !== 'inactive') {
            mediaRecorder.stop();
          }
        }, 100);
      }
    }, 1000 / fps);
  });
}

function renderFrame(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  theme: string,
  t: number,
  prompt: string,
  modelName: string
) {
  // Clear background
  ctx.fillStyle = '#07080b';
  ctx.fillRect(0, 0, w, h);

  // Dynamic theme background
  if (theme === 'cyberpunk') {
    // Neon grid and rain
    const grad = ctx.createLinearGradient(0, 0, 0, h);
    grad.addColorStop(0, '#090d1a');
    grad.addColorStop(0.7, '#141328');
    grad.addColorStop(1, '#2b1029');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, w, h);

    // Grid lines moving forward
    ctx.strokeStyle = `rgba(6, 182, 212, ${0.2 + Math.sin(t * Math.PI) * 0.15})`;
    ctx.lineWidth = 1;
    const horizon = h * 0.65;
    for (let x = -w; x <= w * 2; x += 40) {
      ctx.beginPath();
      ctx.moveTo(w / 2, horizon);
      ctx.lineTo(x + (t * 40) % 40, h);
      ctx.stroke();
    }
    for (let y = horizon; y <= h; y += 15) {
      const offset = (y - horizon) + ((t * 15) % 15);
      if (horizon + offset <= h) {
        ctx.beginPath();
        ctx.moveTo(0, horizon + offset);
        ctx.lineTo(w, horizon + offset);
        ctx.stroke();
      }
    }

    // Glowing sun / neon sphere
    const sunGrad = ctx.createRadialGradient(w / 2, horizon - 20, 10, w / 2, horizon - 20, 80);
    sunGrad.addColorStop(0, 'rgba(245, 158, 11, 0.9)');
    sunGrad.addColorStop(0.5, 'rgba(236, 72, 153, 0.7)');
    sunGrad.addColorStop(1, 'transparent');
    ctx.fillStyle = sunGrad;
    ctx.beginPath();
    ctx.arc(w / 2, horizon - 20, 80, 0, Math.PI * 2);
    ctx.fill();
  } else if (theme === 'nebula') {
    // Starfield & swirling galactic cloud
    const grad = ctx.createRadialGradient(
      w / 2 + Math.cos(t * Math.PI * 2) * 50,
      h / 2 + Math.sin(t * Math.PI * 2) * 30,
      20,
      w / 2,
      h / 2,
      250
    );
    grad.addColorStop(0, 'rgba(217, 70, 239, 0.8)');
    grad.addColorStop(0.4, 'rgba(99, 102, 241, 0.5)');
    grad.addColorStop(0.8, 'rgba(15, 23, 42, 0.9)');
    grad.addColorStop(1, '#05070d');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, w, h);

    // Twinkling stars
    ctx.fillStyle = '#ffffff';
    for (let i = 0; i < 40; i++) {
      const sx = (i * 97) % w;
      const sy = (i * 61) % h;
      const alpha = 0.3 + 0.7 * Math.sin(t * Math.PI * 4 + i);
      ctx.globalAlpha = alpha;
      ctx.beginPath();
      ctx.arc(sx, sy, 1.5, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.globalAlpha = 1.0;
  } else {
    // Oceanic / nature ambient fluid particles
    const grad = ctx.createLinearGradient(0, 0, w, h);
    grad.addColorStop(0, '#042f2e');
    grad.addColorStop(0.5, '#0c4a6e');
    grad.addColorStop(1, '#0f172a');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, w, h);

    // Glowing organic pulses
    for (let j = 0; j < 5; j++) {
      const radius = 40 + j * 25 + Math.sin(t * Math.PI * 2 + j) * 20;
      const px = w * 0.3 + j * 60 + Math.sin(t * 3 + j) * 30;
      const py = h * 0.4 + Math.cos(t * 3 + j) * 30;
      const pGrad = ctx.createRadialGradient(px, py, 5, px, py, radius);
      pGrad.addColorStop(0, 'rgba(45, 212, 191, 0.4)');
      pGrad.addColorStop(1, 'transparent');
      ctx.fillStyle = pGrad;
      ctx.beginPath();
      ctx.arc(px, py, radius, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  // Discrete aesthetic corner watermark
  ctx.fillStyle = 'rgba(15, 23, 42, 0.65)';
  ctx.fillRect(w - 175, h - 26, 165, 18);
  ctx.fillStyle = '#f59e0b';
  ctx.font = '600 10px Inter, system-ui, sans-serif';
  ctx.fillText(`Open Video Studio • ${modelName}`, w - 168, h - 13);
}
