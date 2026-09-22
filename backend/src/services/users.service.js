const suspendUser = async (id) => {
  const user = await User.findByPk(id);

  if (!user) {
    const error = new Error("Usuario no encontrado");
    error.status = 404;
    throw error;
  }

  await user.update({
    estado: "inactivo",
  });

  return user;
};
