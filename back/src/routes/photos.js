const express = require('express');
const router = express.Router();
const photoController = require('../controllers/photoController');
const { authenticateToken, requireAdmin, requireOwnership } = require('../middleware/auth');
const { uploadLimiter, locationLimiter } = require('../config/rateLimit');
const multer = require('multer');
const { validateImageFile } = require('../utils/imageProcessor');

// Configuración de multer para subida de archivos
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: parseInt(process.env.MAX_FILE_SIZE) || 10 * 1024 * 1024 // 10MB
  },
  fileFilter: (req, file, cb) => {
    if (validateImageFile(file)) {
      cb(null, true);
    } else {
      cb(new Error('Tipo de archivo no permitido o archivo demasiado grande'), false);
    }
  }
});

// POST /photos/upload - Subir nueva foto
router.post('/upload', 
  authenticateToken, 
  uploadLimiter, 
  upload.single('photo'), 
  photoController.uploadPhoto
);

// GET /photos - Obtener fotos (con filtros)
router.get('/', authenticateToken, photoController.getAllPhotos);

// GET /photos/my - Obtener fotos del usuario autenticado
router.get('/my', authenticateToken, photoController.getUserPhotos);

// GET /photos/search - Buscar fotos por texto
router.get('/search', authenticateToken, photoController.searchPhotos);

// GET /photos/location - Obtener fotos por ubicación
router.get('/location', authenticateToken, photoController.getPhotosByLocation);

// GET /photos/stats - Obtener estadísticas de fotos
router.get('/stats', authenticateToken, photoController.getPhotoStats);

// GET /photos/:id - Obtener foto por ID
router.get('/:id', authenticateToken, photoController.getPhoto);

// GET /photos/:id/comments - Obtener foto con comentarios
router.get('/:id/comments', authenticateToken, photoController.getPhotoWithComments);

// POST /photos/:photoId/comments - Crear comentario en foto
router.post('/:photoId/comments', authenticateToken, photoController.createComment);

// DELETE /photos/:id - Eliminar foto
router.delete('/:id', authenticateToken, requireOwnership, photoController.deletePhoto);

module.exports = router; 