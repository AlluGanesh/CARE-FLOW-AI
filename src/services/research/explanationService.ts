// Explanation Engine - Research Agent Phase 1
import { ExplanationGenerator, MedicalEntity, MedicalExplanation } from '../../types/research';

interface EntityKnowledgeBase {
  title: string;
  simpleExplanation: string;
  generalUse?: string;
  importantNote?: string;
}

export class RuleBasedExplanationGenerator implements ExplanationGenerator {
  private static KNOWLEDGE_BASE: Record<string, EntityKnowledgeBase> = {
    // Conditions
    'type 2 diabetes': {
      title: 'Type 2 Diabetes',
      simpleExplanation: 'Type 2 diabetes is a long-term condition where the body has difficulty properly processing glucose (blood sugar) because insulin is not used effectively. This can cause glucose levels to stay higher than normal.',
      generalUse: 'Often managed through a combination of healthy nutrition, physical activity, and doctor-prescribed medications.',
      importantNote: 'Your report mentions this condition. Any diagnosis or management plan should always be confirmed and guided directly by your physician.'
    },
    'type 1 diabetes': {
      title: 'Type 1 Diabetes',
      simpleExplanation: 'Type 1 diabetes is a condition where the pancreas produces little or no insulin, a hormone required to allow sugar (glucose) to enter cells to produce energy.',
      generalUse: 'Managed with daily insulin therapy and regular blood sugar monitoring under specialist care.',
      importantNote: 'Educational information only; clinical treatment is individualized by your endocrinologist.'
    },
    'diabetes mellitus': {
      title: 'Diabetes Mellitus',
      simpleExplanation: 'Diabetes mellitus refers to a group of metabolic conditions that affect how the body uses blood glucose (blood sugar), a vital source of energy for cells.',
      generalUse: 'Doctors monitor blood tests periodically to evaluate average glycemic control.',
      importantNote: 'Always consult your healthcare provider for clinical interpretation of your test results.'
    },
    'hypertension': {
      title: 'Hypertension (High Blood Pressure)',
      simpleExplanation: 'Hypertension means the force of blood flowing through your blood vessels is consistently higher than recommended. Over time, this places extra workload on the heart and arteries.',
      generalUse: 'Typically managed through dietary adjustments (such as reducing sodium), regular exercise, and medications prescribed by a clinician.',
      importantNote: 'Blood pressure readings can vary throughout the day. Follow up with your doctor for persistent elevated readings.'
    },
    'dyslipidemia': {
      title: 'Dyslipidemia',
      simpleExplanation: 'Dyslipidemia refers to an imbalance of blood fats (lipids), such as elevated LDL cholesterol or triglycerides, or low HDL cholesterol.',
      generalUse: 'Maintaining healthy lipid levels supports cardiovascular wellness.',
      importantNote: 'Discuss lifestyle habits and lipid targets with your attending doctor.'
    },
    'chronic kidney disease': {
      title: 'Chronic Kidney Disease (CKD)',
      simpleExplanation: 'Chronic kidney disease indicates that the kidneys have experienced gradual reduction in their natural filtering ability over time.',
      generalUse: 'Doctors track parameters like eGFR and urine microalbumin to evaluate kidney health early.',
      importantNote: 'Never adjust your fluid or medication regimen without consulting your nephrologist or physician.'
    },
    'diabetic nephropathy / microalbuminuria': {
      title: 'Diabetic Nephropathy / Microalbuminuria',
      simpleExplanation: 'Microalbuminuria refers to tiny amounts of protein (albumin) detected in the urine, which serves as an early indicator of how the kidneys are filtering under elevated blood sugar or blood pressure.',
      generalUse: 'Early detection allows clinicians to optimize medication and lifestyle strategies to preserve kidney function.',
      importantNote: 'Educational information only; your doctor will correlate this with your overall metabolic health.'
    },
    'coronary artery disease': {
      title: 'Coronary Artery Disease',
      simpleExplanation: 'Coronary artery disease occurs when the blood vessels supplying oxygen-rich blood to the heart muscle become narrowed or stiffened by plaque buildup.',
      generalUse: 'Clinicians focus on heart-healthy habits, blood pressure control, and cholesterol management.',
      importantNote: 'Seek immediate clinical attention if you experience severe chest pain, shortness of breath, or sudden dizziness.'
    },

    // Diagnostic Tests
    'hba1c': {
      title: 'HbA1c (Hemoglobin A1c)',
      simpleExplanation: 'HbA1c is a standard blood test that reflects your average blood sugar level over the past 2 to 3 months. It measures the percentage of hemoglobin in red blood cells that is coated with glucose.',
      generalUse: 'Doctors commonly use this test to monitor overall glycemic control over time rather than just a single moment in time.',
      importantNote: 'A value of 8.2% is above the typical target of under 7.0% for most adults, suggesting average glucose has been elevated. Discuss your personal target with your physician.'
    },
    'fasting blood sugar': {
      title: 'Fasting Blood Sugar (FBS)',
      simpleExplanation: 'Fasting blood sugar measures glucose in the bloodstream after an overnight fast (typically 8 to 12 hours with only water).',
      generalUse: 'Helps evaluate baseline glucose production when the body has not recently digested food.',
      importantNote: 'Normal fasting glucose is typically under 100 mg/dL. Values above 125 mg/dL warrant clinical review with your doctor.'
    },
    'postprandial blood sugar': {
      title: 'Postprandial Blood Sugar (PPBS)',
      simpleExplanation: 'Postprandial blood sugar measures glucose concentration in the blood approximately 2 hours after starting a meal.',
      generalUse: 'Indicates how effectively the body secretes insulin and processes carbohydrates ingested during a meal.',
      importantNote: 'Clinical guidelines usually aim for under 140 mg/dL in general adults, or under 180 mg/dL for individuals managing diabetes.'
    },
    'blood pressure': {
      title: 'Blood Pressure',
      simpleExplanation: 'Blood pressure consists of two numbers: systolic (top number, pressure when heart beats) and diastolic (bottom number, pressure when heart rests between beats).',
      generalUse: 'Monitored routinely to protect heart, brain, and kidney circulation.',
      importantNote: 'Standard optimal readings are below 120/80 mmHg. Discuss reading trends with your care team.'
    },
    'serum creatinine': {
      title: 'Serum Creatinine',
      simpleExplanation: 'Creatinine is a natural waste byproduct formed from normal muscle breakdown. Healthy kidneys filter almost all of it out of the bloodstream into urine.',
      generalUse: 'Used by clinicians as a reliable blood marker to assess how efficiently the kidneys are filtering.',
      importantNote: 'Normal baseline is generally 0.6 to 1.2 mg/dL. Your doctor interprets this alongside your age, gender, and hydration.'
    },
    'egfr': {
      title: 'eGFR (Estimated Glomerular Filtration Rate)',
      simpleExplanation: 'eGFR calculates how many milliliters of blood your kidneys clean each minute, estimated using your blood creatinine level, age, and biological sex.',
      generalUse: 'Values of 90 mL/min or above generally reflect healthy filtering ability; values below 60 mL/min are monitored for potential renal strain.',
      importantNote: 'Temporary factors like dehydration can affect readings; repeat testing is often requested by clinicians.'
    },
    'total cholesterol': {
      title: 'Total Cholesterol',
      simpleExplanation: 'Measures the total amount of cholesterol circulating in the blood, including LDL ("bad") and HDL ("good") cholesterol.',
      generalUse: 'Helps calculate overall cardiovascular risk profile.',
      importantNote: 'Desirable total cholesterol is typically below 200 mg/dL. Your doctor reviews this in context with your other lipid markers.'
    },
    'ldl cholesterol': {
      title: 'LDL Cholesterol',
      simpleExplanation: 'Often referred to as "bad cholesterol" because high levels can contribute to fatty buildup (plaques) within arteries.',
      generalUse: 'Cardiovascular prevention targets typically aim for lower LDL levels.',
      importantNote: 'Your target depends on your overall health history. Discuss your specific number with your doctor.'
    },
    'urine albumin/creatinine ratio': {
      title: 'Urine Albumin/Creatinine Ratio (ACR)',
      simpleExplanation: 'A spot urine test comparing tiny traces of albumin (protein) against creatinine in urine.',
      generalUse: 'Serves as one of the most sensitive early warning markers for kidney vascular health in diabetes and hypertension.',
      importantNote: 'Levels under 30 mg/g are normal. Elevated findings are usually repeated to confirm consistency.'
    },

    // Medicines
    'metformin': {
      title: 'Metformin',
      simpleExplanation: 'Metformin is an oral prescription medicine commonly used as a first-line treatment for managing blood glucose in individuals with Type 2 diabetes. It works primarily by decreasing glucose production in the liver and improving the body\'s natural sensitivity to insulin.',
      generalUse: 'Commonly prescribed in strengths such as 500 mg, 850 mg, or 1000 mg, often taken with meals to minimize stomach upset.',
      importantNote: 'Important: This explanation is for educational purposes only and does not change your doctor\'s prescription. Never adjust or discontinue this medication without consulting your doctor.'
    },
    'amlodipine': {
      title: 'Amlodipine',
      simpleExplanation: 'Amlodipine is a calcium channel blocker medication commonly prescribed to treat high blood pressure and chest pain (angina). It works by relaxing the muscular walls of blood vessels so blood flows more smoothly.',
      generalUse: 'Often taken as a single daily dose (e.g. 5 mg or 10 mg).',
      importantNote: 'Important: Educational information only. Continue taking exactly as directed by your prescribing physician.'
    },
    'atorvastatin': {
      title: 'Atorvastatin',
      simpleExplanation: 'Atorvastatin belongs to a class of medicines called statins. It works by reducing the amount of cholesterol made by the liver and helping the body clear LDL cholesterol from the blood.',
      generalUse: 'Commonly prescribed to reduce cardiovascular risks and maintain healthy arterial circulation.',
      importantNote: 'Educational information only; discuss any questions or symptoms directly with your healthcare provider.'
    },
    'lisinopril': {
      title: 'Lisinopril',
      simpleExplanation: 'Lisinopril is an ACE (angiotensin-converting enzyme) inhibitor. It relaxes blood vessels, which lowers blood pressure and reduces strain on the heart and kidneys.',
      generalUse: 'Commonly prescribed for hypertension, heart failure, and protecting kidney function in diabetes.',
      importantNote: 'Educational information only; never discontinue or alter dosage without direct medical supervision.'
    },

    // Follow-Up Actions
    'follow-up action': {
      title: 'Clinical Follow-Up Recommendation',
      simpleExplanation: 'Your medical report mentions a scheduled timeline for re-evaluation or repeat testing with your clinical care team.',
      generalUse: 'Follow-up appointments allow clinicians to evaluate treatment progress, adjust care safely, and ensure your health markers are heading in the right direction.',
      importantNote: 'Timely follow-ups are critical for proactive health coordination.'
    }
  };

