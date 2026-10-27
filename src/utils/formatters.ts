import { AspectRatio } from '../providers/types';

export function formatDuration(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
}

export function formatFileSize(bytes?: number): string {
  if (!bytes || bytes <= 0) return '0 B';
  const units = ['B', 'KB', 'MB', 'GB'];
  let size = bytes;
  let unitIndex = 0;
  while (size >= 1024 && unitIndex < units.length - 1) {
    size /= 1024;
    unitIndex++;
  }
  return `${size.toFixed(1)} ${units[unitIndex]}`;
}

export function formatRelativeTime(timestamp: number): string {
  const diffMs = Date.now() - timestamp;
  const diffSec = Math.floor(diffMs / 1000);
  if (diffSec < 60) return 'Just now';
  const diffMin = Math.floor(diffSec / 60);
  if (diffMin < 60) return `${diffMin}m ago`;
  const diffHours = Math.floor(diffMin / 60);
  if (diffHours < 24) return `${diffHours}h ago`;
  const diffDays = Math.floor(diffHours / 24);
  return `${diffDays}d ago`;
}

export function getAspectRatioLabel(ratio: AspectRatio): string {
  switch (ratio) {
    case '16:9':
      return '16:9 Widescreen (YouTube, Cinema)';
    case '9:16':
      return '9:16 Vertical (TikTok, Reels, Shorts)';
    case '1:1':
      return '1:1 Square (Feed Post)';
    case '4:3':
      return '4:3 Classic TV';
    case '21:9':
      return '21:9 Anamorphic Cinema';
    default:
      return ratio;
  }
}

export function getDimensionsForRatio(ratio: AspectRatio, resolution: '480p' | '720p'): { width: number; height: number } {
  if (resolution === '720p') {
    switch (ratio) {
      case '16:9':
        return { width: 1280, height: 720 };
      case '9:16':
        return { width: 720, height: 1280 };
      case '1:1':
        return { width: 720, height: 720 };
      case '4:3':
        return { width: 960, height: 720 };
      case '21:9':
        return { width: 1680, height: 720 };
      default:
        return { width: 1280, height: 720 };
    }
  } else {
    // 480p
    switch (ratio) {
      case '16:9':
        return { width: 832, height: 480 };
      case '9:16':
        return { width: 480, height: 832 };
      case '1:1':
        return { width: 512, height: 512 };
      case '4:3':
        return { width: 640, height: 480 };
      case '21:9':
        return { width: 1120, height: 480 };
      default:
        return { width: 832, height: 480 };
    }
  }
}
