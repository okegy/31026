import { useEffect, useState } from 'react';
import { requestNotificationPermission, checkUpcomingTasks } from '@/lib/notifications';
import { useTasks } from './use-tasks';

export function useNotifications() {
  const [hasPermission, setHasPermission] = useState(false);
  const { tasks } = useTasks();

  useEffect(() => {
    const checkPermission = async () => {
      if ('Notification' in window) {
        setHasPermission(Notification.permission === 'granted');
      }
    };
    checkPermission();
  }, []);

  useEffect(() => {
    if (hasPermission && tasks.length > 0) {
      checkUpcomingTasks(tasks);
    }
  }, [hasPermission, tasks]);

  const requestPermission = async () => {
    const granted = await requestNotificationPermission();
    setHasPermission(granted);
    return granted;
  };

  return {
    hasPermission,
    requestPermission,
  };
}
