
const { EventEmitter } = require("events");

// Crear una instancia única del emisor de eventos
const notificationEmitter = new EventEmitter();

// Exportar la instancia para compartirla entre servicios y listeners
module.exports = notificationEmitter;
