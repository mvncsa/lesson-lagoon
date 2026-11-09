import { describe, it, expect } from 'vitest';
import {
  parseResourceFilename,
  detectResourceType,
  validateUploadFileSize,
} from '../lib/fileDetection';

describe('Deterministic File Type & Meta Detection (NO AI)', () => {
  it('detects Dhivehi subject and Grade 4 from filename', () => {
    const meta = parseResourceFilename('grade-4-dhivehi-grammar-drills.pdf');
    expect(meta.detectedGrade).toBe('Grade 4');
    expect(meta.detectedSubject).toBe('dhivehi');
    expect(meta.detectedType).toBe('PDF');
  });

  it('detects Science subject, Grade 5, and PPTX presentation type', () => {
    const meta = parseResourceFilename('Grade_5_Science_Solar_System.pptx');
    expect(meta.detectedGrade).toBe('Grade 5');
    expect(meta.detectedSubject).toBe('science');
    expect(meta.detectedType).toBe('PPTX');
  });

  it('detects KG grade and English phonics', () => {
    const meta = parseResourceFilename('KG_English_Phonics_Flashcards.pdf');
    expect(meta.detectedGrade).toBe('KG');
    expect(meta.detectedSubject).toBe('english');
  });

  it('detects Islam / Quran subject', () => {
    const meta = parseResourceFilename('Grade-2-Islam-Aqeedha-Workbook.docx');
    expect(meta.detectedGrade).toBe('Grade 2');
    expect(meta.detectedSubject).toBe('islam');
    expect(meta.detectedType).toBe('DOCX');
  });

  it('validates file sizes within 25MB threshold', () => {
    const valid = validateUploadFileSize(5 * 1024 * 1024, 25);
    expect(valid.valid).toBe(true);
    expect(valid.formattedSize).toBe('5.0 MB');

    const oversized = validateUploadFileSize(30 * 1024 * 1024, 25);
    expect(oversized.valid).toBe(false);
    expect(oversized.error).toContain('exceeds maximum');
  });
});
