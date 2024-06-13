import jwt from "jsonwebtoken";

export const auth = async (req, res, next) => {
  const authHeader = req.headers.authorization;

  try {
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(403).json({ err: "Invalid authentication" });
    }

    const token = authHeader.split(" ")[1];

    if (!token) {
      return res.status(403).json({ err: "Token missing" });
    }

    const payload = jwt.verify(token, process.env.TOKEN);

    req.user = {
      userId: payload.userId,
      name: payload.name,
      userProfile: payload.userProfile,
    };
    next();
  } catch (error) {
    console.log(error);
    return res.status(401).json({ err: "Authentication failed" });
  }
};
