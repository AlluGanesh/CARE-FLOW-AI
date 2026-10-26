// Trusted Source Hierarchy & Domain Registry - Phase 2
import { ResearchSource, SourceTier } from '../../../types/research';

export interface DomainTrustRule {
  domain: string;
  publisher: string;
  tier: SourceTier;
  reliability: 'high' | 'medium' | 'low';
}

export class TrustedSourceRegistry {
  // Configurable Allowlist of Authoritative Health Domains
  private static ALLOWLIST: DomainTrustRule[] = [
    // Tier 1: Official Regulatory & Government Health Agencies
    { domain: 'fda.gov', publisher: 'U.S. Food & Drug Administration', tier: 1, reliability: 'high' },
    { domain: 'medlineplus.gov', publisher: 'MedlinePlus · National Library of Medicine (NIH)', tier: 1, reliability: 'high' },
    { domain: 'nih.gov', publisher: 'National Institutes of Health', tier: 1, reliability: 'high' },
    { domain: 'nhs.uk', publisher: 'National Health Service (NHS UK)', tier: 1, reliability: 'high' },
    { domain: 'cdc.gov', publisher: 'Centers for Disease Control and Prevention', tier: 1, reliability: 'high' },
    { domain: 'who.int', publisher: 'World Health Organization', tier: 1, reliability: 'high' },
    // Extensible for Indian Health & Regulatory bodies (Rule 53 & 54)
    { domain: 'cdsco.gov.in', publisher: 'Central Drugs Standard Control Organisation (India)', tier: 1, reliability: 'high' },
    { domain: 'mohfw.gov.in', publisher: 'Ministry of Health and Family Welfare (India)', tier: 1, reliability: 'high' },

    // Tier 2: Recognized Academic Medical Centers & Hospital Systems
    { domain: 'mayoclinic.org', publisher: 'Mayo Clinic', tier: 2, reliability: 'high' },
    { domain: 'hopkinsmedicine.org', publisher: 'Johns Hopkins Medicine', tier: 2, reliability: 'high' },
    { domain: 'clevelandclinic.org', publisher: 'Cleveland Clinic', tier: 2, reliability: 'high' },
    { domain: 'diabetes.org', publisher: 'American Diabetes Association', tier: 2, reliability: 'high' },
    { domain: 'heart.org', publisher: 'American Heart Association', tier: 2, reliability: 'high' },
    { domain: 'kidney.org', publisher: 'National Kidney Foundation', tier: 2, reliability: 'high' }
  ];

  /**
   * Evaluates a URL domain against the trust hierarchy.
   */
  public static evaluateDomain(url: string): { tier: SourceTier; publisher: string; reliability: 'high' | 'medium' | 'low'; isAllowed: boolean } {
    try {
      const parsed = new URL(url);
      const hostname = parsed.hostname.toLowerCase().replace(/^www\./, '');

      const match = this.ALLOWLIST.find(rule => 
        hostname === rule.domain || hostname.endsWith(`.${rule.domain}`)
      );

      if (match) {
        return {
          tier: match.tier,
          publisher: match.publisher,
          reliability: match.reliability,
          isAllowed: true
        };
      }

      // Default for unrecognized or untrusted external domains
      return {
        tier: 3,
        publisher: hostname,
        reliability: 'low',
        isAllowed: false
      };
    } catch {
      return {
        tier: 3,
        publisher: 'Unknown Source',
        reliability: 'low',
        isAllowed: false
      };
    }
  }

  /**
   * Sorts candidate sources prioritizing Tier 1 official regulators, then Tier 2 academic centers.
   * Limits results to top 3-5 to conserve tokens and prevent noise.
   */
  public static rankSources(sources: ResearchSource[], limit: number = 4): ResearchSource[] {
    return [...sources]
      .filter(s => s.reliability !== 'low')
      .sort((a, b) => {
        // Tier 1 precedes Tier 2 precedes Tier 3
        if (a.sourceTier !== b.sourceTier) {
          return a.sourceTier - b.sourceTier;
        }
        // Prefer official drug labels for medicine claims
        if (a.isOfficialDrugLabel && !b.isOfficialDrugLabel) return -1;
        if (!a.isOfficialDrugLabel && b.isOfficialDrugLabel) return 1;
        return 0;
      })
      .slice(0, limit);
  }

  /**
   * Adds custom authoritative domains to the registry (e.g. clinic-specific or regional regulators).
   */
  public static registerDomain(rule: DomainTrustRule) {
    if (!this.ALLOWLIST.some(r => r.domain === rule.domain)) {
      this.ALLOWLIST.push(rule);
    }
  }

  public static getAllowlist(): DomainTrustRule[] {
    return [...this.ALLOWLIST];
  }
}
