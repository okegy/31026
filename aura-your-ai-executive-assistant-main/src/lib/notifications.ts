export async function requestNotificationPermission(): Promise<boolean> {
  if (!('Notification' in window)) {
    console.log('This browser does not support notifications');
    return false;
  }

  if (Notification.permission === 'granted') {
    return true;
  }

  if (Notification.permission !== 'denied') {
    const permission = await Notification.requestPermission();
    return permission === 'granted';
  }

  return false;
}

export function showTaskReminder(taskTitle: string, deadline: string) {
  if (Notification.permission === 'granted') {
    const notification = new Notification('Task Reminder - AURA', {
      body: `Reminder: ${taskTitle}\nDeadline: ${new Date(deadline).toLocaleString()}`,
      icon: '/favicon.ico',
      badge: '/favicon.ico',
      tag: 'task-reminder',
      requireInteraction: true,
    });

    notification.onclick = () => {
      window.focus();
      notification.close();
    };

    return notification;
  }
  return null;
}

export function scheduleTaskReminder(taskId: string, taskTitle: string, deadline: string) {
  const deadlineTime = new Date(deadline).getTime();
  const now = Date.now();
  const timeUntilDeadline = deadlineTime - now;

  const reminderTimes = [
    { label: '1 hour before', offset: 60 * 60 * 1000 },
    { label: '30 minutes before', offset: 30 * 60 * 1000 },
    { label: '10 minutes before', offset: 10 * 60 * 1000 },
  ];

  reminderTimes.forEach(({ label, offset }) => {
    const reminderTime = timeUntilDeadline - offset;
    
    if (reminderTime > 0 && reminderTime < 24 * 60 * 60 * 1000) {
      setTimeout(() => {
        showTaskReminder(taskTitle, deadline);
      }, reminderTime);
    }
  });

  if (timeUntilDeadline > 0 && timeUntilDeadline < 24 * 60 * 60 * 1000) {
    setTimeout(() => {
      showTaskReminder(`DEADLINE: ${taskTitle}`, deadline);
    }, timeUntilDeadline);
  }
}

export function checkUpcomingTasks(tasks: Array<{ id: string; title: string; deadline: string | null; status: string }>) {
  const now = Date.now();
  const oneHourFromNow = now + (60 * 60 * 1000);

  tasks.forEach(task => {
    if (task.deadline && task.status !== 'completed') {
      const deadlineTime = new Date(task.deadline).getTime();
      
      if (deadlineTime > now && deadlineTime <= oneHourFromNow) {
        scheduleTaskReminder(task.id, task.title, task.deadline);
      }
    }
  });
}
