const express = require('express');
const router = express.Router();
const Factura = require('../../models/factura');
const Cliente = require('../../models/cliente');

const xlsx = require('node-xlsx');


/* GET home page. */
router.get('/', function(req, res, next) {
  if(req.session && req.session.user){
    req.session.user.iniciales = setIniciales(req.session.user.nombre, req.session.user.apellido);

    res.render('importar/index', { usuario: req.session.user});
  }else{
    res.redirect("/")
  }
});

/* GET home page. */
router.post('/', function(req, res, next) {
  if(req.session && req.session.user){
    req.session.user.iniciales = setIniciales(req.session.user.nombre, req.session.user.apellido);
    let url = req.body.url.replace(/\\/g, "/");
    let excelJson = XLSXtoJSON(url);

    res.render('importar/tabla', { usuario: req.session.user, datos:excelJson, url:url});
  }else{
    res.redirect("/")
  }
});

router.post('/cargarClientes', async (req,res) => {
  let url = req.body.url;
  let excelJson = XLSXtoJSON(url);
  let clientesCargados = 0;
  let clientesExistentes = 0;
  let errores = 0;
  var clientesrecorridos = 0;
  for (const factura of excelJson) {
    let cliente = await Cliente.findOne({_id:factura.CUIT});
    clientesrecorridos++;
    if (!cliente) {
      let data = {
        _id: factura.CUIT,
        razonsocial: factura.Nombre,
        posicionIVA: '',
        posicionIIBB: '',
        numeroIIBB: ''
      };
      let clienteNuevo = new Cliente(data);
      try {
        let clienteCreado = await clienteNuevo.save();
        clientesCargados++;
        let msg = 'cargados ' + clientesrecorridos + ' clientes de ' + excelJson.length;
        emitir('cargados', msg);
      } catch (error) {
        errores++;
      }
    };
    if (cliente) {
      clientesExistentes++;
      let msg = 'cargados ' + clientesrecorridos + ' clientes de ' + excelJson.length;
      emitir('cargados', msg);
    };
  };
  //});

  res.status(200).send({ result:'ok', message:'El archivo fue procesado correctamente!', clientesCargados:clientesCargados , clientesExistentes:clientesExistentes, errores:errores });

});

/* GET home page. */
router.post('/cargarFacturas', async (req, res) => {
  let url = req.body.url;
  let excelJson = XLSXtoJSON(url);
  let facturasCargadas = 0;
  let facturasExistentes = 0;
  let errores = 0;
  var facturasrecorridas = 0;

  for (const factura of excelJson) {


    let query = factura.Factura
    let facturasDB = await Factura.findOne({nroFactura:query});
    facturasrecorridas++;
    if (!facturasDB) {
      let d = factura.Fecha.substr(0,2);
      let m = factura.Fecha.substr(3,2);
      let y = factura.Fecha.substr(6,4);
      let fecha = m + '/' + d + '/' + y;

      let dataFactura = {
        fecha: new Date(fecha),
        tipo: factura.Factura.substr(4,1),
        nroSucursal: factura.Factura.substr(8,2),
        nroFactura: factura.Factura,
        base: factura.Importe,
        alicuota: factura.AliCuota,
        percepcion: factura.Percepcion,
        cliente:  factura.CUIT
      };
      let facturaNueva = new Factura(dataFactura);

      let facturaCreada = await facturaNueva.save();
      facturasCargadas++;

      let msg = 'cargados ' + facturasrecorridas + ' facturas de ' + excelJson.length;
      emitir('cargados', msg);
    };
    if (facturasDB) {
      facturasExistentes++;
      let msg = 'cargados ' + facturasrecorridas + ' facturas de ' + excelJson.length;
      emitir('cargados', msg);
    };
  };
  res.status(200).send({ result:'ok', message:'El archivo fue procesado correctamente', facturasCargadas:facturasCargadas , facturasExistentes:facturasExistentes });

});




module.exports = router;
