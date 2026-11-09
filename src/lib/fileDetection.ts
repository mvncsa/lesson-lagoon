/**
 * LessonLagoon - Deterministic File Detection & Thumbnail Helpers (NO AI)
 * Rule-based filename parsing, MIME verification, and thumbnail generation.
 */

export interface DetectedResourceMeta {
  detectedTitle: string;
  detectedGrade: string;
  detectedSubject: string;
  detectedType: 'PDF' | 'DOCX' | 'PPTX';
  estimatedPages: number;
}

/**
 * Detect file type from name and MIME
 */
export function detectResourceType(filename: string): 'PDF' | 'DOCX' | 'PPTX' {
  const ext = filename.split('.').pop()?.toLowerCase();
  if (ext === 'pptx' || ext === 'ppt') return 'PPTX';
  if (ext === 'docx' || ext === 'doc') return 'DOCX';
  return 'PDF';
}

/**
 * Pure rule-based filename parser for Maldivian school resources (NO AI)
 * Extracts grade, subject, and cleans title from typical teacher filenames:
 * e.g. "Grade-4-Dhivehi-Hiyvaru-Worksheet.pdf" -> Title: "Dhivehi Hiyvaru Worksheet", Grade: "Grade 4", Subject: "dhivehi"
 */
export function parseResourceFilename(filename: string): DetectedResourceMeta {
  const baseName = filename.replace(/\.[^/.]+$/, ''); // Remove extension
  const cleanName = baseName.replace(/[-_]+/g, ' ').trim();

  // Detect Grade
  let detectedGrade = 'Grade 4';
  const gradeMatch = cleanName.match(/\b(KG|Preschool|Grade\s*([1-9]|1[0-2]))\b/i);
  if (gradeMatch) {
    if (gradeMatch[1].toUpperCase() === 'KG') {
      detectedGrade = 'KG';
    } else {
      const num = gradeMatch[2];
      detectedGrade = `Grade ${num}`;
    }
  }

  // Detect Subject
  let detectedSubject = 'maths';
  const lower = cleanName.toLowerCase();
  if (lower.includes('dhivehi') || lower.includes('thaana')) {
    detectedSubject = 'dhivehi';
  } else if (lower.includes('islam') || lower.includes('quran')) {
    detectedSubject = 'islam';
  } else if (lower.includes('math') || lower.includes('fraction') || lower.includes('algebra')) {
    detectedSubject = 'maths';
  } else if (lower.includes('science') || lower.includes('plant') || lower.includes('solar') || lower.includes('animal')) {
    detectedSubject = 'science';
  } else if (lower.includes('english') || lower.includes('grammar') || lower.includes('phonics')) {
    detectedSubject = 'english';
  } else if (lower.includes('environment') || lower.includes('social')) {
    detectedSubject = 'social';
  }

  // Clean title: capitalize words and remove redundant grade prefix
  const words = cleanName.split(/\s+/).filter(Boolean);
  const titleWords = words.map(
    (w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()
  );
  const detectedTitle = titleWords.join(' ');

  // Estimate page count based on type
  const detectedType = detectResourceType(filename);
  const estimatedPages = detectedType === 'PPTX' ? 24 : detectedType === 'DOCX' ? 8 : 14;

  return {
    detectedTitle,
    detectedGrade,
    detectedSubject,
    detectedType,
    estimatedPages,
  };
}

/**
 * Validate upload file size against maximum bytes limit
 */
export function validateUploadFileSize(
  sizeBytes: number,
  maxMegabytes = 25
): { valid: boolean; formattedSize: string; error?: string } {
  const mb = sizeBytes / (1024 * 1024);
  const formattedSize = mb >= 1 ? `${mb.toFixed(1)} MB` : `${Math.round(sizeBytes / 1024)} KB`;

  if (mb > maxMegabytes) {
    return {
      valid: false,
      formattedSize,
      error: `File size (${formattedSize}) exceeds maximum allowed ${maxMegabytes} MB`,
    };
  }

  return { valid: true, formattedSize };
}

/**
 * Generate client-side thumbnail for images or receipts
 */
export function generateClientThumbnail(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    if (!file.type.startsWith('image/')) {
      // For non-images (PDF/DOCX), return empty string so an SVG document badge is rendered
      resolve('');
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      resolve(e.target?.result as string);
    };
    reader.onerror = () => reject(new Error('Failed to read file preview'));
    reader.readAsDataURL(file);
  });
}
