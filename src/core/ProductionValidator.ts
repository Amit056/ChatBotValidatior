import { ChatbotValidator } from './ChatbotValidator.ts';

export class ProductionValidator {
  private validator: ChatbotValidator;
  private fallbackResponses = [
    "Let me rephrase that clearly.",
    "Great question! Here's a better answer:",
    "I understand. Let me explain properly:"
  ];

  constructor(config?: any) {
    this.validator = new ChatbotValidator(config);
  }

  async init(): Promise<void> {
    await this.validator.init();
  }

  async processMessage(userInput: string, botResponse: string): Promise<string> {
    const validation = await this.validator.validateResponse(userInput, botResponse);
    
    if (!validation.valid) {
      console.warn('❌ Validation failed:', validation);
      return this.getFallback(userInput);
    }
    
    console.log('✅ Response validated:', validation.score.toFixed(3));
    return botResponse;
  }

  private getFallback(userInput: string): string {
    const fallback = this.fallbackResponses[Math.floor(Math.random() * this.fallbackResponses.length)];
    return `${fallback} ${userInput}`;
  }

  getPerformanceReport() {
    const metrics = this.validator['getMetrics']();
    const scores = metrics.map(m => Object.values(m.scores)[0] as number);
    return {
      avgScore: scores.reduce((sum, s) => sum + s, 0) / scores.length || 0,
      failureRate: metrics.filter(m => !m.valid).length / Math.max(metrics.length, 1),
      totalValidations: metrics.length
    };
  }
}