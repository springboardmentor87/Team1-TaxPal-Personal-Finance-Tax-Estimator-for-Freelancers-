const { z } = require('zod');

const registerSchema = z.object({
  body: z
    .object({
      fullName: z.string({ required_error: 'Full name is required' }).trim().min(1, 'Full name is required'),
      username: z
        .string({ required_error: 'Username is required' })
        .trim()
        .min(3, 'Username must be at least 3 characters'),
      email: z.string({ required_error: 'Email is required' }).email('Invalid email address'),
      password: z
        .string({ required_error: 'Password is required' })
        .min(6, 'Password must be at least 6 characters'),
      confirmPassword: z.string().optional(),
      phone: z.string().trim().optional(),
      country: z.string().trim().default('US'),
      state: z.string().trim().optional(),
      city: z.string().trim().optional(),
      role: z.string().default('freelancer'),
    }),
});

const loginSchema = z.object({
  body: z.object({
    email: z.string({ required_error: 'Username or Email is required' }).trim().min(1, 'Username or Email is required'),
    password: z.string({ required_error: 'Password is required' }).min(1, 'Password is required'),
  }),
});

const refreshTokenSchema = z.object({
  body: z.object({
    refreshToken: z.string().optional(),
  }),
});

const updateProfileSchema = z.object({
  body: z.object({
    fullName: z.string().trim().min(1).optional(),
    username: z.string().trim().min(3).optional(),
    email: z.string().email().optional(),
    phone: z.string().trim().optional(),
    country: z.string().trim().min(1).optional(),
    state: z.string().trim().optional(),
    city: z.string().trim().optional(),
    avatar: z.string().optional(),
    autoCategorizeEnabled: z.boolean().optional(),
    categoryMappings: z.any().optional(),
  }),
});

module.exports = {
  registerSchema,
  loginSchema,
  refreshTokenSchema,
  updateProfileSchema,
};
