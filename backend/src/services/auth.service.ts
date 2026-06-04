import type { User } from "@prisma/client";
import { prisma } from "@/config/prisma";
import { AppError } from "@/middleware/error.middleware";
import { comparePassword, hashPassword } from "@/utils/hash";
import { signAccessToken } from "@/utils/jwt";

const userProfileSelect = {
  id: true,
  name: true,
  email: true,
  role: true,
  createdAt: true,
  updatedAt: true,
  memberships: {
    select: {
      role: true,
      organization: {
        select: {
          id: true,
          name: true,
          slug: true,
          description: true,
          createdAt: true,
          updatedAt: true,
        },
      },
    },
  },
} as const;

function buildAuthResponse(user: Pick<User, "id" | "email" | "role">) {
  return {
    token: signAccessToken({ userId: user.id, email: user.email, role: user.role }),
    user,
  };
}

export async function registerUser(input: { name: string; email: string; password: string }) {
  const existingUser = await prisma.user.findUnique({ where: { email: input.email } });

  if (existingUser) {
    throw new AppError("An account with this email already exists", 409);
  }

  const user = await prisma.user.create({
    data: {
      name: input.name,
      email: input.email,
      password: await hashPassword(input.password),
    },
    select: userProfileSelect,
  });

  return {
    ...buildAuthResponse(user),
    user,
  };
}

export async function loginUser(input: { email: string; password: string }) {
  const user = await prisma.user.findUnique({
    where: { email: input.email },
    select: {
      id: true,
      name: true,
      email: true,
      password: true,
      role: true,
      createdAt: true,
      updatedAt: true,
    },
  });

  if (!user || !(await comparePassword(input.password, user.password))) {
    throw new AppError("Invalid email or password", 401);
  }

  const { password: _password, ...profile } = user;

  return {
    ...buildAuthResponse(profile),
    user: profile,
  };
}

export async function getCurrentUser(userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: userProfileSelect,
  });

  if (!user) {
    throw new AppError("User not found", 404);
  }

  return user;
}

export async function updateProfile(userId: string, input: { name: string; email: string }) {
  const currentUser = await prisma.user.findUnique({
    where: { id: userId },
    select: { id: true, email: true },
  });

  if (!currentUser) {
    throw new AppError("User not found", 404);
  }

  if (input.email !== currentUser.email) {
    const existingUser = await prisma.user.findUnique({ where: { email: input.email } });
    if (existingUser) {
      throw new AppError("An account with this email already exists", 409);
    }
  }

  return prisma.user.update({
    where: { id: userId },
    data: {
      name: input.name,
      email: input.email,
    },
    select: userProfileSelect,
  });
}

export async function changePassword(userId: string, input: { currentPassword: string; newPassword: string }) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { id: true, password: true },
  });

  if (!user) {
    throw new AppError("User not found", 404);
  }

  if (!(await comparePassword(input.currentPassword, user.password))) {
    throw new AppError("Current password is incorrect", 401);
  }

  const updatedUser = await prisma.user.update({
    where: { id: userId },
    data: {
      password: await hashPassword(input.newPassword),
    },
    select: userProfileSelect,
  });

  return updatedUser;
}