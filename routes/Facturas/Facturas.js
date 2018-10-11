const express = require('express');
const router = express.Router();
const Facturas = require('../../models/factura');

/* GET home page. */
router.get('/', async (req, res) => {
  if(req.session && req.session.user){
    req.session.user.iniciales = setIniciales(req.session.user.nombre, req.session.user.apellido);
    const facturas = await Facturas.find({});
    res.render('Facturas/tabla', { usuario: req.session.user, facturas:facturas,helpers: {
            date: function (fechaDB)
                  {
                    let meses = ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"];
                    let fechahbs = new Date(fechaDB);
                    let d = fechahbs.getDate();
                    let m = meses[fechahbs.getMonth()];
                    let y = fechahbs.getFullYear();
                    return d + '-' + m + '-' + y;
                  }
        }});
  }else{
    res.redirect("/")
  }
});


/* GET home page. */
router.post('/Busqueda', async (req, res) => {
  if(req.session && req.session.user){
    req.session.user.iniciales = setIniciales(req.session.user.nombre, req.session.user.apellido);
    let anio = req.body.anio;
    let mes = req.body.mes;
    let desde = mes - 1;
    let hasta = desde + 1;

    const facturas = await Facturas.find({"fecha": {"$gte": new Date(anio, desde), "$lt": new Date(anio, hasta)}});

    res.render('Facturas/tabla', { usuario: req.session.user, facturas:facturas, helpers: {
            date: function (fechaDB)
                  {
                    let meses = ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"];
                    let fechahbs = new Date(fechaDB);
                    let d = fechahbs.getDate();
                    let m = meses[fechahbs.getMonth()];
                    let y = fechahbs.getFullYear();
                    return d + '-' + m + '-' + y;
                  }
        }});
  }else{
    res.redirect("/")
  }
});

/* GET home page. */
router.get('/Busqueda', async (req, res) => {
  if(req.session && req.session.user){
    req.session.user.iniciales = setIniciales(req.session.user.nombre, req.session.user.apellido);
    res.render('Facturas/busqueda', { usuario: req.session.user });
  }else{
    res.redirect("/")
  }
});

module.exports = router;
