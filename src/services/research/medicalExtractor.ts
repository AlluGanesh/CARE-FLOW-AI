// Medical Information Extraction Engine - Research Agent Phase 1
import { MedicalEntity, MedicalInformationExtractor } from '../../types/research';

interface KnownConditionDef {
  regex: RegExp;
  canonicalName: string;
}

interface KnownTestDef {
  regex: RegExp;
  canonicalName: string;
  defaultUnit?: string;
  normalRange?: string;
  evaluateStatus?: (numValue: number) => 'NORMAL' | 'ELEVATED' | 'LOW' | 'ATTENTION';
}

interface KnownMedicineDef {
  regex: RegExp;
  canonicalName: string;
}

export class DeterministicMedicalExtractor implements MedicalInformationExtractor {
  // Known medical condition patterns
  private static CONDITIONS: KnownConditionDef[] = [
    { regex: /\b(type\s*2\s*diabetes(?:\s*mellitus)?|t2dm|diabetes\s*type\s*2)\b/i, canonicalName: 'Type 2 Diabetes' },
    { regex: /\b(type\s*1\s*diabetes(?:\s*mellitus)?|t1dm|diabetes\s*type\s*1)\b/i, canonicalName: 'Type 1 Diabetes' },
    { regex: /\b(diabetes(?:\s*mellitus)?)\b/i, canonicalName: 'Diabetes Mellitus' },
    { regex: /\b(essential\s*hypertension|hypertension|htn|high\s*blood\s*pressure)\b/i, canonicalName: 'Hypertension' },
    { regex: /\b(dyslipidemia|hyperlipidemia|hypercholesterolemia)\b/i, canonicalName: 'Dyslipidemia' },
    { regex: /\b(chronic\s*kidney\s*disease|ckd)\b/i, canonicalName: 'Chronic Kidney Disease' },
    { regex: /\b(microalbuminuria|diabetic\s*nephropathy)\b/i, canonicalName: 'Diabetic Nephropathy / Microalbuminuria' },
    { regex: /\b(coronary\s*artery\s*disease|cad|ischemic\s*heart\s*disease)\b/i, canonicalName: 'Coronary Artery Disease' },
    { regex: /\b(hypothyroidism)\b/i, canonicalName: 'Hypothyroidism' },
    { regex: /\b(bronchial\s*asthma|asthma)\b/i, canonicalName: 'Asthma' },
    { regex: /\b(hyperglycemia)\b/i, canonicalName: 'Hyperglycemia' }
  ];

