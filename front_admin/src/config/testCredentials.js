// Credenciales de prueba para desarrollo
// Estas credenciales coinciden con las configuradas en el backend via seeds

export const TEST_CREDENTIALS = {
  // Credenciales de administrador
  admin: {
    username: 'admin',
    password: 'admin123',
    role: 'admin',
    description: 'Administrador del sistema con acceso completo'
  },
  
  // Credenciales de operadores
  operator1: {
    username: 'operador1',
    password: 'operador123',
    role: 'operator',
    description: 'Operador de prueba 1'
  },
  
  operator2: {
    username: 'operador2',
    password: 'operador123',
    role: 'operator',
    description: 'Operador de prueba 2'
  }
};

// Función para obtener credenciales por rol
export const getCredentialsByRole = (role) => {
  return Object.values(TEST_CREDENTIALS).filter(cred => cred.role === role);
};

// Función para obtener credenciales por usuario
export const getCredentialsByUsername = (username) => {
  return Object.values(TEST_CREDENTIALS).find(cred => cred.username === username);
};

// Función para obtener todas las credenciales
export const getAllCredentials = () => {
  return Object.values(TEST_CREDENTIALS);
};

// Función para validar credenciales de prueba
export const validateTestCredentials = (username, password) => {
  const credentials = Object.values(TEST_CREDENTIALS).find(
    cred => cred.username === username && cred.password === password
  )
  
  if (credentials) {
    return {
      success: true,
      user: credentials,
      token: `test-token-${Date.now()}`,
      refreshToken: `test-refresh-token-${Date.now()}`,
      permissions: [], // No permissions are stored in TEST_CREDENTIALS directly
      roles: [credentials.role]
    }
  }
  
  return {
    success: false,
    error: 'Credenciales incorrectas'
  }
}

// Función para simular delay de red
export const simulateNetworkDelay = (ms = 1000) => {
  return new Promise(resolve => setTimeout(resolve, ms))
} 