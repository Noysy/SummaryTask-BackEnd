import { AzureFunction, Context, HttpRequest } from "@azure/functions";
import jwt from "jsonwebtoken";
import { errors } from "../config";
import { Person } from "../Person/person.interface";
import mongooseConnection from "../Util/mongoose.connection";

const httpTrigger: AzureFunction = async function (
  context: Context,
  req: HttpRequest
): Promise<void> {
  await mongooseConnection();
  const person = await Person.findOne({ _id: req.params.id });
  if (person === null) throw errors.noPersonErr;
  const accessToken = jwt.sign(
    {
      name: person.name,
      role: person.role,
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
