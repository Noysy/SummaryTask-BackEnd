import { AzureFunction, Context, HttpRequest } from '@azure/functions';
import { Group } from '../Group/group.interface';
import { Person, DBPerson } from '../Person/person.interface';
import { authWrapper, userPerm } from '../Util/authorization';
import errorHandler from '../Util/error.handling';
import mongooseConnection from '../Util/mongoose.connection';

const httpTrigger: AzureFunction = async function (
  context: Context,
  _req: HttpRequest,
  user: DBPerson,
): Promise<void> {
  try {
    if (!user) return null;
    else if (user.role === 'USER') {
      await mongooseConnection();
      const id = user.id;

      const people = [];
      const groupsOfPerson = await Group.find(
        { people: id },
        { _id: 0, people: 1 },
      ).populate('people');
      groupsOfPerson.forEach((group) => {
        group.people.forEach((person) => {
          if (!people.includes(person)) {
            people.push(person);
          }
        });
      });

      if (people.length === 0) people.push(await Person.findById(id));

      context.res = {
        body: people,
      };
    } else if (user.role === 'ADMIN') {
      await mongooseConnection();
      context.res = {
        body: await Person.find({}),
      };
    }
  } catch (err) {
    err.statusCode ??= 500;
    errorHandler(context, err);
  }
};

export default authWrapper(httpTrigger, userPerm);
