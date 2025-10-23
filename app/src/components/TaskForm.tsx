import { useMemo, useState } from 'react';
import { Button, Form, Row, Col } from 'react-bootstrap';
import type { NewTask, Subject } from '../types';
import { useSessionState } from '../hooks/useSessionState';

type Props = { onSubmit: (task: NewTask) => void; subjectSuggestions?: string[] };

export default function TaskForm({ onSubmit, subjectSuggestions = [] }: Props) {
  const today = useMemo(() => {
    // YYYY-MM-DD in America/Chicago
    return new Intl.DateTimeFormat('en-CA', {
      timeZone: 'America/Chicago',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    }).format(new Date());
  }, []);
  const nowTime = useMemo(() => new Intl.DateTimeFormat('en-US', {
    timeZone: 'America/Chicago',
    hour12: false,
    hour: '2-digit',
    minute: '2-digit'
  }).format(new Date()), []);
  const defaultEndTime = '23:59';
  const [title, setTitle] = useSessionState<string>('form:title', '');
  const [startDate, setStartDate] = useSessionState<string>('form:startDate', today);
  const [startTime, setStartTime] = useSessionState<string>('form:startTime', nowTime);
  const [endDate, setEndDate] = useSessionState<string>('form:endDate', '');
  const [endTime, setEndTime] = useSessionState<string>('form:endTime', defaultEndTime);
  const [workload, setWorkload] = useSessionState<string>('form:workload', '');
  const [link, setLink] = useSessionState<string>('form:link', '');
  const [subject, setSubject] = useSessionState<Subject>('form:subject', '');
  const [errors, setErrors] = useState<Record<string, string>>({});

  function validate() {
    const next: Record<string, string> = {};
    if (!title.trim()) next.title = 'Title is required';
    // End date is now optional
    // Compare full datetimes when both available
    if (startDate && endDate) {
      const start = new Date(`${startDate}T${startTime || '00:00'}`);
      const end = new Date(`${endDate}T${endTime || '00:00'}`);
      if (end.getTime() < start.getTime()) next.endDate = 'End must be after start';
    }
    if (workload && isNaN(Number(workload))) next.workload = 'Workload must be a number';
    if (link && !/^https?:\/\//i.test(link)) next.link = 'Link must start with http or https';
    setErrors(next);
    return Object.keys(next).length === 0;
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!validate()) return;
    const wl = workload.trim() === '' ? undefined : Number(workload);
    const lk = link.trim() === '' ? undefined : link.trim();
    onSubmit({ title: title.trim(), startDate, startTime, endDate, endTime, workload: wl, link: lk, subject: subject || undefined });
    setTitle('');
    setStartDate(today);
    setStartTime(nowTime);
    setEndDate('');
    setEndTime(defaultEndTime);
    setWorkload('');
    setLink('');
    setErrors({});
    setSubject('');
  }

  return (
    <Form onSubmit={handleSubmit} noValidate>
      <Form.Group className="mb-3" controlId="title">
        <Form.Label>Title</Form.Label>
        <Form.Control
          type="text"
          value={title}
          onChange={e => setTitle(e.target.value)}
          required
          isInvalid={!!errors.title}
          aria-invalid={!!errors.title}
          placeholder="e.g., Buy groceries"
        />
        <Form.Control.Feedback type="invalid">{errors.title}</Form.Control.Feedback>
      </Form.Group>

      <Row xs={1} sm={2} className="mb-3">
        <Form.Group as={Col} controlId="startDate">
          <Form.Label>Start date</Form.Label>
          <Form.Control
            type="date"
            value={startDate}
            onChange={e => setStartDate(e.target.value)}
          />
        </Form.Group>
        <Form.Group as={Col} controlId="startTime">
          <Form.Label>Start time</Form.Label>
          <Form.Control
            type="time"
            value={startTime}
            onChange={e => setStartTime(e.target.value)}
          />
        </Form.Group>
      </Row>

      <Row xs={1} sm={2} className="mb-3">
        <Form.Group as={Col} controlId="endDate">
          <Form.Label>End date (optional)</Form.Label>
          <Form.Control
            type="date"
            value={endDate}
            onChange={e => setEndDate(e.target.value)}
            isInvalid={!!errors.endDate}
            aria-invalid={!!errors.endDate}
          />
          <Form.Control.Feedback type="invalid">{errors.endDate}</Form.Control.Feedback>
        </Form.Group>
        <Form.Group as={Col} controlId="endTime">
          <Form.Label>End time (optional)</Form.Label>
          <Form.Control
            type="time"
            value={endTime}
            onChange={e => setEndTime(e.target.value)}
            isInvalid={!!errors.endTime}
            aria-invalid={!!errors.endTime}
          />
          <Form.Control.Feedback type="invalid">{errors.endTime}</Form.Control.Feedback>
        </Form.Group>
      </Row>

      <Row xs={1} sm={2} lg={3} className="mb-3">
        <Form.Group as={Col} controlId="workload">
          <Form.Label>Workload (optional)</Form.Label>
          <Form.Control
            type="number"
            inputMode="numeric"
            value={workload}
            onChange={e => setWorkload(e.target.value)}
            isInvalid={!!errors.workload}
            aria-invalid={!!errors.workload}
            placeholder="e.g., 2"
          />
          <Form.Control.Feedback type="invalid">{errors.workload}</Form.Control.Feedback>
        </Form.Group>
        <Form.Group as={Col} controlId="link">
          <Form.Label>Link (optional)</Form.Label>
          <Form.Control
            type="url"
            value={link}
            onChange={e => setLink(e.target.value)}
            isInvalid={!!errors.link}
            aria-invalid={!!errors.link}
            placeholder="https://..."
          />
          <Form.Control.Feedback type="invalid">{errors.link}</Form.Control.Feedback>
        </Form.Group>
        <Form.Group as={Col} controlId="subject">
          <Form.Label>Subject</Form.Label>
          <Form.Control
            type="text"
            value={subject}
            onChange={e => setSubject(e.target.value)}
            placeholder="e.g., Project Alpha"
            list="subject-suggestions"
          />
          {subjectSuggestions.length > 0 && (
            <datalist id="subject-suggestions">
              {subjectSuggestions.map(s => (
                <option key={s} value={s} />
              ))}
            </datalist>
          )}
        </Form.Group>
      </Row>

      <div className="d-flex gap-3 mt-4">
        <Button type="submit" className="flex-grow-1">Add Task</Button>
        <Button type="button" variant="outline-secondary" onClick={() => {
          setTitle('');
          setStartDate(today);
          setStartTime(nowTime);
          setEndDate('');
          setEndTime(defaultEndTime);
          setWorkload('');
          setLink('');
          setErrors({});
          setSubject('');
        }}>Reset</Button>
      </div>
    </Form>
  );
}


