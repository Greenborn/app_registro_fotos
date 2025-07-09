const { db } = require('../config/database');

class UserLocation {
  constructor() {
    this.tableName = 'user_locations';
  }

  // Crear una nueva ubicación
  async create(locationData) {
    const [location] = await db(this.tableName)
      .insert({
        ...locationData,
        created_at: new Date()
      })
      .returning('*');

    return location;
  }

  // Obtener la ubicación más reciente de un usuario
  async getLatestByUserId(userId) {
    const location = await db(this.tableName)
      .where('user_id', userId)
      .orderBy('recorded_at', 'desc')
      .first();

    return location;
  }

  // Obtener ubicaciones de un usuario en un rango de tiempo
  async findByUserIdAndTimeRange(userId, startTime, endTime) {
    const locations = await db(this.tableName)
      .where('user_id', userId)
      .whereBetween('recorded_at', [startTime, endTime])
      .orderBy('recorded_at', 'asc');

    return locations;
  }

  // Obtener todas las ubicaciones de un usuario (con paginación)
  async findByUserId(userId, page = 1, limit = 50) {
    const offset = (page - 1) * limit;

    const locations = await db(this.tableName)
      .where('user_id', userId)
      .orderBy('recorded_at', 'desc')
      .limit(limit)
      .offset(offset);

    const total = await db(this.tableName)
      .where('user_id', userId)
      .count('* as count')
      .first();

    return {
      locations,
      pagination: {
        page,
        limit,
        total: total.count,
        pages: Math.ceil(total.count / limit)
      }
    };
  }

  // Obtener ubicaciones de todos los usuarios activos
  async getActiveUsersLocations() {
    const locations = await db(this.tableName)
      .select(
        'user_locations.*',
        'users.username',
        'users.full_name',
        'users.profile_photo'
      )
      .join('users', 'user_locations.user_id', 'users.id')
      .where('users.status', 'active')
      .where('users.role', 'operator')
      .whereIn('user_locations.id', function() {
        this.select(db.raw('MAX(id)'))
          .from('user_locations')
          .groupBy('user_id');
      })
      .orderBy('user_locations.recorded_at', 'desc');

    return locations;
  }

  // Obtener ubicaciones en un área geográfica
  async findByLocation(bounds, timeRange = null) {
    const { north, south, east, west } = bounds;

    let query = db(this.tableName)
      .select(
        'user_locations.*',
        'users.username',
        'users.full_name',
        'users.profile_photo'
      )
      .join('users', 'user_locations.user_id', 'users.id')
      .where('users.status', 'active')
      .whereBetween('user_locations.latitude', [south, north])
      .whereBetween('user_locations.longitude', [west, east]);

    if (timeRange) {
      query = query.whereBetween('user_locations.recorded_at', [timeRange.start, timeRange.end]);
    }

    const locations = await query.orderBy('user_locations.recorded_at', 'desc');

    return locations;
  }

  // Obtener ruta de un usuario (ubicaciones consecutivas)
  async getUserRoute(userId, startTime, endTime) {
    const route = await db(this.tableName)
      .where('user_id', userId)
      .whereBetween('recorded_at', [startTime, endTime])
      .orderBy('recorded_at', 'asc');

    return route;
  }

  // Calcular distancia total recorrida por un usuario
  async calculateTotalDistance(userId, startTime, endTime) {
    const locations = await this.getUserRoute(userId, startTime, endTime);
    
    let totalDistance = 0;
    
    for (let i = 1; i < locations.length; i++) {
      const prev = locations[i - 1];
      const curr = locations[i];
      
      const distance = this.calculateDistance(
        prev.latitude, prev.longitude,
        curr.latitude, curr.longitude
      );
      
      totalDistance += distance;
    }
    
    return totalDistance;
  }

  // Calcular distancia entre dos puntos (fórmula de Haversine)
  calculateDistance(lat1, lon1, lat2, lon2) {
    const R = 6371; // Radio de la Tierra en km
    const dLat = this.toRadians(lat2 - lat1);
    const dLon = this.toRadians(lon2 - lon1);
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(this.toRadians(lat1)) * Math.cos(this.toRadians(lat2)) * 
      Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    const distance = R * c; // Distancia en km
    return distance;
  }

  toRadians(degrees) {
    return degrees * (Math.PI/180);
  }

  // Obtener estadísticas de ubicación
  async getLocationStats(userId = null) {
    let query = db(this.tableName);

    if (userId) {
      query = query.where('user_id', userId);
    }

    const stats = await query
      .select(
        db.raw('COUNT(*) as total_locations'),
        db.raw('COUNT(DISTINCT user_id) as total_users'),
        db.raw('MIN(recorded_at) as first_location_date'),
        db.raw('MAX(recorded_at) as last_location_date'),
        db.raw('AVG(accuracy) as avg_accuracy')
      )
      .first();

    return stats;
  }

  // Limpiar ubicaciones antiguas (mantener solo las últimas 1000 por usuario)
  async cleanOldLocations() {
    const users = await db('users')
      .where('role', 'operator')
      .where('status', 'active')
      .pluck('id');

    for (const userId of users) {
      const locationsToKeep = await db(this.tableName)
        .where('user_id', userId)
        .orderBy('recorded_at', 'desc')
        .limit(1000)
        .pluck('id');

      if (locationsToKeep.length > 0) {
        await db(this.tableName)
          .where('user_id', userId)
          .whereNotIn('id', locationsToKeep)
          .del();
      }
    }
  }

  // Obtener ubicaciones con información de velocidad
  async getLocationsWithSpeed(userId, limit = 50) {
    const locations = await db(this.tableName)
      .where('user_id', userId)
      .whereNotNull('speed')
      .orderBy('recorded_at', 'desc')
      .limit(limit);

    return locations;
  }

  // Actualizar configuración de ubicación de un usuario
  async updateLocationConfig(userId, config) {
    const [locationConfig] = await db('location_update_config')
      .where('user_id', userId)
      .update({
        ...config,
        updated_at: new Date()
      })
      .returning('*');

    return locationConfig;
  }

  // Obtener configuración de ubicación de un usuario
  async getLocationConfig(userId) {
    const config = await db('location_update_config')
      .where('user_id', userId)
      .first();

    return config;
  }

  // Crear configuración de ubicación para un usuario
  async createLocationConfig(userId, config = {}) {
    const [locationConfig] = await db('location_update_config')
      .insert({
        user_id: userId,
        update_frequency: config.update_frequency || 5000,
        is_enabled: config.is_enabled !== false,
        created_at: new Date(),
        updated_at: new Date()
      })
      .returning('*');

    return locationConfig;
  }
}

module.exports = new UserLocation(); 