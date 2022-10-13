import mongoose from "mongoose";

const fileSchema = new mongoose.Schema({ name: String, url: String });

const person = new mongoose.Schema(
  {
    name: { type: String, required: true },
    favoriteColor: { type: String, required: true },
    favoriteAnimal: { type: String, required: true },
    favoriteFood: { type: String, required: true },
    role: { type: String, required: true },
    files: [fileSchema],
  },
  {
    toJSON: {
      virtuals: true,
      versionKey: false,
      transform: function (_doc, ret) {
        delete ret._id;
      },
    },
  }
);

const Person = mongoose.model("person", person);

export default Person;
