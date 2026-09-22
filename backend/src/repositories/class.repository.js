const prisma = require("../config/prisma");

const searchClasses = async ({ tipoBaile, ciudad }) => {
  return await prisma.clase.findMany({
    where: {
      tipoBaile,
      ciudad,
      estado: "activa",
    },
  });
};

module.exports = {
  searchClasses,
};