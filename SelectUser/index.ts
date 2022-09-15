import { AzureFunction, Context, HttpRequest } from "@azure/functions";
import jwt from "jsonwebtoken";
import PersonManager from "../Person/PersonManager";
import mongooseConnection from "../Util/mongooseConnection";

const httpTrigger: AzureFunction = async function (
  context: Context,
  req: HttpRequest
): Promise<void> {
  await mongooseConnection();
  const person = await PersonManager.getPerson(req.params.id);

  const accessToken = jwt.sign(
    {
      name: person.name,
      // role: person.role,
      id: person.id,
    },
    process.env.TOKEN_SECRET
  );

  context.res = {
    status: 200,
    body: accessToken,
  };
};

export default httpTrigger;
