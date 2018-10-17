const express = require('express');
const router = express.Router();
const xlsx = require('node-xlsx');
const fs = require('fs');
const app = express();
const Cliente = require('../../models/cliente');

const fetch = require("node-fetch");


// post ajax /APICliente
router.post('/', async(req, res, next) => {
  let sesionID = req.body.sesionID;
  let clientesCargados = 0;
  let clientesFallados = 0;
  const clientes = await Cliente.find({posicionIIBB:''});
  for (const consulta of clientes) {
    let cuit = consulta._id;
    let args = {
        //headers: { "Cookie":"AGIP_ID=00d07972-05d9-445b-94a0-94f9cedee0dc; JSESSIONID=d3c02ca6c010761940cd4dd67278; JSESSIONIDVERSION=2f65417263696261:43; JREPLICA=i0402; __utma=165579311.1430963338.1508871447.1512794033.1512854816.50; __utmc=165579311; __utmz=165579311.1512794033.49.3.utmcsr=google|utmccn=(organic)|utmcmd=organic|utmctr=(not%20provided); test=" }
        method: 'GET',
        headers: { "Cookie":" JSESSIONID="+ sesionID +";" }
    };
    let url = "http://lb.agip.gob.ar/eArciba/cc/rest/cliente/" + cuit;

    let response = await fetch(url, args);

    if (response.status == 409) {
      var errorLogin = true;
      break;
    };

    let data = await response.json();

    //console.log(data)

    consulta.posicionIIBB = data.cliente.sitIb;

    if (data.cliente.sitIb == 2) {
      consulta.numeroIIBB = data.cliente.isibCm;
      consulta.posicionIVA = data.cliente.tipoSituacionIva.codigo;
    }
    if (data.cliente.sitIb == 1) {
      consulta.numeroIIBB = data.cliente.isibLocal;
      consulta.posicionIVA = data.cliente.tipoSituacionIva.codigo;
    }
    if (data.cliente.sitIb == 5) {
      consulta.numeroIIBB = cuit;
      consulta.posicionIVA = data.cliente.tipoSituacionIva.codigo;
    }
    if (data.cliente.sitIb == 4) {
          consulta.numeroIIBB = "00000000000";
          consulta.posicionIVA = "3";
        }
    if (data.cliente.sitIb != 1 && data.cliente.sitIb != 2) {
      if (typeof data.cliente.tipoSituacionIva !== 'undefined' && data.cliente.tipoSituacionIva !== null) {
        consulta.posicionIVA = data.cliente.tipoSituacionIva.codigo;
      }
    }

    let actualizado = await consulta.save();

    //console.log(actualizado);

    clientesCargados++;
    let msg = 'cargados ' + clientesCargados + ' clientes de ' + clientes.length;
    emitir('cargados', msg);
  };
  if (errorLogin) {
    res.status(500).send({ result:'error', message:'Cerro la session en AGIP, vuelve a cargar el JSESSIONID!', clientesCargados:clientesCargados });
  }else{
    res.status(200).send({ result:'ok', message:'Todos los clientes fueron Actualizados!', clientesCargados:clientesCargados });
  };
});

module.exports = router;
