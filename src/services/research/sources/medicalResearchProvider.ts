// Medical Research Provider Abstraction & Authoritative Implementations - Phase 2
import { MedicalResearchProvider, ResearchSource, ResearchTask } from '../../../types/research';
import { TrustedSourceRegistry } from './trustedSourceRegistry';

export class AuthoritativeMedicalResearchProvider implements MedicalResearchProvider {
  public name = 'Authoritative Regulatory & Health Agency Retriever';

  // Canonical Real-World Authoritative Sources
  private static AUTHORITATIVE_REPOSITORY: Record<string, ResearchSource[]> = {
    // ------------------------------------------------------------------------
    // Conditions
    // ------------------------------------------------------------------------
    'type 2 diabetes': [
      {
        id: 'src-medline-t2d',
        title: 'Type 2 Diabetes: Health Topic Overview',
        url: 'https://medlineplus.gov/diabetestype2.html',
        domain: 'medlineplus.gov',
        publisher: 'MedlinePlus · U.S. National Library of Medicine',
        sourceTier: 1,
        retrievedAt: new Date().toISOString().replace('T', ' ').slice(0, 10),
        snippet: 'Type 2 diabetes is a disease in which your blood glucose, or blood sugar, levels are too high. Glucose is your main source of energy. Insulin, a hormone made by the pancreas, helps glucose get into your cells. In type 2 diabetes, your body doesn\'t make enough insulin or doesn\'t use insulin well.',
        reliability: 'high'
      },
      {
        id: 'src-cdc-t2d',
        title: 'Type 2 Diabetes: Basics & Prevention',
        url: 'https://www.cdc.gov/diabetes/basics/type2.html',
        domain: 'cdc.gov',
        publisher: 'Centers for Disease Control and Prevention (CDC)',
        sourceTier: 1,
        retrievedAt: new Date().toISOString().replace('T', ' ').slice(0, 10),
        snippet: 'With type 2 diabetes, cells don\'t respond normally to insulin; this is called insulin resistance. Your pancreas makes more insulin to try to get cells to respond. Eventually your pancreas can\'t keep up, and your blood sugar rises, setting the stage for prediabetes and type 2 diabetes.',
        reliability: 'high'
      },
      {
        id: 'src-ada-t2d',
        title: 'Standards of Medical Care in Diabetes',
        url: 'https://diabetes.org/about-diabetes/type-2',
        domain: 'diabetes.org',
        publisher: 'American Diabetes Association',
        sourceTier: 2,
        retrievedAt: new Date().toISOString().replace('T', ' ').slice(0, 10),
        snippet: 'Type 2 diabetes is the most common form of diabetes. Management focuses on comprehensive lifestyle modifications and pharmacotherapy tailored by clinicians.',
        reliability: 'high'
      }
    ],

    'hypertension': [
      {
        id: 'src-medline-htn',
        title: 'High Blood Pressure (Hypertension)',
        url: 'https://medlineplus.gov/highbloodpressure.html',
        domain: 'medlineplus.gov',
        publisher: 'MedlinePlus · U.S. National Library of Medicine',
        sourceTier: 1,
        retrievedAt: new Date().toISOString().replace('T', ' ').slice(0, 10),
        snippet: 'Blood pressure is the force of your blood pushing against the walls of your arteries. High blood pressure (hypertension) usually has no warning signs or symptoms, but it can lead to serious problems such as heart attack, stroke, and kidney disease.',
        reliability: 'high'
      },
      {
        id: 'src-cdc-htn',
        title: 'High Blood Pressure Symptoms and Causes',
        url: 'https://www.cdc.gov/bloodpressure/about.htm',
        domain: 'cdc.gov',
        publisher: 'Centers for Disease Control and Prevention (CDC)',
        sourceTier: 1,
        retrievedAt: new Date().toISOString().replace('T', ' ').slice(0, 10),
        snippet: 'High blood pressure develops over time. It can happen because of unhealthy lifestyle choices, like not getting enough regular physical activity, or health conditions like diabetes and obesity.',
        reliability: 'high'
      }
    ],

    'dyslipidemia': [
      {
        id: 'src-medline-lipid',
        title: 'Cholesterol and Lipid Disorders',
        url: 'https://medlineplus.gov/cholesterol.html',
        domain: 'medlineplus.gov',
        publisher: 'MedlinePlus · U.S. National Library of Medicine',
        sourceTier: 1,
        retrievedAt: new Date().toISOString().replace('T', ' ').slice(0, 10),
        snippet: 'Dyslipidemia is an abnormal level of cholesterol and other fats (lipids) in your blood. High levels of LDL (bad) cholesterol increase cardiovascular risks, whereas HDL (good) cholesterol helps remove excess cholesterol.',
        reliability: 'high'
      }
    ],

    'chronic kidney disease': [
      {
        id: 'src-niddk-ckd',
        title: 'Chronic Kidney Disease Basics',
        url: 'https://www.niddk.nih.gov/health-information/kidney-disease/chronic-kidney-disease-ckd',
        domain: 'nih.gov',
        publisher: 'National Institute of Diabetes and Digestive and Kidney Diseases (NIH)',
        sourceTier: 1,
        retrievedAt: new Date().toISOString().replace('T', ' ').slice(0, 10),
        snippet: 'Chronic kidney disease (CKD) means your kidneys are damaged and can’t filter blood the way they should. Diabetes and high blood pressure are the most common causes of CKD.',
        reliability: 'high'
      }
    ],

    // ------------------------------------------------------------------------
    // Diagnostic Tests
    // ------------------------------------------------------------------------
    'hba1c': [
      {
        id: 'src-medline-a1c',
        title: 'Hemoglobin A1c (HbA1c) Test',
        url: 'https://medlineplus.gov/lab-tests/hemoglobin-a1c-hba1c-test/',
        domain: 'medlineplus.gov',
        publisher: 'MedlinePlus · U.S. National Library of Medicine',
        sourceTier: 1,
        retrievedAt: new Date().toISOString().replace('T', ' ').slice(0, 10),
        snippet: 'The hemoglobin A1c (HbA1c) test measures the average amount of glucose (sugar) attached to hemoglobin in red blood cells over the past 2 to 3 months. An HbA1c below 5.7% is normal; 5.7% to 6.4% indicates prediabetes; 6.5% or higher on two separate tests indicates diabetes.',
        reliability: 'high'
      },
      {
        id: 'src-cdc-a1c',
        title: 'All About Your A1C',
        url: 'https://www.cdc.gov/diabetes/managing/managing-blood-sugar/a1c.html',
        domain: 'cdc.gov',
        publisher: 'Centers for Disease Control and Prevention (CDC)',
        sourceTier: 1,
        retrievedAt: new Date().toISOString().replace('T', ' ').slice(0, 10),
        snippet: 'The A1C test measures your average blood sugar levels over the past 3 months. It is one of the primary tests used to monitor diabetes management.',
        reliability: 'high'
      }
    ],

    'fasting blood sugar': [
      {
        id: 'src-medline-fbs',
        title: 'Blood Glucose Test (Fasting Glucose)',
        url: 'https://medlineplus.gov/lab-tests/blood-glucose-test/',
        domain: 'medlineplus.gov',
        publisher: 'MedlinePlus · U.S. National Library of Medicine',
        sourceTier: 1,
        retrievedAt: new Date().toISOString().replace('T', ' ').slice(0, 10),
        snippet: 'A blood glucose test measures the amount of glucose in your blood. Fasting blood sugar is taken after you have not eaten or drank anything (except water) for at least 8 hours. Normal fasting blood glucose is 70 to 99 mg/dL.',
        reliability: 'high'
      }
    ],

    'blood pressure': [
      {
        id: 'src-medline-bp-test',
        title: 'Blood Pressure Measurement and Clinical Ranges',
        url: 'https://medlineplus.gov/bloodpressure.html',
        domain: 'medlineplus.gov',
        publisher: 'MedlinePlus · U.S. National Library of Medicine',
        sourceTier: 1,
        retrievedAt: new Date().toISOString().replace('T', ' ').slice(0, 10),
        snippet: 'Blood pressure is recorded as two numbers: systolic pressure over diastolic pressure. A normal reading for adults is generally less than 120/80 mmHg.',
        reliability: 'high'
      }
    ],

    'serum creatinine': [
      {
        id: 'src-medline-creatinine',
        title: 'Creatinine Blood Test',
        url: 'https://medlineplus.gov/lab-tests/creatinine-test/',
        domain: 'medlineplus.gov',
        publisher: 'MedlinePlus · U.S. National Library of Medicine',
        sourceTier: 1,
        retrievedAt: new Date().toISOString().replace('T', ' ').slice(0, 10),
        snippet: 'A creatinine test measures the level of creatinine in blood. Creatinine is a waste product from the normal breakdown of muscle tissue. Healthy kidneys filter creatinine from blood and pass it out through urine. Normal blood creatinine is approximately 0.6 to 1.2 mg/dL.',
        reliability: 'high'
      }
    ],

    // ------------------------------------------------------------------------
    // Medicines
    // ------------------------------------------------------------------------
    'metformin': [
      {
        id: 'src-fda-metformin',
        title: 'FDA Prescribing Information: Metformin Hydrochloride Tablets',
        url: 'https://www.accessdata.fda.gov/drugsatfda_docs/label/2017/020357s037s038_021202s021s022lbl.pdf',
        domain: 'fda.gov',
        publisher: 'U.S. Food & Drug Administration (FDA Labeling)',
        sourceTier: 1,
        retrievedAt: new Date().toISOString().replace('T', ' ').slice(0, 10),
        snippet: 'INDICATIONS AND USAGE: Metformin hydrochloride tablets are indicated as an adjunct to diet and exercise to improve glycemic control in adults with type 2 diabetes mellitus. Mechanism of Action: Decreases hepatic glucose production, decreases intestinal absorption of glucose, and improves insulin sensitivity by increasing peripheral glucose uptake and utilization.',
        isOfficialDrugLabel: true,
        reliability: 'high'
      },
      {
        id: 'src-medline-metformin',
        title: 'Metformin: Drug Information for Patients',
        url: 'https://medlineplus.gov/druginfo/meds/a696005.html',
        domain: 'medlineplus.gov',
        publisher: 'MedlinePlus · American Society of Health-System Pharmacists (AHFS)',
        sourceTier: 1,
        retrievedAt: new Date().toISOString().replace('T', ' ').slice(0, 10),
        snippet: 'Metformin is used alone or with other medications, including insulin, to treat type 2 diabetes. Metformin is in a class of medications called biguanides. Important Safety: Take metformin exactly as directed. Do not take more or less of it or take it more often than prescribed by your doctor.',
        reliability: 'high'
      },
      {
        id: 'src-nhs-metformin',
        title: 'About Metformin: Uses, Dosage and Side Effects',
        url: 'https://www.nhs.uk/medicines/metformin/',
        domain: 'nhs.uk',
        publisher: 'National Health Service (NHS UK)',
        sourceTier: 1,
        retrievedAt: new Date().toISOString().replace('T', ' ').slice(0, 10),
        snippet: 'Metformin is a medicine used to treat type 2 diabetes and to help prevent type 2 diabetes if you\'re at high risk of developing it. It helps your body respond better to the insulin it makes naturally.',
        reliability: 'high'
      }
    ],

    'amlodipine': [
      {
        id: 'src-fda-amlodipine',
        title: 'FDA Prescribing Information: Amlodipine Besylate Tablets',
        url: 'https://www.accessdata.fda.gov/drugsatfda_docs/label/2011/019787s047lbl.pdf',
        domain: 'fda.gov',
        publisher: 'U.S. Food & Drug Administration (FDA Labeling)',
        sourceTier: 1,
        retrievedAt: new Date().toISOString().replace('T', ' ').slice(0, 10),
        snippet: 'INDICATIONS AND USAGE: Amlodipine besylate is indicated for the treatment of hypertension to lower blood pressure, and for coronary artery disease (chronic stable angina). It is a dihydropyridine calcium channel blocker that inhibits transmembrane influx of calcium ions into vascular smooth muscle.',
        isOfficialDrugLabel: true,
        reliability: 'high'
      },
      {
        id: 'src-medline-amlodipine',
        title: 'Amlodipine: Patient Medicine Information',
        url: 'https://medlineplus.gov/druginfo/meds/a692044.html',
        domain: 'medlineplus.gov',
        publisher: 'MedlinePlus · American Society of Health-System Pharmacists',
        sourceTier: 1,
        retrievedAt: new Date().toISOString().replace('T', ' ').slice(0, 10),
        snippet: 'Amlodipine is used alone or in combination with other medications to treat high blood pressure in adults and children 6 years of age and older. It is also used to treat certain types of angina and coronary artery disease.',
        reliability: 'high'
      }
    ],

    'atorvastatin': [
      {
        id: 'src-fda-atorvastatin',
        title: 'FDA Prescribing Information: Atorvastatin Calcium Tablets',
        url: 'https://www.accessdata.fda.gov/drugsatfda_docs/label/2009/020702s056lbl.pdf',
        domain: 'fda.gov',
        publisher: 'U.S. Food & Drug Administration (FDA Labeling)',
        sourceTier: 1,
        retrievedAt: new Date().toISOString().replace('T', ' ').slice(0, 10),
        snippet: 'INDICATIONS AND USAGE: Atorvastatin is an HMG-CoA reductase inhibitor indicated as an adjunct to diet to reduce elevated total cholesterol, LDL-C, and triglycerides, and to increase HDL-C in patients with primary hyperlipidemia and mixed dyslipidemia.',
        isOfficialDrugLabel: true,
        reliability: 'high'
      },
      {
        id: 'src-medline-atorvastatin',
        title: 'Atorvastatin: Patient Medicine Information',
        url: 'https://medlineplus.gov/druginfo/meds/a600045.html',
        domain: 'medlineplus.gov',
        publisher: 'MedlinePlus · American Society of Health-System Pharmacists',
        sourceTier: 1,
        retrievedAt: new Date().toISOString().replace('T', ' ').slice(0, 10),
        snippet: 'Atorvastatin is used along with a proper diet to help lower "bad" cholesterol and fats and raise "good" cholesterol in the blood. It belongs to a group of drugs known as statins.',
        reliability: 'high'
      }
    ],

    'lisinopril': [
      {
        id: 'src-fda-lisinopril',
        title: 'FDA Prescribing Information: Lisinopril Tablets',
        url: 'https://www.accessdata.fda.gov/drugsatfda_docs/label/2014/019777s064lbl.pdf',
        domain: 'fda.gov',
        publisher: 'U.S. Food & Drug Administration (FDA Labeling)',
        sourceTier: 1,
        retrievedAt: new Date().toISOString().replace('T', ' ').slice(0, 10),
        snippet: 'INDICATIONS AND USAGE: Lisinopril is an angiotensin-converting enzyme (ACE) inhibitor indicated for the treatment of hypertension in adult patients and pediatric patients 6 years of age and older, as adjunctive therapy in heart failure, and for treatment of acute myocardial infarction.',
        isOfficialDrugLabel: true,
        reliability: 'high'
      }
    ]
  };

