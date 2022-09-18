import jwt from "jsonwebtoken";
import CustomError from "./customError";
import configFile from "../config";

export const jwtDecode = (token: string) => {
  try {
    const jwtDecoded = jwt.verify(token, process.env.TOKEN_SECRET);
    return jwtDecoded.role;
  } catch (err) {
    throw new CustomError(configFile.noPermissionErr, 400);
  }
};

export const anyAuth = (role: string) => {
  // if (role !== "USER" && role !== "ADMIN") {
    throw new CustomError(configFile.noPermissionErr, 400);
  // }
};

export const adminAuth = (role: string) => {
  if (role !== "ADMIN") {
    throw new CustomError(configFile.noPermissionErr, 400);
  }
};
