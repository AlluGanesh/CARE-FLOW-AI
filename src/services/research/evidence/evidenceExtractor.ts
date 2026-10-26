// Evidence Extractor Service - Phase 2
import { Evidence, EvidenceLevel, ResearchSource, ResearchTask } from '../../../types/research';

export class EvidenceExtractor {
  /**
   * Extracts targeted supporting clinical statements from retrieved sources.
   * Avoids passing entire raw HTML / unstructured webpages.
   */
  public extractEvidence(task: ResearchTask, sources: ResearchSource[]): Evidence[] {
    const evidenceList: Evidence[] = [];

    for (const source of sources) {
      if (!source.snippet || source.snippet.trim().length === 0) continue;

      const level: EvidenceLevel = 
        source.sourceTier === 1 ? 'strong' :
        source.sourceTier === 2 ? 'moderate' : 'limited';

      // Parse sentences and clean snippets into concise supporting statements
      const sentences = source.snippet
        .split(/(?<=[.!?])\s+/)
        .map(s => s.trim())
        .filter(s => s.length > 20);

      const supportingText = sentences.slice(0, 3).join(' ');

      evidenceList.push({
        id: `ev-${evidenceList.length + 1}-${source.id}`,
        claim: `Evidence statement for ${task.entityName} from ${source.publisher || source.domain}`,
        sourceId: source.id,
        sourceTitle: source.title,
        sourceUrl: source.url,
        supportingText: supportingText || source.snippet,
        evidenceLevel: level,
        supportsClaim: true
      });
    }

    return evidenceList;
  }
}
