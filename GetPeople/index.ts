import { AzureFunction, Context, HttpRequest } from '@azure/functions';
import { IPerson } from '../util/person.interface';
import { authWrapper, userPerm } from '../util/authorization';
import errorHandler from '../util/error.handling';
import Group from '../util/group.model';
import mongooseConnection from '../util/mongoose.connection';
import Person from '../util/person.model';

const GetPeople: AzureFunction = async function (
  context: Context,
  _req: HttpRequest,
  user: IPerson,
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
      ).populate('people').exec();
      groupsOfPerson.forEach((group) => {
        group.people.forEach((person) => {
          if (!people.includes(person)) {
            people.push(person);
          }
        });
      });

      if (people.length === 0) people.push(await Person.findById(id).exec());

      context.res = {
        body: people,
      };
    } else if (user.role === 'ADMIN') {
      await mongooseConnection();
      context.res = {
        body: await Person.find({}).exec(),
      };
    }
  } catch (err) {
    errorHandler(context, err);
  }
};

export default authWrapper(GetPeople, userPerm);
