import dbConnect from "@/lib/dbConnect";
import { ProjectModel } from "@/lib/projectModel";

export const getDbLogs = async () => {
  let message;

  try {
    await dbConnect();
    const query = await ProjectModel.find().lean();
    message = query;
  } catch (error) {
    message = error;
  }

  return JSON.stringify(message);
};
