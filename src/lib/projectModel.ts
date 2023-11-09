import { getModelForClass, modelOptions, prop } from "@typegoose/typegoose";
import { ObjectId } from "mongodb";
import { nanoid } from "nanoid";
import mongoose from "mongoose";

@modelOptions({
  options: {
    allowMixed: 0,
  },
})
export class Project {
  @prop({ default: () => nanoid(9) })
  _id: string | ObjectId;

  @prop()
  name: string;

  @prop()
  subtitle: string;

  @prop()
  category: string;

  @prop()
  text: string;

  @prop()
  image: string;

  @prop()
  gallery: string[];

  @prop()
  slug: string;

  @prop()
  url: string;

  @prop()
  repo: string;

  @prop({ default: [] })
  tags: string[];
}

export const ProjectModel =
  mongoose.models.Project || getModelForClass(Project);
