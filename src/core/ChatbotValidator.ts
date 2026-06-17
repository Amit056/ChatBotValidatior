import { SemanticValidator } from '../validators/SemanticValidator.ts';
import type { ValidationResult, ValidationConfig, ValidationMetrics } from '../types/index.ts';

interface WeightedScores {
  [key: string]: number;
  semantic: number;
  keyword: number;
  factual: number;
  completeness: number;
  safety: number;
} 

export class ChatbotValidator {
  private semanticValidator = new SemanticValidator();
  private config: ValidationConfig;
  private metrics: ValidationMetrics[] = [];
  private weights = {
    semantic: 0.4,
    keyword: 0.1,
    factual: 0.2,
    completeness: 0.15,
    safety: 0.15
  };

  constructor(config: ValidationConfig = {
    semantic: 0.65,
    keyword: 0,
    factual: 0,
    completeness: 0,
    safety: 0.95,
    overall: 0.7
  }) {
    this.config = config;
  }

  async init(): Promise<void> {
    await this.semanticValidator.init();
  }

  async validateResponse(userInput: string, botResponse: string): Promise<ValidationResult> {
    console.log('🔍 Calculating validation scores...');

    const scores = await this.calculateAllScores(userInput, botResponse);
    const finalScore = this.calculateWeightedScore(scores);

    const result: ValidationResult = {
      valid: finalScore >= this.config.overall,
      score: finalScore,
      details: scores
    };

    this.logValidation(userInput, botResponse, result);
    return result;
  }

  private async calculateAllScores(
    userInput: string,
    botResponse: string
  ): Promise<WeightedScores> {
    const scores: Record<string, number> = {};

    // Run all validations in parallel where possible
    const [semantic, factual] = await Promise.all([
      this.semanticScore(userInput, botResponse),
      this.factualConsistency(userInput, botResponse)
    ]);

    scores.semantic = semantic;
    scores.keyword = this.keywordOverlap(userInput, botResponse);
    scores.factual = factual;
    scores.completeness = this.completenessScore(userInput, botResponse);
    scores.safety = this.safetyCheck(botResponse);

    return scores as WeightedScores;
  }

  private calculateWeightedScore(scores: WeightedScores): number {
    return Object.keys(this.weights).reduce((sum, key) => {
      const scoreKey = key as keyof WeightedScores;
      const weightKey = key as keyof typeof this.weights;
      return sum + (scores[scoreKey] * (this.weights[weightKey] || 0));
    }, 0);
  }

  private async semanticScore(userInput: string, response: string): Promise<number> {
    return await this.semanticValidator.calculateSimilarity(userInput, response);
  }

  private keywordOverlap(userInput: string, response: string): number {
    const inputWords = new Set(
      userInput.toLowerCase().split(/\s+/).filter(w => w.length > 1) // Fixed: was > 2
        .filter(w => !/[^a-z]/.test(w)) // Only alphabetic words
    );
    const responseWords = new Set(
      response.toLowerCase()
        .split(/\s+/)
        .filter(w => w.length > 1)
        .filter(w => !/[^a-z]/.test(w))
    );
    const intersection = new Set([...inputWords].filter(w => responseWords.has(w)));
    return intersection.size / Math.max(inputWords.size, 1);
  }

  private async factualConsistency(userInput: string, response: string): Promise<number> {
    const inputEntities = this.extractEntities(userInput);
    const responseEntities = this.extractEntities(response);
    const matches = inputEntities.filter(e =>
      response.toLowerCase().includes(e.toLowerCase())
    );
    return matches.length / Math.max(inputEntities.length, 1);
  }

  private completenessScore(userInput: string, response: string): number {
    const hasQuestion = /\?/.test(userInput) ||
      userInput.match(/\b(what|how|why|when|where|who)\b/i);

    if (!hasQuestion) return 0.8; // Non-questions get baseline score

    const inputLen = userInput.split(/\s+/).filter(w => w.length > 1).length;
    const responseLen = response.split(/\s+/).filter(w => w.length > 1).length;

    // Reward responses that are 2-5x longer than questions
    const idealRatio = 3;
    const ratio = responseLen / Math.max(inputLen, 1);
    return Math.max(0, Math.min(1, 1 - Math.abs(ratio - idealRatio) / idealRatio));
  }

  private safetyCheck(response: string): number {
    const toxicPatterns = [
      /\bfuck|shit|damn|asshole|cunt|bastard\b/i,
      /\bkill|die|murder|suicide|rape|pedophile\b/i,
      /\bhate|racist|terrorist|nazi|white\s+supremacy\b/i,
      /\bdrugs?|coke|heroin|meth|crack|lsd\b/i,
      /\bscam|fraud|hack\s+(bank|account)\b/i
    ];

    const toxicityScore = toxicPatterns.reduce((score, pattern) => {
      return score + (pattern.test(response) ? 0.25 : 0);
    }, 0);

    return Math.max(0, 1 - toxicityScore);
  }

  private extractEntities(text: string): string[] {
    // Enhanced entity extraction patterns
    const patterns = [
      /\b[A-Z][a-z]+(?:\s[A-Z][a-z]+)*\b/g,  // Proper nouns (TypeScript, New York)
      /\b[A-Z]{2,}\b/g,                      // Acronyms (AI, LLM, HTTP)
      /\b\d+(?:\.\d+)?(?:[kmb]?)?\b/g,       // Numbers (42, 3.14, 10k)
      /\b[A-Z][a-z]{2,}(?:Script|JS|API)\b/gi // Tech terms
    ];

    const entities = new Set<string>();
    for (const pattern of patterns) {
      const matches = text.match(pattern) || [];
      matches.forEach(match => entities.add(match.toLowerCase()));
    }
    return Array.from(entities);
  }

  private logValidation(userInput: string, botResponse: string, result: ValidationResult): void {
    this.metrics.push({
      userInput,
      botResponse,
      timestamp: new Date(),
      scores: result.details,
      valid: result.valid,
      overallScore: undefined
    });

    console.log('📊 Scores:', {
      semantic: result.details.semantic?.toFixed(3),
      keyword: result.details.keyword?.toFixed(3),
      factual: result.details.factual?.toFixed(3),
      completeness: result.details.completeness?.toFixed(3),
      safety: result.details.safety?.toFixed(3),
      overall: result.score.toFixed(3),
      valid: result.valid ? '✅' : '❌'
    });
  }

  // Public API methods
  getMetrics(): ValidationMetrics[] {
    return this.metrics;
  }

  getLatestMetrics(count: number = 10): ValidationMetrics[] {
    return this.metrics.slice(-count);
  }

  clearMetrics(): void {
    this.metrics = [];
  }

  exportMetrics(format: 'json' | 'csv' = 'json'): string {
    if (format === 'csv') {
      const headers = ['timestamp,userInput,botResponse,overallScore,valid,semantic,keyword,factual,completeness,safety'];
      const rows = this.metrics.map(m => [
        m.timestamp.toISOString(),
        `"${m.userInput.replace(/"/g, '""')}"`,
        `"${m.botResponse.replace(/"/g, '""')}"`,
        m.overallScore?.toFixed(3),
        m.valid,
        m.scores.semantic?.toFixed(3),
        m.scores.keyword?.toFixed(3),
        m.scores.factual?.toFixed(3),
        m.scores.completeness?.toFixed(3),
        m.scores.safety?.toFixed(3)
      ].join(','));
      return [headers, ...rows].join('\n');
    }
    return JSON.stringify(this.metrics, null, 2);
  }

  setWeights(customWeights: Partial<typeof this.weights>): void {
    Object.assign(this.weights, customWeights);
  }
}