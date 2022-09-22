import Joi from "joi";

const idPattern = Joi.string().hex().length(24);

const nameLength = Joi.object().keys({
  name: Joi.string().required().max(10),
});

export { idPattern, nameLength };
