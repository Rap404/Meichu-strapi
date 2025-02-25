const passport = require("passport");
const api = require("./api");

const handleProviderAuth = async ({
  strapi,
  provider,
  providerId,
  email,
  username,
}) => {
  const users = await strapi.query('plugin::users-permissions.user').findMany({
    where: { email }
  });

  if (users && users.length) {
    const existingUser = users[0];

    if (!existingUser[`${provider}Id`]) {
      await strapi.query('plugin::users-permissions.user').update({
        where: { id: existingUser.id },
        data: {
          [`${provider}Id`]: providerId,
          lastLogin: new Date()
        }
      });
    }

    const jwt = strapi.plugins['users-permissions'].services.jwt.issue({
      id: existingUser.id,
    });

    return { jwt, user: existingUser };
  }

  const role = await strapi.query('plugin::users-permissions.role').findOne({
    where: { type: 'authenticated' }
  });

  if (!role) {
    throw new Error('Role authenticated not found');
  }

  const newUser = await strapi.query('plugin::users-permissions.user').create({
    data: {
      username,
      email,
      provider,
      [`${provider}Id`]: providerId,
      confirmed: true,
      blocked: false,
      role: role.id,
    }
  });

  const jwt = strapi.plugins['users-permissions'].services.jwt.issue({
    id: newUser.id,
  });

  return { jwt, user: newUser };
};

module.exports = ({ env }) => ({
  'user-permissions': {
    config: {
      providers: [
        {
        uid: 'google',
        displayName: 'Google',
        icon: 'google',
        createStrategy: (strapi) => {
          const GoogleStrategy = require('passport-google-oauth20').Strategy;
          const passport = require('passport');

          passport.use(
            new GoogleStrategy(
            {
              clientID: env('GOOGLE_CLIENT_ID'),
              clientSecret: env('GOOGLE_CLIENT_SECRET'),
              callbackURL: env('GOOGLE_CALLBACK_URL'),
              scope: ['email', 'profile'],
            },
            (accessToken, refreshToken, profile, done) => {
              done(null, {
                accessToken,
                refreshToken,
                profile
              });
            }
        )
      );

          return {
            passport,
            callback: async ({query, accessToken, refreshToken, profile}) => {
              try {
                if (!profile){
                  throw new Error("Profile not found");
                }

                const email = profile.emails[0].value;

                const users = await strapi.query('plugin::users-permissions.user').findMany({
                  where: { email }
                })

                if (users && users.length){
                  const existingUser = users[0];

                  await strapi.query('plugin::users-permissions.user').update({
                    where: { id: existingUser.id },
                    data: {
                      lastLogin: new Date(),
                    }
                  })

                  const jwt = strapi.plugins['users-permissions'].services.jwt.issue({
                    id: existingUser.id,
                  })

                  return {
                    jwt,
                    user: existingUser,
                  };
                }

                const role = await strapi.query('plugin::users-permissions.role').findOne({
                  where: { type: 'authenticated' }
                });

                if (!role) {
                  throw new Error('Authenticated role not found');
                }

                const newUser = await strapi.query('plugin::users-permissions.user').create({
                  data: {
                    username: profile.displayName || email.split('@')[0],
                    email,
                    provider: 'google',
                    googleId: profile.id,
                    confirmed: true,
                    blocked: false,
                    role: role.id,
                    avatar: profile.photos?.[0]?.value,
                  }
                });

                const jwt = strapi.plugins['users-permissions'].services.jwt.issue({
                  id: newUser.id,
                });

                return {
                  jwt,
                  user: newUser
                };
              } catch (error) {
                console.error('Error during google authentication:', error);
                throw error;
              }
            }
          }
        },
        auth: {
          params: {
            client_id: env('GOOGLE_CLIENT_ID'),
            client_secret: env('GOOGLE_CLIENT_SECRET'),
            scope: ['email', 'profile'],
            state: true,
            redirect_uri: env('GOOGLE_CALLBACK_URL'),
          },
        }
      },
      {
        uid: 'discord',
        displayName: 'Discord',
        icon: 'discord',
        createStrategy: (strapi) => {
          const DiscordStrategy = require('passport-discord').Strategy;
          const passport = require('passport');

          passport.use(
            new DiscordStrategy(
              {
                clientID: env('DISCORD_CLIENT_ID'),
                clientSecret: env('DISCORD_CLIENT_SECRET'),
                callbackURL: env('DISCORD_CALLBACK_URL'),
                scope: ['identify', 'email'],
              },
              (accessToken, refreshToken, profile, done) => {
                done(null, { accessToken, refreshToken, profile });
              }
            )
          );

          return {
            passport,
            callback: async ({ query, accessToken, refreshToken, profile }) => {
              try {
                if (!profile) {
                  throw new Error('Profile not found');
                }

                const email = profile.email;

                return await handleProviderAuth({
                  strapi,
                  provider: 'discord',
                  providerId: profile.id,
                  email,
                  username: profile.username || email.split('@')
                })
              } catch (error) {
                console.error('Error during discord authentication:', error);
                throw error;
              }
            },
          };
        },
        auth: {
          params: {
            client_id: env('DISCORD_CLIENT_ID'),
            client_secret: env('DISCORD_CLIENT_SECRET'),
            scope: ['identify', 'email'],
            redirect_uri: env('DISCORD_CALLBACK_URL'),
          },
        },
      },
      ]
    }
  },
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
