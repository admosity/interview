module.exports = ({ env }) => {
  return {
    settings: {
      cors: {
        enabled: true,
        methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS', 'HEAD'],
      },
    },
  };
};
