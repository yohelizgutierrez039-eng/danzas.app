const userRepository = require("../repositories/user.repository");

const listarUsuarios = async () => {
  return await userRepository.findAll();
};

const suspenderUsuario = async (id) => {
  return await userRepository.updateEstado(id, "suspendido");
};

const eliminarUsuario = async (id) => {
  return await userRepository.deleteById(id);
};

module.exports = {
  listarUsuarios,
  suspenderUsuario,
  eliminarUsuario,
};
