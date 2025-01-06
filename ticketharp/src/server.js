//server.js
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const User = require('./models/User');
const Event = require('./models/Event');
const jwt = require('jsonwebtoken');
const { ObjectId } = mongoose.Types; // Importamos ObjectId correctamente


// Inicializar la aplicación de Express
//const app = express();
//const PORT = process.env.PORT || 5000;

const express = require('express');
const { getFileFromS3 } = require('./s3Service');
const app = express();
const bucketName = 'nombre-de-tu-bucket';

app.get('/api/getFile', async (req, res) => {
    const fileKey = 'ruta/del/archivo.txt'; // Cambia a la ruta de tu archivo en S3
    try {
        const fileContent = await getFileFromS3(bucketName, fileKey);
        res.json({ content: fileContent });
    } catch (error) {
        res.status(500).send('Error al obtener el archivo');
    }
});

// Middleware para analizar JSON y habilitar CORS
app.use(express.json());
app.use(cors());

// Middleware para verificar token - MOVIDO AL INICIO
const verifyToken = (req, res, next) => {
  const bearerHeader = req.headers['authorization'];
  
  if (!bearerHeader) {
    return res.status(403).json({ 
      success: false,
      message: 'No token provided' 
    });
  }

  try {
    const token = bearerHeader.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'tu_secreto_jwt');
    req.userId = decoded.userId;
    next();
  } catch (error) {
    return res.status(401).json({ 
      success: false,
      message: 'Token inválido o expirado' 
    });
  }
};

// Función de generación de asientos (mover al inicio, antes de las rutas)
function generateSeats(eventId, zoneConfig, zoneName, price) {
  const seats = [];
  
  // Asegurar que zoneId siempre esté en minúsculas
  const zoneId = zoneName.toLowerCase().replace(/\s+/g, '_');
  
  for (let row = 1; row <= zoneConfig.rows; row++) {
    for (let seatNum = 1; seatNum <= zoneConfig.seatsPerRow; seatNum++) {
      seats.push({
        eventId,
        zoneId,
        zone: zoneName,
        row,
        seatNumber: seatNum,
        price,
        status: 'available',
        reservationTime: null,
        purchaseTime: null,
        purchasedBy: null
      });
    }
  }
  
  return seats;
}

// Conectar a la base de datos
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    console.log('Conectado a MongoDB');
  } catch (err) {
    console.error('Error al conectar a MongoDB:', err.message);
    process.exit(1);
  }
};

// Manejo de errores global
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    message: 'Error interno del servidor',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});


// Configura CORS específicamente
const corsOptions = {
  origin: 'http://localhost:3000', // Ajusta esto según tu frontend
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Accept'],
};

app.use(cors(corsOptions));

// Rutas
app.post('/api/signup', async (req, res) => {
  const { username, email, password, role = "user" } = req.body;
  try {
    if (!username || !email || !password) {
      return res.status(400).json({ 
        success: false,
        message: 'Todos los campos son requeridos' 
      });
    }

    const existingUser = await User.findOne({ $or: [{ email }, { username }] });
    if (existingUser) {
      return res.status(400).json({ 
        success: false,
        message: 'El usuario o email ya existe' 
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new User({ 
      username, 
      email, 
      password: hashedPassword,
      role 
    });
    
    await newUser.save();
    res.status(201).json({ 
      success: true,
      message: 'Usuario registrado correctamente' 
    });
  } catch (error) {
    console.error('Error en el registro:', error);
    res.status(500).json({ 
      success: false,
      message: 'Error en el registro de usuario' 
    });
  }
});

app.post('/api/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ 
        success: false,
        message: 'Email y contraseña son requeridos' 
      });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ 
        success: false,
        message: 'Credenciales inválidas' 
      });
    }

    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
      return res.status(401).json({ 
        success: false,
        message: 'Credenciales inválidas' 
      });
    }

    const token = jwt.sign(
      { 
        userId: user._id,
        role: user.role 
      },
      process.env.JWT_SECRET || 'tu_secreto_jwt',
      { expiresIn: '1h' }
    );

    res.json({
      success: true,
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    console.error('Error en login:', error);
    res.status(500).json({ 
      success: false,
      message: 'Error en el servidor' 
    });
  }
});

