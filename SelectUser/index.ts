import { AzureFunction, Context, HttpRequest } from "@azure/functions";
import jwt from "jsonwebtoken";
import { notFoundError } from "../util/custom.error";
import mongooseConnection from "../util/mongoose.connection";
import Person from "../util/person.model";

const SelectUser: AzureFunction = async function (
  context: Context,
  _req: HttpRequest
): Promise<void> {
  await mongooseConnection();
  const person = await Person.findById(context.bindingData.personId).exec();

  if (!person) throw new notFoundError("person");
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

export default SelectUser;
