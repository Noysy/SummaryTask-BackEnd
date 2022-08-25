import { AzureFunction, Context, HttpRequest } from "@azure/functions"
import { MyGroup } from "../Group/GroupInterface";
import errorHandler from "../Util/errorHandling";
import mongooseConnection from "../Util/mongooseConnection";

const httpTrigger: AzureFunction = async function (context: Context, _req: HttpRequest): Promise<void> {
  try {
    await mongooseConnection();
    
    context.res = {
      body: await MyGroup.find({}),
    };
  } catch (err) {
    err.statusCode ??= 500;
    errorHandler(context, err);
  }
};

export default httpTrigger;