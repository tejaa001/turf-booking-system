/**
 * Middleware to parse nested objects and arrays from multipart/form-data.
 * It transforms fields like 'operatingHours[open_time]' into req.body.operatingHours.open_time
 * and 'amenities' into an array.
 * This should be placed AFTER the multer middleware.
 */
export const processFormData = (req, res, next) => {
  if (!req.body || Object.keys(req.body).length === 0) {
    return next();
  }

  const newBody = {};
  for (const key in req.body) {
    const match = key.match(/(\w+)(?:\[(\w*)\])/);

    if (match) {
      const parentKey = match[1];
      const childKey = match[2];

      if (childKey) {
        // It's an object property, e.g., operatingHours[open_time]
        if (!newBody[parentKey]) {
          newBody[parentKey] = {};
        }
        newBody[parentKey][childKey] = req.body[key];
      }
    } else {
      // It's a regular key or an array key without brackets.
      if (newBody[key]) {
        // If key already exists, convert to array
        newBody[key] = [].concat(newBody[key], req.body[key]);
      } else {
        newBody[key] = req.body[key];
      }
    }
  }

  req.body = newBody;
  next();
};