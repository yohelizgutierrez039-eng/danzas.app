const { defineConfig } = require("vitest/config");

module.exports = defineConfig({
  test: {
    environment: "node",
    include: ["tests/**/*.test.js"],
    restoreMocks: true,
    coverage: {
      provider: "v8",
      reporter: ["text", "html"],
      include: [
        "src/services/payment.service.js",
        "src/services/enrollment.service.js",
        "src/services/schedule.service.js",
      ],
    },
  },
});