app.get('/api/user-profile', verifyToken, async (req, res) => {
  try {
    const user = await User.findById(req.userId).select('-password');
    if (!user) {
      return res.status(404).json({ 
        success: false,
        message: 'Usuario no encontrado' 
      });
    }
    res.json({
      success: true,
      user
    });
  } catch (error) {
    console.error('Error al obtener perfil:', error);
    res.status(500).json({ 
      success: false,
      message: 'Error en el servidor' 
    });
  }
});

// Ruta para crear eventos
app.post('/api/events', verifyToken, async (req, res) => {
  let newEvent = null;

  try {
    const requiredFields = [
      'eventName', 'localTeam', 'visitorTeam', 'eventDate',
      'VIP', 'P_B_Cen', 'P_B_Lat_Oro', 'P_B_Lat_Plata',
      'P_B_Lat_Bronce', 'P_A_Cen', 'P_A_Lat',
      'Berma_G_Der', 'Berma_G_Izq', 'username', 'adminPassword'
    ];

    for (const field of requiredFields) {
      if (!req.body[field]) {
        return res.status(400).json({
          success: false,
          message: `El campo ${field} es requerido`
        });
      }
    }

    if (!req.body.seatingConfig) {
      return res.status(400).json({
        success: false,
        message: 'La configuración de asientos (seatingConfig) es requerida'
      });
    }

    const user = await User.findOne({ username: req.body.username });
    if (!user || user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Acceso denegado'
      });
    }

    const validPassword = await bcrypt.compare(req.body.adminPassword, user.password);
    if (!validPassword) {
      return res.status(401).json({
        success: false,
        message: 'Contraseña incorrecta'
      });
    }

    const eventData = {
      eventName: req.body.eventName,
      localTeam: req.body.localTeam,
      visitorTeam: req.body.visitorTeam,
      eventDate: req.body.eventDate,
      VIP: req.body.VIP,
      P_B_Cen: req.body.P_B_Cen,
      P_B_Lat_Oro: req.body.P_B_Lat_Oro,
      P_B_Lat_Plata: req.body.P_B_Lat_Plata,
      P_B_Lat_Bronce: req.body.P_B_Lat_Bronce,
      P_A_Cen: req.body.P_A_Cen,
      P_A_Lat: req.body.P_A_Lat,
      Berma_G_Der: req.body.Berma_G_Der,
      Berma_G_Izq: req.body.Berma_G_Izq,
      createdBy: user._id
    };

    // Verificar si ya existe un evento con el mismo nombre y fecha
    const existingEvent = await Event.findOne({
      eventName: eventData.eventName,
      eventDate: eventData.eventDate
    });

    if (existingEvent) {
      return res.status(400).json({
        success: false,
        message: 'Ya existe un evento con el mismo nombre y fecha'
      });
    }

    newEvent = new Event(eventData);
    await newEvent.save();

    const zonesConfig = req.body.seatingConfig;
    let allSeats = [];

    // Validar zonas antes de crear asientos
    for (const zoneName of Object.keys(zonesConfig)) {
      if (!eventData[zoneName] && zoneName.toUpperCase() !== 'VIP') {
        return res.status(400).json({
          success: false,
          message: `Zona inválida en seatingConfig: ${zoneName}`
        });
      }
    }

    // Verificar si ya existen asientos para este evento
    const existingSeats = await mongoose.connection.collection('eventseatings')
      .findOne({ eventId: newEvent._id });

    if (existingSeats) {
      await Event.findByIdAndDelete(newEvent._id);
      return res.status(400).json({
        success: false,
        message: 'Ya existen asientos para este evento'
      });
    }

    for (const [zoneName, config] of Object.entries(zonesConfig)) {
      if (!config.rows || !config.seatsPerRow) {
        return res.status(400).json({
          success: false,
          message: `Configuración inválida para la zona ${zoneName}. Se requiere rows y seatsPerRow`
        });
      }

      const seats = generateSeats(
        newEvent._id,
        config,
        zoneName,
        Number(eventData[zoneName.toUpperCase()])
      );
      allSeats = [...allSeats, ...seats];
    }

    if (allSeats.length > 0) {
      // Crear el índice único si no existe
      await mongoose.connection.collection('eventseatings').createIndex(
        { eventId: 1, zoneId: 1, row: 1, seatNumber: 1 },
        { unique: true }
      );

      await mongoose.connection.collection('eventseatings').insertMany(allSeats, { ordered: false });
    }
    
    res.status(201).json({
      success: true,
      message: 'Evento y asientos creados exitosamente',
      event: newEvent
    });

  } catch (error) {
    console.error('Error al crear evento y asientos:', error);
    
    if (newEvent && newEvent._id) {
      try {
        await Event.findByIdAndDelete(newEvent._id);
        await mongoose.connection.collection('eventseatings').deleteMany({ eventId: newEvent._id });
      } catch (cleanupError) {
        console.error('Error durante la limpieza:', cleanupError);
      }
    }
    
    res.status(500).json({
      success: false,
      message: 'Error al crear el evento y los asientos',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Error interno del servidor'
    });
  }
});

