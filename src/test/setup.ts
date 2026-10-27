import '@testing-library/jest-dom';

// Mock window.HTMLMediaElement for JSDOM
if (typeof window !== 'undefined') {
  window.HTMLMediaElement.prototype.load = () => {};
  window.HTMLMediaElement.prototype.play = async () => {};
  window.HTMLMediaElement.prototype.pause = () => {};
  window.HTMLMediaElement.prototype.addTextTrack = () => ({} as any);

  // Mock URL.createObjectURL and URL.revokeObjectURL
  if (!window.URL.createObjectURL) {
    window.URL.createObjectURL = () => 'blob:mock-video-url';
  }
  if (!window.URL.revokeObjectURL) {
    window.URL.revokeObjectURL = () => {};
  }
}