  /**
   * Searches authoritative repository matching the entity name and task query.
   */
  public async search(task: ResearchTask): Promise<ResearchSource[]> {
    // Artificial slight network latency simulation
    await new Promise(r => setTimeout(r, 220));

    const key = task.entityName.toLowerCase().trim();
    const candidates = AuthoritativeMedicalResearchProvider.AUTHORITATIVE_REPOSITORY[key];

    if (!candidates || candidates.length === 0) {
      // Return empty array to demonstrate Rule 33: "No source found - handle safely, do NOT hallucinate"
      return [];
    }

    // Rank and filter candidates through the source registry
    return TrustedSourceRegistry.rankSources(candidates, 4);
  }

  /**
   * Batch search for multiple research tasks.
   */
  public async searchBatch(tasks: ResearchTask[]): Promise<Map<string, ResearchSource[]>> {
    const results = new Map<string, ResearchSource[]>();
    for (const task of tasks) {
      const sources = await this.search(task);
      results.set(task.id, sources);
    }
    return results;
  }
}

/**
 * Mock provider for unit tests and offline testing.
 */
export class MockMedicalResearchProvider implements MedicalResearchProvider {
  public name = 'Mock Deterministic Medical Research Provider';
  private shouldFail = false;
  private returnEmpty = false;

  constructor(options?: { shouldFail?: boolean; returnEmpty?: boolean }) {
    if (options?.shouldFail) this.shouldFail = true;
    if (options?.returnEmpty) this.returnEmpty = true;
  }

  public async search(task: ResearchTask): Promise<ResearchSource[]> {
    if (this.shouldFail) {
      throw new Error('Simulated network connection failure');
    }

    if (this.returnEmpty) {
      return [];
    }

    return [
      {
        id: `mock-src-${task.id}-1`,
        title: `Official Guidance for ${task.entityName}`,
        url: `https://medlineplus.gov/topic/${encodeURIComponent(task.entityName)}.html`,
        domain: 'medlineplus.gov',
        publisher: 'U.S. National Library of Medicine',
        sourceTier: 1,
        retrievedAt: new Date().toISOString().slice(0, 10),
        snippet: `${task.entityName} is documented as an evidence-based clinical item.`,
        reliability: 'high'
      }
    ];
  }

  public async searchBatch(tasks: ResearchTask[]): Promise<Map<string, ResearchSource[]>> {
    const map = new Map<string, ResearchSource[]>();
    for (const t of tasks) {
      map.set(t.id, await this.search(t));
    }
    return map;
  }
}
