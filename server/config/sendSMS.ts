import { Twilio } from "twilio";

const accountSid = `${process.env.TWILIO_ACCOUNT_SID}`;
const authToken = `${process.env.TWILIO_AUTH_TOKEN}`;
const from = `${process.env.TWILIO_PHONE_NUMBER}`;
const serviceID = `${process.env.TWILIO_SERVICE_ID}`;

const client = new Twilio(accountSid, authToken);

export const sendSms = (to: string, body: string, txt: string) => {
  try {
    client.messages
      .create({
        body: `Learn App ${txt} - ${body}`,
        from,
        to,
      })
      .then((message) => console.log(message.sid));
  } catch (error) {
    console.log(error);
  }
};

export const smsOTP = async (to: string, channel: string) => {
  try {
    const data = await client.verify.services(serviceID).verifications.create({
      to,
      channel,
    });
    // console.log("Data SMSOTP: ", data);
    return data;
  } catch (error) {
    console.log(error);
  }
};

export const smsVerify = async (to: string, code: string) => {
  try {
    const data = await client.verify
      .services(serviceID)
      .verificationChecks.create({
        to,
        code,
      });
    // console.log("SMS Verify: ", data);
    return data;
  } catch (error) {
    console.log(error);
  }
};
