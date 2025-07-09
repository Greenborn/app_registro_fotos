import CryptoJS from 'crypto-js'

// Clave de encriptación (en producción debería estar en variables de entorno)
const ENCRYPTION_KEY = import.meta.env.VITE_ENCRYPTION_KEY || 'default-key-change-in-production'

/**
 * Encripta datos usando AES
 * @param {string} data - Datos a encriptar
 * @returns {string} - Datos encriptados
 */
export const encryptData = (data) => {
  try {
    if (!data) return ''
    
    const encrypted = CryptoJS.AES.encrypt(data, ENCRYPTION_KEY).toString()
    return encrypted
  } catch (error) {
    console.error('Error al encriptar datos:', error)
    return ''
  }
}

/**
 * Desencripta datos usando AES
 * @param {string} encryptedData - Datos encriptados
 * @returns {string} - Datos desencriptados
 */
export const decryptData = (encryptedData) => {
  try {
    if (!encryptedData) return ''
    
    const decrypted = CryptoJS.AES.decrypt(encryptedData, ENCRYPTION_KEY)
    return decrypted.toString(CryptoJS.enc.Utf8)
  } catch (error) {
    console.error('Error al desencriptar datos:', error)
    return ''
  }
}

/**
 * Genera un hash SHA-256 de los datos
 * @param {string} data - Datos a hashear
 * @returns {string} - Hash SHA-256
 */
export const generateHash = (data) => {
  try {
    if (!data) return ''
    
    return CryptoJS.SHA256(data).toString()
  } catch (error) {
    console.error('Error al generar hash:', error)
    return ''
  }
}

/**
 * Genera un hash MD5 de los datos
 * @param {string} data - Datos a hashear
 * @returns {string} - Hash MD5
 */
export const generateMD5 = (data) => {
  try {
    if (!data) return ''
    
    return CryptoJS.MD5(data).toString()
  } catch (error) {
    console.error('Error al generar MD5:', error)
    return ''
  }
}

/**
 * Genera una cadena aleatoria segura
 * @param {number} length - Longitud de la cadena
 * @returns {string} - Cadena aleatoria
 */
export const generateRandomString = (length = 32) => {
  try {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
    let result = ''
    
    for (let i = 0; i < length; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length))
    }
    
    return result
  } catch (error) {
    console.error('Error al generar cadena aleatoria:', error)
    return ''
  }
}

/**
 * Genera un token seguro para autenticación
 * @returns {string} - Token seguro
 */
export const generateSecureToken = () => {
  try {
    const timestamp = Date.now().toString()
    const random = generateRandomString(16)
    const data = `${timestamp}.${random}`
    
    return generateHash(data)
  } catch (error) {
    console.error('Error al generar token seguro:', error)
    return ''
  }
}

/**
 * Valida si una cadena está encriptada
 * @param {string} data - Datos a validar
 * @returns {boolean} - True si está encriptada
 */
export const isEncrypted = (data) => {
  try {
    if (!data || typeof data !== 'string') return false
    
    // Verificar si tiene el formato de encriptación AES
    const decrypted = decryptData(data)
    return decrypted !== ''
  } catch (error) {
    return false
  }
}

/**
 * Encripta datos sensibles en un objeto
 * @param {Object} obj - Objeto con datos sensibles
 * @param {Array} sensitiveFields - Campos sensibles a encriptar
 * @returns {Object} - Objeto con datos encriptados
 */
export const encryptSensitiveData = (obj, sensitiveFields = ['password', 'token', 'secret']) => {
  try {
    if (!obj || typeof obj !== 'object') return obj
    
    const encrypted = { ...obj }
    
    sensitiveFields.forEach(field => {
      if (encrypted[field] && typeof encrypted[field] === 'string') {
        encrypted[field] = encryptData(encrypted[field])
      }
    })
    
    return encrypted
  } catch (error) {
    console.error('Error al encriptar datos sensibles:', error)
    return obj
  }
}

/**
 * Desencripta datos sensibles en un objeto
 * @param {Object} obj - Objeto con datos encriptados
 * @param {Array} sensitiveFields - Campos sensibles a desencriptar
 * @returns {Object} - Objeto con datos desencriptados
 */
export const decryptSensitiveData = (obj, sensitiveFields = ['password', 'token', 'secret']) => {
  try {
    if (!obj || typeof obj !== 'object') return obj
    
    const decrypted = { ...obj }
    
    sensitiveFields.forEach(field => {
      if (decrypted[field] && typeof decrypted[field] === 'string' && isEncrypted(decrypted[field])) {
        decrypted[field] = decryptData(decrypted[field])
      }
    })
    
    return decrypted
  } catch (error) {
    console.error('Error al desencriptar datos sensibles:', error)
    return obj
  }
}

/**
 * Genera un salt para encriptación de contraseñas
 * @returns {string} - Salt generado
 */
export const generateSalt = () => {
  try {
    return CryptoJS.lib.WordArray.random(128/8).toString()
  } catch (error) {
    console.error('Error al generar salt:', error)
    return generateRandomString(16)
  }
}

/**
 * Encripta una contraseña con salt
 * @param {string} password - Contraseña a encriptar
 * @param {string} salt - Salt para la encriptación
 * @returns {string} - Contraseña encriptada
 */
export const encryptPassword = (password, salt = null) => {
  try {
    if (!password) return ''
    
    const usedSalt = salt || generateSalt()
    const saltedPassword = password + usedSalt
    const hashedPassword = CryptoJS.SHA256(saltedPassword).toString()
    
    return {
      hash: hashedPassword,
      salt: usedSalt
    }
  } catch (error) {
    console.error('Error al encriptar contraseña:', error)
    return { hash: '', salt: '' }
  }
}

/**
 * Verifica una contraseña contra su hash
 * @param {string} password - Contraseña a verificar
 * @param {string} hash - Hash almacenado
 * @param {string} salt - Salt usado
 * @returns {boolean} - True si la contraseña es correcta
 */
export const verifyPassword = (password, hash, salt) => {
  try {
    if (!password || !hash || !salt) return false
    
    const saltedPassword = password + salt
    const computedHash = CryptoJS.SHA256(saltedPassword).toString()
    
    return computedHash === hash
  } catch (error) {
    console.error('Error al verificar contraseña:', error)
    return false
  }
}

export default {
  encryptData,
  decryptData,
  generateHash,
  generateMD5,
  generateRandomString,
  generateSecureToken,
  isEncrypted,
  encryptSensitiveData,
  decryptSensitiveData,
  generateSalt,
  encryptPassword,
  verifyPassword
} 