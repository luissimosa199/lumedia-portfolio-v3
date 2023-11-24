"use server";

import { ContactFormModel } from "@/lib/contactFormModel";
import dbConnect from "@/lib/dbConnect";
import { SESv2Client, SendEmailCommand } from "@aws-sdk/client-sesv2";

interface ContactData {
  [key: string]: FormDataEntryValue;
  name: string;
  email: string;
  message: string;
  origin: string;
}

export const handleForm = async (formData: FormData) => {
  formData.append("origin", "portfolio");

  const client = new SESv2Client({
    region: "us-east-2",
    credentials: {
      accessKeyId: process.env.AWS_ACCESS_KEY_ID as string,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY as string,
    },
  });

  const formDataObject: ContactData = Array.from(formData.entries()).reduce(
    (obj, [key, value]) => {
      obj[key] = value;
      return obj;
    },
    {} as ContactData
  );

  const params = {
    Destination: {
      ToAddresses: ["simosa37@gmail.com"],
    },
    Content: {
      Simple: {
        Subject: {
          Data: "Test Email",
          Charset: "UTF-8",
        },
        Body: {
          Text: {
            Data: `<div>
            <h1>Recibiste un contacto desde el portafolio</h1>
            <ul>
              <li>De: ${formDataObject.name}</li>
              <li>Email: ${formDataObject.email}</li>
              <li>${formDataObject.message}</li>
            </ul>
          </div>`,
            Charset: "UTF-8",
          },
          Html: {
            Data: `<div>
              <h1>Recibiste un contacto desde el portafolio</h1>
              <ul>
                <li>De: ${formDataObject.name}</li>
                <li>Email: ${formDataObject.email}</li>
                <li>${formDataObject.message}</li>
              </ul>
            </div>`,
            Charset: "UTF-8",
          },
        },
      },
    },
    FromEmailAddress: "doxacontacts01@gmail.com",
  };

  await dbConnect();
  const newContact = new ContactFormModel(formDataObject);
  const savedContact = await newContact.save();

  const command = new SendEmailCommand(params);
  const emailResponse = await client.send(command);

  const response = savedContact.toObject();
  return response;
};
