/**
 * Input validation utilities for prompts, images, and model parameters.
 */

export interface ValidationResult {
  isValid: boolean;
  error?: string;
}

export const VALIDATION_LIMITS = {
  MIN_PROMPT_LENGTH: 3,
  MAX_PROMPT_LENGTH: 1500,
  MAX_NEGATIVE_PROMPT_LENGTH: 1000,
  MAX_IMAGE_SIZE_BYTES: 10 * 1024 * 1024, // 10MB
  ALLOWED_IMAGE_TYPES: ['image/jpeg', 'image/png', 'image/webp'],
  MIN_INFERENCE_STEPS: 10,
  MAX_INFERENCE_STEPS: 60,
  MIN_GUIDANCE_SCALE: 1.0,
  MAX_GUIDANCE_SCALE: 20.0,
};

export function validatePrompt(prompt: string): ValidationResult {
  const trimmed = (prompt || '').trim();
  if (trimmed.length === 0) {
    return {
      isValid: false,
      error: 'Please enter a prompt describing your video concept.',
    };
  }

  if (trimmed.length < VALIDATION_LIMITS.MIN_PROMPT_LENGTH) {
    return {
      isValid: false,
      error: `Prompt must be at least ${VALIDATION_LIMITS.MIN_PROMPT_LENGTH} characters long.`,
    };
  }

  if (trimmed.length > VALIDATION_LIMITS.MAX_PROMPT_LENGTH) {
    return {
      isValid: false,
      error: `Prompt exceeds maximum limit of ${VALIDATION_LIMITS.MAX_PROMPT_LENGTH} characters.`,
    };
  }

  return { isValid: true };
}

export function validateNegativePrompt(negativePrompt?: string): ValidationResult {
  if (!negativePrompt) return { isValid: true };
  if (negativePrompt.length > VALIDATION_LIMITS.MAX_NEGATIVE_PROMPT_LENGTH) {
    return {
      isValid: false,
      error: `Negative prompt exceeds maximum limit of ${VALIDATION_LIMITS.MAX_NEGATIVE_PROMPT_LENGTH} characters.`,
    };
  }
  return { isValid: true };
}

export function validateImageFile(file: File): ValidationResult {
  if (!VALIDATION_LIMITS.ALLOWED_IMAGE_TYPES.includes(file.type)) {
    return {
      isValid: false,
      error: `Unsupported image format: "${file.type || 'unknown'}". Please upload PNG, JPG, or WebP.`,
    };
  }

  if (file.size > VALIDATION_LIMITS.MAX_IMAGE_SIZE_BYTES) {
    const sizeMb = (file.size / (1024 * 1024)).toFixed(1);
    return {
      isValid: false,
      error: `Image file is too large (${sizeMb} MB). Maximum allowed size is 10 MB.`,
    };
  }

  return { isValid: true };
}

export function validateSteps(steps: number): ValidationResult {
  if (steps < VALIDATION_LIMITS.MIN_INFERENCE_STEPS || steps > VALIDATION_LIMITS.MAX_INFERENCE_STEPS) {
    return {
      isValid: false,
      error: `Inference steps must be between ${VALIDATION_LIMITS.MIN_INFERENCE_STEPS} and ${VALIDATION_LIMITS.MAX_INFERENCE_STEPS}.`,
    };
  }
  return { isValid: true };
}

export function validateGuidanceScale(scale: number): ValidationResult {
  if (scale < VALIDATION_LIMITS.MIN_GUIDANCE_SCALE || scale > VALIDATION_LIMITS.MAX_GUIDANCE_SCALE) {
    return {
      isValid: false,
      error: `Guidance scale must be between ${VALIDATION_LIMITS.MIN_GUIDANCE_SCALE} and ${VALIDATION_LIMITS.MAX_GUIDANCE_SCALE}.`,
    };
  }
  return { isValid: true };
}
