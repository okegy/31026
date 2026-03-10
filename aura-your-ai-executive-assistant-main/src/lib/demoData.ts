import { Task } from '@/hooks/use-tasks';
import { Event } from '@/hooks/use-events';

export const demoTasks: any[] = [
  {
    id: '1',
    user_id: 'demo-user',
    title: 'Consultation with Rahul Sharma (Cardiology)',
    description: 'Routine checkup and blood pressure monitoring.',
    priority: 'medium',
    status: 'pending',
    priority_score: 85,
    deadline: new Date(Date.now() + 1000 * 60 * 60 * 2).toISOString(), // 2 hours from now
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: '2',
    user_id: 'demo-user',
    title: 'Review Sarah Connor MRI results',
    description: 'Check latest brain scan for migraine consultation.',
    priority: 'high',
    status: 'pending',
    priority_score: 95,
    deadline: new Date(Date.now() + 1000 * 60 * 30).toISOString(), // 30 mins from now
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: '3',
    user_id: 'demo-user',
    title: 'Follow-up with patient Priya Patel',
    description: 'Post-op recovery assessment.',
    priority: 'medium',
    status: 'completed',
    priority_score: 60,
    deadline: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: '4',
    user_id: 'demo-user',
    title: 'Urgent Consultation: Michael Chen',
    description: 'Asthma attack history, needs immediate review.',
    priority: 'high',
    status: 'missed',
    priority_score: 100,
    deadline: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: '5',
    user_id: 'demo-user',
    title: 'Initial Consultation: Emma Wilson',
    description: 'General health checkup and consultation.',
    priority: 'low',
    status: 'pending',
    priority_score: 40,
    deadline: new Date(Date.now() + 1000 * 60 * 60 * 4).toISOString(),
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: '6',
    user_id: 'demo-user',
    title: 'Review Lab Results: David Lee',
    description: 'Complete blood count and cholesterol analysis.',
    priority: 'medium',
    status: 'pending',
    priority_score: 75,
    deadline: new Date(Date.now() + 1000 * 60 * 60 * 5).toISOString(),
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: '7',
    user_id: 'demo-user',
    title: 'Physical Therapy: James Taylor',
    description: 'Shoulder mobility assessment.',
    priority: 'medium',
    status: 'completed',
    priority_score: 55,
    deadline: new Date(Date.now() - 1000 * 60 * 60 * 4).toISOString(),
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  }
];

export const demoEvents: any[] = [
  {
    id: '1',
    user_id: 'demo-user',
    title: 'Morning Clinic Duty',
    description: 'Standard block for walk-in patients.',
    start_time: new Date(new Date().setHours(9, 0, 0, 0)).toISOString(),
    end_time: new Date(new Date().setHours(12, 0, 0, 0)).toISOString(),
    status: 'confirmed',
    priority: 'high',
    location: 'Room 102',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: '2',
    user_id: 'demo-user',
    title: 'Surgery: John Doe',
    description: 'Appendix removal.',
    start_time: new Date(new Date().setHours(14, 0, 0, 0)).toISOString(),
    end_time: new Date(new Date().setHours(16, 0, 0, 0)).toISOString(),
    status: 'confirmed',
    priority: 'high',
    location: 'OT-1',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  }
];

export const demoEmails = [
  {
    id: '1',
    subject: 'MEDICU: Appointment Confirmation - Tomorrow 10:00 AM',
    recipient: 'rahul.s@example.com',
    status: 'sent',
    sent_at: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString()
  },
  {
    id: '2',
    subject: 'MEDICU: Action Required - Reschedule Your Visit',
    recipient: 'm.chen@example.com',
    status: 'pending',
    sent_at: null
  },
  {
    id: '3',
    subject: 'MEDICU: How are you feeling after surgery?',
    recipient: 'priya.p@example.com',
    status: 'followed_up',
    sent_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2).toISOString()
  }
];

export const demoAgentLogs = [
  {
    id: '1',
    action_type: 'task_created',
    description: 'MEDICU scheduled a high-priority appointment for Sarah Connor.',
    ai_reasoning: 'Patient records indicate history of severe migraines requiring immediate attention.',
    created_at: new Date(Date.now() - 1000 * 60 * 30).toISOString()
  },
  {
    id: '2',
    action_type: 'conflict_resolved',
    description: 'Rescheduled Dr. Smith\'s routine checkups due to emergency surgery block.',
    ai_reasoning: 'Emergency OT duty takes precedence over routine outpatient clinic.',
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString()
  },
  {
    id: '3',
    action_type: 'suggestion',
    description: 'Suggesting a follow-up call with Michael Chen.',
    ai_reasoning: 'Patient missed previous urgent appointment for asthma. Outreach is recommended to ensure stability.',
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString()
  }
];

export const getDemoStats = () => {
  const todayTasks = demoTasks.filter(t => t.status !== 'completed');
  const overdueTasks = demoTasks.filter(t => t.status === 'missed');
  const upcomingEventsThisWeek = demoEvents;

  return {
    todayCount: todayTasks.length,
    overdueCount: overdueTasks.length,
    upcomingEventsCount: upcomingEventsThisWeek.length
  };
};
