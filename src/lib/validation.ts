import { z } from "zod";

export const cardSchema = z.object({
  fullName: z.string().min(2, "Full name is required"),
  company: z.string().optional().nullable(),
  title: z.string().optional().nullable(),
  phone: z.string().min(5, "Phone is required"),
  email: z.string().email("Invalid email").optional().nullable(),
  website: z.string().url("Invalid URL").optional().nullable().or(z.literal("")),
  whatsapp: z.string().optional().nullable(),
  telegram: z.string().optional().nullable(),
  model: z.enum(["minimal", "wave", "premium"]),
  color: z.enum(["turquoise", "navy", "graphite"]),
  photoDataUrl: z.string().optional().nullable(),
});

export const orderSchema = z.object({
  card: cardSchema,
  customerFullName: z.string().min(2, "Name is required"),
  customerPhone: z.string().min(5, "Phone is required"),
  customerEmail: z.string().email("Invalid email").optional().nullable().or(z.literal("")),
  shippingCountry: z.string().min(2, "Country is required"),
  shippingCity: z.string().min(2, "City is required"),
  shippingAddress1: z.string().min(5, "Address is required"),
  shippingAddress2: z.string().optional().nullable(),
  shippingPostalCode: z.string().optional().nullable(),
  notes: z.string().optional().nullable(),
  paymentMethodId: z.string().min(1, "Payment method is required"),
});

export const adminSettingsSchema = z.object({
  currency: z.string().min(1),
  basePriceRub: z.number().int().positive(),
});

export const paymentMethodSchema = z.object({
  name: z.string().min(1, "Name is required"),
  type: z.enum(["manual", "bank", "card", "crypto"]),
  active: z.boolean().default(true),
  instructions: z.string().optional().nullable(),
  sortOrder: z.number().int().default(0),
});

export const loginSchema = z.object({
  email: z.string().email("Invalid email"),
  password: z.string().min(1, "Password is required"),
});

export const orderStatusSchema = z.object({
  status: z.enum([
    "NEW",
    "PAID",
    "IN_PRODUCTION",
    "SHIPPED",
    "COMPLETED",
    "CANCELED",
  ]),
});

export type CardInput = z.infer<typeof cardSchema>;
export type OrderInput = z.infer<typeof orderSchema>;
