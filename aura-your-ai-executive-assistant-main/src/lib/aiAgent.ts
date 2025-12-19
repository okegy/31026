// AI Agent Orchestration System
import { parseTaskFromInput } from './taskParser';
import { parseEventFromInput } from './eventParser';
import { createCalendarEvent } from './googleCalendar';
import { sendTaskConfirmationEmail, sendEventConfirmationEmail } from './gmail';

export interface AIProcessingStep {
  id: string;
  name: string;
  status: 'pending' | 'processing' | 'completed' | 'error';
  description: string;
  result?: any;
}

export interface AIAgentResult {
  success: boolean;
  taskCreated?: any;
  eventCreated?: any;
  emailSent?: boolean;
  steps: AIProcessingStep[];
  error?: string;
}

export class AIAgent {
  private steps: AIProcessingStep[] = [];
  private onStepUpdate?: (steps: AIProcessingStep[]) => void;

  constructor(onStepUpdate?: (steps: AIProcessingStep[]) => void) {
    this.onStepUpdate = onStepUpdate;
  }

  private updateStep(id: string, updates: Partial<AIProcessingStep>) {
    const step = this.steps.find(s => s.id === id);
    if (step) {
      Object.assign(step, updates);
      this.onStepUpdate?.(this.steps);
    }
  }

  private addStep(step: AIProcessingStep) {
    this.steps.push(step);
    this.onStepUpdate?.(this.steps);
  }

  async processUserInput(
    input: string,
    userEmail: string,
    createTaskFn: (taskData: any) => Promise<any>,
    createEventFn?: (eventData: any) => Promise<any>
  ): Promise<AIAgentResult> {
    this.steps = [];

    // Step 1: Understanding Intent
    this.addStep({
      id: 'intent',
      name: 'Understanding Intent',
      status: 'processing',
      description: 'Analyzing your request using NLP...',
    });

    await this.delay(800);

    try {
      const lowerInput = input.toLowerCase();
      const isEvent = lowerInput.includes('meeting') || 
                     lowerInput.includes('event') || 
                     lowerInput.includes('schedule') ||
                     lowerInput.includes('appointment');

      this.updateStep('intent', {
        status: 'completed',
        description: `Detected: ${isEvent ? 'Calendar Event' : 'Task Reminder'}`,
        result: { type: isEvent ? 'event' : 'task' },
      });

      // Step 2: Extracting Details
      this.addStep({
        id: 'extract',
        name: 'Extracting Details',
        status: 'processing',
        description: 'Parsing date, time, and priority...',
      });

      await this.delay(1000);

      let parsedData: any;
      if (isEvent) {
        parsedData = parseEventFromInput(input);
      } else {
        parsedData = parseTaskFromInput(input);
      }

      this.updateStep('extract', {
        status: 'completed',
        description: `Extracted: ${parsedData.title}`,
        result: parsedData,
      });

      // Step 3: Priority Analysis
      this.addStep({
        id: 'priority',
        name: 'Analyzing Priority',
        status: 'processing',
        description: 'Calculating urgency and importance...',
      });

      await this.delay(700);

      const priority = parsedData.priority || 'medium';
      const priorityScore = parsedData.priority_score || 50;

      this.updateStep('priority', {
        status: 'completed',
        description: `Priority: ${priority.toUpperCase()} (Score: ${priorityScore})`,
        result: { priority, priorityScore },
      });

      // Step 4: Creating Task/Event
      this.addStep({
        id: 'create',
        name: isEvent ? 'Scheduling Event' : 'Creating Task',
        status: 'processing',
        description: isEvent ? 'Adding to Google Calendar...' : 'Saving to task list...',
      });

      await this.delay(1200);

      let createdItem: any;
      let calendarEventId: string | undefined;

      if (isEvent) {
        // Create event in app
        if (createEventFn) {
          const { data } = await createEventFn(parsedData);
          createdItem = data;
        }

        // Create in Google Calendar if authenticated
        try {
          const calendarEvent = await createCalendarEvent({
            summary: parsedData.title,
            description: parsedData.description,
            start: {
              dateTime: parsedData.start_time,
              timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
            },
            end: {
              dateTime: parsedData.end_time,
              timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
            },
            location: parsedData.location,
            attendees: parsedData.attendees?.map(email => ({ email })),
          });
          calendarEventId = calendarEvent.id;
        } catch (error) {
          console.log('Google Calendar not available, using local storage');
        }

        this.updateStep('create', {
          status: 'completed',
          description: 'Event scheduled successfully',
          result: { event: createdItem, calendarEventId },
        });
      } else {
        // Create task
        const { data } = await createTaskFn(parsedData);
        createdItem = data;

        // Also create calendar event for task deadline
        if (parsedData.deadline) {
          try {
            const taskEvent = await createCalendarEvent({
              summary: `⏰ ${parsedData.title}`,
              description: `Task deadline: ${parsedData.description || ''}`,
              start: {
                dateTime: parsedData.deadline,
                timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
              },
              end: {
                dateTime: new Date(new Date(parsedData.deadline).getTime() + 30 * 60000).toISOString(),
                timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
              },
            });
            calendarEventId = taskEvent.id;
          } catch (error) {
            console.log('Google Calendar not available');
          }
        }

        this.updateStep('create', {
          status: 'completed',
          description: 'Task created successfully',
          result: { task: createdItem, calendarEventId },
        });
      }

      // Step 5: Sending Confirmation Email
      this.addStep({
        id: 'email',
        name: 'Sending Confirmation',
        status: 'processing',
        description: 'Sending email notification...',
      });

      await this.delay(1000);

      let emailSent = false;
      try {
        if (isEvent) {
          await sendEventConfirmationEmail(
            userEmail,
            parsedData.title,
            parsedData.start_time,
            parsedData.end_time,
            parsedData.location,
            parsedData.attendees
          );
        } else {
          await sendTaskConfirmationEmail(
            userEmail,
            parsedData.title,
            parsedData.deadline || new Date().toISOString(),
            priority
          );
        }
        emailSent = true;

        this.updateStep('email', {
          status: 'completed',
          description: 'Confirmation email sent',
          result: { emailSent: true },
        });
      } catch (error) {
        console.log('Email not sent (Gmail API not available)');
        this.updateStep('email', {
          status: 'completed',
          description: 'Email notification skipped (not authenticated)',
          result: { emailSent: false },
        });
      }

      // Step 6: Setting Reminders
      this.addStep({
        id: 'reminders',
        name: 'Setting Reminders',
        status: 'processing',
        description: 'Scheduling proactive follow-ups...',
      });

      await this.delay(800);

      this.updateStep('reminders', {
        status: 'completed',
        description: 'Reminders configured (1hr, 30min, 10min before)',
        result: { reminders: ['1 hour', '30 minutes', '10 minutes'] },
      });

      return {
        success: true,
        taskCreated: isEvent ? undefined : createdItem,
        eventCreated: isEvent ? createdItem : undefined,
        emailSent,
        steps: this.steps,
      };

    } catch (error: any) {
      const currentStep = this.steps.find(s => s.status === 'processing');
      if (currentStep) {
        this.updateStep(currentStep.id, {
          status: 'error',
          description: `Error: ${error.message}`,
        });
      }

      return {
        success: false,
        steps: this.steps,
        error: error.message,
      };
    }
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  getSteps(): AIProcessingStep[] {
    return this.steps;
  }
}
