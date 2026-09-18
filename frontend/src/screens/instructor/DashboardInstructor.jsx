<Route
  element={<RoleRoute userRole={userRole} allowedRoles={["instructor"]} />}
>
  <Route path="/instructor" element={<DashboardInstructor />} />

  <Route path="/instructor/clases" element={<MyClasses />} />

  <Route path="/instructor/clases/nueva" element={<ClassForm />} />

  <Route path="/instructor/clases/:id" element={<ClassDetailInstructor />} />

  <Route path="/instructor/clases/:id/editar" element={<ClassForm />} />
</Route>;
