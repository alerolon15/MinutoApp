const express = require('express');
const router = express.Router();
const Facturas = require('../../models/factura');
const Cliente = require('../../models/cliente');
const fs = require('fs');

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
      let facturaObj = {
        tipoOperacion: "2",
        codigoNorma: "29",
        // confirmar si es la fecha correcta (la que viene en la factura o la fecha del dia de hoy ?)
        fechaRetPerc: formatearFecha(Factura.fecha),
        tipoComprobante: "01",
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
        importeOtrosConceptos: "0",
        importeIva: "0",
        montoSujetoRetPerc: Factura.base,
        aliCuota: Factura.alicuota,
        retPrecPracticada: (parseInt(Factura.alicuota)*parseInt(Factura.base))/100,
        montoTotalRetPerc: (parseInt(Factura.alicuota)*parseInt(Factura.base))/100
      };
      if(Factura.nroFactura.substr(1,3) == "NCD"){
        facturaObj.tipoComprobante = "09";
        facturaObj.letraComprobante = " ";
      }

      // Le saco el % a la alicuota
      facturaObj.aliCuota = facturaObj.aliCuota.replace("%", " ");
      //corto la Razon social
      let longitud = facturaObj.razonSocialRetenido.length;
      if(longitud>30)
      facturaObj.razonSocialRetenido = facturaObj.razonSocialRetenido.substring(0,30);
      console.log(longitud);
      //  Seccion de pading
      facturaObj.fechaRetPerc = padIzquierda((facturaObj.fechaRetPerc),10,'0');
      facturaObj.nroComprobante = padIzquierda(facturaObj.nroComprobante,16,'0');
      facturaObj.fechaComprobante = padIzquierda((facturaObj.fechaComprobante),10,'0');
      facturaObj.montoComprobante = padIzquierda(facturaObj.montoComprobante,16,'0');
      facturaObj.nroInscripcionIIBBRetenido = padIzquierda(facturaObj.nroInscripcionIIBBRetenido,11,'0');
      facturaObj.razonSocialRetenido = padDerecha(facturaObj.razonSocialRetenido,30,' ');
      facturaObj.importeOtrosConceptos = padIzquierda(facturaObj.importeOtrosConceptos,16,'0');
      facturaObj.importeIva = padIzquierda(facturaObj.importeIva,16,'0');
      facturaObj.montoSujetoRetPerc = padIzquierda(facturaObj.montoSujetoRetPerc,16,'0');
      facturaObj.aliCuota = padIzquierda(facturaObj.aliCuota,5,'0');
      facturaObj.retPrecPracticada = padIzquierda(facturaObj.retPrecPracticada,16,'0');
      facturaObj.montoTotalRetPerc = padIzquierda(facturaObj.montoTotalRetPerc,16,'0');

      //   Plasma el JSON en el Vector
      facturastxt.push(facturaObj);

      let linea = '';
      linea += facturaObj.tipoOperacion;
      linea += facturaObj.codigoNorma;
      linea += facturaObj.fechaRetPerc;
      linea += facturaObj.tipoComprobante;
      linea += facturaObj.letraComprobante;
      linea += facturaObj.nroComprobante;
      linea += facturaObj.fechaComprobante;
      linea += facturaObj.montoComprobante;
      linea += facturaObj.nroCertificadoPropio;
      linea += facturaObj.tipoDocRetenido;
      linea += facturaObj.nroDocRetenido;
      linea += facturaObj.sitIIBBRetenido;
      linea += facturaObj.nroInscripcionIIBBRetenido;
      linea += facturaObj.sitIvaRetenido;
      linea += facturaObj.razonSocialRetenido;
      linea += facturaObj.importeOtrosConceptos;
      linea += facturaObj.importeIva;
      linea += facturaObj.montoSujetoRetPerc;
      linea += facturaObj.aliCuota;
      linea += facturaObj.retPrecPracticada;
      linea += facturaObj.montoTotalRetPerc;
      linea += facturaObj.codigoNorma;



      fs.appendFile('AGIP.txt', linea + "\r\n", function (err) { // buscar append sincronico
        if (err) throw err;
        console.log('Updated!');
      });
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
    if(err){
      res.send({error:'true', mensaje:'Hubo un problema al intentar borrar la factura.'});
    };
    res.send({resultado:'ok', mensaje:'La factura ha sido eliminada con exito.'});
  });
});
