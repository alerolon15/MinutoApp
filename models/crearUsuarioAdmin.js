const mongoose = require('mongoose');
const User = require('../models/user');
// en caso de ejecutar este archivo desde Node por fuera del proyecto, descomentar las lineas de conexion y desconexion a mongo.



let nombre = "administrador";
let apellido = "administrador";
let urlImagen = "/images/logos/Profile.png";
let email = "admin@admin.com";
let password = "admin++";
let esAdmin = true;
let BackOfficeFacturas = true;
let BackOfficeClientes = true;

let data = {
  nombre,
  apellido,
  urlImagen,
  email,
  password,
  esAdmin,
  BackOfficeFacturas,
  BackOfficeClientes
};

const userAdmin = new User(data);

User.findOne({email: email, password: password}, function(err,users){
  if(err){
    console.log(err);
  }
  if(!users) {
    userAdmin.save(function(err){
      if (err) {console.log(err)}
      else {
        console.log(userAdmin);
        console.log("usuario admin creado con exito!");
        //mongoose.disconnect();
       };
    });
  }
  if(users) {
    console.log(users)
    console.log("usuario admin ya existe!");
    //mongoose.disconnect();
  }
});
