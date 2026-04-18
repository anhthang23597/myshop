export const isAdmin = (username: string, password: string) => {
  const adminUsername = process.env.ADMIN_USERNAME || "admin";
  const adminPassword = process.env.ADMIN_PASSWORD || "admin";
  return username === adminUsername && password === adminPassword;
};