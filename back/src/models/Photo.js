const { db } = require('../config/database');

class Photo {
  constructor() {
    this.tableName = 'photos';
  }

  // Crear una nueva foto
  async create(photoData) {
    const [photo] = await db(this.tableName)
      .insert({
        ...photoData,
        created_at: new Date(),
        updated_at: new Date()
      })
      .returning('*');

    return photo;
  }

  // Buscar foto por ID
  async findById(id) {
    const photo = await db(this.tableName)
      .where('id', id)
      .first();

    return photo;
  }

  // Obtener foto con información del usuario
  async findByIdWithUser(id) {
    const photo = await db(this.tableName)
      .select(
        'photos.*',
        'users.username',
        'users.full_name',
        'users.profile_photo as user_profile_photo'
      )
      .join('users', 'photos.user_id', 'users.id')
      .where('photos.id', id)
      .first();

    return photo;
  }

  // Obtener fotos de un usuario específico
  async findByUserId(userId, page = 1, limit = 10) {
    const offset = (page - 1) * limit;

    const photos = await db(this.tableName)
      .where('user_id', userId)
      .orderBy('captured_at', 'desc')
      .limit(limit)
      .offset(offset);

    const total = await db(this.tableName)
      .where('user_id', userId)
      .count('* as count')
      .first();

    return {
      photos,
      pagination: {
        page,
        limit,
        total: total.count,
        pages: Math.ceil(total.count / limit)
      }
    };
  }

  // Obtener todas las fotos (con paginación y filtros)
  async findAll(page = 1, limit = 10, filters = {}) {
    const offset = (page - 1) * limit;

    let query = db(this.tableName)
      .select(
        'photos.*',
        'users.username',
        'users.full_name',
        'users.profile_photo as user_profile_photo'
      )
      .join('users', 'photos.user_id', 'users.id');

    // Aplicar filtros
    if (filters.userId) {
      query = query.where('photos.user_id', filters.userId);
    }
    if (filters.dateFrom) {
      query = query.where('photos.captured_at', '>=', filters.dateFrom);
    }
    if (filters.dateTo) {
      query = query.where('photos.captured_at', '<=', filters.dateTo);
    }
    if (filters.latitude && filters.longitude && filters.radius) {
      // Filtro por distancia (aproximado usando bounding box)
      const lat = parseFloat(filters.latitude);
      const lng = parseFloat(filters.longitude);
      const radius = parseFloat(filters.radius);
      const latDelta = radius / 111000; // Aproximadamente 111km por grado
      const lngDelta = radius / (111000 * Math.cos(lat * Math.PI / 180));

      query = query.whereBetween('photos.latitude', [lat - latDelta, lat + latDelta])
        .whereBetween('photos.longitude', [lng - lngDelta, lng + lngDelta]);
    }

    const photos = await query
      .orderBy('photos.captured_at', 'desc')
      .limit(limit)
      .offset(offset);

    const total = await query.clone().count('photos.id as count').first();

    return {
      photos,
      pagination: {
        page,
        limit,
        total: total.count,
        pages: Math.ceil(total.count / limit)
      }
    };
  }

  // Obtener fotos en un área geográfica
  async findByLocation(bounds) {
    const { north, south, east, west } = bounds;

    const photos = await db(this.tableName)
      .select(
        'photos.*',
        'users.username',
        'users.full_name'
      )
      .join('users', 'photos.user_id', 'users.id')
      .whereBetween('photos.latitude', [south, north])
      .whereBetween('photos.longitude', [west, east])
      .orderBy('photos.captured_at', 'desc');

    return photos;
  }

  // Actualizar foto
  async update(id, updateData) {
    const [photo] = await db(this.tableName)
      .where('id', id)
      .update({
        ...updateData,
        updated_at: new Date()
      })
      .returning('*');

    return photo;
  }