//ELIMNAR EVENTOS
// Ruta para eliminar eventos
app.delete('/api/events/:eventId', async (req, res) => {
  try {
    const { username, adminPassword } = req.body;
    const { eventId } = req.params;

    // Validación de datos de entrada
    if (!username || !adminPassword) {
      return res.status(400).json({
        success: false,
        message: 'Se requieren credenciales de administrador'
      });
    }

    if (!mongoose.Types.ObjectId.isValid(eventId)) {
      return res.status(400).json({
        success: false,
        message: 'ID de evento inválido'
      });
    }

    // Verificar credenciales del administrador
    const user = await User.findOne({ username });
    if (!user || user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Acceso denegado - Se requieren privilegios de administrador'
      });
    }

    const validPassword = await bcrypt.compare(adminPassword, user.password);
    if (!validPassword) {
      return res.status(401).json({
        success: false,
        message: 'Credenciales incorrectas'
      });
    }

    // Verificar si el evento existe
    const event = await Event.findById(eventId);
    if (!event) {
      return res.status(404).json({
        success: false,
        message: 'Evento no encontrado'
      });
    }

    try {
      // Eliminar los asientos asociados al evento
      await mongoose.connection.collection('eventseatings').deleteMany({ 
        eventId: new mongoose.Types.ObjectId(eventId) 
      });

      // Eliminar el evento
      await Event.findByIdAndDelete(eventId);

      return res.json({
        success: true,
        message: 'Evento y asientos asociados eliminados exitosamente'
      });
    } catch (deleteError) {
      console.error('Error durante la eliminación:', deleteError);
      return res.status(500).json({
        success: false,
        message: 'Error al eliminar el evento o sus asientos asociados'
      });
    }

  } catch (error) {
    console.error('Error al eliminar evento:', error);
    return res.status(500).json({
      success: false,
      message: 'Error al eliminar el evento',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Error interno del servidor'
    });
  }
});

// Ruta del calendario
app.get('/api/events/calendar', async (req, res) => {
  try {
    const { year, month } = req.query;
    
    if (!year || !month) {
      return res.status(400).json({
        success: false,
        message: 'Año y mes son requeridos'
      });
    }
    
    const numYear = parseInt(year);
    const numMonth = parseInt(month);
    
    if (isNaN(numYear) || isNaN(numMonth) || 
        numMonth < 1 || numMonth > 12 || 
        numYear < 2000 || numYear > 2100) {
      return res.status(400).json({
        success: false,
        message: 'Año o mes inválidos'
      });
    }
    
    const startDate = new Date(Date.UTC(numYear, numMonth - 1, 1, 0, 0, 0));
    const endDate = new Date(Date.UTC(numYear, numMonth, 0, 23, 59, 59));
    
    const events = await Event.find({
      eventDate: {
        $gte: startDate,
        $lte: endDate
      }
    })
    .select('eventDate eventName localTeam visitorTeam _id')
    .sort({ eventDate: 1 })
    .lean();
    
    // Asegúrate de que la respuesta tenga el formato correcto
    res.json({
      success: true,
      events: events.map(event => ({
        id: event._id,
        date: event.eventDate,
        name: event.eventName,
        localTeam: event.localTeam,
        visitorTeam: event.visitorTeam
      }))
    });
    
  } catch (error) {
    console.error('Error al obtener eventos:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener eventos'
    });
  }
});

