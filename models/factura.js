const mongoose = require('mongoose');
const Schema = mongoose.Schema;

var facturaSchema = new Schema({
  fecha: {type: Date},
  tipo: {type: String},
  nroSucursal: {type: String},
  nroFactura: {type: String, required: true, unique: true},
  base: {type: String},
  alicuota: {type: String},
  percepcion: {type: String},
  cliente: { type: String, ref: 'Cliente' }
});

module.exports = mongoose.model('Factura', facturaSchema);
