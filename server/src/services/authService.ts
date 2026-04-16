import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import prisma from '../config/prisma';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const USERNAME_REGEX = /^[a-zA-Z0-9]{3,20}$/;
const PASSWORD_REGEX = /^(?=.*[a-zA-Z])(?=.*\d).{8,}$/;

export async function register(email: string, username: string, password: string) {
  if (!email || !username || !password) {
    throw { status: 400, message: 'All fields are required' };
  }
  if (!EMAIL_REGEX.test(email)) {
    throw { status: 400, message: 'Invalid email format' };
  }
  if (!USERNAME_REGEX.test(username)) {
    throw { status: 400, message: 'Username must be 3-20 alphanumeric characters' };
  }
  if (!PASSWORD_REGEX.test(password)) {
    throw { status: 400, message: 'Password must be at least 8 characters with at least one letter and one number' };
  }

  const existing = await prisma.user.findFirst({
    where: { OR: [{ email }, { username }] },
  });
  if (existing) {
    throw { status: 409, message: 'Username or email already exists' };
  }

  const passwordHash = await bcrypt.hash(password, 10);
  await prisma.user.create({
    data: { email, username, passwordHash },
  });

  return { message: 'Account created' };
}

export async function login(username: string, password: string) {
  if (!username || !password) {
    throw { status: 400, message: 'All fields are required' };
  }

  const user = await prisma.user.findUnique({ where: { username } });
  if (!user) {
    throw { status: 401, message: 'Invalid credentials' };
  }

  const valid = await bcrypt.compare(password, user.passwordHash);
  if (!valid) {
    throw { status: 401, message: 'Invalid credentials' };
  }

  const token = jwt.sign(
    { userId: user.id, username: user.username },
    process.env.JWT_SECRET!,
    { expiresIn: '24h' }
  );

  return { message: 'Login successful', token };
}

export async function getMe(userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      email: true,
      username: true,
      displayName: true,
      diningDollarBalance: true,
      swipeBalance: true,
      createdAt: true,
    },
  });
  if (!user) {
    throw { status: 404, message: 'User not found' };
  }
  return user;
}
