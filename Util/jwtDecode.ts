import jwt from "jsonwebtoken";

const jwtDecode = (token: string) => {
  const jwtDecoded = jwt.verify(token, process.env.TOKEN_SECRET);
  return jwtDecoded;
};

export default jwtDecode;
