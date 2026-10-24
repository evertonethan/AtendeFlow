import { z } from 'zod';
export const registerSchema = z.object({
    name: z.string().trim().min(2).max(80),
    email: z.string().trim().email().max(254).transform((value) => value.toLowerCase()),
    password: z.string().min(10).max(72),
});
export const loginSchema = z.object({
    email: z.string().trim().email().max(254).transform((value) => value.toLowerCase()),
    password: z.string().min(1).max(72),
});
export const createRequestSchema = z.object({
    title: z.string().trim().min(4).max(120),
    description: z.string().trim().min(8).max(2000),
    category: z.enum(['Suporte técnico', 'Acesso e conta', 'Cadastro', 'Conteúdo', 'Financeiro', 'Outro']),
    priority: z.enum(['Baixa', 'Média', 'Alta']).default('Média'),
});
export const updateRequestSchema = z.object({
    status: z.enum(['Aberta', 'Em andamento', 'Concluída']).optional(),
    priority: z.enum(['Baixa', 'Média', 'Alta']).optional(),
}).refine((value) => Object.keys(value).length > 0, 'Informe ao menos um campo para atualizar');
