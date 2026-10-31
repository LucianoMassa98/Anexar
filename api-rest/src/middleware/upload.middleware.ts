import multer from 'multer';

// Ephemeral memory storage: uploaded files are kept exclusively in RAM buffers
// and NEVER written to disk, upholding the Zero-Retention security policy.
const storage = multer.memoryStorage();

export const uploadMiddleware = multer({
  storage,
  limits: {
    fileSize: 50 * 1024 * 1024, // 50MB maximum per file
    files: 5,
  },
  fileFilter: (_req, file, cb) => {
    const allowedMime = [
      'text/csv',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    ];
    const isExtensionValid = /\.(csv|xlsx|xls)$/i.test(file.originalname);

    if (allowedMime.includes(file.mimetype) || isExtensionValid) {
      cb(null, true);
    } else {
      cb(new Error('Formato no soportado. Sólo se admiten archivos .csv, .xlsx y .xls.'));
    }
  },
});

