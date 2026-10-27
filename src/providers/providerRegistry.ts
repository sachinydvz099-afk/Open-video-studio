import { IVideoProvider } from './types';
import { DemoProvider } from './DemoProvider';
import { HuggingFaceGradioProvider } from './HuggingFaceGradioProvider';
import { CustomProvider } from './CustomProvider';

export type ProviderType = 'demo' | 'huggingface' | 'custom';

class ProviderManager {
  private currentType: ProviderType = 'demo';
  private demoProvider: DemoProvider;
  private hfProvider: HuggingFaceGradioProvider;
  private customProvider: CustomProvider;

  constructor() {
    this.demoProvider = new DemoProvider('normal', 'none');
    this.hfProvider = new HuggingFaceGradioProvider({
      spaceId: 'Wan-AI/Wan2.1-T2V-14B',
    });
    this.customProvider = new CustomProvider({
      endpointUrl: 'http://127.0.0.1:8188',
    });
  }

  public getActiveProvider(): IVideoProvider {
    switch (this.currentType) {
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
