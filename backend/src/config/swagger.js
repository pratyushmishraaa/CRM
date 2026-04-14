import swaggerJsdoc from 'swagger-jsdoc';

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'CRM SaaS API',
      version: '1.0.0',
      description: 'SaaS CRM REST API — multi-tenancy, RBAC, JWT auth',
    },
    servers: [{ url: '/api/v1', description: 'V1 API' }],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
    },
    security: [{ bearerAuth: [] }],
  },
  apis: ['./src/modules/**/*.routes.js', './src/docs/*.yaml'],
};

export const swaggerSpec = swaggerJsdoc(options);
