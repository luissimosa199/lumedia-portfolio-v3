import dbConnect from "@/lib/dbConnect";
import { ProjectModel } from "@/lib/projectModel";

export const getProjectData = async (slug: string) => {
  try {
    await dbConnect();
    const response = await ProjectModel.findOne({ slug }).lean();
    const data = JSON.stringify(response);
    return data;
  } catch (error) {
    throw new Error(JSON.stringify(error));
  }
};
