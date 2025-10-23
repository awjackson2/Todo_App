import { useEffect, useMemo, useState } from 'react';
import { Button } from 'react-bootstrap';
import type { Task } from '../types';

type Props = {
  task: Task;
  onDelete?: (id: string) => void;
  onComplete?: (id: string) => void;
  onEdit?: (task: Task) => void;
  onUndo?: (task: Task) => void;
  showRemaining?: boolean;
  showDuration?: boolean;
  isHistory?: boolean;
};

function hashColor(input: string): string {
  let h = 0;
  for (let i = 0; i < input.length; i++) h = (h * 31 + input.charCodeAt(i)) | 0;
  const hue = Math.abs(h) % 360;
  return `hsl(${hue} 70% 45%)`;
}

function remainingMs(endDate: string, endTime?: string): number {
  if (!endDate) return Infinity; // No end date means no deadline
  const end = new Date(`${endDate}T${endTime || '23:59'}`);
  return end.getTime() - Date.now();
}

function formatDuration(ms: number): string {
  if (ms === Infinity) return 'no deadline';
  if (ms <= 0) return 'expired';
  const sec = Math.floor(ms / 1000);
  const d = Math.floor(sec / 86400);
  const h = Math.floor((sec % 86400) / 3600);
  const m = Math.floor((sec % 3600) / 60);
  if (d > 0) return `${d}d ${h}h`;
  if (h > 0) return `${h}h ${m}m`;
  return `${m}m`;
}

export default function TaskItem({ task, onDelete, onComplete, onEdit, onUndo, showRemaining = true, showDuration = false, isHistory = false }: Props) {
  const [msLeft, setMsLeft] = useState(() => remainingMs(task.endDate || '', task.endTime));

  useEffect(() => {
    const timer = setInterval(() => setMsLeft(remainingMs(task.endDate || '', task.endTime)), 60_000);
    return () => clearInterval(timer);
  }, [task.endDate, task.endTime]);

  const urgencyColor = useMemo(() => {
    // Green (>48h), Yellow (6-48h), Red (<6h), Grey (no deadline)
    const ms = msLeft;
    if (ms === Infinity) return '#6B7280'; // grey for no deadline
    if (ms <= 0) return '#dc3545'; // red
    const h = ms / (1000 * 60 * 60);
    if (h < 6) return '#dc3545';
    if (h < 48) return '#ffc107';
    return '#198754';
  }, [msLeft]);

  const startMs = new Date(`${task.startDate}T${task.startTime || '00:00'}`).getTime();
  const endPlannedMs = task.endDate ? new Date(`${task.endDate}T${task.endTime || '00:00'}`).getTime() : null;
  const endActualMs = task.completedAt ?? endPlannedMs;

  const dotColor = isHistory ? '#6f42c1' : urgencyColor; // purple when in history

  return (
    <div className="task-item d-flex justify-content-between align-items-stretch gap-2" style={{ minHeight: '80px' }}>
      <div className="flex-grow-1 min-width-0 d-flex flex-column justify-content-between">
        <div className="fw-semibold d-flex align-items-center gap-2 mb-2" style={{ minHeight: '24px' }}>
          <span 
            style={{ 
              display: 'inline-block', 
              width: 10, 
              height: 10, 
              borderRadius: '50%', 
              backgroundColor: dotColor,
              boxShadow: `0 0 0 2px ${dotColor}20`,
              flexShrink: 0
            }} 
          />
          <span 
            className="flex-grow-1" 
            style={{ 
              wordBreak: 'break-word',
              overflow: 'hidden',
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical',
              lineHeight: '1.2'
            }}
          >
            {task.title}
          </span>
          {task.subject && (
            <span 
              className="badge flex-shrink-0" 
              style={{ 
                backgroundColor: hashColor(task.subject), 
                color: '#FEF7E8',
                fontSize: '0.7rem',
                fontWeight: '500'
              }}
            >
              {task.subject}
            </span>
          )}
        </div>
        <div className="small text-muted" style={{ minHeight: '32px', display: 'flex', alignItems: 'center' }}>
          <div className="d-flex flex-wrap gap-2 align-items-center">
            <span style={{ whiteSpace: 'nowrap' }}>
              {new Date(startMs).toLocaleDateString()} {new Date(startMs).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </span>
            {endPlannedMs && (
              <span style={{ whiteSpace: 'nowrap' }}>
                → {new Date(endPlannedMs).toLocaleDateString()} {new Date(endPlannedMs).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </span>
            )}
            {typeof task.workload === 'number' && <span style={{ whiteSpace: 'nowrap' }}>· {task.workload}h</span>}
            {task.link && <a href={task.link} target="_blank" rel="noreferrer" style={{ whiteSpace: 'nowrap' }}>link</a>}
            {showRemaining && <span style={{ color: urgencyColor, whiteSpace: 'nowrap' }}>{formatDuration(msLeft)}</span>}
            {showDuration && endActualMs && (
              <span style={{ whiteSpace: 'nowrap' }}>
                {Math.floor(Math.max(0, endActualMs - startMs) / 3_600_000)}h {Math.floor((Math.max(0, endActualMs - startMs) % 3_600_000) / 60_000)}m
              </span>
            )}
          </div>
        </div>
      </div>
      {(onDelete || onComplete || onEdit || onUndo) && (
        <div className="d-flex gap-1 flex-shrink-0">
          {onEdit && !isHistory && (
            <Button 
              variant="outline-primary" 
              size="sm" 
              onClick={() => onEdit?.(task)} 
              title="Edit task"
              className="d-flex align-items-center justify-content-center"
              style={{ width: '36px', height: '36px', padding: 0 }}
            >
              ✏️
            </Button>
          )}
          {onComplete && (
            <Button 
              variant="outline-success" 
              size="sm" 
              onClick={() => onComplete?.(task.id)} 
              title="Mark complete"
              className="d-flex align-items-center justify-content-center"
              style={{ width: '36px', height: '36px', padding: 0 }}
            >
              ✓
            </Button>
          )}
          {onDelete && (
            <Button 
              variant="outline-danger" 
              size="sm" 
              onClick={() => onDelete?.(task.id)}
              title="Delete task"
              className="d-flex align-items-center justify-content-center"
              style={{ width: '36px', height: '36px', padding: 0 }}
            >
              ×
            </Button>
          )}
          {onUndo && isHistory && (
            <Button 
              variant="outline-warning" 
              size="sm" 
              onClick={() => onUndo?.(task)}
              title="Move back to current tasks"
              className="d-flex align-items-center justify-content-center"
              style={{ width: '36px', height: '36px', padding: 0 }}
            >
              ↶
            </Button>
          )}
        </div>
      )}
    </div>
  );
}


