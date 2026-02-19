import { useMemo, useState } from 'react';
import type { Task } from '../types';

type Props = {
  tasks: Task[];
  completedTasks: Task[];
};

type TimelineTask = Task & {
  dueDate: Date;
};

function hashColor(input: string): string {
  let h = 0;
  for (let i = 0; i < input.length; i++) h = (h * 31 + input.charCodeAt(i)) | 0;
  const hue = Math.abs(h) % 360;
  return `hsl(${hue} 70% 45%)`;
}

function getTaskColor(task: Task): string {
  if (task.completedAt) {
    return '#6f42c1'; // Purple for completed tasks
  }
  if (task.subject) {
    return hashColor(task.subject);
  }
  return '#6B7280'; // Default gray
}

function formatDate(date: Date): string {
  return date.toLocaleDateString('en-US', { 
    month: 'short', 
    day: 'numeric' 
  });
}

function formatTime(date: Date): string {
  return date.toLocaleTimeString('en-US', { 
    hour: '2-digit', 
    minute: '2-digit' 
  });
}

export default function TaskTimeline({ tasks, completedTasks }: Props) {
  const [hoveredTask, setHoveredTask] = useState<TimelineTask | null>(null);
  const [tooltipPosition, setTooltipPosition] = useState<{ x: number; y: number } | null>(null);

  // Combine all tasks and filter those with end dates
  const allTasks = useMemo(() => {
    const tasksWithEndDates: TimelineTask[] = [...tasks, ...completedTasks]
      .filter(task => task.endDate)
      .map(task => ({
        ...task,
        dueDate: new Date(`${task.endDate}T${task.endTime || '23:59'}`)
      }))
      .sort((a, b) => a.dueDate.getTime() - b.dueDate.getTime());

    return tasksWithEndDates;
  }, [tasks, completedTasks]);

  // Calculate timeline range
  const timelineRange = useMemo(() => {
    if (allTasks.length === 0) {
      const today = new Date();
      const weekFromNow = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000);
      return { start: today, end: weekFromNow };
    }

    const dates = allTasks.map(task => task.dueDate);
    const minDate = new Date(Math.min(...dates.map(d => d.getTime())));
    const maxDate = new Date(Math.max(...dates.map(d => d.getTime())));
    // Always stretch to include all tasks with minimal padding
    const padding = (maxDate.getTime() - minDate.getTime()) * 0.05; // 5% padding
    
    return {
      start: new Date(minDate.getTime() - padding),
      end: new Date(maxDate.getTime() + padding)
    };
  }, [allTasks]);

  // Group tasks by date for better visualization
  const tasksByDate = useMemo(() => {
    const groups: { [key: string]: typeof allTasks } = {};
    
    allTasks.forEach(task => {
      const dateKey = task.dueDate.toDateString();
      if (!groups[dateKey]) {
        groups[dateKey] = [];
      }
      groups[dateKey].push(task);
    });

    return groups;
  }, [allTasks]);

  // Calculate position for a given date
  const getDatePosition = (date: Date): number => {
    const totalRange = timelineRange.end.getTime() - timelineRange.start.getTime();
    const dateOffset = date.getTime() - timelineRange.start.getTime();
    return (dateOffset / totalRange) * 100;
  };

  // Generate timeline markers
  const timelineMarkers = useMemo(() => {
    const markers = [];
    const today = new Date();
    const range = timelineRange.end.getTime() - timelineRange.start.getTime();
    const days = Math.ceil(range / (24 * 60 * 60 * 1000));
    
    // Show markers for every few days depending on range, but ensure we have enough markers
    const step = Math.max(1, Math.floor(days / 12)); // More markers for better visibility
    
    for (let i = 0; i <= days; i += step) {
      const date = new Date(timelineRange.start.getTime() + i * 24 * 60 * 60 * 1000);
      const position = getDatePosition(date);
      const isToday = date.toDateString() === today.toDateString();
      
      markers.push({
        date,
        position,
        isToday,
        label: formatDate(date)
      });
    }
    
    // Always include today if it's not already included
    const todayPosition = getDatePosition(today);
    const hasToday = markers.some(marker => marker.isToday);
    if (!hasToday && todayPosition >= 0 && todayPosition <= 100) {
      markers.push({
        date: today,
        position: todayPosition,
        isToday: true,
        label: formatDate(today)
      });
    }
    
    // Sort markers by position
    return markers.sort((a, b) => a.position - b.position);
  }, [timelineRange]);

  if (allTasks.length === 0) {
    return (
      <div className="task-timeline-container">
        <div className="timeline-header">
          <h6 className="mb-2">Task Timeline</h6>
          <p className="text-muted small mb-0">No tasks with due dates found</p>
        </div>
      </div>
    );
  }

  return (
    <div className="task-timeline-container">
      <div className="timeline-header">
        <h6 className="mb-2">Task Timeline</h6>
        <p className="text-muted small mb-0">
          {allTasks.length} task{allTasks.length !== 1 ? 's' : ''} with due dates
        </p>
      </div>
      
      <div className="timeline-wrapper">
        <div className="timeline-track">
          {/* Timeline markers */}
          {timelineMarkers.map((marker, index) => (
            <div
              key={index}
              className={`timeline-marker ${marker.isToday ? 'today' : ''}`}
              style={{ left: `${marker.position}%` }}
            >
              <div className="marker-line"></div>
              <div className="marker-label">{marker.label}</div>
            </div>
          ))}
          
          {/* Task circles */}
          {Object.entries(tasksByDate).map(([dateKey, dateTasks]) => {
            const date = new Date(dateKey);
            const position = getDatePosition(date);
            const isOverdue = date < new Date() && !dateTasks.some(t => t.completedAt);
            
            return (
              <div
                key={dateKey}
                className={`timeline-date-group ${isOverdue ? 'overdue' : ''}`}
                style={{ left: `${position}%` }}
              >
                {dateTasks.map((task, taskIndex) => {
                  const taskColor = getTaskColor(task);
                  const isCompleted = !!task.completedAt;
                  
                  return (
                    <div
                      key={task.id}
                      className={`timeline-task-circle ${isCompleted ? 'completed' : ''} ${hoveredTask?.id === task.id ? 'hovered' : ''}`}
                      style={{
                        backgroundColor: taskColor,
                        transform: `translateY(${taskIndex * 8}px)`,
                        zIndex: dateTasks.length - taskIndex
                      }}
                      onMouseEnter={(e) => {
                        setHoveredTask(task);
                        const rect = e.currentTarget.getBoundingClientRect();
                        setTooltipPosition({
                          x: rect.left + rect.width / 2,
                          y: rect.top - 15
                        });
                      }}
                      onMouseLeave={() => {
                        setHoveredTask(null);
                        setTooltipPosition(null);
                      }}
                    />
                  );
                })}
              </div>
            );
          })}
        </div>
      </div>
      
      {/* Custom Tooltip */}
      {hoveredTask && tooltipPosition && (
        <div
          className="custom-tooltip"
          style={{
            position: 'fixed',
            left: tooltipPosition.x,
            top: tooltipPosition.y,
            transform: 'translateX(-50%) translateY(-100%)',
            zIndex: 1000,
            pointerEvents: 'none'
          }}
        >
          <div className="timeline-tooltip">
            <div className="tooltip-title">{hoveredTask.title}</div>
            <div className="tooltip-subject">
              {hoveredTask.subject && (
                <span 
                  className="tooltip-subject-badge"
                  style={{ backgroundColor: getTaskColor(hoveredTask) }}
                >
                  {hoveredTask.subject}
                </span>
              )}
            </div>
            <div className="tooltip-due">
              Due: {formatDate(hoveredTask.dueDate)} at {formatTime(hoveredTask.dueDate)}
            </div>
            {hoveredTask.completedAt && (
              <div className="tooltip-status text-success">
                ✓ Completed
              </div>
            )}
            {!hoveredTask.completedAt && hoveredTask.dueDate < new Date() && (
              <div className="tooltip-status text-danger">
                ⚠ Overdue
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
