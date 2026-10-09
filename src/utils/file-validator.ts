// validator file

// ua: типи файлів на клієнті
const BANNED_EXTENSIONS = ['exe', 'bat', 'cmd', 'sh', 'msi', 'com']; // banned
const MAX_FILE_SIZE_MB = 10; // max size of file
const MAX_FILE_SIZE_BYTES = MAX_FILE_SIZE_MB * 1024 * 1024;

export interface FileValidationResult {
  isValid: boolean;
  error?: string;
}

export const validateUploadedFile = (file: File): FileValidationResult => {
  const extension = file.name.split('.').pop()?.toLowerCase() || '';

  // check на небезпечні виконувані розширення
  if (BANNED_EXTENSIONS.includes(extension)) {
    return {
      isValid: false,
      error: `File type .${extension} is blocked for security reasons.`,
    };
  }

  // check на ліміт розміру (макс 10 MB)
  if (file.size > MAX_FILE_SIZE_BYTES) {
    return {
      isValid: false,
      error: `File size exceeds the limit of ${MAX_FILE_SIZE_MB} MB.`,
    };
  }

  return { isValid: true };
};
