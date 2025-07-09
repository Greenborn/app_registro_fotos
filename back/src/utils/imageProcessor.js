const sharp = require('sharp');
const path = require('path');
const fs = require('fs').promises;
const { v4: uuidv4 } = require('uuid');

/**
 * Procesar imagen subida
 * @param {Object} file - Archivo de multer
 * @returns {Object} Información del archivo procesado
 */
const processImage = async (file) => {
  try {
    // Validar tipo MIME
    const allowedMimeTypes = process.env.ALLOWED_MIME_TYPES?.split(',') || [
      'image/jpeg',
      'image/png',
      'image/webp'
    ];

    if (!allowedMimeTypes.includes(file.mimetype)) {
      throw new Error(`Tipo de archivo no permitido: ${file.mimetype}`);
    }

    // Validar tamaño
    const maxFileSize = parseInt(process.env.MAX_FILE_SIZE) || 10 * 1024 * 1024; // 10MB
    if (file.size > maxFileSize) {
      throw new Error(`Archivo demasiado grande: ${file.size} bytes`);
    }

    // Crear directorio de uploads si no existe
    const uploadPath = process.env.UPLOAD_PATH || './uploads';
    await ensureDirectoryExists(uploadPath);

    // Generar nombre único para el archivo
    const fileExtension = path.extname(file.originalname);
    const fileName = `${uuidv4()}${fileExtension}`;
    const filePath = path.join(uploadPath, fileName);

    // Procesar imagen con Sharp
    const processedImage = await sharp(file.buffer)
      .resize(1920, 1080, { // Máximo 1920x1080
        fit: 'inside',
        withoutEnlargement: true
      })
      .jpeg({ 
        quality: 85,
        progressive: true
      })
      .toBuffer();

    // Guardar archivo procesado
    await fs.writeFile(filePath, processedImage);

    // Obtener metadatos de la imagen
    const metadata = await sharp(file.buffer).metadata();

    return {
      path: filePath,
      filename: fileName,
      size: processedImage.length,
      mimeType: 'image/jpeg',
      originalSize: file.size,
      originalMimeType: file.mimetype,
      width: metadata.width,
      height: metadata.height,
      format: metadata.format
    };

  } catch (error) {
    console.error('Error al procesar imagen:', error);
    throw error;
  }
};

/**
 * Crear thumbnail de una imagen
 * @param {string} imagePath - Ruta de la imagen original
 * @param {number} width - Ancho del thumbnail
 * @param {number} height - Alto del thumbnail
 * @returns {Object} Información del thumbnail
 */
const createThumbnail = async (imagePath, width = 300, height = 300) => {
  try {
    const uploadPath = process.env.UPLOAD_PATH || './uploads';
    const thumbnailsPath = path.join(uploadPath, 'thumbnails');
    
    await ensureDirectoryExists(thumbnailsPath);

    const fileName = path.basename(imagePath);
    const thumbnailName = `thumb_${fileName}`;
    const thumbnailPath = path.join(thumbnailsPath, thumbnailName);

    // Crear thumbnail
    await sharp(imagePath)
      .resize(width, height, {
        fit: 'cover',
        position: 'center'
      })
      .jpeg({ 
        quality: 80,
        progressive: true
      })
      .toFile(thumbnailPath);

    return {
      path: thumbnailPath,
      filename: thumbnailName,
      width,
      height
    };

  } catch (error) {
    console.error('Error al crear thumbnail:', error);
    throw error;
  }
};

/**
 * Redimensionar imagen existente
 * @param {string} imagePath - Ruta de la imagen
 * @param {number} width - Nuevo ancho
 * @param {number} height - Nuevo alto
 * @param {string} outputPath - Ruta de salida (opcional)
 * @returns {Object} Información de la imagen redimensionada
 */
const resizeImage = async (imagePath, width, height, outputPath = null) => {
  try {
    if (!outputPath) {
      const dir = path.dirname(imagePath);
      const ext = path.extname(imagePath);
      const name = path.basename(imagePath, ext);
      outputPath = path.join(dir, `${name}_${width}x${height}${ext}`);
    }

    await sharp(imagePath)
      .resize(width, height, {
        fit: 'inside',
        withoutEnlargement: true
      })
      .jpeg({ 
        quality: 85,
        progressive: true
      })
      .toFile(outputPath);

    return {
      path: outputPath,
      filename: path.basename(outputPath),
      width,
      height
    };

  } catch (error) {
    console.error('Error al redimensionar imagen:', error);
    throw error;
  }
};

/**
 * Obtener metadatos de una imagen
 * @param {string} imagePath - Ruta de la imagen
 * @returns {Object} Metadatos de la imagen
 */
const getImageMetadata = async (imagePath) => {
  try {
    const metadata = await sharp(imagePath).metadata();
    
    return {
      width: metadata.width,
      height: metadata.height,
      format: metadata.format,
      space: metadata.space,
      channels: metadata.channels,
      depth: metadata.depth,
      density: metadata.density,
      hasProfile: metadata.hasProfile,
      hasAlpha: metadata.hasAlpha
    };

  } catch (error) {
    console.error('Error al obtener metadatos de imagen:', error);
    throw error;
  }
};

