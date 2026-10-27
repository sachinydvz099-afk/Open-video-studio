import { describe, it, expect } from 'vitest';
import {
  validatePrompt,
  validateNegativePrompt,
  validateImageFile,
  validateSteps,
  validateGuidanceScale,
  VALIDATION_LIMITS,
} from '../utils/validators';

describe('Validators Unit Tests', () => {
  describe('validatePrompt', () => {
    it('rejects empty prompts', () => {
      const res = validatePrompt('');
      expect(res.isValid).toBe(false);
      expect(res.error).toContain('Please enter a prompt');
    });

    it('rejects prompts with only whitespace', () => {
      const res = validatePrompt('   ');
      expect(res.isValid).toBe(false);
    });

    it('rejects prompts shorter than minimum characters', () => {
      const res = validatePrompt('ab');
      expect(res.isValid).toBe(false);
      expect(res.error).toContain(`at least ${VALIDATION_LIMITS.MIN_PROMPT_LENGTH} characters`);
    });

    it('accepts valid cinematic prompts', () => {
      const res = validatePrompt('Cinematic drone shot over misty mountains');
      expect(res.isValid).toBe(true);
      expect(res.error).toBeUndefined();
    });

    it('rejects prompts exceeding maximum length', () => {
      const longPrompt = 'a'.repeat(VALIDATION_LIMITS.MAX_PROMPT_LENGTH + 10);
      const res = validatePrompt(longPrompt);
      expect(res.isValid).toBe(false);
      expect(res.error).toContain('exceeds maximum limit');
    });
  });

  describe('validateNegativePrompt', () => {
    it('accepts undefined or empty negative prompt', () => {
      expect(validateNegativePrompt(undefined).isValid).toBe(true);
      expect(validateNegativePrompt('').isValid).toBe(true);
    });

    it('rejects negative prompt exceeding limit', () => {
      const tooLong = 'x'.repeat(VALIDATION_LIMITS.MAX_NEGATIVE_PROMPT_LENGTH + 5);
      expect(validateNegativePrompt(tooLong).isValid).toBe(false);
    });
  });

  describe('validateImageFile', () => {
    it('accepts valid PNG, JPG, and WebP images', () => {
      const pngFile = new File(['mock content'], 'test.png', { type: 'image/png' });
      const jpgFile = new File(['mock content'], 'test.jpg', { type: 'image/jpeg' });
      const webpFile = new File(['mock content'], 'test.webp', { type: 'image/webp' });

      expect(validateImageFile(pngFile).isValid).toBe(true);
      expect(validateImageFile(jpgFile).isValid).toBe(true);
      expect(validateImageFile(webpFile).isValid).toBe(true);
    });

    it('rejects unsupported file formats like GIF, SVG, or executable', () => {
      const gifFile = new File(['mock'], 'test.gif', { type: 'image/gif' });
      const exeFile = new File(['mock'], 'test.exe', { type: 'application/octet-stream' });

      const resGif = validateImageFile(gifFile);
      expect(resGif.isValid).toBe(false);
      expect(resGif.error).toContain('Unsupported image format');

      const resExe = validateImageFile(exeFile);
      expect(resExe.isValid).toBe(false);
    });

    it('rejects images exceeding 10MB', () => {
      // Mock large file > 10MB
      const largeFile = new File([''], 'huge.jpg', { type: 'image/jpeg' });
      Object.defineProperty(largeFile, 'size', { value: 12 * 1024 * 1024 });

      const res = validateImageFile(largeFile);
      expect(res.isValid).toBe(false);
      expect(res.error).toContain('Image file is too large');
    });
  });

  describe('validateSteps and validateGuidanceScale', () => {
    it('validates inference steps range', () => {
      expect(validateSteps(5).isValid).toBe(false);
      expect(validateSteps(30).isValid).toBe(true);
      expect(validateSteps(100).isValid).toBe(false);
    });

    it('validates guidance scale range', () => {
      expect(validateGuidanceScale(0.5).isValid).toBe(false);
      expect(validateGuidanceScale(7.5).isValid).toBe(true);
      expect(validateGuidanceScale(25).isValid).toBe(false);
    });
  });
});