  // Known diagnostic tests and value extraction patterns
  private static TESTS: KnownTestDef[] = [
    {
      regex: /(?:hba1c|hemoglobin\s*a1c|glycated\s*hemoglobin)\s*[:=–-]?\s*([0-9]+(?:\.[0-9]+)?\s*%?)/i,
      canonicalName: 'HbA1c',
      defaultUnit: '%',
      normalRange: 'Below 5.7% (Normal), 5.7-6.4% (Prediabetes), ≥6.5% (Diabetes)',
      evaluateStatus: (val) => val >= 7.0 ? 'ELEVATED' : val >= 5.7 ? 'ATTENTION' : 'NORMAL'
    },
    {
      regex: /(?:fasting\s*blood\s*sugar|fasting\s*blood\s*glucose|fasting\s*glucose|fbs|fbg)\s*[:=–-]?\s*([0-9]+(?:\.[0-9]+)?\s*(?:mg\/dL|mmol\/L)?)/i,
      canonicalName: 'Fasting Blood Sugar',
      defaultUnit: 'mg/dL',
      normalRange: '70 - 99 mg/dL (Normal fasting)',
      evaluateStatus: (val) => val > 125 ? 'ELEVATED' : val < 70 ? 'LOW' : 'NORMAL'
    },
    {
      regex: /(?:postprandial\s*blood\s*sugar|postprandial\s*glucose|ppbs|ppbg|2h\s*postprandial)\s*[:=–-]?\s*([0-9]+(?:\.[0-9]+)?\s*(?:mg\/dL|mmol\/L)?)/i,
      canonicalName: 'Postprandial Blood Sugar',
      defaultUnit: 'mg/dL',
      normalRange: '< 140 mg/dL (Normal post-meal)',
      evaluateStatus: (val) => val >= 180 ? 'ELEVATED' : 'NORMAL'
    },
    {
      regex: /(?:blood\s*pressure|bp)\s*[:=–-]?\s*([0-9]{2,3}\s*\/\s*[0-9]{2,3}\s*(?:mm\s*hg)?)/i,
      canonicalName: 'Blood Pressure',
      defaultUnit: 'mmHg',
      normalRange: '< 120/80 mmHg (Optimal)',
      evaluateStatus: () => 'NORMAL' // Evaluated specially for systolic/diastolic
    },
    {
      regex: /(?:serum\s*creatinine|creatinine)\s*[:=–-]?\s*([0-9]+(?:\.[0-9]+)?\s*(?:mg\/dL)?)/i,
      canonicalName: 'Serum Creatinine',
      defaultUnit: 'mg/dL',
      normalRange: '0.6 - 1.2 mg/dL',
      evaluateStatus: (val) => val > 1.3 ? 'ELEVATED' : 'NORMAL'
    },
    {
      regex: /(?:egfr|estimated\s*gfr)\s*[:=–-]?\s*([0-9]+(?:\.[0-9]+)?\s*(?:mL\/min(?:\/1\.73m2)?)?)/i,
      canonicalName: 'eGFR',
      defaultUnit: 'mL/min/1.73m²',
      normalRange: '≥ 90 mL/min (Normal renal function)',
      evaluateStatus: (val) => val < 60 ? 'ATTENTION' : 'NORMAL'
    },
    {
      regex: /(?:total\s*cholesterol)\s*[:=–-]?\s*([0-9]+(?:\.[0-9]+)?\s*(?:mg\/dL)?)/i,
      canonicalName: 'Total Cholesterol',
      defaultUnit: 'mg/dL',
      normalRange: '< 200 mg/dL (Desirable)',
      evaluateStatus: (val) => val >= 200 ? 'ELEVATED' : 'NORMAL'
    },
    {
      regex: /(?:ldl(?:\s*cholesterol)?)\s*[:=–-]?\s*([0-9]+(?:\.[0-9]+)?\s*(?:mg\/dL)?)/i,
      canonicalName: 'LDL Cholesterol',
      defaultUnit: 'mg/dL',
      normalRange: '< 100 mg/dL (Optimal)',
      evaluateStatus: (val) => val >= 100 ? 'ELEVATED' : 'NORMAL'
    },
    {
      regex: /(?:hdl(?:\s*cholesterol)?)\s*[:=–-]?\s*([0-9]+(?:\.[0-9]+)?\s*(?:mg\/dL)?)/i,
      canonicalName: 'HDL Cholesterol',
      defaultUnit: 'mg/dL',
      normalRange: '> 40 mg/dL (Men), > 50 mg/dL (Women)',
      evaluateStatus: (val) => val < 40 ? 'LOW' : 'NORMAL'
    },
    {
      regex: /(?:triglycerides)\s*[:=–-]?\s*([0-9]+(?:\.[0-9]+)?\s*(?:mg\/dL)?)/i,
      canonicalName: 'Triglycerides',
      defaultUnit: 'mg/dL',
      normalRange: '< 150 mg/dL (Normal)',
      evaluateStatus: (val) => val >= 150 ? 'ELEVATED' : 'NORMAL'
    },
    {
      regex: /(?:urine\s*albumin(?:\/creatinine|\s*ratio)?|urine\s*acr|spot\s*urine\s*acr)\s*[:=–-]?\s*([0-9]+(?:\.[0-9]+)?\s*(?:mg\/g)?)/i,
      canonicalName: 'Urine Albumin/Creatinine Ratio',
      defaultUnit: 'mg/g',
      normalRange: '< 30 mg/g (Normal)',
      evaluateStatus: (val) => val >= 30 ? 'ELEVATED' : 'NORMAL'
    }
  ];

  // Known medicines and dosage extraction patterns
  private static MEDICINES: KnownMedicineDef[] = [
    { regex: /\b(metformin(?:\s*er|\s*xr)?)\b/i, canonicalName: 'Metformin' },
    { regex: /\b(amlodipine)\b/i, canonicalName: 'Amlodipine' },
    { regex: /\b(atorvastatin)\b/i, canonicalName: 'Atorvastatin' },
    { regex: /\b(lisinopril)\b/i, canonicalName: 'Lisinopril' },
    { regex: /\b(losartan)\b/i, canonicalName: 'Losartan' },
    { regex: /\b(empagliflozin|jardiance)\b/i, canonicalName: 'Empagliflozin' },
    { regex: /\b(dapagliflozin|farxiga)\b/i, canonicalName: 'Dapagliflozin' },
    { regex: /\b(glimepiride)\b/i, canonicalName: 'Glimepiride' },
    { regex: /\b(sitagliptin|januvia)\b/i, canonicalName: 'Sitagliptin' },
    { regex: /\b(levothyroxine|synthroid)\b/i, canonicalName: 'Levothyroxine' },
    { regex: /\b(aspirin|ecosprin)\b/i, canonicalName: 'Aspirin' },
    { regex: /\b(telmisartan)\b/i, canonicalName: 'Telmisartan' },
    { regex: /\b(rosuvastatin)\b/i, canonicalName: 'Rosuvastatin' }
  ];

