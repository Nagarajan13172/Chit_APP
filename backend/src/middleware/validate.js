/**
 * Validates req[part] against a Zod schema and replaces it with the parsed result.
 * Throws ZodError on failure (handled centrally by errorHandler).
 */
export const validate =
  (schema, part = "body") =>
  (req, res, next) => {
    const result = schema.parse(req[part]);
    req[part] = result;
    next();
  };
