const Photo = require('../models/Photo');
const User = require('../models/User');
const { createAuditLog } = require('../utils/auditLogger');
const { processImage } = require('../utils/imageProcessor');
const path = require('path');
const fs = require('fs').promises;

class PhotoController {
  // Subir una nueva foto
  async uploadPhoto(req, res) {
    try {
      const { userId } = req.user;
      const { latitude, longitude, orientation, altitude, accuracy, comment } = req.body;
      const file = req.file;

      if (!file) {
        return res.status(400).json({
          error: 'Archivo requerido',
          message: 'Debe seleccionar una imagen'
        });
      }

      // Validar coordenadas
      if (!latitude || !longitude) {
        return res.status(400).json({
          error: 'Ubicación requerida',
          message: 'Las coordenadas de ubicación son requeridas'
        });
      }

      // Procesar imagen
      const processedImage = await processImage(file);
      
      // Crear registro de foto
      const photoData = {
        user_id: userId,
        file_path: processedImage.path,
        file_name: processedImage.filename,
        file_size: processedImage.size,
        mime_type: processedImage.mimeType,
        latitude: parseFloat(latitude),
        longitude: parseFloat(longitude),
        orientation: orientation ? parseFloat(orientation) : null,
        altitude: altitude ? parseFloat(altitude) : null,
        accuracy: accuracy ? parseFloat(accuracy) : null,
        captured_at: new Date()
      };

      const photo = await Photo.create(photoData);

      // Crear comentario si se proporciona
      if (comment && comment.trim()) {
        await this.createComment(photo.id, userId, comment);
      }

      // Log de auditoría
      await createAuditLog({
        userId,
        action: 'create',
        tableName: 'photos',
        recordId: photo.id,
        newValues: { file_path: photo.file_path, latitude, longitude },
        ipAddress: req.ip,
        userAgent: req.get('User-Agent')
      });

      // Obtener foto con información del usuario
      const photoWithUser = await Photo.findByIdWithUser(photo.id);

      res.status(201).json({
        success: true,
        message: 'Foto subida exitosamente',
        data: {
          photo: photoWithUser
        }
      });

    } catch (error) {
      console.error('Error al subir foto:', error);
      res.status(500).json({
        error: 'Error interno del servidor',
        message: 'Ocurrió un error al subir la foto'
      });
    }
  }

  // Obtener foto por ID
  async getPhoto(req, res) {
    try {
      const { id } = req.params;
      const { userId, role } = req.user;

      const photo = await Photo.findByIdWithUser(id);
      if (!photo) {
        return res.status(404).json({
          error: 'Foto no encontrada',
          message: 'La foto especificada no existe'
        });
      }

      // Verificar permisos (operadores solo pueden ver sus propias fotos)
      if (role === 'operator' && photo.user_id !== userId) {
        return res.status(403).json({
          error: 'Acceso denegado',
          message: 'No tienes permisos para ver esta foto'
        });
      }

      res.json({
        success: true,
        data: {
          photo
        }
      });

    } catch (error) {
      console.error('Error al obtener foto:', error);
      res.status(500).json({
        error: 'Error interno del servidor',
        message: 'Ocurrió un error al obtener la foto'
      });
    }
  }

  // Obtener foto con comentarios
  async getPhotoWithComments(req, res) {
    try {
      const { id } = req.params;
      const { userId, role } = req.user;

      const photoWithComments = await Photo.findWithComments(id);
      if (!photoWithComments) {
        return res.status(404).json({
          error: 'Foto no encontrada',
          message: 'La foto especificada no existe'
        });
      }

      // Verificar permisos
      if (role === 'operator' && photoWithComments.user_id !== userId) {
        return res.status(403).json({
          error: 'Acceso denegado',
          message: 'No tienes permisos para ver esta foto'
        });
      }

      res.json({
        success: true,
        data: {
          photo: photoWithComments
        }
      });

    } catch (error) {
      console.error('Error al obtener foto con comentarios:', error);
      res.status(500).json({
        error: 'Error interno del servidor',
        message: 'Ocurrió un error al obtener la foto'
      });
    }
  }

