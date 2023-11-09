"use server";

import { ContactFormModel } from "@/lib/contactFormModel";
import dbConnect from "@/lib/dbConnect";

interface ContactData {
  [key: string]: FormDataEntryValue;
  name: string;
  email: string;
  message: string;
  origin: string;
}

export const handleForm = async (formData: FormData) => {
  formData.append("origin", "portfolio");

  const formDataObject: ContactData = Array.from(formData.entries()).reduce(
    (obj, [key, value]) => {
      obj[key] = value;
      return obj;
    },
    {} as ContactData
  );

  await dbConnect();
  const newContact = new ContactFormModel(formDataObject);
  const response = await newContact.save();
  return response;
};
