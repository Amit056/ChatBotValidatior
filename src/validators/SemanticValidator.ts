import { pipeline, env } from '@xenova/transformers';

// env.allowLocalModels = false;
// env.allowRemoteModels = true;

export class SemanticValidator {
  private model: any;

  async init(): Promise<void> {
    this.model = await pipeline('feature-extraction', 'Xenova/all-MiniLM-L6-v2');
  }

  async calculateSimilarity(input1: string, input2: string): Promise<number> {
    try {
      const emb1 = await this.model(input1, { pooling: 'mean', normalize: true });
      const emb2 = await this.model(input2, { pooling: 'mean', normalize: true });
      
      const dotProduct = emb1.data.reduce((sum: number, val: number, i: number) => 
        sum + val * (emb2.data[i] as number), 0);
      
      return dotProduct;
    } catch (error) {
      console.warn('Semantic calculation failed:', error);
      return 0;
    }
  }
}