//BUSCADOR
app.get('/api/events/search', async (req, res) => {
  try {
    const { query } = req.query;

    // Validar que la consulta no esté vacía
    if (!query || query.trim() === '') {
      return res.status(400).json({
        success: false,
        message: 'La búsqueda no puede estar vacía'
      });
    }

    // Crear una expresión regular para búsqueda insensible a mayúsculas y minúsculas
    const searchRegex = new RegExp(query.trim(), 'i');
    
    // Buscar eventos que coincidan con el nombre del evento, equipo local o equipo visitante
    const events = await Event.find({
      $or: [
        { eventName: searchRegex },
        { localTeam: searchRegex },
        { visitorTeam: searchRegex }
      ]
    })
    .select('_id eventName localTeam visitorTeam eventDate')
    .sort({ eventDate: 1 })
    .lean();

    // Manejar caso sin resultados
    if (events.length === 0) {
      return res.json({
        success: true,
        events: [],
        message: 'No se encontraron eventos'
      });
    }

    // Devolver resultados formateados
    res.json({
      success: true,
      events: events.map(event => ({
        id: event._id.toString(),
        eventName: event.eventName,
        localTeam: event.localTeam,
        visitorTeam: event.visitorTeam,
        eventDate: event.eventDate
      }))
    });

  } catch (error) {
    console.error('Error al procesar la solicitud de eventos:', error);
    res.status(500).json({
      success: false,
      message: 'Hubo un error al procesar la solicitud. Por favor, inténtalo de nuevo más tarde.'
    });
  }
});

