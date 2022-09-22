import Joi from "joi";
import { validationError } from "../util/custom.error";
import { idPattern } from "../util/joi";

interface IPerson {
  name: string;
  favoriteColor: string;
  favoriteAnimal: string;
  favoriteFood: string;
  role: string;
  group?: string;
  files?: FileDetails[];
}

interface DBPerson extends IPerson {
  id: string;
}

interface FileDetails {
  name: string;
  url: string;
}

const validateId = (id: string) => {
  const validation = idPattern.validate(id);
  if (validation.error) throw new validationError(validation.error.message);
};

const personRequirements = Joi.object().keys({
  name: Joi.string().required().max(10),
  favoriteColor: Joi.string().required().max(15),
  favoriteAnimal: Joi.string().required().max(15),
  favoriteFood: Joi.string().required().max(15),
  role: Joi.string().required().max(15),
  group: idPattern.allow(""),
  files: Joi.array().items(Joi.string()),
});

const updatePersonDetails = Joi.object().keys({
  name: Joi.string().max(10),
  favoriteColor: Joi.string().max(15),
  favoriteAnimal: Joi.string().max(15),
  favoriteFood: Joi.string().max(15),
  role: Joi.string().max(15),
});

export {
  DBPerson,
  IPerson,
  validateId,
  personRequirements,
  updatePersonDetails,
};
