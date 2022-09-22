import Joi from "joi";
import { validationError } from "./custom.error";

const idPattern = Joi.string().hex().length(24);

const nameLength = Joi.object().keys({
  name: Joi.string().required().max(10),
});

const groupRequirements = Joi.object().keys({
  id: idPattern,
  name: Joi.string().required().max(10),
  people: Joi.array().items(idPattern),
  parentGroup: idPattern,
});

const validateId = (id: string) => {
  const validation = idPattern.required().validate(id);
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
  idPattern,
  nameLength,
  updatePersonDetails,
  personRequirements,
  validateId,
  groupRequirements,
};
