import Joi from "joi";
import { idPattern } from "../util/joi";

type IGroup = {
  name: string;
  people?: string[];
  parentGroup?: string;
};

const groupRequirements = Joi.object().keys({
  id: idPattern,
  name: Joi.string().required().max(10),
  people: Joi.array().items(idPattern),
  parentGroup: idPattern,
});


export { groupRequirements, IGroup };
