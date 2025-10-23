import { ListGroup } from 'react-bootstrap';
import type { Task } from '../types';
import TaskItem from './TaskItem';

type Props = {
  tasks: Task[];
  onDelete: (id: string) => void;
  onComplete?: (id: string) => void;
  onEdit?: (task: Task) => void;
};

export default function TaskList({ tasks, onDelete, onComplete, onEdit }: Props) {
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
    <ListGroup className="border-0">
      {tasks.map(task => (
        <ListGroup.Item key={task.id} className="border-0 p-0 mb-3">
          <TaskItem task={task} onDelete={onDelete} onComplete={onComplete} onEdit={onEdit} />
        </ListGroup.Item>
      ))}
    </ListGroup>
  );
}


