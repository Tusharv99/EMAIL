import { Request, Response } from 'express';
import { emailService } from '../services/email.service';

export class EmailController {
  // Handle OPTIONS preflight requests
  async options(req: Request, res: Response) {
    res.setHeader('Access-Control-Allow-Origin', process.env.CLIENT_URL || 'http://localhost:5173');
    res.setHeader('Access-Control-Allow-Credentials', 'true');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, Cookie');
    res.sendStatus(200);
  }

  async scheduleEmail(req: Request, res: Response) {
    try {
      const userId = req.user!.id;
      const { 
        subject, 
        body, 
        recipients, 
        startTime, 
        delayMs, 
        hourlyLimit, 
        senderId 
      } = req.body;

      console.log('📧 Scheduling email request:', {
        userId,
        subject,
        recipientsCount: recipients?.length,
        senderId
      });

      // Validate required fields
      if (!subject || !body || !recipients || !startTime || !delayMs || !hourlyLimit || !senderId) {
        return res.status(400).json({
          status: 'error',
          message: 'Missing required fields'
        });
      }

      // Validate data types
      if (!Array.isArray(recipients) || recipients.length === 0) {
        return res.status(400).json({
          status: 'error',
          message: 'Recipients must be a non-empty array'
        });
      }

      if (typeof subject !== 'string' || subject.trim().length === 0) {
        return res.status(400).json({
          status: 'error',
          message: 'Subject is required'
        });
      }

      if (typeof body !== 'string' || body.trim().length === 0) {
        return res.status(400).json({
          status: 'error',
          message: 'Body is required'
        });
      }

      const startTimeDate = new Date(startTime);
      if (isNaN(startTimeDate.getTime())) {
        return res.status(400).json({
          status: 'error',
          message: 'Invalid start time'
        });
      }

      if (startTimeDate <= new Date()) {
        return res.status(400).json({
          status: 'error',
          message: 'Start time must be in the future'
        });
      }

      if (typeof delayMs !== 'number' || delayMs < 1000) {
        return res.status(400).json({
          status: 'error',
          message: 'Delay must be at least 1000ms'
        });
      }

      if (typeof hourlyLimit !== 'number' || hourlyLimit < 1) {
        return res.status(400).json({
          status: 'error',
          message: 'Hourly limit must be at least 1'
        });
      }

      // Validate email addresses
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      const invalidEmails = recipients.filter(email => !emailRegex.test(email));
      if (invalidEmails.length > 0) {
        return res.status(400).json({
          status: 'error',
          message: 'Invalid email addresses found',
          invalidEmails
        });
      }

      // Schedule emails
      const result = await emailService.scheduleEmail({
        subject: subject.trim(),
        body: body.trim(),
        recipients,
        startTime: startTimeDate,
        delayMs,
        hourlyLimit,
        senderId,
        userId
      });

      return res.status(201).json({
        status: 'success',
        message: `Scheduled ${result.totalRecipients} emails`,
        data: {
          campaignId: result.campaign.id,
          totalRecipients: result.totalRecipients,
          emails: result.emails
        }
      });

    } catch (error) {
      console.error('Schedule email error:', error);
      return res.status(500).json({
        status: 'error',
        message: error instanceof Error ? error.message : 'Failed to schedule emails'
      });
    }
  }

  async getScheduledEmails(req: Request, res: Response) {
    try {
      const userId = req.user!.id;
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;

      const result = await emailService.getScheduledEmails(userId, { page, limit });

      return res.json({
        status: 'success',
        data: result
      });

    } catch (error) {
      console.error('Get scheduled emails error:', error);
      return res.status(500).json({
        status: 'error',
        message: 'Failed to fetch scheduled emails'
      });
    }
  }

  async getSentEmails(req: Request, res: Response) {
    try {
      const userId = req.user!.id;
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;

      const result = await emailService.getSentEmails(userId, { page, limit });

      return res.json({
        status: 'success',
        data: result
      });

    } catch (error) {
      console.error('Get sent emails error:', error);
      return res.status(500).json({
        status: 'error',
        message: 'Failed to fetch sent emails'
      });
    }
  }

  async cancelEmail(req: Request, res: Response) {
    try {
      const userId = req.user!.id;
      const { emailId } = req.params;

      if (!emailId) {
        return res.status(400).json({
          status: 'error',
          message: 'Email ID is required'
        });
      }

      const result = await emailService.cancelScheduledEmail(emailId, userId);

      return res.json({
        status: 'success',
        message: 'Email cancelled successfully',
        data: result
      });

    } catch (error) {
      console.error('Cancel email error:', error);
      return res.status(500).json({
        status: 'error',
        message: error instanceof Error ? error.message : 'Failed to cancel email'
      });
    }
  }
}

export const emailController = new EmailController();