//seleccion de boletos
app.get('/api/events/:eventId', async (req, res) => {
  try {
    const { eventId } = req.params;
    
    if (!mongoose.Types.ObjectId.isValid(eventId)) {
      return res.status(400).json({
        success: false,
        message: 'ID de evento inválido'
      });
    }

    const event = await Event.findById(eventId);
    
    if (!event) {
      return res.status(404).json({
        success: false,
        message: 'Evento no encontrado'
      });
    }

    // Crear un nuevo ObjectId para la consulta
    const eventObjectId = new ObjectId(eventId);

    // Obtener los asientos disponibles para este evento
    const seats = await mongoose.connection.collection('eventseatings')
      .find({ eventId: eventObjectId })
      .toArray();

    // Agrupar asientos por zona
    const seatingByZone = {};
    for (const seat of seats) {
      if (!seatingByZone[seat.zone]) {
        seatingByZone[seat.zone] = [];
      }
      seatingByZone[seat.zone].push({
        row: seat.row,
        seatNumber: seat.seatNumber,
        status: seat.status
      });
    }

    // Estructurar la respuesta
    const response = {
      success: true,
      event: {
        id: event._id,
        name: event.eventName,
        date: event.eventDate,
        localTeam: event.localTeam,
        visitorTeam: event.visitorTeam,
        prices: {
          VIP: event.VIP,
          P_B_Cen: event.P_B_Cen,
          P_B_Lat_Oro: event.P_B_Lat_Oro,
          P_B_Lat_Plata: event.P_B_Lat_Plata,
          P_B_Lat_Bronce: event.P_B_Lat_Bronce,
          P_A_Cen: event.P_A_Cen,
          P_A_Lat: event.P_A_Lat,
          Berma_G_Der: event.Berma_G_Der,
          Berma_G_Izq: event.Berma_G_Izq
        }
      },
      seating: seatingByZone
    };

    res.json(response);

  } catch (error) {
    console.error('Error al obtener información del evento:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener información del evento',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

//pago de bolotes

// Corrección del endpoint en server.js
app.post('/api/payment/process', verifyToken, async (req, res) => {
  try {
    const { eventId, seats, paymentMethod, paymentData } = req.body;
    const userId = req.userId;

    // Verificar que el evento exista
    const eventsCollection = mongoose.connection.collection('events');
    const event = await eventsCollection.findOne({ 
      _id: new ObjectId(eventId)
    });
    
    if (!event) {
      return res.status(404).json({
        success: false,
        message: 'Evento no encontrado'
      });
    }

    // Verificar disponibilidad de asientos
    const eventSeatsCollection = mongoose.connection.collection('eventseatings');
    
    const seatsToCheck = seats.map(seat => ({
      eventId: new ObjectId(eventId),
      zone: seat.zone,
      row: seat.row,
      seatNumber: seat.seatNumber,
      status: 'available'
    }));

    // Verificar todos los asientos de una vez
    const availableSeats = await eventSeatsCollection.find({
      $or: seatsToCheck
    }).toArray();

    if (availableSeats.length !== seats.length) {
      return res.status(400).json({
        success: false,
        message: 'Algunos asientos seleccionados ya no están disponibles'
      });
    }

    // Actualizar los asientos uno por uno para mayor seguridad
    const updatePromises = seats.map(async (seat) => {
      const result = await eventSeatsCollection.updateOne(
        {
          eventId: new ObjectId(eventId),
          zone: seat.zone,
          row: seat.row,
          seatNumber: seat.seatNumber,
          status: 'available' // Aseguramos que sigue disponible
        },
        {
          $set: {
            status: 'purchased',
            purchaseTime: new Date(),
            purchasedBy: new ObjectId(userId)
          }
        }
      );
      return result.modifiedCount === 1;
    });

    const updateResults = await Promise.all(updatePromises);
    
    // Verificar si todos los asientos se actualizaron correctamente
    if (updateResults.some(result => !result)) {
      // Si algún asiento no se pudo actualizar, intentamos revertir los que sí
      const revertPromises = seats.map(seat => 
        eventSeatsCollection.updateOne(
          {
            eventId: new ObjectId(eventId),
            zone: seat.zone,
            row: seat.row,
            seatNumber: seat.seatNumber,
            purchasedBy: new ObjectId(userId)
          },
          {
            $set: {
              status: 'available',
              purchaseTime: null,
              purchasedBy: null
            }
          }
        )
      );
      
      await Promise.all(revertPromises);
      
      return res.status(400).json({
        success: false,
        message: 'Error al actualizar los asientos. La operación ha sido revertida.'
      });
    }

    // Crear registro de compra
    const seatReservationsCollection = mongoose.connection.collection('seatreservations');
    
    const reservationData = {
      userId: new ObjectId(userId),
      eventId: new ObjectId(eventId),
      seats: seats.map(seat => ({
        zone: seat.zone,
        row: seat.row,
        seatNumber: seat.seatNumber,
        price: seat.price
      })),
      paymentMethod,
      paymentDetails: {
        cardHolder: paymentData?.cardHolder,
        lastFourDigits: paymentData?.cardNumber ? 
          paymentData.cardNumber.slice(-4) : undefined,
        paypalEmail: paymentData?.paypalEmail
      },
      totalAmount: seats.reduce((sum, seat) => sum + seat.price, 0),
      serviceCharge: seats.reduce((sum, seat) => sum + seat.price, 0) * 0.05,
      purchaseDate: new Date(),
      status: 'completed',
      eventDetails: {
        eventName: event.eventName,
        eventDate: event.eventDate,
        localTeam: event.localTeam,
        visitorTeam: event.visitorTeam
      }
    };

    const reservation = await seatReservationsCollection.insertOne(reservationData);

    res.json({
      success: true,
      message: 'Pago procesado exitosamente',
      reservationId: reservation.insertedId
    });

  } catch (error) {
    console.error('Error al procesar el pago:', error);
    res.status(500).json({
      success: false,
      message: 'Error al procesar el pago',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});





// Iniciar el servidor
const start = async () => {
  try {
    await connectDB();
    app.listen(PORT, () => {
      console.log(`Servidor escuchando en el puerto ${PORT}`);
    });
  } catch (err) {
    console.error('Error al iniciar el servidor:', err.message);
    process.exit(1);
  }
};

start();
