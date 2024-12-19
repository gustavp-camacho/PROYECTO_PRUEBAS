const mongoose = require('mongoose');

const eventSeatingSchema = new mongoose.Schema({
  eventId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Event',
    required: true
  },
  zone: {
    type: String,
    required: true,
    enum: ['VIP', 'P_B_Cen', 'P_B_Lat_Oro', 'P_B_Lat_Plata', 'P_B_Lat_Bronce', 'P_A_Cen', 'P_A_Lat', 'Berma_G_Der', 'Berma_G_Izq']
  },
  seatNumber: {
    type: String,
    required: true
  },
  row: {
    type: String,
    required: true
  },
  price: {
    type: Number,
    required: true
  },
  status: {
    type: String,
    enum: ['available', 'reserved', 'sold'],
    default: 'available'
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Índice compuesto para búsquedas eficientes
eventSeatingSchema.index({ eventId: 1, zone: 1, row: 1, seatNumber: 1 }, { unique: true });

module.exports = mongoose.model('EventSeating', eventSeatingSchema);
