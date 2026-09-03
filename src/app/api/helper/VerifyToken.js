import jwt from "jsonwebtoken";

export const verifyToken = (req) => {
    try {
      // Check cookie first (web sessions)
      const cookieToken = req.cookies.get("UserToken")?.value || "";

      // Check Authorization: Bearer <token> (mobile sessions)
      const authHeader = req.headers.get("authorization") || "";
      const bearerToken = authHeader.startsWith("Bearer ")
        ? authHeader.slice(7).trim()
        : "";

      const token = cookieToken || bearerToken;

      if (!token) {
        return null;
      }

      const decodedId = jwt.verify(token, process.env.SECRET_KEY);
      return decodedId.userId;

    } catch (error) {
        if (error instanceof jwt.TokenExpiredError) {
            console.log("Token expired");
        } else {
            console.log("VerifyToken ERROR:", error.message);
        }
        return null;
    }
};