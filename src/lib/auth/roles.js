export function isAdminUser(user) {
  return user?.app_metadata?.role === "admin" || user?.user_metadata?.role === "admin";
}
