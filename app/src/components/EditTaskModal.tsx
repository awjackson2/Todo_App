import { useState, useEffect } from 'react';
import { Modal, Button, Form, Row, Col } from 'react-bootstrap';
import type { Task, NewTask } from '../types';

type Props = {
  task: Task;
  show: boolean;
  onHide: () => void;
  onSubmit: (updatedTask: Task) => void;
  subjectSuggestions: string[];
};

export default function EditTaskModal({ task, show, onHide, onSubmit, subjectSuggestions }: Props) {
  const [formData, setFormData] = useState<NewTask>({
    title: '',
    startDate: '',
    endDate: '',
    startTime: '',
    endTime: '',
    workload: undefined,
    link: '',
    subject: '',
  });

  // Initialize form data when task changes
  useEffect(() => {
    if (task) {
      setFormData({
        title: task.title,
        startDate: task.startDate,
        endDate: task.endDate || '',
        startTime: task.startTime || '',
        endTime: task.endTime || '',
        workload: task.workload,
        link: task.link || '',
        subject: task.subject || '',
      });
    }
  }, [task]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate required fields
    if (!formData.title.trim()) {
      alert('Task title is required');
      return;
    }
    
    if (!formData.startDate) {
      alert('Start date is required');
      return;
    }

    // Create updated task
    const updatedTask: Task = {
      ...task,
      ...formData,
      // Clean up undefined values
      endDate: formData.endDate || undefined,
      startTime: formData.startTime || undefined,
      endTime: formData.endTime || undefined,
      workload: formData.workload || undefined,
      link: formData.link || undefined,
      subject: formData.subject || undefined,
    };

    onSubmit(updatedTask);
    onHide();
  };

  const handleInputChange = (field: keyof NewTask, value: string | number | undefined) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  return (
    <Modal show={show} onHide={onHide} size="lg" centered>
      <Modal.Header closeButton>
        <Modal.Title>Edit Task</Modal.Title>
      </Modal.Header>
      <Form onSubmit={handleSubmit}>
        <Modal.Body>
          <Form.Group className="mb-3" controlId="title">
            <Form.Label>Task Title *</Form.Label>
            <Form.Control
              type="text"
              value={formData.title}
              onChange={(e) => handleInputChange('title', e.target.value)}
              placeholder="Enter task title"
              required
            />
          </Form.Group>

          <Row xs={1} sm={2} className="mb-3">
            <Form.Group as={Col} controlId="startDate">
              <Form.Label>Start Date *</Form.Label>
              <Form.Control
                type="date"
                value={formData.startDate}
                onChange={(e) => handleInputChange('startDate', e.target.value)}
                required
              />
            </Form.Group>
            <Form.Group as={Col} controlId="startTime">
              <Form.Label>Start Time</Form.Label>
              <Form.Control
                type="time"
                value={formData.startTime}
                onChange={(e) => handleInputChange('startTime', e.target.value)}
              />
            </Form.Group>
          </Row>

          <Row xs={1} sm={2} className="mb-3">
            <Form.Group as={Col} controlId="endDate">
              <Form.Label>End Date</Form.Label>
              <Form.Control
                type="date"
                value={formData.endDate}
                onChange={(e) => handleInputChange('endDate', e.target.value)}
              />
            </Form.Group>
            <Form.Group as={Col} controlId="endTime">
              <Form.Label>End Time</Form.Label>
              <Form.Control
                type="time"
                value={formData.endTime}
                onChange={(e) => handleInputChange('endTime', e.target.value)}
              />
            </Form.Group>
          </Row>

          <Row xs={1} sm={2} lg={3} className="mb-3">
            <Form.Group as={Col} controlId="workload">
              <Form.Label>Workload (hours)</Form.Label>
              <Form.Control
                type="number"
                min="0"
                step="0.5"
                value={formData.workload || ''}
                onChange={(e) => handleInputChange('workload', e.target.value ? parseFloat(e.target.value) : undefined)}
                placeholder="0"
              />
            </Form.Group>
            <Form.Group as={Col} controlId="link">
              <Form.Label>Link</Form.Label>
              <Form.Control
                type="url"
                value={formData.link}
                onChange={(e) => handleInputChange('link', e.target.value)}
                placeholder="https://..."
              />
            </Form.Group>
            <Form.Group as={Col} controlId="subject">
              <Form.Label>Subject</Form.Label>
              <Form.Control
                type="text"
                list="subjectSuggestions"
                value={formData.subject}
                onChange={(e) => handleInputChange('subject', e.target.value)}
                placeholder="Enter or select subject"
              />
              <datalist id="subjectSuggestions">
                {subjectSuggestions.map(suggestion => (
                  <option key={suggestion} value={suggestion} />
                ))}
              </datalist>
            </Form.Group>
          </Row>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={onHide}>
            Cancel
          </Button>
          <Button variant="primary" type="submit">
            Save Changes
          </Button>
        </Modal.Footer>
      </Form>
    </Modal>
  );
}
