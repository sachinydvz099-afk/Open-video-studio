import { IVideoProvider } from './types';
import { RealisticAiProvider } from './RealisticAiProvider';
import { DemoProvider } from './DemoProvider';
import { HuggingFaceGradioProvider } from './HuggingFaceGradioProvider';
import { CustomProvider } from './CustomProvider';

export type ProviderType = 'realistic-ai' | 'huggingface' | 'custom' | 'demo';

class ProviderManager {
  private currentType: ProviderType = 'realistic-ai';
  private realisticAiProvider: RealisticAiProvider;
  private demoProvider: DemoProvider;
  private hfProvider: HuggingFaceGradioProvider;
  private customProvider: CustomProvider;

  constructor() {
    this.realisticAiProvider = new RealisticAiProvider();
    this.demoProvider = new DemoProvider('normal', 'none');
    this.hfProvider = new HuggingFaceGradioProvider({
      spaceId: 'multimodalart/wan2-1-fast',
    });
    this.customProvider = new CustomProvider({
      endpointUrl: 'http://127.0.0.1:8188',
    });
  }

  public getActiveProvider(): IVideoProvider {
    switch (this.currentType) {
      case 'realistic-ai':
        return this.realisticAiProvider;
      case 'huggingface':
        return this.hfProvider;
      case 'custom':
        return this.customProvider;
      case 'demo':
      default:
        return this.demoProvider;
    }
  }

  public getActiveType(): ProviderType {
    return this.currentType;
  }

  public setActiveType(type: ProviderType) {
    this.currentType = type;
  }

  public getRealisticAiProvider(): RealisticAiProvider {
    return this.realisticAiProvider;
  }

  public getDemoProvider(): DemoProvider {
    return this.demoProvider;
  }

  public getHuggingFaceProvider(): HuggingFaceGradioProvider {
    return this.hfProvider;
  }

  public getCustomProvider(): CustomProvider {
    return this.customProvider;
  }
}

export const providerManager = new ProviderManager();

