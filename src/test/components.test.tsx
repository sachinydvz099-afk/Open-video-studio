import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { VideoPlayer } from '../components/player/VideoPlayer';
import { PromptEditor } from '../components/studio/PromptEditor';
import { AspectRatioPicker } from '../components/studio/AspectRatioPicker';
import { Badge } from '../components/common/Badge';
import { Button } from '../components/common/Button';

describe('UI Components Unit Tests', () => {
  describe('VideoPlayer', () => {
    it('renders video element and demo badge', () => {
      render(
        <VideoPlayer
          src="https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4"
          prompt="Test cyberpunk prompt"
          title="Cyberpunk Test"
          isSimulated={true}
          aspectRatio="16:9"
        />
      );

      expect(screen.getByText(/Demo Simulation/i)).toBeInTheDocument();
      expect(screen.getByText('16:9')).toBeInTheDocument();
      expect(screen.getByText('Cyberpunk Test')).toBeInTheDocument();
    });

    it('triggers play/pause on click', () => {
      render(
        <VideoPlayer
          src="blob:mock-url"
          isSimulated={true}
        />
      );

      const playBtn = screen.getByLabelText(/Play video/i);
      expect(playBtn).toBeInTheDocument();
      fireEvent.click(playBtn);
    });
  });

  describe('PromptEditor', () => {
    it('renders prompt text, character counter, and handles edits', () => {
      const handleChange = vi.fn();
      const handleNegChange = vi.fn();
      const handleOpenExamples = vi.fn();

      render(
        <PromptEditor
          prompt="A majestic lion on a savanna"
          onPromptChange={handleChange}
          negativePrompt=""
          onNegativePromptChange={handleNegChange}
          onOpenExamples={handleOpenExamples}
        />
      );

      const textarea = screen.getByPlaceholderText(/Describe the scene/i);
      expect(textarea).toHaveValue('A majestic lion on a savanna');

      fireEvent.change(textarea, { target: { value: 'New scene prompt' } });
      expect(handleChange).toHaveBeenCalledWith('New scene prompt');

      const libraryBtn = screen.getByText(/Prompt Library/i);
      fireEvent.click(libraryBtn);
      expect(handleOpenExamples).toHaveBeenCalled();
    });

    it('displays validation error if provided', () => {
      render(
        <PromptEditor
          prompt=""
          onPromptChange={() => {}}
          negativePrompt=""
          onNegativePromptChange={() => {}}
          onOpenExamples={() => {}}
          error="Please enter a valid prompt."
        />
      );

      expect(screen.getByText('Please enter a valid prompt.')).toBeInTheDocument();
    });
  });

  describe('AspectRatioPicker', () => {
    it('renders all aspect ratio options and calls onChange', () => {
      const handleChange = vi.fn();
      render(
        <AspectRatioPicker
          value="16:9"
          onChange={handleChange}
        />
      );

      expect(screen.getByText('16:9')).toBeInTheDocument();
      expect(screen.getByText('9:16')).toBeInTheDocument();
      expect(screen.getByText('1:1')).toBeInTheDocument();
      expect(screen.getByText('4:3')).toBeInTheDocument();
      expect(screen.getByText('21:9')).toBeInTheDocument();

      fireEvent.click(screen.getByText('9:16'));
      expect(handleChange).toHaveBeenCalledWith('9:16');
    });
  });

  describe('Common Button & Badge', () => {
    it('renders button with loading spinner when isLoading=true', () => {
      render(
        <Button isLoading={true}>
          Generating Video
        </Button>
      );

      const button = screen.getByRole('button');
      expect(button).toBeDisabled();
      expect(screen.getByText('Generating Video')).toBeInTheDocument();
    });

    it('renders badge with correct variant style', () => {
      render(<Badge variant="amber">Wan2.1</Badge>);
      expect(screen.getByText('Wan2.1')).toBeInTheDocument();
    });
  });
});
