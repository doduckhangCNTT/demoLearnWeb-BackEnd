"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const nodemailer = require("nodemailer");
const google_auth_library_1 = require("google-auth-library");
const OAUTH_PLAYGROUND = "https://developers.google.com/oauthplayground";
const CLIENT_ID = `${process.env.MAIL_CLIENT_ID}`;
const CLIENT_SECRET = `${process.env.MAIL_CLIENT_SECRET}`;
const REFRESH_TOKEN = `${process.env.MAIL_REFRESH_TOKEN}`;
const SENDER_MAIL = `${process.env.SENDER_EMAIL_ADDRESS}`;
// send email
const sendEmail = (to, url, txt) => __awaiter(void 0, void 0, void 0, function* () {
    console.log({ to, url, txt });
    const oAuth2Client = new google_auth_library_1.OAuth2Client(CLIENT_ID, CLIENT_SECRET, OAUTH_PLAYGROUND);
    // Đặt thông tin xác thực.
    oAuth2Client.setCredentials({ refresh_token: REFRESH_TOKEN });
    try {
        const access_token = yield oAuth2Client.getAccessToken();
        // cấu hình cho hình thức vận chuyển thông tin
        const transport = nodemailer.createTransport({
            service: "gmail",
            // secure: true,
            auth: {
                type: "OAuth2",
                user: SENDER_MAIL,
                clientId: CLIENT_ID,
                clientSecret: CLIENT_SECRET,
                refreshToken: REFRESH_TOKEN,
                access_token,
            },
            tls: {
                rejectUnauthorized: false,
            },
        });
        // Thiết lập nội dung và các thông tin đính kèm
        const mailOptions = {
            from: SENDER_MAIL,
            to: to,
            subject: "Register Learn Web",
            // Nội dung gửi
            html: `
              <div style="max-width: 700px; margin:auto; border: 10px solid #ddd; padding: 50px 20px; font-size: 110%;">
              <h2 style="text-align: center; text-transform: uppercase;color: teal;">Welcome to the Learn Web.</h2>
              <p>Congratulations! You're almost set to start using Learn Web.
                  Just click the button below to validate your email address.
              </p>
              
              <a href=${url} style="background: crimson; text-decoration: none; color: white; padding: 10px 20px; margin: 10px 0; display: inline-block;">${txt}</a>
          
              <p>If the button doesn't work for any reason, you can also click on the link below:</p>
          
              <div>${url}</div>
              </div>
            `,
        };
        // Vận chuyển nội dung đến email người nhận
        const result = yield transport.sendMail(mailOptions);
        return result;
    }
    catch (error) {
        console.log(error);
    }
});
exports.default = sendEmail;
