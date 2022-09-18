import jwt from "jsonwebtoken";
import CustomError from "./customError";
import configFile from "../config";
import { AzureFunction, Context, HttpRequest } from "@azure/functions";

export const jwtDecode = (token: string) => {
  try {
    const jwtDecoded = jwt.verify(token, process.env.TOKEN_SECRET);
    return jwtDecoded;
  } catch (err) {
    throw new CustomError(configFile.noPermissionErr, 400);
  }
};

export const noPermission = (role: string) => {
  if (role !== "USER" && role !== "ADMIN") {
    throw new CustomError(configFile.noPermissionErr, 400);
  }
};

export const adminPerm = (role: string) => {
  if (role !== "ADMIN") {
    throw new CustomError(configFile.noPermissionErr, 400);
  }
};

interface HttpTriggerResult {
  status?: number;
  body?: any;
}

export const authWrapper = (
  func: AzureFunction,
  permissionType: Function
): AzureFunction => {
  return async (
    context: Context,
    req: HttpRequest
  ): Promise<HttpTriggerResult> => {
    const header = req.headers?.authorization;

    if (header && header.split(" ")[1]) {
      const user = jwtDecode(header.split(" ")[1]);
      if (user) {
        permissionType();
        return func(context, req, user);
      }
    }
    return {
      status: 401,
    };
  };
};