  // Medical terminology keywords
  private static MEDICAL_TERMS = [
    { term: 'HbA1c', context: 'Long-term glycemic marker' },
    { term: 'Fasting Blood Sugar', context: 'Baseline glucose concentration' },
    { term: 'Hyperglycemia', context: 'Elevated blood glucose state' },
    { term: 'Hypertension', context: 'Elevated arterial pressure' },
    { term: 'Microalbuminuria', context: 'Early indicator of renal glomerulus filtering load' },
    { term: 'eGFR', context: 'Estimated glomerular filtration rate' },
    { term: 'Serum Creatinine', context: 'Metabolic byproduct filtered by healthy kidneys' },
    { term: 'Dyslipidemia', context: 'Imbalance of lipids such as cholesterol and triglycerides' }
  ];

  /**
   * Main extraction method: parses free text into structured entities.
   */
  public async extract(text: string): Promise<{
    conditions: MedicalEntity[];
    tests: MedicalEntity[];
    medicines: MedicalEntity[];
    medicalTerms: MedicalEntity[];
    followUps: MedicalEntity[];
    summary: string;
  }> {
    if (!text || text.trim().length === 0) {
      throw new Error('Please upload a report or enter medical report text.');
    }

    const lines = text.split(/\r?\n/);
    const conditions: MedicalEntity[] = [];
    const tests: MedicalEntity[] = [];
    const medicines: MedicalEntity[] = [];
    const medicalTerms: MedicalEntity[] = [];
    const followUps: MedicalEntity[] = [];

    const foundConditionNames = new Set<string>();
    const foundTestNames = new Set<string>();
    const foundMedicineNames = new Set<string>();
    const foundTerms = new Set<string>();

    // 1. Extract Conditions
    for (const condDef of DeterministicMedicalExtractor.CONDITIONS) {
      if (condDef.regex.test(text) && !foundConditionNames.has(condDef.canonicalName)) {
        // Avoid duplicate generic "Diabetes" if "Type 2 Diabetes" is already identified
        if (condDef.canonicalName === 'Diabetes Mellitus' && foundConditionNames.has('Type 2 Diabetes')) {
          continue;
        }

        const match = text.match(condDef.regex);
        const matchedContext = lines.find(l => condDef.regex.test(l))?.trim() || match?.[0] || '';

        foundConditionNames.add(condDef.canonicalName);
        conditions.push({
          id: `cond-${conditions.length + 1}`,
          type: 'condition',
          name: condDef.canonicalName,
          context: matchedContext,
          confidence: 0.98,
          statusIndicator: 'ATTENTION'
        });
      }
    }

    // 2. Extract Diagnostic Tests & Values
    for (const testDef of DeterministicMedicalExtractor.TESTS) {
      const match = text.match(testDef.regex);
      if (match && !foundTestNames.has(testDef.canonicalName)) {
        foundTestNames.add(testDef.canonicalName);
        let rawVal = match[1]?.trim() || '';
        
        // Append default unit if omitted
        if (testDef.defaultUnit && !rawVal.toLowerCase().includes(testDef.defaultUnit.toLowerCase().split('/')[0])) {
          if (!rawVal.endsWith('%') && !rawVal.toLowerCase().includes('mg') && !rawVal.toLowerCase().includes('mm')) {
            rawVal = `${rawVal} ${testDef.defaultUnit}`;
          }
        }

        // Determine numerical indicator
        const numMatch = rawVal.match(/([0-9]+(?:\.[0-9]+)?)/);
        let indicator: 'NORMAL' | 'ELEVATED' | 'LOW' | 'ATTENTION' = 'NORMAL';
        if (numMatch && testDef.evaluateStatus) {
          indicator = testDef.evaluateStatus(parseFloat(numMatch[1]));
        } else if (testDef.canonicalName === 'Blood Pressure') {
          const bpMatch = rawVal.match(/([0-9]{2,3})\s*\/\s*([0-9]{2,3})/);
          if (bpMatch) {
            const sys = parseInt(bpMatch[1], 10);
            const dia = parseInt(bpMatch[2], 10);
            if (sys >= 140 || dia >= 90) indicator = 'ELEVATED';
            else if (sys >= 130 || dia >= 80) indicator = 'ATTENTION';
            else indicator = 'NORMAL';
          }
        }

        const contextLine = lines.find(l => testDef.regex.test(l))?.trim() || '';

        tests.push({
          id: `test-${tests.length + 1}`,
          type: 'test',
          name: testDef.canonicalName,
          value: rawVal,
          normalRange: testDef.normalRange,
          context: contextLine,
          confidence: 0.96,
          statusIndicator: indicator
        });
      }
    }

    // 3. Extract Medicines & Dosages
    for (const medDef of DeterministicMedicalExtractor.MEDICINES) {
      if (medDef.regex.test(text) && !foundMedicineNames.has(medDef.canonicalName)) {
        foundMedicineNames.add(medDef.canonicalName);
        
        // Find line containing medicine to extract dosage
        const line = lines.find(l => medDef.regex.test(l)) || text;
        const dosageMatch = line.match(new RegExp(medDef.canonicalName + `(?:\\s+([0-9]+(?:\\.[0-9]+)?\\s*(?:mg|mcg|g|ml)(?:\\s+(?:once|twice|thrice|daily|od|bd|tid))?))?`, 'i')) ||
                            line.match(/\b([0-9]+(?:\.[0-9]+)?\s*(?:mg|mcg|g|ml)(?:\s+(?:once|twice|daily|od|bd))?)\b/i);

        const dosage = dosageMatch ? dosageMatch[1]?.trim() : 'As prescribed';

        medicines.push({
          id: `med-${medicines.length + 1}`,
          type: 'medicine',
          name: medDef.canonicalName,
          dosage: dosage,
          value: dosage,
          context: line.trim(),
          confidence: 0.95,
          statusIndicator: 'INFO'
        });
      }
    }

    // 4. Extract Follow-Up Instructions
    const followUpPatterns = [
      /(?:follow-?up|review|repeat|recheck|next\s*visit|consult|appointment|schedule)(?:\s*[:=–-]?\s*)([^\n.]+)/gi,
      /(?:review\s+(?:after|in)\s+[0-9]+\s+(?:days|weeks|months))/gi,
      /(?:repeat\s+[a-z0-9\s/]+\s+(?:after|in)\s+[0-9]+\s+(?:days|weeks|months))/gi,
      /(?:upload\s+[^\n.]+)/gi
    ];

    for (const pattern of followUpPatterns) {
      let m: RegExpExecArray | null;
      while ((m = pattern.exec(text)) !== null) {
        const fullInstruction = m[0]?.trim();
        if (fullInstruction && fullInstruction.length > 5 && !followUps.some(f => f.name.toLowerCase() === fullInstruction.toLowerCase())) {
          followUps.push({
            id: `fu-${followUps.length + 1}`,
            type: 'follow_up',
            name: 'Follow-Up Action',
            value: fullInstruction,
            context: fullInstruction,
            confidence: 0.92,
            statusIndicator: 'INFO'
          });
        }
      }
    }

    // Check specific standalone sentences like "Review after 2 weeks."
    const generalFollowUpMatch = text.match(/\b(review\s+after\s+[0-9]+\s+(?:days|weeks|months)[^.\n]*)/i);
    if (generalFollowUpMatch && !followUps.some(f => f.value?.toLowerCase().includes('review after'))) {
      followUps.push({
        id: `fu-${followUps.length + 1}`,
        type: 'follow_up',
        name: 'Follow-Up Action',
        value: generalFollowUpMatch[1].trim(),
        confidence: 0.95,
        statusIndicator: 'INFO'
      });
    }

    // 5. Extract Medical Terms
    for (const termItem of DeterministicMedicalExtractor.MEDICAL_TERMS) {
      const termRegex = new RegExp(`\\b${termItem.term.replace('/', '\\/')}\\b`, 'i');
      if (termRegex.test(text) && !foundTerms.has(termItem.term)) {
        foundTerms.add(termItem.term);
        medicalTerms.push({
          id: `term-${medicalTerms.length + 1}`,
          type: 'medical_term',
          name: termItem.term,
          context: termItem.context,
          confidence: 0.94,
          statusIndicator: 'INFO'
        });
      }
    }

    // Validation: At least one clinical entity must be identified
    const totalEntities = conditions.length + tests.length + medicines.length + followUps.length;
    if (totalEntities === 0) {
      throw new Error(
        "We couldn't identify enough medical information from this report. Please check the report or enter the text manually."
      );
    }

    const summary = `Identified ${conditions.length} condition${conditions.length === 1 ? '' : 's'}, ${tests.length} diagnostic test${tests.length === 1 ? '' : 's'}, ${medicines.length} medication${medicines.length === 1 ? '' : 's'}, and ${followUps.length} follow-up recommendation${followUps.length === 1 ? '' : 's'}.`;

    return {
      conditions,
      tests,
      medicines,
      medicalTerms,
      followUps,
      summary
    };
  }
}
