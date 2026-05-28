import jwt from "jsonwebtoken";


export const verifyToken = (req) => {
    try {
      let token = req.cookies.get("UserToken")?.value || "";

      if(!token){
        const authHeader = req.headers.get("authorization");
        token = authHeader?.replace("Bearer ", "") || ""
      };

      if(!token){
        return null;
      };

        const decodedId = jwt.verify(token, process.env.SECRET_KEY);
        return decodedId.userId
    } catch (error) {
        if (error instanceof jwt.TokenExpiredError) {
            console.log("Token expired");
        } else {
            console.log("VerifyToken ERROR:", error.message);
        }
        return null;
    }
};