const { db } = require('../config/database');

/**
 * Crear un log de auditoría
 * @param {Object} logData - Datos del log
 * @param {number} logData.userId - ID del usuario que realiza la acción
 * @param {string} logData.action - Tipo de acción (create, update, delete, login, etc.)
 * @param {string} logData.tableName - Nombre de la tabla afectada
 * @param {number} logData.recordId - ID del registro afectado
 * @param {Object} logData.oldValues - Valores anteriores (para updates)
 * @param {Object} logData.newValues - Valores nuevos (para creates/updates)
 * @param {string} logData.ipAddress - Dirección IP del usuario
 * @param {string} logData.userAgent - User agent del navegador
 */
const createAuditLog = async (logData) => {
  try {
    const {
      userId,
      action,
      tableName,
      recordId,
      oldValues,
      newValues,
      ipAddress,
      userAgent
    } = logData;

    await db('audit_logs').insert({
      user_id: userId,
      action,
      table_name: tableName,
      record_id: recordId,
      old_values: oldValues ? JSON.stringify(oldValues) : null,
      new_values: newValues ? JSON.stringify(newValues) : null,
      ip_address: ipAddress,
      user_agent: userAgent,
      created_at: new Date()
    });

  } catch (error) {
    console.error('Error al crear log de auditoría:', error);
    // No lanzar error para no interrumpir el flujo principal
  }
};

/**
 * Obtener logs de auditoría con filtros
 * @param {Object} filters - Filtros para la búsqueda
 * @param {number} filters.userId - Filtrar por usuario
 * @param {string} filters.action - Filtrar por acción
 * @param {string} filters.tableName - Filtrar por tabla
 * @param {Date} filters.dateFrom - Fecha desde
 * @param {Date} filters.dateTo - Fecha hasta
 * @param {number} page - Página actual
 * @param {number} limit - Límite por página
 */
const getAuditLogs = async (filters = {}, page = 1, limit = 50) => {
  try {
    const offset = (page - 1) * limit;

    let query = db('audit_logs')
      .select(
        'audit_logs.*',
        'users.username',
        'users.full_name'
      )
      .leftJoin('users', 'audit_logs.user_id', 'users.id');

    // Aplicar filtros
    if (filters.userId) {
      query = query.where('audit_logs.user_id', filters.userId);
    }
    if (filters.action) {
      query = query.where('audit_logs.action', filters.action);
    }
    if (filters.tableName) {
      query = query.where('audit_logs.table_name', filters.tableName);
    }
    if (filters.dateFrom) {
      query = query.where('audit_logs.created_at', '>=', filters.dateFrom);
    }
    if (filters.dateTo) {
      query = query.where('audit_logs.created_at', '<=', filters.dateTo);
    }

    const logs = await query
      .orderBy('audit_logs.created_at', 'desc')
      .limit(limit)
      .offset(offset);

    const total = await query.clone().count('audit_logs.id as count').first();

    return {
      logs,
      pagination: {
        page,
        limit,
        total: total.count,
        pages: Math.ceil(total.count / limit)
      }
    };

  } catch (error) {
    console.error('Error al obtener logs de auditoría:', error);
    throw error;
  }
};

/**
 * Obtener estadísticas de auditoría
 * @param {Object} filters - Filtros para las estadísticas
 */
const getAuditStats = async (filters = {}) => {
  try {
    let query = db('audit_logs');

    // Aplicar filtros
    if (filters.userId) {
      query = query.where('user_id', filters.userId);
    }
    if (filters.dateFrom) {
      query = query.where('created_at', '>=', filters.dateFrom);
    }
    if (filters.dateTo) {
      query = query.where('created_at', '<=', filters.dateTo);
    }

    const stats = await query
      .select(
        db.raw('COUNT(*) as total_logs'),
        db.raw('COUNT(DISTINCT user_id) as total_users'),
        db.raw('COUNT(DISTINCT action) as total_actions'),
        db.raw('MIN(created_at) as first_log_date'),
        db.raw('MAX(created_at) as last_log_date')
      )
      .first();

    // Obtener acciones más comunes
    const topActions = await query
      .select('action')
      .count('* as count')
      .groupBy('action')
      .orderBy('count', 'desc')
      .limit(10);

    return {
      ...stats,
      topActions
    };

  } catch (error) {
    console.error('Error al obtener estadísticas de auditoría:', error);
    throw error;
  }
};

/**
 * Limpiar logs antiguos (mantener solo los últimos 6 meses)
 */
const cleanOldAuditLogs = async () => {
  try {
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    const result = await db('audit_logs')
      .where('created_at', '<', sixMonthsAgo)
      .del();

    console.log(`🧹 Limpiados ${result} logs de auditoría antiguos`);
    return result;

  } catch (error) {
    console.error('Error al limpiar logs antiguos:', error);
    throw error;
  }
};

/**
 * Exportar logs de auditoría a CSV
 * @param {Object} filters - Filtros para la exportación
 */
const exportAuditLogsToCSV = async (filters = {}) => {
  try {
    let query = db('audit_logs')
      .select(
        'audit_logs.created_at',
        'users.username',
        'users.full_name',
        'audit_logs.action',
        'audit_logs.table_name',
        'audit_logs.record_id',
        'audit_logs.ip_address',
        'audit_logs.user_agent'
      )
      .leftJoin('users', 'audit_logs.user_id', 'users.id');

    // Aplicar filtros
    if (filters.userId) {
      query = query.where('audit_logs.user_id', filters.userId);
    }
    if (filters.action) {
      query = query.where('audit_logs.action', filters.action);
    }
    if (filters.dateFrom) {
      query = query.where('audit_logs.created_at', '>=', filters.dateFrom);
    }
    if (filters.dateTo) {
      query = query.where('audit_logs.created_at', '<=', filters.dateTo);
    }

    const logs = await query
      .orderBy('audit_logs.created_at', 'desc')
      .limit(10000); // Límite para evitar archivos muy grandes

    // Convertir a CSV
    const csvHeader = 'Fecha,Usuario,Nombre Completo,Acción,Tabla,ID Registro,IP,User Agent\n';
    const csvRows = logs.map(log => {
      return [
        log.created_at,
        log.username || 'N/A',
        log.full_name || 'N/A',
        log.action,
        log.table_name || 'N/A',
        log.record_id || 'N/A',
        log.ip_address || 'N/A',
        `"${(log.user_agent || 'N/A').replace(/"/g, '""')}"`
      ].join(',');
    }).join('\n');

    return csvHeader + csvRows;

  } catch (error) {
    console.error('Error al exportar logs de auditoría:', error);
    throw error;
  }
};

module.exports = {
  createAuditLog,
  getAuditLogs,
  getAuditStats,
  cleanOldAuditLogs,
  exportAuditLogsToCSV
}; 