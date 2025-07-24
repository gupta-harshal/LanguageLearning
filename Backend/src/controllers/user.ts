// controllers/auth.controller.ts
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import { Request, Response } from 'express';

const prisma = new PrismaClient();

export const registerUser = async (req: Request, res: Response) => {
  const { email, password } = req.body;

  try {
    // Check if user already exists
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create the user
    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
      },
    });

    res.status(201).json({ message: 'User created successfully', userId: user.id });
  } catch (err) {
    console.error('Error creating user:', err);
    res.status(500).json({ message: 'Internal server error' });
  }
};
