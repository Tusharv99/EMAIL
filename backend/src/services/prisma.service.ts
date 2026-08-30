import { PrismaClient } from '@prisma/client'

// Create a singleton PrismaClient instance
class PrismaService {
  private static instance: PrismaClient

  static getInstance(): PrismaClient {
    if (!PrismaService.instance) {
      PrismaService.instance = new PrismaClient({
        log: process.env.NODE_ENV === 'development' 
          ? ['query', 'info', 'warn', 'error'] 
          : ['error']
      })
    }
    return PrismaService.instance
  }
}

export const prisma = PrismaService.getInstance()