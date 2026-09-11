import { z } from 'zod';

export const emailSchema = z.string().email('Valid email is required');
export const passwordSchema = z.string().min(8, 'Password must be at least 8 characters');
export const nameSchema = z.string().min(2, 'Name is required');
export const phoneSchema = z.string().min(10, 'Valid phone number is required');

export const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, 'Password is required'),
});

export const registerSchema = z.object({
  firstName: nameSchema,
  lastName: nameSchema,
  email: emailSchema,
  phone: phoneSchema,
  password: passwordSchema,
});

export const addressSchema = z.object({
  street: z.string().min(1, 'Street address is required'),
  city: z.string().min(1, 'City is required'),
  postalCode: z.string().min(1, 'Postal code is required'),
  province: z.string().min(1, 'Province is required'),
  country: z.string().min(1, 'Country is required'),
});

export const supportTicketSchema = z.object({
  subject: z.string().min(3, 'Subject must be at least 3 characters'),
  category: z.string().min(1, 'Category is required'),
  priority: z.string().min(1, 'Priority is required'),
  message: z.string().min(10, 'Message must be at least 10 characters'),
  customerName: z.string().min(2, 'Name is required'),
  customerEmail: emailSchema,
});

export function validateSchema(schema, data) {
  const result = schema.safeParse(data);
  if (result.success) {
    return { success: true, data: result.data };
  }
  const errors = {};
  for (const issue of result.error.issues) {
    const path = issue.path.join('.');
    errors[path] = issue.message;
  }
  return { success: false, errors };
}
