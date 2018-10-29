const xlsx = require('node-xlsx');

//Crear Iniciales de usuario para view
setIniciales = (nombre, apellido) => {
  let inicialN = nombre.substring(0,1);
  let inicialA = apellido.substring(0,1);
  let iniciales = inicialN.toUpperCase() + inicialA.toUpperCase();
  return iniciales;
};
XLSXtoJSON = (url) => {
  // Parse a file
  var datos = [];
  var workSheetsFromFile = xlsx.parse(url);
  var datosExcel = workSheetsFromFile[0].data;
  datosExcel.forEach(function(item,index) {
    if (index == 0) {
        console.log(item[0],item[2],item[4],item[7],item[8],item[9],item[10],)
    }else{
      if(typeof item[0] !== 'undefined' && item[0] !== null){
        var cuit = item[7];
        if (cuit) {
          cuit = cuit.replace('-','');
          cuit = cuit.replace('-','');
        }
        var temp = JSON.parse(
          '{ "Fecha": "' + item[0]
          + '" , "Factura": "' + item[2]
          + '" , "Nombre": "' + item[4]
          + '" , "CUIT": "' + cuit
          + '" , "Importe": "' + item[8]
          + '" , "AliCuota": "' + item[9]
          + '" , "Percepcion": "' + item[10] + '" }'
        );
        datos.push(temp);
      };
    };
  });
  return datos;
}


//recibe 3 parametros (string a rellenar, tamaño final, valor con el que se rellena)
padDerecha = (n, width, z) => {
        z = z || '0';
        n = n + '';
        return n.length >= width ? n : n + new Array(width - n.length + 1).join(z);
};

padIzquierda = (n, width, z) => {
        z = z || '0';
        n = n + '';
        return n.length >= width ? n : new Array(width - n.length + 1).join(z) + n;
};