/**
 * Convertir imagen a formato específico
 * @param {string} imagePath - Ruta de la imagen
 * @param {string} format - Formato de salida (jpeg, png, webp)
 * @param {string} outputPath - Ruta de salida (opcional)
 * @returns {Object} Información de la imagen convertida
 */
const convertImageFormat = async (imagePath, format, outputPath = null) => {
  try {
    if (!outputPath) {
      const dir = path.dirname(imagePath);
      const name = path.basename(imagePath, path.extname(imagePath));
      outputPath = path.join(dir, `${name}.${format}`);
    }

    let sharpInstance = sharp(imagePath);

    switch (format.toLowerCase()) {
      case 'jpeg':
      case 'jpg':
        sharpInstance = sharpInstance.jpeg({ quality: 85, progressive: true });
        break;
      case 'png':
        sharpInstance = sharpInstance.png({ progressive: true });
        break;
      case 'webp':
        sharpInstance = sharpInstance.webp({ quality: 85 });
        break;
      default:
        throw new Error(`Formato no soportado: ${format}`);
    }

    await sharpInstance.toFile(outputPath);

    return {
      path: outputPath,
      filename: path.basename(outputPath),
      format: format.toLowerCase()
    };

  } catch (error) {
    console.error('Error al convertir formato de imagen:', error);
    throw error;
  }
};

/**
 * Optimizar imagen (comprimir sin pérdida de calidad)
 * @param {string} imagePath - Ruta de la imagen
 * @param {string} outputPath - Ruta de salida (opcional)
 * @returns {Object} Información de la imagen optimizada
 */
const optimizeImage = async (imagePath, outputPath = null) => {
  try {
    if (!outputPath) {
      const dir = path.dirname(imagePath);
      const ext = path.extname(imagePath);
      const name = path.basename(imagePath, ext);
      outputPath = path.join(dir, `${name}_optimized${ext}`);
    }

    const metadata = await sharp(imagePath).metadata();
    let sharpInstance = sharp(imagePath);

    // Aplicar optimizaciones según el formato
    switch (metadata.format) {
      case 'jpeg':
        sharpInstance = sharpInstance.jpeg({ 
          quality: 85,
          progressive: true,
          mozjpeg: true
        });
        break;
      case 'png':
        sharpInstance = sharpInstance.png({ 
          progressive: true,
          compressionLevel: 9
        });
        break;
      case 'webp':
        sharpInstance = sharpInstance.webp({ 
          quality: 85,
          effort: 6
        });
        break;
    }

    await sharpInstance.toFile(outputPath);

    // Obtener tamaño del archivo optimizado
    const stats = await fs.stat(outputPath);

    return {
      path: outputPath,
      filename: path.basename(outputPath),
      originalSize: (await fs.stat(imagePath)).size,
      optimizedSize: stats.size,
      compressionRatio: ((await fs.stat(imagePath)).size - stats.size) / (await fs.stat(imagePath)).size * 100
    };

  } catch (error) {
    console.error('Error al optimizar imagen:', error);
    throw error;
  }
};

/**
 * Asegurar que un directorio existe
 * @param {string} dirPath - Ruta del directorio
 */
const ensureDirectoryExists = async (dirPath) => {
  try {
    await fs.access(dirPath);
  } catch (error) {
    await fs.mkdir(dirPath, { recursive: true });
  }
};

/**
 * Eliminar archivo de imagen y sus thumbnails
 * @param {string} imagePath - Ruta de la imagen
 */
const deleteImage = async (imagePath) => {
  try {
    // Eliminar imagen principal
    await fs.unlink(imagePath);

    // Eliminar thumbnail si existe
    const uploadPath = process.env.UPLOAD_PATH || './uploads';
    const thumbnailsPath = path.join(uploadPath, 'thumbnails');
    const fileName = path.basename(imagePath);
    const thumbnailPath = path.join(thumbnailsPath, `thumb_${fileName}`);

    try {
      await fs.unlink(thumbnailPath);
    } catch (error) {
      // El thumbnail puede no existir, no es un error crítico
      console.warn('No se pudo eliminar thumbnail:', error.message);
    }

  } catch (error) {
    console.error('Error al eliminar imagen:', error);
    throw error;
  }
};

/**
 * Validar archivo de imagen
 * @param {Object} file - Archivo de multer
 * @returns {boolean} True si es válido
 */
const validateImageFile = (file) => {
  const allowedMimeTypes = process.env.ALLOWED_MIME_TYPES?.split(',') || [
    'image/jpeg',
    'image/png',
    'image/webp'
  ];

  const maxFileSize = parseInt(process.env.MAX_FILE_SIZE) || 10 * 1024 * 1024;

  return (
    file &&
    allowedMimeTypes.includes(file.mimetype) &&
    file.size <= maxFileSize
  );
};

module.exports = {
  processImage,
  createThumbnail,
  resizeImage,
  getImageMetadata,
  convertImageFormat,
  optimizeImage,
  deleteImage,
  validateImageFile
}; 