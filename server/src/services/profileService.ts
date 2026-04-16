import prisma from '../config/prisma';

export async function getProfile(userId: string) {
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
  if (!user) throw { status: 404, message: 'User not found' };
  return user;
}

export async function updateProfile(userId: string, displayName: string) {
  const user = await prisma.user.update({
    where: { id: userId },
    data: { displayName },
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
  return user;
}
