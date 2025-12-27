const ADMIN_TOKEN = process.env.ADMIN_TOKEN || "dev-admin-token";

export function requireAdmin(req, res, next) {
  const token = req.header("x-admin-token");

  if (!token || token !== ADMIN_TOKEN) {
    return res
      .status(401)
      .json({ success: false, message: "Unauthorized" });
  }

  next();
}
