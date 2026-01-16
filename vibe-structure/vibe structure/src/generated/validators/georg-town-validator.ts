import { z } from 'zod';

/**
 * Zod schema for GeorgTown validation
 */
export const GeorgTownSchema = z.object({
  id: z.string().uuid(),
  townName: z.string().max(850).min(1, "Town Name is required"),
  country: z.string().max(100).optional(),
  population: z.number().int().min(-2147483648).max(2147483647).optional(),
  state: z.string().max(100).optional(),
});

/**
 * Schema for creating a new GeorgTown (omits system-generated ID)
 */
export const CreateGeorgTownSchema = GeorgTownSchema.omit({ id: true });

/**
 * Schema for updating an existing GeorgTown
 * Includes id to identify the record to update
 * Required fields must be included in update operations: townName
 */
export const UpdateGeorgTownSchema = GeorgTownSchema;

export type GeorgTownInput = z.infer<typeof GeorgTownSchema>;
export type CreateGeorgTownInput = z.infer<typeof CreateGeorgTownSchema>;
export type UpdateGeorgTownInput = z.infer<typeof UpdateGeorgTownSchema>;