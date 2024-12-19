const mongoose = require('mongoose');

// Función para conectar a MongoDB
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    console.log("Conectado a MongoDB exitosamente");
  } catch (error) {
    console.error("Error al conectar a MongoDB:", error);
    process.exit(1); // Salir si no se puede conectar
  }
};

module.exports = connectDB;
