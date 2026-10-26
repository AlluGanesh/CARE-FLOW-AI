// Evidence Verifier Agent - Phase 2
import { Evidence, EvidenceStatus, ResearchClaim, ResearchSource } from '../../../types/research';

export interface VerificationResult {
  verifiedClaims: ResearchClaim[];
  unsupportedClaims: ResearchClaim[];
  conflictingClaims: ResearchClaim[];
  overallEvidenceStatus: EvidenceStatus;
  hasContradictions: boolean;
  summaryMessage: string;
}

export class EvidenceVerifier {
  /**
   * Cross-references claims against extracted evidence statements.
   * If a claim has no evidence, it is rejected (Rule 17 & 45 & 65).
   * If reliable sources present conflicting statements, flag conflict (Rule 18).
   */
  public verifyClaims(
    entityName: string,
    proposedClaims: string[],
    evidence: Evidence[],
    sources: ResearchSource[]
  ): VerificationResult {
    const verifiedClaims: ResearchClaim[] = [];
    const unsupportedClaims: ResearchClaim[] = [];
    const conflictingClaims: ResearchClaim[] = [];

    if (evidence.length === 0 || sources.length === 0) {
      return {
        verifiedClaims: [],
        unsupportedClaims: proposedClaims.map((text, idx) => ({
          id: `claim-unsup-${idx + 1}`,
          entityId: entityName,
          text,
          evidenceIds: [],
          verificationStatus: 'unsupported',
          safetyStatus: 'flagged',
          flagReason: 'No authoritative source evidence found to corroborate this statement.'
        })),
        conflictingClaims: [],
        overallEvidenceStatus: 'insufficient',
        hasContradictions: false,
        summaryMessage: 'Insufficient authoritative evidence found to verify proposed clinical statements.'
      };
    }

    // Inspect each claim against evidence
    for (let i = 0; i < proposedClaims.length; i++) {
      const claimText = proposedClaims[i];
      const matchingEvidence = evidence.filter(ev => 
        this.doesEvidenceSupport(claimText, ev.supportingText)
      );

      const hasDirectContradiction = evidence.some(ev => 
        this.doesEvidenceContradict(claimText, ev.supportingText)
      );

      if (hasDirectContradiction) {
        conflictingClaims.push({
          id: `claim-conflict-${i + 1}`,
          entityId: entityName,
          text: claimText,
          evidenceIds: matchingEvidence.map(e => e.id),
          verificationStatus: 'conflicting',
          safetyStatus: 'flagged',
          flagReason: 'Conflicting medical assertions detected between authoritative sources.'
        });
      } else if (matchingEvidence.length > 0) {
        verifiedClaims.push({
          id: `claim-ver-${i + 1}`,
          entityId: entityName,
          text: claimText,
          evidenceIds: matchingEvidence.map(e => e.id),
          verificationStatus: 'verified',
          safetyStatus: 'safe'
        });
      } else {
        unsupportedClaims.push({
          id: `claim-unsup-${i + 1}`,
          entityId: entityName,
          text: claimText,
          evidenceIds: [],
          verificationStatus: 'unsupported',
          safetyStatus: 'flagged',
          flagReason: 'Statement not directly supported by retrieved evidence text.'
        });
      }
    }

    // Determine overall evidence status
    let overallEvidenceStatus: EvidenceStatus = 'verified';
    if (conflictingClaims.length > 0) {
      overallEvidenceStatus = 'conflicting';
    } else if (verifiedClaims.length === 0) {
      overallEvidenceStatus = 'insufficient';
    } else if (unsupportedClaims.length > 0) {
      overallEvidenceStatus = 'partial';
    }

    const summaryMessage = 
      overallEvidenceStatus === 'verified'
        ? `All ${verifiedClaims.length} statements verified against authoritative sources.`
        : overallEvidenceStatus === 'conflicting'
        ? `Evidence conflict detected across sources for ${entityName}. Definitive assertions withheld.`
        : `Verified ${verifiedClaims.length} statement(s); withheld ${unsupportedClaims.length} unsupported assertion(s).`;

    return {
      verifiedClaims,
      unsupportedClaims,
      conflictingClaims,
      overallEvidenceStatus,
      hasContradictions: conflictingClaims.length > 0,
      summaryMessage
    };
  }

  /**
   * Evaluates semantic alignment between claim text and supporting evidence snippet.
   */
  private doesEvidenceSupport(claim: string, evidenceText: string): boolean {
    const claimKeywords = this.extractSignificantKeywords(claim);
    const evidenceLower = evidenceText.toLowerCase();

    // Check if significant core medical keywords are grounded in the evidence
    const matchedCount = claimKeywords.filter(kw => evidenceLower.includes(kw)).length;
    const matchRatio = claimKeywords.length > 0 ? matchedCount / claimKeywords.length : 0;

    return matchRatio >= 0.45;
  }

  /**
   * Checks for direct negation or conflicting clinical indicators.
   */
  private doesEvidenceContradict(claim: string, evidenceText: string): boolean {
    const claimLower = claim.toLowerCase();
    const evidenceLower = evidenceText.toLowerCase();

    if (claimLower.includes('indicated for') && evidenceLower.includes('contraindicated')) {
      return true;
    }
    if (claimLower.includes('effective for') && evidenceLower.includes('not recommended')) {
      return true;
    }
    return false;
  }

  private extractSignificantKeywords(text: string): string[] {
    const stopWords = new Set([
      'the', 'is', 'are', 'was', 'were', 'and', 'or', 'to', 'in', 'at', 'by', 'for', 'with', 'about',
      'against', 'between', 'into', 'through', 'during', 'before', 'after', 'above', 'below', 'from',
      'up', 'down', 'of', 'off', 'over', 'under', 'again', 'further', 'then', 'once', 'this', 'that',
      'these', 'those', 'such', 'what', 'which', 'who', 'whom', 'their', 'your', 'patient', 'report'
    ]);

    return text
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, ' ')
      .split(/\s+/)
      .filter(w => w.length > 3 && !stopWords.has(w));
  }
}
