const { db } = require('../config/database');
const bcrypt = require('bcryptjs');

class User {
  constructor() {
    this.tableName = 'users';
  }

  // Crear un nuevo usuario
  async create(userData) {
    const { password, ...userFields } = userData;
    
    // Hash de la contraseña
    const passwordHash = await bcrypt.hash(password, 12);
    
    const [user] = await db(this.tableName)
      .insert({
        ...userFields,
        password_hash: passwordHash,
        created_at: new Date(),
        updated_at: new Date()
      })
      .returning('*');

    // No retornar el hash de la contraseña
    const { password_hash, ...userWithoutPassword } = user;
    return userWithoutPassword;
  }

  // Buscar usuario por ID
  async findById(id) {
    const user = await db(this.tableName)
      .where('id', id)
      .where('status', '!=', 'deleted')
      .first();

    if (user) {
      const { password_hash, ...userWithoutPassword } = user;
      return userWithoutPassword;
    }
    return null;
  }

  // Buscar usuario por username
  async findByUsername(username) {
    const user = await db(this.tableName)
      .where('username', username)
      .where('status', '!=', 'deleted')
      .first();

    return user; // Retornar con password_hash para autenticación
  }

  // Buscar usuario por email
  async findByEmail(email) {
    const user = await db(this.tableName)
      .where('email', email)
      .where('status', '!=', 'deleted')
      .first();

    if (user) {
      const { password_hash, ...userWithoutPassword } = user;
      return userWithoutPassword;
    }
    return null;
  }

  // Obtener todos los usuarios (con paginación)
  async findAll(page = 1, limit = 10, filters = {}) {
    const offset = (page - 1) * limit;
    
    let query = db(this.tableName)
      .where('status', '!=', 'deleted');

    // Aplicar filtros
    if (filters.role) {
      query = query.where('role', filters.role);
    }
    if (filters.status) {
      query = query.where('status', filters.status);
    }
    if (filters.search) {
      query = query.where(function() {
        this.where('username', 'like', `%${filters.search}%`)
          .orWhere('full_name', 'like', `%${filters.search}%`)
          .orWhere('email', 'like', `%${filters.search}%`);
      });
    }

    const users = await query
      .select('id', 'username', 'email', 'full_name', 'profile_photo', 'role', 'status', 'created_at', 'last_login')
      .orderBy('created_at', 'desc')
      .limit(limit)
      .offset(offset);

    const total = await query.clone().count('* as count').first();

    return {
      users,
      pagination: {
        page,
        limit,
        total: total.count,
        pages: Math.ceil(total.count / limit)
      }
    };
  }

  // Actualizar usuario
  async update(id, updateData) {
    const { password, ...fields } = updateData;
    
    const updateFields = {
      ...fields,
      updated_at: new Date()
    };

    // Si se está actualizando la contraseña
    if (password) {
      updateFields.password_hash = await bcrypt.hash(password, 12);
    }

    const [user] = await db(this.tableName)
      .where('id', id)
      .where('status', '!=', 'deleted')
      .update(updateFields)
      .returning('*');

    if (user) {
      const { password_hash, ...userWithoutPassword } = user;
      return userWithoutPassword;
    }
    return null;
  }

  // Eliminar usuario (soft delete)
  async delete(id) {
    const [user] = await db(this.tableName)
      .where('id', id)
      .where('status', '!=', 'deleted')
      .update({
        status: 'deleted',
        updated_at: new Date()
      })
      .returning('*');

    if (user) {
      const { password_hash, ...userWithoutPassword } = user;
      return userWithoutPassword;
    }
    return null;
  }

  // Verificar contraseña
  async verifyPassword(user, password) {
    return bcrypt.compare(password, user.password_hash);
  }

  // Actualizar último login
  async updateLastLogin(id) {
    await db(this.tableName)
      .where('id', id)
      .update({
        last_login: new Date(),
        updated_at: new Date()
      });
  }

  // Obtener usuarios por rol
  async findByRole(role) {
    const users = await db(this.tableName)
      .where('role', role)
      .where('status', 'active')
      .select('id', 'username', 'full_name', 'profile_photo', 'last_login');

    return users;
  }

  // Contar usuarios por rol
  async countByRole(role) {
    const result = await db(this.tableName)
      .where('role', role)
      .where('status', 'active')
      .count('* as count')
      .first();

    return result.count;
  }

  // Verificar si el username existe
  async usernameExists(username, excludeId = null) {
    let query = db(this.tableName)
      .where('username', username)
      .where('status', '!=', 'deleted');

    if (excludeId) {
      query = query.where('id', '!=', excludeId);
    }

    const user = await query.first();
    return !!user;
  }

  // Verificar si el email existe
  async emailExists(email, excludeId = null) {
    let query = db(this.tableName)
      .where('email', email)
      .where('status', '!=', 'deleted');

    if (excludeId) {
      query = query.where('id', '!=', excludeId);
    }

    const user = await query.first();
    return !!user;
  }
}

module.exports = new User(); 