  /**
   * Generates a patient-friendly explanation for a single entity.
   */
  public async explain(entity: MedicalEntity): Promise<MedicalExplanation> {
    const key = entity.name.toLowerCase().trim();
    const entry = RuleBasedExplanationGenerator.KNOWLEDGE_BASE[key] || 
                  this.findFallbackExplanation(entity);

    return {
      entityId: entity.id,
      entityName: entity.name,
      entityType: entity.type,
      title: entry.title || entity.name,
      simpleExplanation: entry.simpleExplanation,
      generalUse: entry.generalUse,
      importantNote: entry.importantNote,
      safetyDisclaimer: 'This explanation is for educational reference only. It does not constitute medical advice or change your doctor\'s instructions.'
    };
  }

  /**
   * Generates explanations for a list of entities in batch.
   */
  public async explainBatch(entities: MedicalEntity[]): Promise<MedicalExplanation[]> {
    const results: MedicalExplanation[] = [];
    for (const entity of entities) {
      results.push(await this.explain(entity));
    }
    return results;
  }

  /**
   * Safe fallback for recognized medical entities that lack a bespoke dictionary entry.
   */
  private findFallbackExplanation(entity: MedicalEntity): EntityKnowledgeBase {
    if (entity.type === 'condition') {
      return {
        title: entity.name,
        simpleExplanation: `Your report notes "${entity.name}". This is a clinical condition documented by your healthcare provider.`,
        generalUse: 'Discuss lifestyle habits and personalized targets with your care team.',
        importantNote: 'Educational summary only; always consult your physician for individualized medical management.'
      };
    } else if (entity.type === 'test') {
      return {
        title: entity.name,
        simpleExplanation: `"${entity.name}" is a clinical diagnostic investigation ordered to evaluate specific organ function or metabolic balance.`,
        generalUse: entity.normalRange ? `Standard reference range: ${entity.normalRange}.` : 'Used by clinicians to monitor baseline health parameters.',
        importantNote: 'Laboratory reference ranges may vary slightly between diagnostic laboratories. Your clinician will interpret this result in your full clinical context.'
      };
    } else if (entity.type === 'medicine') {
      return {
        title: entity.name,
        simpleExplanation: `"${entity.name}" is a medication identified in your clinical report.`,
        generalUse: entity.dosage ? `Reported dosage in note: ${entity.dosage}.` : 'Prescribed by clinicians to address specific clinical indications.',
        importantNote: 'Important: This explanation is educational only and does not change your doctor\'s prescription. Always follow your prescribing physician\'s instructions.'
      };
    } else {
      return {
        title: entity.name,
        simpleExplanation: `This clinical item was identified in your report for monitoring and care coordination.`,
        generalUse: 'Reviewed as part of routine healthcare follow-up.',
        importantNote: 'Educational information only; discuss any questions with your care team.'
      };
    }
  }
}
