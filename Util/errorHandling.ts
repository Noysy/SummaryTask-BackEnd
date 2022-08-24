import { Context } from "@azure/functions";
import CustomError from "./customError";

const errorHandler = (context: Context, err: CustomError) => {
  context.res = {
    status: err.statusCode,
    body: err.message,
  };
};

export default errorHandler;
