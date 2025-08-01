import Joi from 'joi';

export const search = Joi.object({
  name: Joi.string().min(2),
  location: Joi.string().min(2),
  priceMin: Joi.number().positive(),
  priceMax: Joi.number().positive().greater(Joi.ref('priceMin')),
  // Allow amenities to be a comma-separated string and transform it into an array.
  // This makes the API more flexible for query parameters.
  amenities: Joi.string().custom((value, helpers) => {
    return value.split(',').map(item => item.trim()).filter(Boolean);
  }),
});

export const checkAvailability = Joi.object({
  date: Joi.date().iso().required(),
});

export const createTurfSchema = Joi.object({
  turfName: Joi.string().required().messages({
    'string.empty': 'Turf name is required',
    'any.required': 'Turf name is required'
  }),
  description: Joi.string().required().messages({
    'string.empty': 'Description is required',
    'any.required': 'Description is required'
  }),
  address: Joi.string().required().messages({
    'string.empty': 'Address is required',
    'any.required': 'Address is required'
  }),
  pricePerHour: Joi.number().positive().required().messages({
    'number.base': 'Price must be a number',
    'number.positive': 'Price must be a positive number',
    'any.required': 'Price is required'
  }),
  contactDetails: Joi.string().required().messages({
    'string.empty': 'Contact details are required',
    'any.required': 'Contact details are required'
  }),
  email: Joi.string().email().required().messages({
    'string.email': 'Please provide a valid email',
    'string.empty': 'Email is required',
    'any.required': 'Email is required'
  }),
  images: Joi.array().items(Joi.string().uri()).optional(),
  amenities: Joi.array().items(Joi.string()).optional(),
  operatingHours: Joi.object({
    open_time: Joi.string().pattern(/^\d{2}:\d{2}$/).required().messages({
      'string.empty': 'Opening time is required',
      'any.required': 'Opening time is required'
    }),
    close_time: Joi.string().pattern(/^\d{2}:\d{2}$/).required().messages({
      'string.empty': 'Closing time is required',
      'any.required': 'Closing time is required'
    })
  }).required().messages({
    'object.base': 'Operating hours are required',
    'any.required': 'Operating hours are required'
  })
});

export const updateTurfSchema = createTurfSchema.fork(
  ['turfName', 'description', 'address', 'pricePerHour', 'contactDetails', 'email', 'operatingHours'],
  (schema) => schema.optional()
).append({
  imagesToDelete: Joi.array().items(Joi.string()).optional()
}).min(1);