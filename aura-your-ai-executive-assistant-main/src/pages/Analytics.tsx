import React, { useState, useMemo } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useEvents } from '@/hooks/use-events';
import { useTasks } from '@/hooks/use-tasks';
import { 
  format, 
  startOfYear, 
  endOfYear, 
  eachMonthOfInterval, 
  eachDayOfInterval,
  isSameMonth,
  isSameDay,
  parseISO,
  startOfMonth,
  endOfMonth,
  getDay,
  addDays,
  startOfWeek
} from 'date-fns';
import { 
  Calendar as CalendarIcon, 
  TrendingUp, 
  Clock, 
  CheckCircle, 
  AlertTriangle,
  BarChart3,
  PieChart,
  Activity,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';

export default function Analytics() {
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const { events, isLoading: eventsLoading } = useEvents();
  const { tasks, isLoading: tasksLoading } = useTasks();

  const isLoading = eventsLoading || tasksLoading;

  // Calculate yearly statistics
  const yearlyStats = useMemo(() => {
    const yearStart = startOfYear(new Date(selectedYear, 0, 1));
    const yearEnd = endOfYear(new Date(selectedYear, 0, 1));

    const yearEvents = events.filter(e => {
      const eventDate = parseISO(e.start_time);
      return eventDate >= yearStart && eventDate <= yearEnd;
    });

    const yearTasks = tasks.filter(t => {
      if (!t.created_at) return false;
      const taskDate = parseISO(t.created_at);
      return taskDate >= yearStart && taskDate <= yearEnd;
    });

    // Monthly breakdown
    const months = eachMonthOfInterval({ start: yearStart, end: yearEnd });
    const monthlyData = months.map(month => {
      const monthEvents = yearEvents.filter(e => 
        isSameMonth(parseISO(e.start_time), month)
      );
      const monthTasks = yearTasks.filter(t => 
        t.created_at && isSameMonth(parseISO(t.created_at), month)
      );

      return {
        month: format(month, 'MMM'),
        events: monthEvents.length,
        tasks: monthTasks.length,
        completedTasks: monthTasks.filter(t => t.status === 'completed').length,
      };
    });

    // Day-by-day heatmap data
    const allDays = eachDayOfInterval({ start: yearStart, end: yearEnd });
    const dailyActivity = allDays.map(day => {
      const dayEvents = yearEvents.filter(e => 
        isSameDay(parseISO(e.start_time), day)
      );
      const dayTasks = yearTasks.filter(t => 
        t.created_at && isSameDay(parseISO(t.created_at), day)
      );

      return {
        date: day,
        activity: dayEvents.length + dayTasks.length,
      };
    });

    // Calculate max activity for color scaling
    const maxActivity = Math.max(...dailyActivity.map(d => d.activity), 1);

    return {
      totalEvents: yearEvents.length,
      totalTasks: yearTasks.length,
      completedTasks: yearTasks.filter(t => t.status === 'completed').length,
      pendingTasks: yearTasks.filter(t => t.status === 'pending').length,
      overdueTasksCount: yearTasks.filter(t => t.status === 'missed').length,
      monthlyData,
      dailyActivity,
      maxActivity,
      busiestMonth: monthlyData.reduce((max, curr) => 
        (curr.events + curr.tasks) > (max.events + max.tasks) ? curr : max
      , monthlyData[0]),
      averageEventsPerMonth: Math.round(yearEvents.length / 12),
      averageTasksPerMonth: Math.round(yearTasks.length / 12),
      completionRate: yearTasks.length > 0 
        ? Math.round((yearTasks.filter(t => t.status === 'completed').length / yearTasks.length) * 100)
        : 0,
    };
  }, [events, tasks, selectedYear]);

  // Get color intensity for heatmap
  const getActivityColor = (activity: number) => {
    if (activity === 0) return 'bg-gray-100 dark:bg-gray-800';
    const intensity = Math.min(activity / yearlyStats.maxActivity, 1);
    if (intensity < 0.25) return 'bg-green-200 dark:bg-green-900';
    if (intensity < 0.5) return 'bg-green-400 dark:bg-green-700';
    if (intensity < 0.75) return 'bg-green-600 dark:bg-green-500';
    return 'bg-green-800 dark:bg-green-300';
  };

  // Organize heatmap by weeks
  const heatmapWeeks = useMemo(() => {
    const yearStart = startOfYear(new Date(selectedYear, 0, 1));
    const yearEnd = endOfYear(new Date(selectedYear, 0, 1));
    const firstWeekStart = startOfWeek(yearStart);
    
    const weeks: Date[][] = [];
    let currentWeekStart = firstWeekStart;
    
    while (currentWeekStart <= yearEnd) {
      const week = Array.from({ length: 7 }, (_, i) => addDays(currentWeekStart, i));
      weeks.push(week);
      currentWeekStart = addDays(currentWeekStart, 7);
    }
    
    return weeks;
  }, [selectedYear]);

  if (isLoading) {
    return (
      <DashboardLayout title="Analytics" subtitle="Yearly insights and trends">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading analytics...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title="Analytics" subtitle="Yearly insights and trends">
      <div className="space-y-6 animate-fade-in">
        {/* Year Selector */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setSelectedYear(selectedYear - 1)}
            >
              <ChevronLeft className="w-4 h-4" />
            </Button>
            <h2 className="text-2xl font-bold">{selectedYear}</h2>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setSelectedYear(selectedYear + 1)}
              disabled={selectedYear >= new Date().getFullYear()}
            >
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
          <Button
            variant="outline"
            onClick={() => setSelectedYear(new Date().getFullYear())}
          >
            Current Year
          </Button>
        </div>

        {/* Summary Stats */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Events</CardTitle>
              <CalendarIcon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{yearlyStats.totalEvents}</div>
              <p className="text-xs text-muted-foreground">
                Avg {yearlyStats.averageEventsPerMonth}/month
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Tasks</CardTitle>
              <CheckCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{yearlyStats.totalTasks}</div>
              <p className="text-xs text-muted-foreground">
                {yearlyStats.completedTasks} completed
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Completion Rate</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{yearlyStats.completionRate}%</div>
              <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                <div 
                  className="bg-green-500 h-2 rounded-full" 
                  style={{ width: `${yearlyStats.completionRate}%` }}
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Busiest Month</CardTitle>
              <Activity className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{yearlyStats.busiestMonth?.month}</div>
              <p className="text-xs text-muted-foreground">
                {(yearlyStats.busiestMonth?.events || 0) + (yearlyStats.busiestMonth?.tasks || 0)} activities
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Monthly Bar Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Monthly Activity
            </CardTitle>
            <CardDescription>Events and tasks throughout the year</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {yearlyStats.monthlyData.map((month, index) => (
                <div key={index} className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-medium w-12">{month.month}</span>
                    <div className="flex-1 mx-4">
                      <div className="flex gap-1 h-8">
                        <div 
                          className="bg-blue-500 rounded flex items-center justify-center text-white text-xs font-medium"
                          style={{ width: `${(month.events / Math.max(...yearlyStats.monthlyData.map(m => m.events + m.tasks))) * 100}%`, minWidth: month.events > 0 ? '30px' : '0' }}
                        >
                          {month.events > 0 && month.events}
                        </div>
                        <div 
                          className="bg-green-500 rounded flex items-center justify-center text-white text-xs font-medium"
                          style={{ width: `${(month.tasks / Math.max(...yearlyStats.monthlyData.map(m => m.events + m.tasks))) * 100}%`, minWidth: month.tasks > 0 ? '30px' : '0' }}
                        >
                          {month.tasks > 0 && month.tasks}
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-2 text-xs">
                      <Badge variant="outline" className="bg-blue-50">
                        {month.events} events
                      </Badge>
                      <Badge variant="outline" className="bg-green-50">
                        {month.tasks} tasks
                      </Badge>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <div className="flex items-center gap-4 mt-6 text-sm">
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-blue-500 rounded"></div>
                <span>Events</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-green-500 rounded"></div>
                <span>Tasks</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Year Heatmap */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CalendarIcon className="h-5 w-5" />
              Activity Heatmap - {selectedYear}
            </CardTitle>
            <CardDescription>Daily activity throughout the year</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <div className="inline-block min-w-full">
                {/* Month labels */}
                <div className="flex mb-2">
                  <div className="w-8"></div>
                  {yearlyStats.monthlyData.map((month, i) => (
                    <div key={i} className="flex-1 text-xs text-center text-muted-foreground">
                      {month.month}
                    </div>
                  ))}
                </div>
                
                {/* Heatmap grid */}
                <div className="flex">
                  {/* Day labels */}
                  <div className="flex flex-col justify-around text-xs text-muted-foreground pr-2">
                    <div>Sun</div>
                    <div>Mon</div>
                    <div>Tue</div>
                    <div>Wed</div>
                    <div>Thu</div>
                    <div>Fri</div>
                    <div>Sat</div>
                  </div>
                  
                  {/* Weeks */}
                  <div className="flex gap-1">
                    {heatmapWeeks.map((week, weekIndex) => (
                      <div key={weekIndex} className="flex flex-col gap-1">
                        {week.map((day, dayIndex) => {
                          const dayData = yearlyStats.dailyActivity.find(d => 
                            isSameDay(d.date, day)
                          );
                          const activity = dayData?.activity || 0;
                          const isCurrentYear = day.getFullYear() === selectedYear;
                          
                          return (
                            <div
                              key={dayIndex}
                              className={`w-3 h-3 rounded-sm ${
                                isCurrentYear ? getActivityColor(activity) : 'bg-gray-50 dark:bg-gray-900'
                              } hover:ring-2 hover:ring-primary transition-all cursor-pointer`}
                              title={`${format(day, 'MMM d, yyyy')}: ${activity} activities`}
                            />
                          );
                        })}
                      </div>
                    ))}
                  </div>
                </div>
                
                {/* Legend */}
                <div className="flex items-center gap-2 mt-4 text-xs text-muted-foreground">
                  <span>Less</span>
                  <div className="flex gap-1">
                    <div className="w-3 h-3 bg-gray-100 dark:bg-gray-800 rounded-sm"></div>
                    <div className="w-3 h-3 bg-green-200 dark:bg-green-900 rounded-sm"></div>
                    <div className="w-3 h-3 bg-green-400 dark:bg-green-700 rounded-sm"></div>
                    <div className="w-3 h-3 bg-green-600 dark:bg-green-500 rounded-sm"></div>
                    <div className="w-3 h-3 bg-green-800 dark:bg-green-300 rounded-sm"></div>
                  </div>
                  <span>More</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Task Breakdown */}
        <div className="grid gap-4 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <PieChart className="h-5 w-5" />
                Task Status Distribution
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 bg-green-500 rounded"></div>
                    <span className="text-sm">Completed</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium">{yearlyStats.completedTasks}</span>
                    <span className="text-xs text-muted-foreground">
                      ({Math.round((yearlyStats.completedTasks / yearlyStats.totalTasks) * 100) || 0}%)
                    </span>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 bg-yellow-500 rounded"></div>
                    <span className="text-sm">Pending</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium">{yearlyStats.pendingTasks}</span>
                    <span className="text-xs text-muted-foreground">
                      ({Math.round((yearlyStats.pendingTasks / yearlyStats.totalTasks) * 100) || 0}%)
                    </span>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 bg-red-500 rounded"></div>
                    <span className="text-sm">Overdue</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium">{yearlyStats.overdueTasksCount}</span>
                    <span className="text-xs text-muted-foreground">
                      ({Math.round((yearlyStats.overdueTasksCount / yearlyStats.totalTasks) * 100) || 0}%)
                    </span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5" />
                Productivity Insights
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm">Overall Productivity</span>
                    <span className="text-sm font-medium">{yearlyStats.completionRate}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className={`h-2 rounded-full ${
                        yearlyStats.completionRate > 70 ? 'bg-green-500' :
                        yearlyStats.completionRate > 40 ? 'bg-yellow-500' : 'bg-red-500'
                      }`}
                      style={{ width: `${yearlyStats.completionRate}%` }}
                    />
                  </div>
                </div>
                <div className="pt-4 border-t">
                  <p className="text-sm text-muted-foreground">
                    {yearlyStats.completionRate > 70 
                      ? "🎉 Excellent! You're crushing your goals!"
                      : yearlyStats.completionRate > 40
                      ? "👍 Good progress! Keep it up!"
                      : "💪 There's room for improvement. You've got this!"}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}
