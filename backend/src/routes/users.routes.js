const express = require("express");
const router = express.Router();

const dependentController = require("../controllers/dependent.controller");
const authMiddleware = require("../middlewares/auth.middleware");

router.post("/dependents", authMiddleware, dependentController.createDependent);

router.get("/dependents", authMiddleware, dependentController.getDependents);

router.get(
  "/dependents/:id",
  authMiddleware,
  dependentController.getDependentById,
);

module.exports = router;