  // Obtener fotos del usuario
  async getUserPhotos(req, res) {
    try {
      const { userId } = req.user;
      const { page = 1, limit = 10 } = req.query;

      const result = await Photo.findByUserId(userId, parseInt(page), parseInt(limit));

      res.json({
        success: true,
        data: result
      });

    } catch (error) {
      console.error('Error al obtener fotos del usuario:', error);
      res.status(500).json({
        error: 'Error interno del servidor',
        message: 'Ocurrió un error al obtener las fotos'
      });
    }
  }

  // Obtener todas las fotos (solo administradores)
  async getAllPhotos(req, res) {
    try {
      const { role } = req.user;
      
      if (role !== 'admin') {
        return res.status(403).json({
          error: 'Acceso denegado',
          message: 'Solo los administradores pueden ver todas las fotos'
        });
      }

      const { page = 1, limit = 10, userId, dateFrom, dateTo, latitude, longitude, radius } = req.query;

      const filters = {};
      if (userId) filters.userId = userId;
      if (dateFrom) filters.dateFrom = dateFrom;
      if (dateTo) filters.dateTo = dateTo;
      if (latitude && longitude && radius) {
        filters.latitude = latitude;
        filters.longitude = longitude;
        filters.radius = radius;
      }

      const result = await Photo.findAll(parseInt(page), parseInt(limit), filters);

      res.json({
        success: true,
        data: result
      });

    } catch (error) {
      console.error('Error al obtener todas las fotos:', error);
      res.status(500).json({
        error: 'Error interno del servidor',
        message: 'Ocurrió un error al obtener las fotos'
      });
    }
  }

  // Obtener fotos en un área geográfica
  async getPhotosByLocation(req, res) {
    try {
      const { role } = req.user;
      const { north, south, east, west } = req.query;

      if (!north || !south || !east || !west) {
        return res.status(400).json({
          error: 'Parámetros requeridos',
          message: 'Se requieren las coordenadas del área (north, south, east, west)'
        });
      }

      const bounds = { north, south, east, west };
      const photos = await Photo.findByLocation(bounds);

      // Filtrar por permisos si es operador
      let filteredPhotos = photos;
      if (role === 'operator') {
        filteredPhotos = photos.filter(photo => photo.user_id === req.user.userId);
      }

      res.json({
        success: true,
        data: {
          photos: filteredPhotos,
          count: filteredPhotos.length
        }
      });

    } catch (error) {
      console.error('Error al obtener fotos por ubicación:', error);
      res.status(500).json({
        error: 'Error interno del servidor',
        message: 'Ocurrió un error al obtener las fotos'
      });
    }
  }

  // Buscar fotos por texto
  async searchPhotos(req, res) {
    try {
      const { role } = req.user;
      const { q, page = 1, limit = 10 } = req.query;

      if (!q || q.trim().length < 2) {
        return res.status(400).json({
          error: 'Término de búsqueda requerido',
          message: 'Debe proporcionar un término de búsqueda de al menos 2 caracteres'
        });
      }

      const result = await Photo.searchByText(q.trim(), parseInt(page), parseInt(limit));

      // Filtrar por permisos si es operador
      if (role === 'operator') {
        result.photos = result.photos.filter(photo => photo.user_id === req.user.userId);
        result.pagination.total = result.photos.length;
        result.pagination.pages = Math.ceil(result.photos.length / parseInt(limit));
      }

      res.json({
        success: true,
        data: result
      });

    } catch (error) {
      console.error('Error al buscar fotos:', error);
      res.status(500).json({
        error: 'Error interno del servidor',
        message: 'Ocurrió un error al buscar las fotos'
      });
    }
  }

