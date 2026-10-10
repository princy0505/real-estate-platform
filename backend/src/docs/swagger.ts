import swaggerJSDoc from 'swagger-jsdoc';

export const swaggerSpec = swaggerJSDoc({
  definition: {
    openapi: '3.0.3',
    info: {
      title: 'Real Estate Listing API',
      version: '1.0.0',
      description: 'API for a scalable real-estate listing platform.'
    },
    servers: [{ url: 'http://localhost:4000' }],
    components: {
      securitySchemes: {
        bearerAuth: { type: 'http', scheme: 'bearer', bearerFormat: 'JWT' }
      }
    }
  },
  apis: []
});

// Route-level schemas are documented explicitly below.
Object.assign(swaggerSpec, {
  paths: {
    '/api/auth/register': {
      post: {
        summary: 'Register',
        requestBody: { required: true, content: { 'application/json': {
          schema: { type: 'object', required: ['name','email','password'],
            properties: { name:{type:'string'}, email:{type:'string'}, password:{type:'string'} }
          }
        }}},
        responses: { '201': { description: 'Registered' }, '409': { description: 'Email exists' } }
      }
    },
    '/api/auth/login': {
      post: {
        summary: 'Login',
        requestBody: { required: true, content: { 'application/json': {
          schema: { type: 'object', required: ['email','password'],
            properties: { email:{type:'string'}, password:{type:'string'} }
          }
        }}},
        responses: { '200': { description: 'Logged in' } }
      }
    },
    '/api/properties': {
      get: {
        summary: 'Search and filter properties',
        parameters: [
          {name:'search',in:'query',schema:{type:'string'}},
          {name:'city',in:'query',schema:{type:'string'}},
          {name:'minPrice',in:'query',schema:{type:'number'}},
          {name:'maxPrice',in:'query',schema:{type:'number'}},
          {name:'propertyType',in:'query',schema:{type:'string'}},
          {name:'bedrooms',in:'query',schema:{type:'integer'}},
          {name:'sort',in:'query',schema:{type:'string',enum:['newest','price_asc','price_desc']}},
          {name:'limit',in:'query',schema:{type:'integer',maximum:50}},
          {name:'cursor',in:'query',schema:{type:'string'}}
        ],
        responses: {'200':{description:'Property list'}}
      },
      post: {
        summary: 'Create property',
        security: [{bearerAuth:[]}],
        responses: {'201':{description:'Created'}}
      }
    },
    '/api/properties/{id}': {
      get: {summary:'Get property details', parameters:[{name:'id',in:'path',required:true,schema:{type:'string',format:'uuid'}}], responses:{'200':{description:'Property'}}},
      put: {summary:'Update owned property',security:[{bearerAuth:[]}],responses:{'200':{description:'Updated'}}},
      delete: {summary:'Delete owned property',security:[{bearerAuth:[]}],responses:{'204':{description:'Deleted'}}}
    },
    '/api/properties/{id}/similar': {
      get: {summary:'Get similar properties',parameters:[{name:'id',in:'path',required:true,schema:{type:'string',format:'uuid'}}],responses:{'200':{description:'Similar properties'}}}
    },
    '/api/inquiries/{propertyId}': {
      post: {summary:'Send inquiry',security:[{bearerAuth:[]}],responses:{'201':{description:'Inquiry created'},'409':{description:'Duplicate inquiry'}}}
    }
  }
});
