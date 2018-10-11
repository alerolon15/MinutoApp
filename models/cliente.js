var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var clienteSchema = new Schema({
  _id: {type: String, required: true, unique: true},
  razonsocial: {type: String},
  posicionIVA: {type: String},
  posicionIIBB: {type: String},
  numeroIIBB: {type: String}
});

module.exports = mongoose.model('Cliente', clienteSchema);
