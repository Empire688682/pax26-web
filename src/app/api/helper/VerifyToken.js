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
        console.log("ERROR:", error);
        if(error.TokenExpiredError.message === "jwt expired"){
            console.log("Token expired");
        }
        return null
    }
};