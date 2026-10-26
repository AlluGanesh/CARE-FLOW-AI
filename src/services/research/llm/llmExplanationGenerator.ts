// Grounded LLM Explanation Generator with Fallback - Phase 2
import { Evidence, ExplanationGenerator, LLMProvider, MedicalEntity, MedicalExplanation, ResearchSource } from '../../../types/research';
import { RuleBasedExplanationGenerator } from '../explanationService';

interface StructuredExplanationOutput {
  title: string;
  simpleExplanation: string;
  generalUse?: string;
  safetyNote?: string;
  claims: string[];
}

export class LLMExplanationGenerator implements ExplanationGenerator {
  private fallbackGenerator = new RuleBasedExplanationGenerator();

  constructor(
    private llmProvider: LLMProvider,
    private evidenceMap: Map<string, Evidence[]> = new Map(),
    private sourceMap: Map<string, ResearchSource[]> = new Map()
  ) {}

  public setContext(evidenceMap: Map<string, Evidence[]>, sourceMap: Map<string, ResearchSource[]>) {
    this.evidenceMap = evidenceMap;
    this.sourceMap = sourceMap;
  }

  /**
   * Generates a grounded patient explanation using the LLM and retrieved evidence.
   * If LLM is unavailable or fails, falls back automatically to RuleBasedExplanationGenerator.
   */
  public async explain(entity: MedicalEntity): Promise<MedicalExplanation> {
    try {
      const isAvailable = await this.llmProvider.isAvailable();
      if (!isAvailable) {
        return this.generateFallback(entity, 'LLM provider unavailable');
      }

      const entityEvidence = this.evidenceMap.get(entity.id) || [];
      const entitySources = this.sourceMap.get(entity.id) || [];

      // If no authoritative evidence was retrieved for this entity, rule 33 applies:
      // "If no sufficiently reliable source is found... do NOT hallucinate"
      if (entityEvidence.length === 0 || entitySources.length === 0) {
        return {
          entityId: entity.id,
          entityName: entity.name,
          entityType: entity.type,
          title: entity.name,
          simpleExplanation: `No sufficiently reliable source was found for ${entity.name}. The system has not generated a definitive explanation for this item to prevent unsupported medical assertions.`,
          importantNote: 'Discuss this item directly with your attending physician.',
          safetyDisclaimer: 'Clinical safety boundary: No ungrounded claims generated.',
          isEvidenceBacked: false,
          evidenceLevel: 'insufficient',
          sourceIds: []
        };
      }

      // Format prompt strictly separating system instructions from untrusted evidence data (Rules 26, 51, 52)
      const systemPrompt = `You are a clinical education assistant for CareFlow AI.
TASK: Explain medical terms to patients using ONLY the provided authoritative evidence.
CRITICAL SAFETY BOUNDARIES:
1. Never diagnose conditions.
2. Never prescribe or advise taking/stopping/changing medication dosages.
3. If evidence does not support a claim, state that sufficient evidence was not found.
4. Output must be strictly valid JSON conforming to the requested schema.`;

      const evidenceFormatted = entityEvidence
        .map((ev, i) => `[Evidence ${i + 1}] (${ev.sourceTitle} - ${ev.sourceUrl}): ${ev.supportingText}`)
        .join('\n');

      const userPrompt = `Entity: ${entity.name}
Report Context: ${entity.context || entity.value || 'None'}
Entity Type: ${entity.type}

EVIDENTIARY SOURCES:
${evidenceFormatted}

SAFETY INSTRUCTIONS:
- Educational framing only. Use phrases like "According to FDA labeling..." or "MedlinePlus describes..."
- Avoid prescriptive words ("you should take", "stop taking", "you have").
- Generate a structured JSON response with keys: title, simpleExplanation, generalUse, safetyNote, claims (array of string claims).`;

      const response = await this.llmProvider.generate({
        systemPrompt,
        userPrompt,
        responseFormat: 'json',
        temperature: 0.1
      });

      let parsed: StructuredExplanationOutput;
      if (response.parsedJson && typeof response.parsedJson === 'object') {
        parsed = response.parsedJson as StructuredExplanationOutput;
      } else {
        parsed = JSON.parse(response.text) as StructuredExplanationOutput;
      }

      // Validate structured output format
      if (!parsed.simpleExplanation) {
        throw new Error('LLM response lacked simpleExplanation key');
      }

      const sourceIds = entitySources.map(s => s.id);

      return {
        entityId: entity.id,
        entityName: entity.name,
        entityType: entity.type,
        title: parsed.title || entity.name,
        simpleExplanation: parsed.simpleExplanation,
        generalUse: parsed.generalUse,
        importantNote: parsed.safetyNote,
        safetyDisclaimer: 'This explanation is synthesized from verified government and clinical labeling sources for educational reference only.',
        isEvidenceBacked: true,
        evidenceLevel: entitySources.some(s => s.sourceTier === 1) ? 'strong' : 'moderate',
        sourceIds
      };
    } catch (err: unknown) {
      const reason = err instanceof Error ? err.message : 'Error in LLM synthesis';
      return this.generateFallback(entity, reason);
    }
  }

  /**
   * Generates batch explanations.
   */
  public async explainBatch(entities: MedicalEntity[]): Promise<MedicalExplanation[]> {
    const results: MedicalExplanation[] = [];
    for (const ent of entities) {
      results.push(await this.explain(ent));
    }
    return results;
  }

  /**
   * Safe graceful fallback to Phase 1 rule-based dictionary
   */
  private async generateFallback(entity: MedicalEntity, reason: string): Promise<MedicalExplanation> {
    const fallback = await this.fallbackGenerator.explain(entity);
    return {
      ...fallback,
      isEvidenceBacked: false,
      evidenceLevel: 'limited',
      importantNote: `${fallback.importantNote || ''} (Showing verified baseline educational information; ${reason}).`.trim()
    };
  }
}
