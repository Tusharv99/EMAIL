import { prisma } from './prisma.service';
import { EmailStatus } from '@prisma/client';

export interface ScheduleEmailInput {
  subject: string;
  body: string;
  recipients: string[];
  startTime: Date;
  delayMs: number;
  hourlyLimit: number;
  senderId: string;
  userId: string;
}

export interface PaginationParams {
  page?: number;
  limit?: number;
}

export class EmailService {
  async scheduleEmail(input: ScheduleEmailInput) {
    const { 
      subject, 
      body, 
      recipients, 
      startTime, 
      delayMs, 
      hourlyLimit, 
      senderId, 
      userId 
    } = input;

    // Verify sender belongs to user
    const sender = await prisma.sender.findFirst({
      where: {
        id: senderId,
        userId: userId,
        isActive: true
      }
    });

    if (!sender) {
      throw new Error('Sender not found or not active');
    }

    // Create campaign
    const campaign = await prisma.campaign.create({
      data: {
        name: subject.substring(0, 50), // Truncate for campaign name
        description: `Campaign for ${recipients.length} recipients`,
        userId: userId
      }
    });

    // Create email records
    const emails = [];
    for (let i = 0; i < recipients.length; i++) {
      const scheduledAt = new Date(startTime.getTime() + (i * delayMs));
      
      const email = await prisma.email.create({
        data: {
          subject: subject,
          body: body,
          recipient: recipients[i],
          senderId: senderId,
          campaignId: campaign.id,
          status: EmailStatus.SCHEDULED,
          scheduledAt: scheduledAt,
          retryCount: 0
        }
      });
      emails.push(email);
    }

    return {
      campaign,
      emails,
      totalRecipients: recipients.length
    };
  }

  async getScheduledEmails(userId: string, pagination: PaginationParams = {}) {
    const page = pagination.page || 1;
    const limit = pagination.limit || 10;
    const skip = (page - 1) * limit;

    const [emails, total] = await Promise.all([
      prisma.email.findMany({
        where: {
          campaign: {
            userId: userId
          },
          status: EmailStatus.SCHEDULED,
          scheduledAt: {
            gte: new Date() // Only future emails
          }
        },
        include: {
          sender: true,
          campaign: {
            select: {
              name: true,
              id: true
            }
          }
        },
        orderBy: {
          scheduledAt: 'asc'
        },
        skip,
        take: limit
      }),
      prisma.email.count({
        where: {
          campaign: {
            userId: userId
          },
          status: EmailStatus.SCHEDULED,
          scheduledAt: {
            gte: new Date()
          }
        }
      })
    ]);

    return {
      emails,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    };
  }

  async getSentEmails(userId: string, pagination: PaginationParams = {}) {
    const page = pagination.page || 1;
    const limit = pagination.limit || 10;
    const skip = (page - 1) * limit;

    const [emails, total] = await Promise.all([
      prisma.email.findMany({
        where: {
          campaign: {
            userId: userId
          },
          OR: [
            { status: EmailStatus.SENT },
            { status: EmailStatus.FAILED }
          ]
        },
        include: {
          sender: true,
          campaign: {
            select: {
              name: true,
              id: true
            }
          }
        },
        orderBy: {
          sentAt: 'desc'
        },
        skip,
        take: limit
      }),
      prisma.email.count({
        where: {
          campaign: {
            userId: userId
          },
          OR: [
            { status: EmailStatus.SENT },
            { status: EmailStatus.FAILED }
          ]
        }
      })
    ]);

    return {
      emails,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    };
  }

  async getEmailById(emailId: string, userId: string) {
    const email = await prisma.email.findFirst({
      where: {
        id: emailId,
        campaign: {
          userId: userId
        }
      },
      include: {
        sender: true,
        campaign: true
      }
    });

    if (!email) {
      throw new Error('Email not found');
    }

    return email;
  }

  async cancelScheduledEmail(emailId: string, userId: string) {
    const email = await prisma.email.findFirst({
      where: {
        id: emailId,
        campaign: {
          userId: userId
        },
        status: EmailStatus.SCHEDULED
      }
    });

    if (!email) {
      throw new Error('Email not found or already processed');
    }

    // Update status to FAILED with cancellation message
    return prisma.email.update({
      where: { id: emailId },
      data: {
        status: EmailStatus.FAILED,
        errorMessage: 'Cancelled by user',
        failedAt: new Date()
      }
    });
  }
}

export const emailService = new EmailService();