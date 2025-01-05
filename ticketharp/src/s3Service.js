const AWS = require('aws-sdk');

// Configurar AWS usando variables de entorno
AWS.config.update({
  region: process.env.AWS_REGION || 'us-east-2',
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
});

// Crear una instancia de S3
const s3 = new AWS.S3();

/**
 * Obtiene un archivo de S3
 * @param {string} bucketName - Nombre del bucket
 * @param {string} key - Ruta del archivo en S3
 * @returns {Promise<string>} Contenido del archivo
 */
const getFileFromS3 = async (bucketName, key) => {
  if (!bucketName || !key) {
    throw new Error('Bucket name and key are required');
  }

  const params = {
    Bucket: bucketName,
    Key: key,
  };

  try {
    const data = await s3.getObject(params).promise();
    return data.Body.toString('utf-8');
  } catch (error) {
    console.error('Error al obtener archivo de S3:', error);
    // Agregamos más contexto al error
    throw new Error(`Error al obtener archivo ${key} de bucket ${bucketName}: ${error.message}`);
  }
};

// Función adicional para verificar si un archivo existe
const checkFileExists = async (bucketName, key) => {
  try {
    await s3.headObject({
      Bucket: bucketName,
      Key: key
    }).promise();
    return true;
  } catch (error) {
    if (error.code === 'NotFound') {
      return false;
    }
    throw error;
  }
};

module.exports = { 
  getFileFromS3,
  checkFileExists
};