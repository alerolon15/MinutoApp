const express = require('express');
const router = express.Router();
const Factura = require('../models/factura');
const Cliente = require('../models/cliente');

/* GET home page. */
router.get('/', async (req, res) => {
  if(req.session && req.session.user){
    req.session.user.iniciales = setIniciales(req.session.user.nombre, req.session.user.apellido);
    const clientes = await Cliente.find({});
    const facturas = await Factura.find({});
    res.render('index/index', { usuario: req.session.user, facturas:facturas.length, clientes:clientes.length});
  }else{
    res.redirect("/")
  }
});


module.exports = router;
