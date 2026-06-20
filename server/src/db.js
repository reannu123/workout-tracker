// Single shared Prisma client for the server process.
import { PrismaClient } from "@prisma/client";

export const prisma = new PrismaClient();
