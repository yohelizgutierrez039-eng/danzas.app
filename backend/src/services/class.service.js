const classRepository = require("../repositories/class.repository");

const searchClasses = async ({ tipoBaile, ciudad }) => {
  return await classRepository.searchClasses({
    tipoBaile,
    ciudad,
  });
};

module.exports = {
  searchClasses,
};