import { AzureFunction, Context, HttpRequest } from "@azure/functions";
import jwt from "jsonwebtoken";
import { Person } from "../Person/person.interface";
import { noPermissionError } from "../Util/custom.error";
import mongooseConnection from "../Util/mongoose.connection";

const httpTrigger: AzureFunction = async function (
  context: Context,
  _req: HttpRequest
): Promise<void> {
  await mongooseConnection();
  const person = await Person.findOne({ _id: context.bindingData.personId });

  if (person === null) throw new noPermissionError();
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
