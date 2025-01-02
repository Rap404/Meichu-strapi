const api = require("./api");

module.exports = ({ env }) => ({
  email: {
    config: {
      provider: 'nodemailer',
      providerOptions: {
        host: 'smtp.gmail.com',
        port: 587,
        auth: {
          user: env('SMTP_USER'),
          pass: env('SMTP_PASS'),
        },
      },
      settings: {
        deafultFrom: env('EMAIL_FROM', 'no-reply@example.com'),
        defaultReplyTo: env('EMAIL_REPLY_TO', 'support@example.com')
      }
    }
  },
  upload: {
    config: {
      provider: 'cloudinary',
      providerOptions: {
        cloud_name: env('CLOUDINARY_NAME'),
        api_key: env('CLOUDINARY_KEY'),
        api_secret: env('CLOUDINARY_SECRET'),
      },
      actionOptions: {
        upload: {},
        uploadStrem: {},
        delete: {}
      }
    }
  }
});
