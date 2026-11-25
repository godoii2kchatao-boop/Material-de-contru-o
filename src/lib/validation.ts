import { z } from 'zod';

const trimmed = (max: number) => z.string().trim().max(max);
const phone = z
  .string()
  .trim()
  .transform((s) => s.replace(/\D/g, ''))
  .refine((d) => d.length >= 10 && d.length <= 11, 'Informe um telefone com DDD.');
const cep = z
  .string()
  .trim()
  .transform((s) => s.replace(/\D/g, ''))
  .refine((d) => d.length === 0 || d.length === 8, 'CEP deve ter 8 dígitos.')
  .transform((d) => (d ? `${d.slice(0, 5)}-${d.slice(5)}` : null));

export const profileEnum = z.enum(['morador', 'reforma', 'pedreiro', 'eletricista', 'encanador', 'pintor', 'mestre_de_obras', 'engenheiro', 'arquiteto', 'construtora', 'manutencao'], 'Escolha uma opção em "Você é".');

export const customerSchema = z.object({
  name: trimmed(80).min(2, 'Informe seu nome.'),
  phone,
  email: z
    .string()
    .trim()
    .max(120)
    .transform((s) => s || null)
    .refine((s) => s === null || z.email().safeParse(s).success, 'E-mail inválido.')
    .nullable()
    .optional()
    .transform((s) => s ?? null),
  profile: profileEnum,
  company: trimmed(80)
    .optional()
    .nullable()
    .transform((s) => s || null),
});

export const deliverySchema = z
  .object({
    mode: z.enum(['entrega', 'retirada']),
    cep: cep.optional().nullable().transform((s) => s ?? null),
    district: trimmed(60)
      .optional()
      .nullable()
      .transform((s) => s || null),
    address: trimmed(140)
      .optional()
      .nullable()
      .transform((s) => s || null),
  })
  .refine((d) => d.mode === 'retirada' || d.cep || d.district, { message: 'Informe o CEP ou o bairro da entrega.', path: ['cep'] });

export const quoteSchema = z.object({
  customer: customerSchema,
  delivery: deliverySchema,
  items: z
    .array(z.object({ productId: z.string().max(40), qty: z.number().positive().max(100000) }))
    .min(1, 'Adicione pelo menos um item.')
    .max(120),
  notes: trimmed(800)
    .optional()
    .nullable()
    .transform((s) => s || null),
  project: z
    .object({ name: trimmed(80).nullable(), recurring: z.boolean(), volume: trimmed(80).nullable() })
    .nullable()
    .optional()
    .transform((p) => p ?? null),
  source: z.enum(['carrinho', 'profissional']).default('carrinho'),
  consent: z.literal(true, 'É preciso concordar com o uso dos dados para responder à solicitação.'),
  website: z.string().max(0).optional(), // honeypot
});

export const listSchema = z.object({
  customer: customerSchema,
  delivery: deliverySchema,
  listText: trimmed(4000)
    .optional()
    .nullable()
    .transform((s) => s || null),
  notes: trimmed(800)
    .optional()
    .nullable()
    .transform((s) => s || null),
  consent: z.literal(true, 'É preciso concordar com o uso dos dados para responder à solicitação.'),
  website: z.string().max(0).optional(),
});

export const freightSchema = z.object({
  cep: cep.optional().nullable(),
  district: trimmed(60).optional().nullable(),
  city: trimmed(60).optional().nullable(),
  pickup: z.boolean().optional(),
  classes: z.array(z.enum(['leve', 'volumoso', 'granel'])).max(200).default([]),
});

export type QuoteInput = z.infer<typeof quoteSchema>;

/** Flatten zod issues into { 'customer.name': 'message' }. */
export function fieldErrors(err: z.ZodError) {
  const out: Record<string, string> = {};
  for (const issue of err.issues) {
    const key = issue.path.join('.') || '_';
    if (!out[key]) out[key] = issue.message;
  }
  return out;
}
