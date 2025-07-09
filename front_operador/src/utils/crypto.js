import CryptoJS from 'crypto-js'

// Clave de encriptación (en producción debería estar en variables de entorno)
const ENCRYPTION_KEY = import.meta.env.VITE_ENCRYPTION_KEY || 'app-registro-fotos-2024'

/**
 * Encriptar datos
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
 * Desencriptar datos
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
 * Generar hash SHA-256
 * @param {string} data - Datos a hashear
 * @returns {string} - Hash generado
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
 * Generar hash MD5 (para compatibilidad)
 * @param {string} data - Datos a hashear
 * @returns {string} - Hash MD5 generado
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
 * Generar salt aleatorio
 * @param {number} length - Longitud del salt
 * @returns {string} - Salt generado
 */
export const generateSalt = (length = 16) => {
  try {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
    let result = ''
    
    for (let i = 0; i < length; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length))
    }
    
    return result
  } catch (error) {
    console.error('Error al generar salt:', error)
    return ''
  }
}

/**
 * Generar contraseña segura
 * @param {number} length - Longitud de la contraseña
 * @returns {string} - Contraseña generada
 */
export const generatePassword = (length = 12) => {
  try {
    const uppercase = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'
    const lowercase = 'abcdefghijklmnopqrstuvwxyz'
    const numbers = '0123456789'
    const symbols = '!@#$%^&*()_+-=[]{}|;:,.<>?'
    
    const allChars = uppercase + lowercase + numbers + symbols
    let password = ''
    
    // Asegurar al menos un carácter de cada tipo
    password += uppercase.charAt(Math.floor(Math.random() * uppercase.length))
    password += lowercase.charAt(Math.floor(Math.random() * lowercase.length))
    password += numbers.charAt(Math.floor(Math.random() * numbers.length))
    password += symbols.charAt(Math.floor(Math.random() * symbols.length))
    
    // Completar el resto de la contraseña
    for (let i = 4; i < length; i++) {
      password += allChars.charAt(Math.floor(Math.random() * allChars.length))
    }
    
    // Mezclar la contraseña
    return password.split('').sort(() => Math.random() - 0.5).join('')
  } catch (error) {
    console.error('Error al generar contraseña:', error)
    return ''
  }
}

/**
 * Verificar fortaleza de contraseña
 * @param {string} password - Contraseña a verificar
 * @returns {object} - Resultado de la verificación
 */
export const checkPasswordStrength = (password) => {
  try {
    if (!password) {
      return {
        score: 0,
        strength: 'muy_débil',
        feedback: 'La contraseña está vacía'
      }
    }
    
    let score = 0
    const feedback = []
    
    // Longitud
    if (password.length >= 8) score += 1
    if (password.length >= 12) score += 1
    if (password.length >= 16) score += 1
    
    // Caracteres
    if (/[a-z]/.test(password)) score += 1
    if (/[A-Z]/.test(password)) score += 1
    if (/[0-9]/.test(password)) score += 1
    if (/[^A-Za-z0-9]/.test(password)) score += 1
    
    // Patrones
    if (!/(.)\1{2,}/.test(password)) score += 1 // No caracteres repetidos
    if (!/(123|abc|qwe)/i.test(password)) score += 1 // No secuencias comunes
    
    // Determinar fortaleza
    let strength = 'muy_débil'
    if (score >= 6) strength = 'fuerte'
    else if (score >= 4) strength = 'media'
    else if (score >= 2) strength = 'débil'
    
    // Generar feedback
    if (password.length < 8) feedback.push('Usar al menos 8 caracteres')
    if (!/[a-z]/.test(password)) feedback.push('Incluir letras minúsculas')
    if (!/[A-Z]/.test(password)) feedback.push('Incluir letras mayúsculas')
    if (!/[0-9]/.test(password)) feedback.push('Incluir números')
    if (!/[^A-Za-z0-9]/.test(password)) feedback.push('Incluir símbolos')
    
    return {
      score,
      strength,
      feedback: feedback.length > 0 ? feedback : ['Contraseña aceptable']
    }
  } catch (error) {
    console.error('Error al verificar fortaleza de contraseña:', error)
    return {
      score: 0,
      strength: 'error',
      feedback: ['Error al verificar contraseña']
    }
  }
}

