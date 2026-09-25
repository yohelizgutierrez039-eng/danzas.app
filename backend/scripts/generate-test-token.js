const { signToken } = require("../src/utils/jwt.util");

const [, , id, rol] = process.argv;

if (!id || !rol) {
  console.error("Uso: node scripts/generate-test-token.js <id> <rol>");
  process.exit(1);
}

const token = signToken({
  id,
  rol,
});

console.log(token);
