import { addDays, addHours, subDays, subHours, startOfDay, setHours } from 'date-fns';

export interface DemoTask {
  id: string;
  title: string;
  description: string | null;
  deadline: string | null;
  priority: 'low' | 'medium' | 'high';
  priority_score: number;
  priority_reason: string | null;
  status: 'pending' | 'in_progress' | 'completed' | 'missed';
  required_action: 'email' | 'meeting' | 'reminder' | 'call' | null;
  action_target: string | null;
  created_at: string;
}

export interface DemoEvent {
  id: string;
  title: string;
  description: string | null;
  start_time: string;
  end_time: string;
  attendees: string[] | null;
  location: string | null;
  created_at: string;
}

export interface DemoEmail {
  id: string;
  task_id: string | null;
  recipient: string;
  subject: string;
  body: string | null;
  status: 'pending' | 'sent' | 'followed_up' | 'failed';
  sent_at: string | null;
  follow_up_count: number;
  created_at: string;
}

export interface DemoAgentLog {
  id: string;
  action_type: 'prioritized' | 'rescheduled' | 'email_sent' | 'email_followed_up' | 'task_created' | 'task_completed' | 'suggestion' | 'conflict_resolved';
  description: string;
  related_task_id: string | null;
  related_event_id: string | null;
  related_email_id: string | null;
  ai_reasoning: string | null;
  created_at: string;
}

const now = new Date();

export const demoTasks: DemoTask[] = [
  {
    id: 'demo-task-1',
    title: 'Submit quarterly report',
    description: 'Complete and submit Q4 financial report to the finance team',
    deadline: addHours(now, 3).toISOString(),
    priority: 'high',
    priority_score: 95,
    priority_reason: 'Due in 3 hours - critical deadline',
    status: 'in_progress',
    required_action: 'email',
    action_target: 'finance@company.com',
    created_at: subDays(now, 2).toISOString(),
  },
  {
    id: 'demo-task-2',
    title: 'Prepare presentation for client meeting',
    description: 'Create slides for the product demo with Acme Corp',
    deadline: addDays(now, 1).toISOString(),
    priority: 'high',
    priority_score: 85,
    priority_reason: 'Client meeting tomorrow - high impact',
    status: 'pending',
    required_action: 'meeting',
    action_target: 'sarah@acmecorp.com',
    created_at: subDays(now, 1).toISOString(),
  },
  {
    id: 'demo-task-3',
    title: 'Review pull request #142',
    description: 'Code review for the new authentication feature',
    deadline: addDays(now, 2).toISOString(),
    priority: 'medium',
    priority_score: 60,
    priority_reason: 'Team dependency - moderate urgency',
    status: 'pending',
    required_action: null,
    action_target: null,
    created_at: subHours(now, 6).toISOString(),
  },
  {
    id: 'demo-task-4',
    title: 'Schedule team standup',
    description: 'Organize weekly team sync meeting',
    deadline: addDays(now, 3).toISOString(),
    priority: 'low',
    priority_score: 30,
    priority_reason: 'Flexible timeline',
    status: 'pending',
    required_action: 'meeting',
    action_target: 'team@company.com',
    created_at: subDays(now, 1).toISOString(),
  },
  {
    id: 'demo-task-5',
    title: 'Call John about project timeline',
    description: 'Discuss potential delays in Phase 2 delivery',
    deadline: subHours(now, 2).toISOString(),
    priority: 'high',
    priority_score: 100,
    priority_reason: 'OVERDUE - Missed deadline',
    status: 'missed',
    required_action: 'call',
    action_target: 'john@partner.com',
    created_at: subDays(now, 3).toISOString(),
  },
  {
    id: 'demo-task-6',
    title: 'Update documentation',
    description: 'Add API endpoints to developer docs',
    deadline: addDays(now, 5).toISOString(),
    priority: 'low',
    priority_score: 20,
    priority_reason: 'Low urgency - ample time',
    status: 'pending',
    required_action: null,
    action_target: null,
    created_at: now.toISOString(),
  },
];

const todayStart = startOfDay(now);

export const demoEvents: DemoEvent[] = [
  {
    id: 'demo-event-1',
    title: 'Team Standup',
    description: 'Daily sync with the engineering team',
    start_time: setHours(todayStart, 9).toISOString(),
    end_time: setHours(todayStart, 9).toISOString(),
    attendees: ['alice@company.com', 'bob@company.com', 'charlie@company.com'],
    location: 'Zoom',
    created_at: subDays(now, 7).toISOString(),
  },
  {
    id: 'demo-event-2',
    title: 'Product Demo - Acme Corp',
    description: 'Showcase new features to potential client',
    start_time: addDays(setHours(todayStart, 14), 1).toISOString(),
    end_time: addDays(setHours(todayStart, 15), 1).toISOString(),
    attendees: ['sarah@acmecorp.com', 'mike@acmecorp.com'],
    location: 'Google Meet',
    created_at: subDays(now, 3).toISOString(),
  },
  {
    id: 'demo-event-3',
    title: '1:1 with Manager',
    description: 'Weekly check-in with Lisa',
    start_time: addDays(setHours(todayStart, 11), 2).toISOString(),
    end_time: addDays(setHours(todayStart, 11).getTime() + 30 * 60 * 1000, 2).toISOString(),
    attendees: ['lisa@company.com'],
    location: 'Office - Room 3B',
    created_at: subDays(now, 14).toISOString(),
  },
  {
    id: 'demo-event-4',
    title: 'Sprint Planning',
    description: 'Plan tasks for Sprint 24',
    start_time: addDays(setHours(todayStart, 10), 3).toISOString(),
    end_time: addDays(setHours(todayStart, 12), 3).toISOString(),
    attendees: ['team@company.com'],
    location: 'Conference Room A',
    created_at: subDays(now, 5).toISOString(),
  },
  {
    id: 'demo-event-5',
    title: 'Lunch with Mentor',
    description: 'Career development discussion',
    start_time: addDays(setHours(todayStart, 12), 4).toISOString(),
    end_time: addDays(setHours(todayStart, 13), 4).toISOString(),
    attendees: ['david@company.com'],
    location: 'Cafe Bistro',
    created_at: subDays(now, 2).toISOString(),
  },
];