  // Eliminar foto
  async delete(id) {
    const [photo] = await db(this.tableName)
      .where('id', id)
      .del()
      .returning('*');

    return photo;
  }

  // Obtener estadísticas de fotos
  async getStats(userId = null) {
    let query = db(this.tableName);

    if (userId) {
      query = query.where('user_id', userId);
    }

    const stats = await query
      .select(
        db.raw('COUNT(*) as total_photos'),
        db.raw('COUNT(DISTINCT user_id) as total_users'),
        db.raw('MIN(captured_at) as first_photo_date'),
        db.raw('MAX(captured_at) as last_photo_date'),
        db.raw('AVG(file_size) as avg_file_size')
      )
      .first();

    return stats;
  }

  // Obtener fotos recientes
  async getRecent(limit = 10) {
    const photos = await db(this.tableName)
      .select(
        'photos.*',
        'users.username',
        'users.full_name'
      )
      .join('users', 'photos.user_id', 'users.id')
      .orderBy('photos.captured_at', 'desc')
      .limit(limit);

    return photos;
  }

  // Obtener fotos por rango de fechas
  async findByDateRange(startDate, endDate, userId = null) {
    let query = db(this.tableName)
      .select(
        'photos.*',
        'users.username',
        'users.full_name'
      )
      .join('users', 'photos.user_id', 'users.id')
      .whereBetween('photos.captured_at', [startDate, endDate]);

    if (userId) {
      query = query.where('photos.user_id', userId);
    }

    const photos = await query.orderBy('photos.captured_at', 'desc');

    return photos;
  }

  // Contar fotos por usuario
  async countByUser(userId) {
    const result = await db(this.tableName)
      .where('user_id', userId)
      .count('* as count')
      .first();

    return result.count;
  }

  // Obtener fotos con comentarios
  async findWithComments(id) {
    const photo = await db(this.tableName)
      .select(
        'photos.*',
        'users.username',
        'users.full_name',
        'users.profile_photo as user_profile_photo'
      )
      .join('users', 'photos.user_id', 'users.id')
      .where('photos.id', id)
      .first();

    if (!photo) return null;

    // Obtener comentarios
    const comments = await db('photo_comments')
      .select(
        'photo_comments.*',
        'users.username',
        'users.full_name',
        'users.profile_photo'
      )
      .join('users', 'photo_comments.user_id', 'users.id')
      .where('photo_comments.photo_id', id)
      .orderBy('photo_comments.created_at', 'asc');

    return {
      ...photo,
      comments
    };
  }

  // Buscar fotos por texto (en comentarios)
  async searchByText(searchText, page = 1, limit = 10) {
    const offset = (page - 1) * limit;

    const photos = await db(this.tableName)
      .distinct('photos.*')
      .select(
        'photos.*',
        'users.username',
        'users.full_name'
      )
      .join('users', 'photos.user_id', 'users.id')
      .leftJoin('photo_comments', 'photos.id', 'photo_comments.photo_id')
      .where(function() {
        this.where('photo_comments.comment', 'like', `%${searchText}%`)
          .orWhere('users.full_name', 'like', `%${searchText}%`)
          .orWhere('users.username', 'like', `%${searchText}%`);
      })
      .orderBy('photos.captured_at', 'desc')
      .limit(limit)
      .offset(offset);

    const total = await db(this.tableName)
      .distinct('photos.id')
      .join('users', 'photos.user_id', 'users.id')
      .leftJoin('photo_comments', 'photos.id', 'photo_comments.photo_id')
      .where(function() {
        this.where('photo_comments.comment', 'like', `%${searchText}%`)
          .orWhere('users.full_name', 'like', `%${searchText}%`)
          .orWhere('users.username', 'like', `%${searchText}%`);
      })
      .count('photos.id as count')
      .first();

    return {
      photos,
      pagination: {
        page,
        limit,
        total: total.count,
        pages: Math.ceil(total.count / limit)
      }
    };
  }
}

module.exports = new Photo(); 