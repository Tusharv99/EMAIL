import { Router, Request, Response } from 'express'
import { prisma } from '../services/prisma.service'

const router = Router()

// Test database connection
router.get('/db-test', async (req: Request, res: Response) => {
  try {
    // Try to query the database
    const userCount = await prisma.user.count()
    
    res.json({
      status: 'success',
      message: 'Database connection successful!',
      data: {
        userCount,
        tables: ['users', 'campaigns', 'senders', 'emails', 'slack_connections'],
        timestamp: new Date().toISOString()
      }
    })
  } catch (error) {
    console.error('Database test failed:', error)
    res.status(500).json({
      status: 'error',
      message: 'Database connection failed',
      error: error instanceof Error ? error.message : 'Unknown error'
    })
  }
})

// Create a test user
router.post('/test-user', async (req: Request, res: Response) => {
  try {
    const testUser = await prisma.user.create({
      data: {
        email: 'test@example.com',
        name: 'Test User',
        googleId: 'test_google_id_123'
      }
    })

    res.json({
      status: 'success',
      message: 'Test user created!',
      data: testUser
    })
  } catch (error) {
    console.error('Failed to create test user:', error)
    res.status(500).json({
      status: 'error',
      message: 'Failed to create test user',
      error: error instanceof Error ? error.message : 'Unknown error'
    })
  }
})

export default router