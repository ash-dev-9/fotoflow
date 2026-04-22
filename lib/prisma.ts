import { PrismaClient } from "../prisma/generated/client";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

// Create a proxy that defers initialization until the first method call
export const prisma = new Proxy({} as PrismaClient, {
  get: (target, prop) => {
    if (!globalForPrisma.prisma) {
      console.log("Prisma: Initializing client (Lazy Load)");
      globalForPrisma.prisma = new PrismaClient({
        log: ["error"],
      });
    }
    
    const value = (globalForPrisma.prisma as any)[prop];
    return typeof value === 'function' ? value.bind(globalForPrisma.prisma) : value;
  }
});

if (process.env.NODE_ENV !== "production") {
  // Still maintain the singleton in dev
}
