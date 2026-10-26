// Citation Builder & Validator Service - Phase 2
import { MedicalExplanation, ResearchCitation, ResearchClaim, ResearchSource } from '../../../types/research';

export class CitationBuilder {
  /**
   * Binds verified research sources to claims and explanations, assigning numbered citation badges [1], [2]...
   */
  public buildCitations(
    sources: ResearchSource[],
    explanations: MedicalExplanation[],
    claims: ResearchClaim[]
  ): {
    citations: ResearchCitation[];
    annotatedExplanations: MedicalExplanation[];
    annotatedClaims: ResearchClaim[];
  } {
    const citations: ResearchCitation[] = [];
    const sourceIndexMap = new Map<string, number>();

    // 1. Assign sequential indices to verified, unique sources
    for (const source of sources) {
      if (!sourceIndexMap.has(source.id)) {
        // Validate source URL and domain before citing (Rule 45)
        if (this.isValidSource(source)) {
          const citationIndex = citations.length + 1;
          sourceIndexMap.set(source.id, citationIndex);

          citations.push({
            id: `cite-${citationIndex}`,
            citationIndex,
            sourceId: source.id,
            sourceTitle: source.title,
            sourceUrl: source.url,
            publisher: source.publisher,
            sourceTier: source.sourceTier,
            accessedDate: source.retrievedAt || new Date().toISOString().slice(0, 10)
          });
        }
      }
    }

    // 2. Annotate explanations with citation indices
    const annotatedExplanations = explanations.map(exp => {
      const sourceIds = exp.sourceIds || [];
      const indices = sourceIds
        .map(id => sourceIndexMap.get(id))
        .filter((idx): idx is number => idx !== undefined);

      return {
        ...exp,
        citationIndices: indices
      };
    });

    // 3. Annotate claims with citation indices based on their supporting evidence
    const annotatedClaims = claims.map(claim => {
      // Find sources related to this claim's evidence
      const indices: number[] = [];
      for (const [sourceId, idx] of sourceIndexMap.entries()) {
        if (claim.evidenceIds.some(evId => evId.includes(sourceId))) {
          if (!indices.includes(idx)) indices.push(idx);
        }
      }

      return {
        ...claim,
        citationIndices: indices
      };
    });

    return {
      citations,
      annotatedExplanations,
      annotatedClaims
    };
  }

  /**
   * Validates source structure to prevent hallucinated URLs or empty links.
   */
  private isValidSource(source: ResearchSource): boolean {
    if (!source.url || !source.url.startsWith('http')) return false;
    if (!source.title || source.title.trim().length === 0) return false;
    if (!source.domain || source.domain.trim().length === 0) return false;
    return true;
  }
}
