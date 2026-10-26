// Safety & Healthcare Boundary Validator - Phase 1 & Phase 2
import { MedicalExplanation, ResearchClaim, ResearchResult, SafetyValidator } from '../../types/research';

export class ClinicalSafetyValidator implements SafetyValidator {
  // Prohibited phrases that must NEVER appear in patient-facing explanations
  private static PROHIBITED_PATTERNS = [
    /\byou have (?:diabetes|hypertension|disease|cancer|failure)\b/i,
    /\byou should (?:take|stop|start|increase|decrease)\b/i,
    /(?<!(?:never|do not|don't)\s+(?:adjust\s+or\s+)?)\bstop\s+taking\b/i,
    /\bincrease your dosage\b/i,
    /\bdecrease your dosage\b/i,
    /\bthis definitely means\b/i,
    /\bwe diagnose you\b/i,
    /\bprescription:\b/i,
    /\byou must take\b/i,
    /\bemergency treatment:\b/i
  ];

  private static MANDATORY_DISCLAIMERS = [
    'Educational Information Only: This report understanding tool is designed to help patients and care teams comprehend medical terminology. It does not provide clinical diagnoses, prescribe treatment, or modify physician orders.',
    'Doctor Consultation Notice: Always review laboratory findings, medication dosages, and symptoms directly with your qualified healthcare provider. Never start, alter, or discontinue any prescribed medication without clinician supervision.',
    'Emergency Boundary: In the event of acute symptoms (e.g. severe chest pain, extreme dizziness, sudden shortness of breath), seek immediate emergency medical care.'
  ];

  /**
   * Validates a completed ResearchResult before rendering it to the user.
   */
  public validate(result: ResearchResult): {
    isSafe: boolean;
    flags: string[];
    disclaimers: string[];
  } {
    const flags: string[] = [];

    // 1. Check all explanations for prohibited terms
    for (const exp of result.explanations) {
      const combined = `${exp.simpleExplanation} ${exp.importantNote || ''} ${exp.generalUse || ''}`;
      for (const pattern of ClinicalSafetyValidator.PROHIBITED_PATTERNS) {
        if (pattern.test(combined)) {
          flags.push(`Prohibited medical recommendation pattern detected in explanation for "${exp.entityName}": ${pattern.source}`);
        }
      }
    }

    // 2. Phase 2: Check all generated research claims
    if (result.claims && result.claims.length > 0) {
      result.claims = result.claims.map(claim => {
        let isFlagged = false;
        for (const pattern of ClinicalSafetyValidator.PROHIBITED_PATTERNS) {
          if (pattern.test(claim.text)) {
            flags.push(`Prohibited pattern in claim #${claim.id}: ${pattern.source}`);
            isFlagged = true;
          }
        }
        return isFlagged ? { ...claim, safetyStatus: 'flagged' as const } : claim;
      });
    }

    // Defensive safety layer: sanitize any offending text if found
    if (flags.length > 0) {
      result.explanations = result.explanations.map(exp => this.sanitizeExplanation(exp));
    }

    return {
      isSafe: flags.length === 0,
      flags,
      disclaimers: ClinicalSafetyValidator.MANDATORY_DISCLAIMERS
    };
  }

  /**
   * Validates standalone claims list.
   */
  public validateClaims(claims: ResearchClaim[]): { sanitizedClaims: ResearchClaim[]; flags: string[] } {
    const flags: string[] = [];
    const sanitizedClaims = claims.map(claim => {
      let isFlagged = false;
      for (const pattern of ClinicalSafetyValidator.PROHIBITED_PATTERNS) {
        if (pattern.test(claim.text)) {
          flags.push(`Prohibited recommendation pattern in claim: ${claim.text}`);
          isFlagged = true;
        }
      }
      return isFlagged 
        ? { ...claim, safetyStatus: 'flagged' as const, flagReason: 'Contains unauthorized prescriptive advice.' }
        : claim;
    });

    return { sanitizedClaims, flags };
  }

  /**
   * Sanitizes explanation text if an unauthorized phrase was somehow encountered.
   */
  private sanitizeExplanation(exp: MedicalExplanation): MedicalExplanation {
    let sanitizedSimple = exp.simpleExplanation;
    for (const pattern of ClinicalSafetyValidator.PROHIBITED_PATTERNS) {
      sanitizedSimple = sanitizedSimple.replace(pattern, '[Educational Reference]');
    }

    return {
      ...exp,
      simpleExplanation: sanitizedSimple,
      safetyDisclaimer: 'This explanation is for educational reference only and does not constitute medical advice.'
    };
  }

  /**
   * Static helper for validating raw text against prohibited medical claims.
   */
  public static containsProhibitedPhrases(text: string): boolean {
    return ClinicalSafetyValidator.PROHIBITED_PATTERNS.some(p => p.test(text));
  }

  public static getDisclaimers(): string[] {
    return ClinicalSafetyValidator.MANDATORY_DISCLAIMERS;
  }
}
