import { z } from "zod";

/**
 * Treat empty-string / null query params as "not provided".
 * Clients (Postman, HTML forms) often send `?mode=&from=` — without this an optional
 * enum/date/number field would reject the empty string instead of falling back to its
 * default/undefined. Wrap the OUTERMOST schema so "" becomes undefined before any
 * .default()/.optional() handling runs.
 */
export const blankToUndefined = (schema) =>
  z.preprocess((v) => (v === "" || v === null ? undefined : v), schema);
