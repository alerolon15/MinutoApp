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

//Route para el metodo VerClientes
router.get('/VerCliente', async (req, res) => {
  if(req.session && req.session.user){
    req.session.user.iniciales = setIniciales(req.session.user.nombre, req.session.user.apellido);

    //tomo el cuit del cliente, enviado desde el Ajax por metodo GET
    //en el caso del metodo GET, lo tengo que tomar como req.query.nombre
    let clienteAjax = req.query.cliente;

    try {
      //llamo a mongoDB, y pido encontrar el cliente con ese CUIT;
      const cliente = await Cliente.findOne({_id:clienteAjax});

      //enviamos el cliente de vuelta a la funcion Ajax
      res.send(cliente);
    } catch (excepcion) {
      //si falla algo en la logica anterior, envio al Ajax una respuesta con el error
      res.send({error:excepcion});
    }

  }else{
    res.send({error:'se cerro la sesion'});
  }
});

module.exports = router;
