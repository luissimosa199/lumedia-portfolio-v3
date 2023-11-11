import dbConnect from "@/lib/dbConnect";
import { ProjectModel } from "@/lib/projectModel";

export const getDbLogs = async () => {
  await dbConnect();

  const query = await ProjectModel.find().lean();

  const message = query;

  return JSON.stringify(message);
};
