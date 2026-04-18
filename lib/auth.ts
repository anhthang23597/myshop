export const isAdmin = (username: string, password: string) => {
  return username === "admin" && password === "admin";
};