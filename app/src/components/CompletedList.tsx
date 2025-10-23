import { ListGroup } from 'react-bootstrap';
import type { Task } from '../types';
import TaskItem from './TaskItem';

type Props = { 
  tasks: Task[];
  onUndo?: (task: Task) => void;
};

function hashColor(input: string): string {
  let h = 0;
  for (let i = 0; i < input.length; i++) h = (h * 31 + input.charCodeAt(i)) | 0;
  const hue = Math.abs(h) % 360;
  return `hsl(${hue} 70% 45%)`;
}

export default function CompletedList({ tasks, onUndo }: Props) {
  if (tasks.length === 0) {
    return (
      <div className="text-center py-5">
        <div className="text-muted mb-2">✅</div>
        <div className="text-muted small">No completed tasks yet</div>
        <div className="text-muted" style={{ fontSize: '0.75rem' }}>Complete some tasks to see them here</div>
      </div>
    );
  }
  return (
    <ListGroup className="border-0">
      {tasks.map(t => (
        <ListGroup.Item key={t.id} className="border-0 p-0 mb-3">
          <TaskItem task={t} showRemaining={false} showDuration isHistory onUndo={onUndo} />
        </ListGroup.Item>
      ))}
    </ListGroup>
  );
}


