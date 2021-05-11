
const { ConnectionString } = require('connection-string');




module.exports = ({ env }) => {
  const databaseUrl = env('DATABASE_URL');

  if (databaseUrl) {
    const connectionString = new ConnectionString(databaseUrl);

    const connectionParsed = {
      host: connectionString.hostname,
      port: connectionString.port,
      database: connectionString.path?.[0],
      username: connectionString.user,
      password: connectionString.password,
      ssl: connectionString.params?.ssl ? Boolean(connectionString.params.ssl) : undefined,
    };

    return {
      defaultConnection: 'default',
      connections: {
        default: {
          connector: 'bookshelf',
          settings: {
            client: 'postgres',
            ...connectionParsed,
            ssl: {
              rejectUnauthorized: env.bool('DATABASE_SSL_SELF', false), // For self-signed certificates
            },
          },
          options: {
            ssl: env.bool('DATABASE_SSL', false),
          },
        },
      },
    };
  }

  // use sqlite locally
  return {
    defaultConnection: 'default',
    connections: {
      default: {
        connector: 'bookshelf',
        settings: {
          client: 'sqlite',
          filename: env('DATABASE_FILENAME', '.tmp/data.db'),
        },
        options: {
          useNullAsDefault: true,
        },
      },
    },
  };
};
