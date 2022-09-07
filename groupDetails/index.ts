import { AzureFunction, Context, HttpRequest } from "@azure/functions"
import { MyGroup } from "../Group/GroupInterface";
import { validateId } from "../Person/PersonInterface";
import errorHandler from "../Util/errorHandling";
import mongooseConnection from "../Util/mongooseConnection";

const httpTrigger: AzureFunction = async function (context: Context, _req: HttpRequest): Promise<void> {
    try {
        const id = context.bindingData.id;
        validateId({ id: id });
    
        await mongooseConnection();
        context.res = {
          body: await MyGroup.find({ _id: id }).populate('people'),
        };
      } catch (err) {
        err.statusCode ??= 500;
        errorHandler(context, err);
      }
};

export default httpTrigger;