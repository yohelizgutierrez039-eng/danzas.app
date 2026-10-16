router.get(
  "/attendance",
  authMiddleware,
  requireRole("padre"),
  reportController.getAttendanceReport
);