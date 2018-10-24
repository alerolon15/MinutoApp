const express = require('express');
const router = express.Router();
const Facturas = require('../../models/factura');
const Cliente = require('../../models/cliente');


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

    res.render('Facturas/tabla', { usuario: req.session.user, facturas:facturas, anio:anio, mes:mes, helpers: {
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
router.get('/ExportarTXT', async (req, res) => {
  if(req.session && req.session.user){
    req.session.user.iniciales = setIniciales(req.session.user.nombre, req.session.user.apellido);
    let anio = req.query.anio;
    let mes = req.query.mes;
    let desde = mes - 1;
    let hasta = desde + 1;

    function formatearFecha(fechaDB) {
      let meses = ["01", "02", "03", "04", "05", "06", "07", "08", "09", "10", "11", "12"];
      let fechahbs = new Date(fechaDB);
      let d = fechahbs.getDate();
      let m = meses[fechahbs.getMonth()];
      let y = fechahbs.getFullYear();
      return d + '/' + m + '/' + y;
    };

    const facturas = await Facturas.find({"fecha": {"$gte": new Date(anio, desde), "$lt": new Date(anio, hasta)}}).populate('cliente');

    let facturastxt = [];

    for (const Factura of facturas) {
      //Completar cada campo del objero de factura con los datos correspondientes a la documentacion de AGIP
      let facturaObj = {
        tipoOperacion: "2",
        codigoNorma: "",
        fechaRetPerc: formatearFecha(Factura.fecha),
        tipoComprobante: "",
        letraComprobante: Factura.tipo,
        nroComprobante: Factura.nroFactura.substr(11),
        fechaComprobante: formatearFecha(Factura.fecha),
        montoComprobante: Factura.base,
        nroCertificadoPropio: "                ",
        tipoDocRetenido: "3",
        nroDocRetenido:  Factura.cliente._id,
        sitIIBBRetenido: Factura.cliente.posicionIIBB,
        nroInscripcionIIBBRetenido: Factura.cliente.numeroIIBB,
        sitIvaRetenido: Factura.cliente.posicionIVA,
        razonSocialRetenido: Factura.cliente.razonsocial,
        importeOtrosConceptos: "",
        importeIva: "",
        montoSujetoRetPerc: "",
        aliCuota: Factura.alicuota,
        retPrecPracticada: "",
        montoTotalRetPerc: ""
      };



      facturastxt.push(facturaObj);
    };

    console.log('ejemplo de registro : ');
    console.log(facturastxt[0]);

    res.send(facturastxt);
  }else{
    res.send({error:"falta loguearse nuevamente!"});
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

router.delete('/BorrarFactura', async (req,res) => {
  let idFactura = req.body.factura;
  console.log(idFactura);
  Facturas.findOneAndDelete({_id: idFactura},function(err){
    if(!err){
      console.log('Factura eliminada con exito');
    }
  })
  res.send('Algo fallo');
});