  // Eliminar foto
  async deletePhoto(req, res) {
    try {
      const { id } = req.params;
      const { userId, role } = req.user;

      const photo = await Photo.findById(id);
      if (!photo) {
        return res.status(404).json({
          error: 'Foto no encontrada',
          message: 'La foto especificada no existe'
        });
      }

      // Verificar permisos
      if (role === 'operator' && photo.user_id !== userId) {
        return res.status(403).json({
          error: 'Acceso denegado',
          message: 'No tienes permisos para eliminar esta foto'
        });
      }

      // Eliminar archivo físico
      try {
        await fs.unlink(photo.file_path);
      } catch (fileError) {
        console.warn('No se pudo eliminar el archivo físico:', fileError.message);
      }

      // Eliminar registro de la base de datos
      await Photo.delete(id);

      // Log de auditoría
      await createAuditLog({
        userId: req.user.userId,
        action: 'delete',
        tableName: 'photos',
        recordId: id,
        oldValues: { file_path: photo.file_path },
        ipAddress: req.ip,
        userAgent: req.get('User-Agent')
      });

      res.json({
        success: true,
        message: 'Foto eliminada exitosamente'
      });

    } catch (error) {
      console.error('Error al eliminar foto:', error);
      res.status(500).json({
        error: 'Error interno del servidor',
        message: 'Ocurrió un error al eliminar la foto'
      });
    }
  }

  // Crear comentario
  async createComment(req, res) {
    try {
      const { photoId } = req.params;
      const { userId } = req.user;
      const { comment } = req.body;

      if (!comment || comment.trim().length === 0) {
        return res.status(400).json({
          error: 'Comentario requerido',
          message: 'El comentario no puede estar vacío'
        });
      }

      // Verificar que la foto existe
      const photo = await Photo.findById(photoId);
      if (!photo) {
        return res.status(404).json({
          error: 'Foto no encontrada',
          message: 'La foto especificada no existe'
        });
      }

      const commentData = {
        photo_id: photoId,
        user_id: userId,
        comment: comment.trim()
      };

      const newComment = await this.createCommentRecord(commentData);

      // Log de auditoría
      await createAuditLog({
        userId,
        action: 'create',
        tableName: 'photo_comments',
        recordId: newComment.id,
        newValues: { comment: newComment.comment },
        ipAddress: req.ip,
        userAgent: req.get('User-Agent')
      });

      // Obtener comentario con información del usuario
      const commentWithUser = await this.getCommentWithUser(newComment.id);

      res.status(201).json({
        success: true,
        message: 'Comentario creado exitosamente',
        data: {
          comment: commentWithUser
        }
      });

    } catch (error) {
      console.error('Error al crear comentario:', error);
      res.status(500).json({
        error: 'Error interno del servidor',
        message: 'Ocurrió un error al crear el comentario'
      });
    }
  }

  // Método interno para crear comentario
  async createComment(photoId, userId, comment) {
    const { db } = require('../config/database');
    
    const [newComment] = await db('photo_comments')
      .insert({
        photo_id: photoId,
        user_id: userId,
        comment: comment.trim(),
        created_at: new Date(),
        updated_at: new Date()
      })
      .returning('*');

    return newComment;
  }

  // Método interno para crear comentario (versión pública)
  async createCommentRecord(commentData) {
    const { db } = require('../config/database');
    
    const [newComment] = await db('photo_comments')
      .insert({
        ...commentData,
        created_at: new Date(),
        updated_at: new Date()
      })
      .returning('*');

    return newComment;
  }

  // Obtener comentario con información del usuario
  async getCommentWithUser(commentId) {
    const { db } = require('../config/database');
    
    return await db('photo_comments')
      .select(
        'photo_comments.*',
        'users.username',
        'users.full_name',
        'users.profile_photo'
      )
      .join('users', 'photo_comments.user_id', 'users.id')
      .where('photo_comments.id', commentId)
      .first();
  }

  // Obtener estadísticas de fotos
  async getPhotoStats(req, res) {
    try {
      const { userId, role } = req.user;
      
      let stats;
      if (role === 'admin') {
        stats = await Photo.getStats();
      } else {
        stats = await Photo.getStats(userId);
      }

      res.json({
        success: true,
        data: {
          stats
        }
      });

    } catch (error) {
      console.error('Error al obtener estadísticas:', error);
      res.status(500).json({
        error: 'Error interno del servidor',
        message: 'Ocurrió un error al obtener las estadísticas'
      });
    }
  }
}

module.exports = new PhotoController(); 