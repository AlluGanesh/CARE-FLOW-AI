// Document Processor Service - Research Agent Phase 1
import { ResearchDocument } from '../../types/research';

export interface DocumentValidationResult {
  isValid: boolean;
  errorMessage?: string;
  sanitizedText?: string;
  inputType: 'pdf' | 'image' | 'text';
  fileName?: string;
  fileSize?: string;
  isSimulatedOcr?: boolean;
}

const SUPPORTED_FILE_TYPES = [
  'application/pdf',
  'image/png',
  'image/jpeg',
  'image/jpg'
];

const SUPPORTED_EXTENSIONS = ['.pdf', '.png', '.jpg', '.jpeg'];

export class DocumentProcessor {
  /**
   * Validates plain text input entered directly by user.
   */
  public static validateTextInput(rawText: string): DocumentValidationResult {
    const trimmed = rawText?.trim() || '';
    if (!trimmed) {
      return {
        isValid: false,
        errorMessage: 'Please enter medical report text or paste clinical lab results to analyze.',
        inputType: 'text'
      };
    }

    if (trimmed.length < 10) {
      return {
        isValid: false,
        errorMessage: 'The provided report text is too brief to identify medical information. Please provide a complete medical statement or lab panel.',
        inputType: 'text'
      };
    }

    return {
      isValid: true,
      sanitizedText: trimmed,
      inputType: 'text'
    };
  }

  /**
   * Validates an uploaded File object (PDF or PNG/JPG image).
   */
  public static validateUploadedFile(file: File): DocumentValidationResult {
    if (!file) {
      return {
        isValid: false,
        errorMessage: 'No file was provided. Please select a valid medical report file.',
        inputType: 'text'
      };
    }

    const fileName = file.name.toLowerCase();
    const hasValidExt = SUPPORTED_EXTENSIONS.some(ext => fileName.endsWith(ext));
    const hasValidMime = SUPPORTED_FILE_TYPES.includes(file.type);

    if (!hasValidExt && !hasValidMime) {
      return {
        isValid: false,
        errorMessage: `Unsupported file format "${file.name}". Please upload a PDF document or an image (PNG, JPG, JPEG), or paste the text directly.`,
        inputType: 'text'
      };
    }

    const isPdf = fileName.endsWith('.pdf') || file.type === 'application/pdf';
    const inputType: 'pdf' | 'image' = isPdf ? 'pdf' : 'image';
    const fileSizeFormatted = (file.size / (1024 * 1024)).toFixed(2) + ' MB';

    return {
      isValid: true,
      inputType,
      fileName: file.name,
      fileSize: fileSizeFormatted,
      isSimulatedOcr: true
    };
  }

  /**
   * For Phase 1, extracts text from files.
   * If a PDF or image is provided, realistic simulated report text is produced
   * based on the file characteristics, while explicitly noting in the UI that
   * Phase 1 uses simulated OCR extraction prepared for Phase 2 backend pipeline.
   */
  public static async processFileToText(
    file: File, 
    patientName: string = 'Patient'
  ): Promise<{ text: string; isSimulated: boolean }> {
    const validation = this.validateUploadedFile(file);
    if (!validation.isValid) {
      throw new Error(validation.errorMessage || 'Invalid document format');
    }

    // Realistic simulation for uploaded files in Phase 1
    // (Explicitly transparent that this is prototype extraction prepared for backend OCR)
    const fileName = file.name.toLowerCase();
    let text = '';

    if (fileName.includes('cardio') || fileName.includes('echo') || fileName.includes('heart')) {
      text = `CARDIOLOGY CONSULTATION & LAB REPORT
Patient: ${patientName}
Diagnosis: Coronary Artery Disease, Hypertension
Medical Tests:
- Blood Pressure: 138/88 mmHg
- Total Cholesterol: 215 mg/dL
- LDL Cholesterol: 132 mg/dL
- HDL Cholesterol: 42 mg/dL
- Serum Creatinine: 1.0 mg/dL
Prescribed Medications:
- Atorvastatin 20 mg once daily
- Amlodipine 5 mg once daily
Follow-up:
Review in cardiology outpatient clinic after 4 weeks. Repeat lipid panel in 3 months.`;
    } else if (fileName.includes('renal') || fileName.includes('kidney') || fileName.includes('urine')) {
      text = `METABOLIC & RENAL SCREENING REPORT
Patient: ${patientName}
Diagnosis: Type 2 Diabetes Mellitus with Microalbuminuria
Laboratory Investigations:
- HbA1c: 7.9%
- Fasting Blood Sugar: 154 mg/dL
- Serum Creatinine: 1.2 mg/dL
- eGFR: 68 mL/min
- Urine Albumin/Creatinine: 45 mg/g
Medication:
- Metformin 500 mg twice daily
- Lisinopril 5 mg once daily
Follow-up:
Repeat Renal Function Panel in 6 weeks. Review with attending physician after 2 weeks.`;
    } else {
      // Default standard metabolic / diabetes follow-up report
      text = `OUTPATIENT CLINICAL SUMMARY & LABORATORY REPORT
Patient: ${patientName}
Diagnosis: Type 2 Diabetes, Hypertension
Laboratory Results:
- HbA1c: 8.2%
- Fasting Blood Sugar: 165 mg/dL
- Postprandial Blood Sugar: 210 mg/dL
- Blood Pressure: 135/85 mmHg
- Serum Creatinine: 1.1 mg/dL
Active Medications:
- Metformin 500 mg
- Amlodipine 5 mg
Follow-up Instructions:
Review after 2 weeks. Repeat HbA1c after 3 months. Upload laboratory report to care portal.`;
    }

    return {
      text,
      isSimulated: true
    };
  }

  /**
   * Helper to instantiate a ResearchDocument record
   */
  public static createDocumentRecord(
    patientId: string,
    inputType: 'pdf' | 'image' | 'text',
    text: string,
    fileName?: string,
    fileSize?: string
  ): ResearchDocument {
    return {
      id: `rdoc-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      patientId,
      fileName: fileName || (inputType === 'text' ? 'Clinical_Text_Input.txt' : 'Medical_Report.pdf'),
      inputType,
      originalText: text,
      status: 'uploaded',
      createdAt: new Date().toISOString().replace('T', ' ').slice(0, 19),
      fileSize: fileSize || (inputType === 'text' ? `${Math.round(text.length / 1024 * 10) / 10 || 0.5} KB` : undefined)
    };
  }
}
