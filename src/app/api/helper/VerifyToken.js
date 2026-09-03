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

      // DIAGNOSTIC — visible in Vercel function logs
      console.log(
        "[VerifyToken]",
        "cookie:", cookieToken ? cookieToken.substring(0, 20) + "..." : "NONE",
        "| bearer:", bearerToken ? bearerToken.substring(0, 20) + "..." : "NONE",
        "| x-client-type:", req.headers.get("x-client-type") || "NONE"
      );

      if (!token) {
        console.log("[VerifyToken] REJECTED — no token found in cookie or Authorization header");
        return null;
      }

      const decodedId = jwt.verify(token, process.env.SECRET_KEY);
      console.log("[VerifyToken] OK — userId:", String(decodedId.userId).substring(0, 12) + "...");
      return decodedId.userId;

    } catch (error) {
        if (error instanceof jwt.TokenExpiredError) {
            console.log("[VerifyToken] REJECTED — token EXPIRED");
        } else {
            console.log("[VerifyToken] REJECTED — jwt.verify error:", error.message);
        }
        return null;
    }
};