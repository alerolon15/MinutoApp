const express = require('express');
const router = express.Router();
const Cliente = require('../../models/cliente');

/* GET home page. */
router.get('/', async (req, res) => {
  if(req.session && req.session.user){
    req.session.user.iniciales = setIniciales(req.session.user.nombre, req.session.user.apellido);
    const clientes = await Cliente.find({});
    res.render('Clientes/tabla', { usuario: req.session.user, clientes:clientes});
  }else{
    res.redirect("/")
  }
});


module.exports = router;
