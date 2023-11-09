"use server";
import dbConnect from "@/lib/dbConnect";
import { ProjectModel } from "@/lib/projectModel";

export async function getCategoriesCount() {
  await dbConnect();

  const response = await ProjectModel.aggregate([
    {
      $group: {
        _id: "$category",
        count: { $sum: 1 },
      },
    },
    {
      $group: {
        _id: null,
        total: { $sum: "$count" },
        categories: {
          $push: {
            category: "$_id",
            count: "$count",
          },
        },
      },
    },
    {
      $project: {
        _id: 0,
        total: 1,
        categories: 1,
      },
    },
  ]);

  if (!response) {
    throw new Error("Failed to fetch data");
  }

  return response[0];
}
