import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export interface Task {
  id: string;
  user_id: string;
  title: string;
  description: string | null;
  deadline: string | null;
  priority: 'low' | 'medium' | 'high';
  priority_score: number;
  priority_reason: string | null;
  status: 'pending' | 'in_progress' | 'completed' | 'missed';
  required_action: 'email' | 'meeting' | 'reminder' | 'call' | null;
  action_target: string | null;
  is_demo: boolean;
  created_at: string;
  updated_at: string;
}

export function useTasks() {
  const { user, isDemoMode } = useAuth();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (isDemoMode) {
      setTasks([]);
      setIsLoading(false);
      return;
    }

    if (!user) {
      setTasks([]);
      setIsLoading(false);
      return;
    }

    fetchTasks();

    const channel = supabase
      .channel('tasks_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'tasks',
          filter: `user_id=eq.${user.id}`,
        },
        () => {
          fetchTasks();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, isDemoMode]);

  const fetchTasks = async () => {
    if (!user) return;

    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('tasks')
        .select('*')
        .eq('user_id', user.id)
        .order('priority_score', { ascending: false });

      if (error) throw error;
      setTasks(data || []);
      setError(null);
    } catch (err) {
      setError(err as Error);
      console.error('Error fetching tasks:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const createTask = async (taskData: {
    title: string;
    description?: string;
    deadline?: string;
    priority?: 'low' | 'medium' | 'high';
    priority_score?: number;
    priority_reason?: string;
    required_action?: 'email' | 'meeting' | 'reminder' | 'call' | null;
    action_target?: string;
  }) => {
    if (isDemoMode) {
      const newTask: Task = {
        id: `demo-task-${Date.now()}`,
        user_id: 'demo-user',
        title: taskData.title,
        description: taskData.description || null,
        deadline: taskData.deadline || null,
        priority: taskData.priority || 'medium',
        priority_score: taskData.priority_score || 50,
        priority_reason: taskData.priority_reason || null,
        status: 'pending',
        required_action: taskData.required_action || null,
        action_target: taskData.action_target || null,
        is_demo: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      setTasks(prev => [...prev, newTask]);
      return { data: newTask, error: null };
    }

    if (!user) {
      throw new Error('You must be signed in to create tasks');
    }

    try {
      const { data, error } = await supabase
        .from('tasks')
        .insert({
          user_id: user.id,
          title: taskData.title,
          description: taskData.description || null,
          deadline: taskData.deadline || null,
          priority: taskData.priority || 'medium',
          priority_score: taskData.priority_score || 50,
          priority_reason: taskData.priority_reason || null,
          status: 'pending',
          required_action: taskData.required_action || null,
          action_target: taskData.action_target || null,
          is_demo: false,
        })
        .select()
        .single();

      if (error) throw error;

      if (taskData.required_action === 'reminder' && taskData.deadline) {
        await createReminder(data.id, taskData.deadline);
      }

      return { data, error: null };
    } catch (err) {
      console.error('Error creating task:', err);
      return { data: null, error: err as Error };
    }
  };

  const updateTask = async (
    taskId: string,
    updates: Partial<Omit<Task, 'id' | 'user_id' | 'created_at' | 'updated_at'>>
  ) => {
    if (isDemoMode) {
      setTasks(prev => prev.map(task => 
        task.id === taskId 
          ? { ...task, ...updates, updated_at: new Date().toISOString() }
          : task
      ));
      const updatedTask = tasks.find(t => t.id === taskId);
      return { data: updatedTask || null, error: null };
    }

    if (!user) {
      throw new Error('You must be signed in to update tasks');
    }

    try {
      const { data, error } = await supabase
        .from('tasks')
        .update(updates)
        .eq('id', taskId)
        .eq('user_id', user.id)
        .select()
        .single();

      if (error) throw error;
      return { data, error: null };
    } catch (err) {
      console.error('Error updating task:', err);
      return { data: null, error: err as Error };
    }
  };

  const deleteTask = async (taskId: string) => {
    if (isDemoMode) {
      setTasks(prev => prev.filter(task => task.id !== taskId));
      return { error: null };
    }

    if (!user) {
      throw new Error('You must be signed in to delete tasks');
    }

    try {
      const { error } = await supabase
        .from('tasks')
        .delete()
        .eq('id', taskId)
        .eq('user_id', user.id);

      if (error) throw error;
      return { error: null };
    } catch (err) {
      console.error('Error deleting task:', err);
      return { error: err as Error };
    }
  };

  const toggleTaskStatus = async (taskId: string, currentStatus: string) => {
    const newStatus = currentStatus === 'completed' ? 'pending' : 'completed';
    return updateTask(taskId, { status: newStatus as any });
  };

  const createReminder = async (taskId: string, deadline: string) => {
    if (!user) return;

    try {
      await supabase.from('agent_logs').insert({
        user_id: user.id,
        action_type: 'task_created',
        description: `Reminder set for task`,
        related_task_id: taskId,
        ai_reasoning: `Reminder scheduled for ${new Date(deadline).toLocaleString()}`,
        is_demo: false,
      });
    } catch (err) {
      console.error('Error creating reminder log:', err);
    }
  };

  return {
    tasks,
    isLoading,
    error,
    createTask,
    updateTask,
    deleteTask,
    toggleTaskStatus,
    refetch: fetchTasks,
  };
}
