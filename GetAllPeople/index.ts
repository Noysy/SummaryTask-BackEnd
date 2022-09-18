import { AzureFunction, Context, HttpRequest } from "@azure/functions";
import { MyGroup } from "../Group/GroupInterface";
import { MyPerson, DBPerson } from "../Person/PersonInterface";
import { authWrapper, userPerm } from "../Util/authorization";
import errorHandler from "../Util/errorHandling";
import mongooseConnection from "../Util/mongooseConnection";

const httpTrigger: AzureFunction = async function (
  context: Context,
  _req: HttpRequest,
  user: DBPerson
): Promise<void> {
  try {
    await mongooseConnection();
    if (user.role === "USER") {
      const id = user.id;

      const people = [];
      const groupsOfPerson = await MyGroup.find(
        { people: id },
        { _id: 0, people: 1 }
      ).populate("people");
      groupsOfPerson.forEach((group) => {
        group.people.forEach((person) => {
          if (!people.includes(person)) {
            people.push(person);
          }
        });
      });

      if (people.length === 0) people.push(await MyPerson.findById(id));

      context.res = {
        body: people,
      };
    } else if (user.role === "ADMIN") {
      context.res = {
        body: await MyPerson.find({}),
      };
    }
  } catch (err) {
    err.statusCode ??= 500;
    errorHandler(context, err);
  }
};

export default authWrapper(httpTrigger, userPerm);