/**
 * Encriptar archivo
 * @param {File} file - Archivo a encriptar
 * @returns {Promise<string>} - Archivo encriptado como base64
 */
export const encryptFile = async (file) => {
  try {
    if (!file) throw new Error('No se proporcionó archivo')
    
    const arrayBuffer = await file.arrayBuffer()
    const wordArray = CryptoJS.lib.WordArray.create(arrayBuffer)
    const encrypted = CryptoJS.AES.encrypt(wordArray, ENCRYPTION_KEY)
    
    return encrypted.toString()
  } catch (error) {
    console.error('Error al encriptar archivo:', error)
    throw error
  }
}

/**
 * Desencriptar archivo
 * @param {string} encryptedData - Datos encriptados del archivo
 * @returns {Promise<ArrayBuffer>} - Archivo desencriptado
 */
export const decryptFile = async (encryptedData) => {
  try {
    if (!encryptedData) throw new Error('No se proporcionaron datos encriptados')
    
    const decrypted = CryptoJS.AES.decrypt(encryptedData, ENCRYPTION_KEY)
    const wordArray = decrypted.toString(CryptoJS.enc.Base64)
    
    return CryptoJS.enc.Base64.parse(wordArray).toString()
  } catch (error) {
    console.error('Error al desencriptar archivo:', error)
    throw error
  }
}

/**
 * Generar token seguro
 * @param {number} length - Longitud del token
 * @returns {string} - Token generado
 */
export const generateSecureToken = (length = 32) => {
  try {
    const array = new Uint8Array(length)
    crypto.getRandomValues(array)
    
    return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('')
  } catch (error) {
    console.error('Error al generar token seguro:', error)
    // Fallback a método menos seguro
    return generateSalt(length)
  }
}

/**
 * Verificar integridad de datos
 * @param {string} data - Datos originales
 * @param {string} hash - Hash de verificación
 * @returns {boolean} - True si los datos son válidos
 */
export const verifyDataIntegrity = (data, hash) => {
  try {
    if (!data || !hash) return false
    
    const calculatedHash = generateHash(data)
    return calculatedHash === hash
  } catch (error) {
    console.error('Error al verificar integridad:', error)
    return false
  }
}

/**
 * Encriptar datos sensibles para almacenamiento local
 * @param {object} data - Datos a encriptar
 * @returns {string} - Datos encriptados para localStorage
 */
export const encryptForStorage = (data) => {
  try {
    if (!data) return ''
    
    const jsonString = JSON.stringify(data)
    return encryptData(jsonString)
  } catch (error) {
    console.error('Error al encriptar para almacenamiento:', error)
    return ''
  }
}

/**
 * Desencriptar datos del almacenamiento local
 * @param {string} encryptedData - Datos encriptados
 * @returns {object|null} - Datos desencriptados
 */
export const decryptFromStorage = (encryptedData) => {
  try {
    if (!encryptedData) return null
    
    const decryptedString = decryptData(encryptedData)
    return JSON.parse(decryptedString)
  } catch (error) {
    console.error('Error al desencriptar del almacenamiento:', error)
    return null
  }
}

/**
 * Limpiar datos sensibles de la memoria
 * @param {string} data - Datos a limpiar
 */
export const secureWipe = (data) => {
  try {
    if (typeof data === 'string') {
      // Sobrescribir con ceros
      data = '0'.repeat(data.length)
    } else if (typeof data === 'object') {
      // Limpiar propiedades del objeto
      Object.keys(data).forEach(key => {
        if (typeof data[key] === 'string') {
          data[key] = '0'.repeat(data[key].length)
        }
      })
    }
  } catch (error) {
    console.error('Error al limpiar datos:', error)
  }
}

export default {
  encryptData,
  decryptData,
  generateHash,
  generateMD5,
  generateSalt,
  generatePassword,
  checkPasswordStrength,
  encryptFile,
  decryptFile,
  generateSecureToken,
  verifyDataIntegrity,
  encryptForStorage,
  decryptFromStorage,
  secureWipe
} 