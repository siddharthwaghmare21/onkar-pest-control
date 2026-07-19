export function isAdminUser(user, options = {}) {
  const hasAdminRole = user?.app_metadata?.role === "admin" || user?.user_metadata?.role === "admin";
  if (hasAdminRole) return true;

  const adminEmails = (process.env.ADMIN_EMAILS || "")
    .split(",")
    .map((email) => email.trim().toLowerCase())
    .filter(Boolean);

  if (user?.email && adminEmails.includes(user.email.toLowerCase())) {
    return true;
  }

  return Boolean(options.allowDevelopmentFallback && process.env.NODE_ENV === "development" && user);
}
