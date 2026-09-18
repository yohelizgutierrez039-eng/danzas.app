router.put(
  "/:id",
  authMiddleware,
  instructorMiddleware,
  classController.updateClass,
);

router.delete(
  "/:id",
  authMiddleware,
  instructorMiddleware,
  classController.deleteClass,
);
