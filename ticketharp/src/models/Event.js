const mongoose = require('mongoose');

const eventSchema = new mongoose.Schema({
  eventName: { type: String, required: true },
  localTeam: { type: String, required: true },
  visitorTeam: { type: String, required: true },
  eventDate: { type: Date, required: true },
  VIP: { type: Number, required: true },
  P_B_Cen: { type: Number, required: true },
  P_B_Lat_Oro: { type: Number, required: true },
  P_B_Lat_Plata: { type: Number, required: true },
  P_B_Lat_Bronce: { type: Number, required: true },
  P_A_Cen: { type: Number, required: true },
  P_A_Lat: { type: Number, required: true },
  Berma_G_Der: { type: Number, required: true },
  Berma_G_Izq: { type: Number, required: true },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'admin', required: true }
}, {
  timestamps: true
});

module.exports = mongoose.model('Event', eventSchema);