export const demoEmails: DemoEmail[] = [
  {
    id: 'demo-email-1',
    task_id: 'demo-task-1',
    recipient: 'finance@company.com',
    subject: 'Q4 Report Submission',
    body: 'Hi team, Please find attached the Q4 financial report...',
    status: 'pending',
    sent_at: null,
    follow_up_count: 0,
    created_at: subHours(now, 1).toISOString(),
  },
  {
    id: 'demo-email-2',
    task_id: 'demo-task-2',
    recipient: 'sarah@acmecorp.com',
    subject: 'Product Demo - Meeting Confirmation',
    body: 'Hi Sarah, Looking forward to our meeting tomorrow...',
    status: 'sent',
    sent_at: subHours(now, 4).toISOString(),
    follow_up_count: 0,
    created_at: subHours(now, 5).toISOString(),
  },
  {
    id: 'demo-email-3',
    task_id: null,
    recipient: 'john@partner.com',
    subject: 'Project Timeline Discussion - Follow Up',
    body: 'Hi John, Following up on our previous conversation...',
    status: 'followed_up',
    sent_at: subDays(now, 2).toISOString(),
    follow_up_count: 2,
    created_at: subDays(now, 5).toISOString(),
  },
];

export const demoAgentLogs: DemoAgentLog[] = [
  {
    id: 'demo-log-1',
    action_type: 'prioritized',
    description: 'Marked "Submit quarterly report" as HIGH priority',
    related_task_id: 'demo-task-1',
    related_event_id: null,
    related_email_id: null,
    ai_reasoning: 'Deadline is in 3 hours and this is a critical business deliverable',
    created_at: subHours(now, 1).toISOString(),
  },
  {
    id: 'demo-log-2',
    action_type: 'rescheduled',
    description: 'Rescheduled "Call John about project timeline" to tomorrow 10am',
    related_task_id: 'demo-task-5',
    related_event_id: null,
    related_email_id: null,
    ai_reasoning: 'Original deadline was missed. Automatically rescheduled to next available slot',
    created_at: subMinutes(now, 30).toISOString(),
  },
  {
    id: 'demo-log-3',
    action_type: 'email_sent',
    description: 'Sent meeting confirmation to sarah@acmecorp.com',
    related_task_id: 'demo-task-2',
    related_event_id: 'demo-event-2',
    related_email_id: 'demo-email-2',
    ai_reasoning: 'Client meeting is tomorrow - proactive confirmation sent',
    created_at: subHours(now, 4).toISOString(),
  },
  {
    id: 'demo-log-4',
    action_type: 'email_followed_up',
    description: 'Sent 2nd follow-up to john@partner.com',
    related_task_id: null,
    related_event_id: null,
    related_email_id: 'demo-email-3',
    ai_reasoning: 'No response received after 48 hours - automatic follow-up triggered',
    created_at: subHours(now, 6).toISOString(),
  },
  {
    id: 'demo-log-5',
    action_type: 'suggestion',
    description: 'Consider delegating "Update documentation" to free up bandwidth for urgent tasks',
    related_task_id: 'demo-task-6',
    related_event_id: null,
    related_email_id: null,
    ai_reasoning: 'You have 2 high-priority tasks due soon. This low-priority task could be delegated',
    created_at: subHours(now, 2).toISOString(),
  },
  {
    id: 'demo-log-6',
    action_type: 'conflict_resolved',
    description: 'Moved "Team Standup" to avoid conflict with client call',
    related_task_id: null,
    related_event_id: 'demo-event-1',
    related_email_id: null,
    ai_reasoning: 'Detected scheduling conflict - standup is flexible, client call is not',
    created_at: subDays(now, 1).toISOString(),
  },
  {
    id: 'demo-log-7',
    action_type: 'task_created',
    description: 'Created "Prepare presentation for client meeting" from your message',
    related_task_id: 'demo-task-2',
    related_event_id: null,
    related_email_id: null,
    ai_reasoning: 'Extracted task from: "I need to prepare slides for the Acme demo tomorrow"',
    created_at: subDays(now, 1).toISOString(),
  },
];

function subMinutes(date: Date, minutes: number): Date {
  return new Date(date.getTime() - minutes * 60 * 1000);
}

// Summary stats for demo
export function getDemoStats() {
  const todayTasks = demoTasks.filter(t => {
    if (!t.deadline) return false;
    const deadline = new Date(t.deadline);
    return deadline.toDateString() === now.toDateString() && t.status !== 'completed';
  });
  
  const overdueTasks = demoTasks.filter(t => t.status === 'missed');
  
  const upcomingEvents = demoEvents.filter(e => {
    const start = new Date(e.start_time);
    return start > now && start < addDays(now, 7);
  });
  
  return {
    todayCount: todayTasks.length,
    overdueCount: overdueTasks.length,
    upcomingEventsCount: upcomingEvents.length,
    pendingEmailsCount: demoEmails.filter(e => e.status === 'pending').length,
  };
}
