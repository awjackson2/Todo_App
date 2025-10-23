import { Button } from 'react-bootstrap';
import type { Task } from '../types';

type Props = {
  tasks: Task[];
  onDelete?: (id: string) => void;
  onComplete?: (id: string) => void;
  onEdit?: (task: Task) => void;
  showRemaining?: boolean;
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

export default function TaskGrid({ tasks, onDelete, onComplete, onEdit, showRemaining = true, isHistory = false }: Props) {
  if (tasks.length === 0) {
    return (
      <div className="text-center py-5">
        <div className="text-muted mb-2">📝</div>
        <div className="text-muted small">No tasks yet</div>
        <div className="text-muted" style={{ fontSize: '0.75rem' }}>Add your first task to get started</div>
      </div>
    );
  }

  return (
    <div className="row g-3">
      {tasks.map(task => {
        const msLeft = remainingMs(task.endDate || '', task.endTime);
        const urgencyColor = (() => {
          if (msLeft === Infinity) return '#6B7280';
          if (msLeft <= 0) return '#dc3545';
          const h = msLeft / (1000 * 60 * 60);
          if (h < 6) return '#dc3545';
          if (h < 48) return '#ffc107';
          return '#198754';
        })();
        
        const dotColor = isHistory ? '#6f42c1' : urgencyColor;

        return (
          <div key={task.id} className="col-12 col-sm-6 col-lg-4">
            <div className="task-grid-item h-100 d-flex flex-column">
              <div className="d-flex align-items-start justify-content-between mb-2">
                <span 
                  style={{ 
                    display: 'inline-block', 
                    width: 8, 
                    height: 8, 
                    borderRadius: '50%', 
                    backgroundColor: dotColor,
                    boxShadow: `0 0 0 2px ${dotColor}20`,
                    flexShrink: 0,
                    marginTop: '2px'
                  }} 
                />
                <div className="d-flex gap-1">
                  {onEdit && !isHistory && (
                    <Button 
                      variant="outline-primary" 
                      size="sm" 
                      onClick={() => onEdit?.(task)} 
                      title="Edit task"
                      className="d-flex align-items-center justify-content-center"
                      style={{ width: '28px', height: '28px', padding: 0, fontSize: '0.7rem' }}
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
                      style={{ width: '28px', height: '28px', padding: 0, fontSize: '0.7rem' }}
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
                      style={{ width: '28px', height: '28px', padding: 0, fontSize: '0.7rem' }}
                    >
                      ×
                    </Button>
                  )}
                </div>
              </div>
              
              <div className="flex-grow-1 d-flex flex-column">
                <h6 
                  className="fw-semibold mb-2 flex-grow-1" 
                  style={{ 
                    fontSize: '0.9rem',
                    lineHeight: '1.3',
                    overflow: 'hidden',
                    display: '-webkit-box',
                    WebkitLineClamp: 3,
                    WebkitBoxOrient: 'vertical'
                  }}
                >
                  {task.title}
                </h6>
                
                <div className="mt-auto">
                  {task.subject && (
                    <div className="mb-2">
                      <span 
                        className="badge" 
                        style={{ 
                          backgroundColor: hashColor(task.subject), 
                          color: '#FEF7E8',
                          fontSize: '0.65rem',
                          fontWeight: '500'
                        }}
                      >
                        {task.subject}
                      </span>
                    </div>
                  )}
                  
                  {showRemaining && (
                    <div className="small text-muted">
                      <span style={{ color: urgencyColor, fontWeight: '500' }}>
                        {formatDuration(msLeft)}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
