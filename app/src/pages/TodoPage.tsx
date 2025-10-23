import { useEffect, useMemo, useState } from 'react';
import { Container, Row, Col, Card, Button, Spinner, Dropdown } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import type { Task, NewTask } from '../types';
import { getTasks, saveTasks, getCompletedTasks, saveAll, subscribeToUserData, getXPData, saveXPData } from '../storage';
import TaskForm from '../components/TaskForm';
import TaskList from '../components/TaskList';
import TaskGrid from '../components/TaskGrid';
import CompletedList from '../components/CompletedList';
import EditTaskModal from '../components/EditTaskModal';
import XPBar from '../components/XPBar';
import ThemeSelector from '../components/ThemeSelector';
import RandomQuote from '../components/RandomQuote';
import { useSessionState } from '../hooks/useSessionState';
import { useInfiniteScroll } from '../hooks/useInfiniteScroll';
import { useTheme } from '../hooks/useTheme';

export default function TodoPage() {
  const navigate = useNavigate();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [completed, setCompleted] = useState<Task[]>([]);
  const [taskSubjectFilter, setTaskSubjectFilter] = useSessionState<string>('ui:taskSubjectFilter', '');
  const [completedSubjectFilter, setCompletedSubjectFilter] = useSessionState<string>('ui:completedSubjectFilter', '');
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [showEditModal, setShowEditModal] = useState<boolean>(false);
  const [taskSortBy, setTaskSortBy] = useSessionState<string>('ui:taskSortBy', 'createdAt');
  const [taskSortOrder, setTaskSortOrder] = useSessionState<string>('ui:taskSortOrder', 'desc');
  const [taskViewMode, setTaskViewMode] = useSessionState<string>('ui:taskViewMode', 'list');
  const [completedSortBy, setCompletedSortBy] = useSessionState<string>('ui:completedSortBy', 'completedAt');
  const [completedSortOrder, setCompletedSortOrder] = useSessionState<string>('ui:completedSortOrder', 'desc');
  const [currentXP, setCurrentXP] = useState<number>(0);
  const [currentLevel, setCurrentLevel] = useState<number>(1);
  const [displayedTasksCount, setDisplayedTasksCount] = useState<number>(20); // Start with 20 tasks
  const [displayedCompletedCount, setDisplayedCompletedCount] = useState<number>(20); // Start with 20 completed tasks
  
  // Use the new theme system
  useTheme();

  // Reset displayed counts when filters change
  useEffect(() => {
    setDisplayedTasksCount(20);
  }, [taskSubjectFilter, taskSortBy, taskSortOrder]);

  useEffect(() => {
    setDisplayedCompletedCount(20);
  }, [completedSubjectFilter, completedSortBy, completedSortOrder]);

  // Infinite scroll logic for tasks
  const handleLoadMoreTasks = () => {
    setDisplayedTasksCount(prev => prev + 20);
  };

  const { loadMoreRef, isLoading: isLoadingMore } = useInfiniteScroll(handleLoadMoreTasks, {
    enabled: true,
    threshold: 100
  });

  // Infinite scroll logic for completed tasks
  const handleLoadMoreCompleted = () => {
    setDisplayedCompletedCount(prev => prev + 20);
  };

  const { loadMoreRef: loadMoreCompletedRef, isLoading: isLoadingMoreCompleted } = useInfiniteScroll(handleLoadMoreCompleted, {
    enabled: true,
    threshold: 100
  });

  // Load data effect
  useEffect(() => {
    const loadData = async () => {
      try {
        console.log('Loading data from Firebase...');
        const [allTasks, completedTasks, xpData] = await Promise.all([
          getTasks(),
          getCompletedTasks(),
          getXPData()
        ]);
        
        setTasks(allTasks);
        setCompleted(completedTasks);
        setCurrentXP(xpData.xp);
        setCurrentLevel(xpData.level);
        setIsLoading(false);
        console.log('Data loaded successfully');
      } catch (error) {
        console.error('Error loading data:', error);
        setIsLoading(false);
      }
    };

    loadData();
  }, []);

  // Real-time data subscription
  useEffect(() => {
    const unsubscribe = subscribeToUserData((newTasks, newCompleted) => {
      setTasks(newTasks);
      setCompleted(newCompleted);
    });

    return unsubscribe;
  }, []);


  async function addTask(newTask: NewTask) {
    console.log('Adding new task:', newTask);
    const task: Task = {
      ...newTask,
      id: crypto.randomUUID(),
      createdAt: Date.now(),
    };
    const newTasks = [task, ...tasks];
    setTasks(newTasks);
    // Save to Firebase immediately
    await saveTasks(newTasks);
  }

  async function removeTask(id: string) {
    const newTasks = tasks.filter(t => t.id !== id);
    setTasks(newTasks);
    // Save to Firebase immediately
    await saveTasks(newTasks);
  }

  async function completeTask(id: string) {
    const t = tasks.find(x => x.id === id);
    if (!t) return;
    const newTasks = tasks.filter(x => x.id !== id);
    const finished: Task = { ...t, completedAt: Date.now() };
    const newCompleted = [finished, ...completed];
    setTasks(newTasks);
    setCompleted(newCompleted);
    // Save to Firebase immediately
    await saveAll(newTasks, newCompleted);
  }

  async function clearAll() {
    if (confirm('Delete all tasks? This cannot be undone.')) {
      const newTasks: Task[] = [];
      setTasks(newTasks);
      // Save to Firebase immediately
      await saveAll(newTasks, completed);
    }
  }

  async function clearHistory() {
    if (confirm('Clear completed history? This cannot be undone.')) {
      const newCompleted: Task[] = [];
      setCompleted(newCompleted);
      // Save to Firebase immediately
      await saveAll(tasks, newCompleted);
    }
  }

  function handleEditTask(task: Task) {
    setEditingTask(task);
    setShowEditModal(true);
  }

  function handleCloseEditModal() {
    setShowEditModal(false);
    setEditingTask(null);
  }

  async function handleUpdateTask(updatedTask: Task) {
    const newTasks = tasks.map(t => t.id === updatedTask.id ? updatedTask : t);
    setTasks(newTasks);
    // Save to Firebase immediately
    await saveTasks(newTasks);
  }

  const handleXPUpdate = async (xp: number, level: number) => {
    setCurrentXP(xp);
    setCurrentLevel(level);
    
    await saveXPData(xp, level);
  };


  const handleUndoTask = async (task: Task) => {
    // Remove from completed tasks
    const updatedCompleted = completed.filter(t => t.id !== task.id);
    setCompleted(updatedCompleted);
    
    // Add back to current tasks (remove completedAt timestamp)
    const { completedAt, ...taskWithoutCompletedAt } = task;
    const updatedTasks = [...tasks, taskWithoutCompletedAt];
    setTasks(updatedTasks);
    
    // Save to Firebase
    await saveAll(updatedTasks, updatedCompleted);
  };

  const subjectSuggestions = useMemo(() => {
    const set = new Set<string>();
    for (const t of tasks) if (t.subject) set.add(t.subject);
    for (const t of completed) if (t.subject) set.add(t.subject);
    return [...set];
  }, [tasks, completed]);

  const filteredTasks = useMemo(() => (
    taskSubjectFilter ? tasks.filter(t => t.subject === taskSubjectFilter) : tasks
  ), [tasks, taskSubjectFilter]);

  const sortedAndFilteredTasks = useMemo(() => {
    const filtered = filteredTasks;
    const sorted = [...filtered].sort((a, b) => {
      let aValue: any;
      let bValue: any;

      switch (taskSortBy) {
        case 'title':
          aValue = a.title.toLowerCase();
          bValue = b.title.toLowerCase();
          break;
        case 'startDate':
          aValue = new Date(a.startDate).getTime();
          bValue = new Date(b.startDate).getTime();
          break;
        case 'endDate':
          aValue = a.endDate ? new Date(a.endDate).getTime() : Infinity;
          bValue = b.endDate ? new Date(b.endDate).getTime() : Infinity;
          break;
        case 'subject':
          aValue = a.subject || '';
          bValue = b.subject || '';
          break;
        case 'workload':
          aValue = a.workload || 0;
          bValue = b.workload || 0;
          break;
        case 'createdAt':
        default:
          aValue = a.createdAt;
          bValue = b.createdAt;
          break;
      }

      if (aValue < bValue) return taskSortOrder === 'asc' ? -1 : 1;
      if (aValue > bValue) return taskSortOrder === 'asc' ? 1 : -1;
      return 0;
    });

    return sorted;
  }, [filteredTasks, taskSortBy, taskSortOrder]);

  const filteredCompleted = useMemo(() => (
    completedSubjectFilter ? completed.filter(t => t.subject === completedSubjectFilter) : completed
  ), [completed, completedSubjectFilter]);

  const sortedAndFilteredCompleted = useMemo(() => {
    const filtered = filteredCompleted;
    const sorted = [...filtered].sort((a, b) => {
      let aValue: any;
      let bValue: any;

      switch (completedSortBy) {
        case 'title':
          aValue = a.title.toLowerCase();
          bValue = b.title.toLowerCase();
          break;
        case 'startDate':
          aValue = new Date(a.startDate).getTime();
          bValue = new Date(b.startDate).getTime();
          break;
        case 'endDate':
          aValue = a.endDate ? new Date(a.endDate).getTime() : Infinity;
          bValue = b.endDate ? new Date(b.endDate).getTime() : Infinity;
          break;
        case 'subject':
          aValue = a.subject || '';
          bValue = b.subject || '';
          break;
        case 'workload':
          aValue = a.workload || 0;
          bValue = b.workload || 0;
          break;
        case 'completedAt':
        default:
          aValue = a.completedAt || 0;
          bValue = b.completedAt || 0;
          break;
      }

      if (aValue < bValue) return completedSortOrder === 'asc' ? -1 : 1;
      if (aValue > bValue) return completedSortOrder === 'asc' ? 1 : -1;
      return 0;
    });

    return sorted;
  }, [filteredCompleted, completedSortBy, completedSortOrder]);

  // Show loading spinner while authenticating
  if (isLoading) {
    return (
      <Container fluid className="my-4">
        <Row className="justify-content-center">
          <Col xs="auto">
            <div className="text-center">
              <Spinner animation="border" role="status" className="mb-3">
                <span className="visually-hidden">Loading...</span>
              </Spinner>
              <p className="text-muted">Connecting to database...</p>
            </div>
          </Col>
        </Row>
      </Container>
    );
  }

  return (
    <>
    <Container fluid className="my-4">
          <Row className="mb-5 header-row">
            <Col lg={6} className="d-flex align-items-center">
          <h1 className="mb-0">Todo List</h1>
              <p className="text-muted mb-0 ms-3">
                Organize your tasks with precision and clarity
                <span className="text-success ms-2">• Synced across devices</span>
              </p>
            </Col>
            <Col lg={6} className="d-flex align-items-center justify-content-end">
              {/* XP Bar */}
              <XPBar 
                completedTasks={completed} 
                currentXP={currentXP} 
                onXPUpdate={handleXPUpdate}
              />
        </Col>
      </Row>

          <Row xs={1} lg={12} className="g-3 g-lg-4 align-items-stretch flex-grow-1" style={{ minHeight: 0 }}>
          <Col lg={3} className="d-flex">
          <Card className="flex-grow-1 panel-fixed d-flex flex-column">
            <Card.Header className="d-flex align-items-center justify-content-between">
              <span className="fw-semibold">Add Task</span>
            </Card.Header>
            <Card.Body className="d-flex flex-column scrollable-content" style={{ overflowY: 'auto', maxHeight: '70vh' }}>
              <TaskForm onSubmit={addTask} subjectSuggestions={subjectSuggestions} />
              <RandomQuote />
            </Card.Body>
          </Card>
        </Col>

          <Col lg={6} className="d-flex">
            <Card className="flex-grow-1 task-panel d-flex flex-column">
              <Card.Header className="d-flex align-items-center justify-content-between gap-2 flex-wrap">
              <span className="fw-semibold">Tasks</span>
                <div className="d-flex align-items-center gap-1 flex-wrap">
                  <Dropdown>
                    <Dropdown.Toggle
                      variant="outline-secondary"
                      size="sm"
                      className="d-flex align-items-center justify-content-center"
                      style={{ width: '36px', height: '36px', padding: 0 }}
                      title={`Filter by subject${taskSubjectFilter ? `: ${taskSubjectFilter}` : ''}`}
                    >
                      🔍
                    </Dropdown.Toggle>
                    <Dropdown.Menu align="end">
                      <Dropdown.Item 
                        active={!taskSubjectFilter}
                        onClick={() => setTaskSubjectFilter('')}
                      >
                        All subjects
                      </Dropdown.Item>
                  {subjectSuggestions.map(s => (
                        <Dropdown.Item 
                          key={s}
                          active={taskSubjectFilter === s}
                          onClick={() => setTaskSubjectFilter(s)}
                        >
                          {s}
                        </Dropdown.Item>
                      ))}
                    </Dropdown.Menu>
                  </Dropdown>
                  
                  <Dropdown>
                    <Dropdown.Toggle
                      variant="outline-secondary"
                      size="sm"
                      className="d-flex align-items-center justify-content-center"
                      style={{ width: '36px', height: '36px', padding: 0 }}
                      title={`Sort by ${taskSortBy === 'createdAt' ? 'Created' : taskSortBy === 'startDate' ? 'Start Date' : taskSortBy === 'endDate' ? 'End Date' : taskSortBy}`}
                    >
                      📊
                    </Dropdown.Toggle>
                    <Dropdown.Menu align="end">
                      <Dropdown.Item 
                        active={taskSortBy === 'createdAt'}
                        onClick={() => { setTaskSortBy('createdAt')}}
                      >
                        Created
                      </Dropdown.Item>
                      <Dropdown.Item 
                        active={taskSortBy === 'title'}
                        onClick={() => { setTaskSortBy('title')}}
                      >
                        Title
                      </Dropdown.Item>
                      <Dropdown.Item 
                        active={taskSortBy === 'startDate'}
                        onClick={() => { setTaskSortBy('startDate')}}
                      >
                        Start Date
                      </Dropdown.Item>
                      <Dropdown.Item 
                        active={taskSortBy === 'endDate'}
                        onClick={() => { setTaskSortBy('endDate')}}
                      >
                        End Date
                      </Dropdown.Item>
                      <Dropdown.Item 
                        active={taskSortBy === 'subject'}
                        onClick={() => { setTaskSortBy('subject')}}
                      >
                        Subject
                      </Dropdown.Item>
                      <Dropdown.Item 
                        active={taskSortBy === 'workload'}
                        onClick={() => { setTaskSortBy('workload')}}
                      >
                        Workload
                      </Dropdown.Item>
                    </Dropdown.Menu>
                  </Dropdown>
                  
                  <Button 
                    variant="outline-secondary" 
                    size="sm" 
                    onClick={() => { setTaskSortOrder(taskSortOrder === 'asc' ? 'desc' : 'asc')}} 
                    title={`Sort ${taskSortOrder === 'asc' ? 'descending' : 'ascending'}`}
                    className="d-flex align-items-center justify-content-center"
                    style={{ width: '36px', height: '36px', padding: 0 }}
                  >
                    {taskSortOrder === 'asc' ? '↑' : '↓'}
                  </Button>
                  
                <Button 
                  variant="outline-secondary" 
                  size="sm" 
                  onClick={() => setTaskViewMode(taskViewMode === 'list' ? 'grid' : 'list')} 
                  title={`Switch to ${taskViewMode === 'list' ? 'grid' : 'list'} view`}
                  className="d-flex align-items-center justify-content-center"
                  style={{ width: '36px', height: '36px', padding: 0 }}
                >
                  {taskViewMode === 'list' ? '⊞' : '☰'}
                </Button>
                <Button 
                  variant="outline-danger" 
                  size="sm" 
                  onClick={clearAll} 
                  disabled={tasks.length === 0} 
                  title="Clear tasks"
                  className="d-flex align-items-center justify-content-center"
                  style={{ width: '36px', height: '36px', padding: 0 }}
                >
                  ×
                </Button>
              </div>
            </Card.Header>
              <Card.Body className="d-flex flex-column p-0">
                <div className="scrollable-content p-3">
                  {taskViewMode === 'list' ? (
                    <TaskList tasks={sortedAndFilteredTasks.slice(0, displayedTasksCount)} onDelete={removeTask} onComplete={completeTask} onEdit={handleEditTask} />
                  ) : (
                    <TaskGrid tasks={sortedAndFilteredTasks.slice(0, displayedTasksCount)} onDelete={removeTask} onComplete={completeTask} onEdit={handleEditTask} />
                  )}
                  
                  {/* Infinite scroll trigger */}
                  {displayedTasksCount < sortedAndFilteredTasks.length && (
                    <div ref={loadMoreRef} className="infinite-scroll-trigger">
                      {isLoadingMore ? (
                        <Spinner animation="border" size="sm" />
                      ) : (
                        <div>Scroll to load more...</div>
                      )}
                    </div>
                  )}
                  
                  {/* End of list indicator */}
                  {displayedTasksCount >= sortedAndFilteredTasks.length && sortedAndFilteredTasks.length > 0 && (
                    <div className="infinite-scroll-end">
                      You've reached the end of your tasks
                    </div>
                  )}
              </div>
            </Card.Body>
          </Card>
        </Col>

          <Col lg={3} className="d-flex">
            <Card className="flex-grow-1 task-panel d-flex flex-column">
            <Card.Header className="d-flex align-items-center justify-content-between gap-2 flex-wrap">
              <span className="fw-semibold">History</span>
              <div className="d-flex align-items-center gap-1 flex-wrap">
                <Dropdown>
                  <Dropdown.Toggle
                    variant="outline-secondary"
                    size="sm"
                    className="d-flex align-items-center justify-content-center"
                    style={{ width: '36px', height: '36px', padding: 0 }}
                    title={`Filter by subject${completedSubjectFilter ? `: ${completedSubjectFilter}` : ''}`}
                  >
                    🔍
                  </Dropdown.Toggle>
                  <Dropdown.Menu align="end">
                    <Dropdown.Item 
                      active={!completedSubjectFilter}
                      onClick={() => { setCompletedSubjectFilter('')}}
                    >
                      All subjects
                    </Dropdown.Item>
                  {subjectSuggestions.map(s => (
                      <Dropdown.Item 
                        key={s}
                        active={completedSubjectFilter === s}
                        onClick={() => { setCompletedSubjectFilter(s)}}
                      >
                        {s}
                      </Dropdown.Item>
                    ))}
                  </Dropdown.Menu>
                </Dropdown>
                
                <Dropdown>
                  <Dropdown.Toggle
                    variant="outline-secondary"
                    size="sm"
                    className="d-flex align-items-center justify-content-center"
                    style={{ width: '36px', height: '36px', padding: 0 }}
                    title={`Sort by ${completedSortBy === 'completedAt' ? 'Completed' : completedSortBy === 'startDate' ? 'Start Date' : completedSortBy === 'endDate' ? 'End Date' : completedSortBy}`}
                  >
                    📊
                  </Dropdown.Toggle>
                  <Dropdown.Menu align="end">
                    <Dropdown.Item 
                      active={completedSortBy === 'completedAt'}
                      onClick={() => { setCompletedSortBy('completedAt')}}
                    >
                      Completed
                    </Dropdown.Item>
                    <Dropdown.Item 
                      active={completedSortBy === 'title'}
                      onClick={() => { setCompletedSortBy('title')}}
                    >
                      Title
                    </Dropdown.Item>
                    <Dropdown.Item 
                      active={completedSortBy === 'startDate'}
                      onClick={() => { setCompletedSortBy('startDate')}}
                    >
                      Start Date
                    </Dropdown.Item>
                    <Dropdown.Item 
                      active={completedSortBy === 'endDate'}
                      onClick={() => { setCompletedSortBy('endDate')}}
                    >
                      End Date
                    </Dropdown.Item>
                    <Dropdown.Item 
                      active={completedSortBy === 'subject'}
                      onClick={() => { setCompletedSortBy('subject')}}
                    >
                      Subject
                    </Dropdown.Item>
                    <Dropdown.Item 
                      active={completedSortBy === 'workload'}
                      onClick={() => { setCompletedSortBy('workload')}}
                    >
                      Workload
                    </Dropdown.Item>
                  </Dropdown.Menu>
                </Dropdown>
                
                <Button 
                  variant="outline-secondary" 
                  size="sm" 
                  onClick={() => { setCompletedSortOrder(completedSortOrder === 'asc' ? 'desc' : 'asc')}} 
                  title={`Sort ${completedSortOrder === 'asc' ? 'descending' : 'ascending'}`}
                  className="d-flex align-items-center justify-content-center"
                  style={{ width: '36px', height: '36px', padding: 0 }}
                >
                  {completedSortOrder === 'asc' ? '↑' : '↓'}
                </Button>
                
                <Button 
                  variant="outline-danger" 
                  size="sm" 
                  onClick={clearHistory} 
                  disabled={completed.length === 0} 
                  title="Clear history"
                  className="d-flex align-items-center justify-content-center"
                  style={{ width: '36px', height: '36px', padding: 0 }}
                >
                  ×
                </Button>
              </div>
            </Card.Header>
              <Card.Body className="d-flex flex-column p-0">
                <div className="scrollable-content p-3">
                  <CompletedList 
                    tasks={sortedAndFilteredCompleted.slice(0, displayedCompletedCount)} 
                    onUndo={handleUndoTask}
                  />
                  
                  {/* Infinite scroll trigger for completed tasks */}
                  {displayedCompletedCount < sortedAndFilteredCompleted.length && (
                    <div ref={loadMoreCompletedRef} className="infinite-scroll-trigger">
                      {isLoadingMoreCompleted ? (
                        <Spinner animation="border" size="sm" />
                      ) : (
                        <div>Scroll to load more...</div>
                      )}
                    </div>
                  )}
                  
                  {/* End of completed list indicator */}
                  {displayedCompletedCount >= sortedAndFilteredCompleted.length && sortedAndFilteredCompleted.length > 0 && (
                    <div className="infinite-scroll-end">
                      You've reached the end of your completed tasks
                    </div>
                  )}
                </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>
      </Container>

      {/* Bottom Navigation Bar - Outside main app div */}
      <div className="bottom-navbar">
        <Container fluid>
          <div className="d-flex justify-content-between align-items-center w-100 py-2">
            <div className="d-flex align-items-center gap-2">
              <ThemeSelector 
                currentLevel={currentLevel}
              />
            </div>
            <div className="text-center flex-grow-1">
              <span className="small text-muted fw-medium">
                <span className="d-none d-sm-inline">{tasks.length} active · {completed.length} completed</span>
                <span className="d-sm-none">{tasks.length + completed.length} total</span>
              </span>
            </div>
            <div className="d-flex align-items-center gap-2">
              <Button
                variant="outline-primary"
                size="sm"
                onClick={() => navigate('/timeline')}
                title="View task timeline"
                className="d-flex align-items-center gap-1"
              >
                📅 Timeline
              </Button>
              <Button
                variant="outline-primary"
                size="sm"
                onClick={() => navigate('/quotes')}
                title="View pinned quotes"
                className="d-flex align-items-center gap-1"
              >
                📌 Quotes
              </Button>
              <span className="small text-muted">
                <span className="d-none d-lg-inline">Firebase</span>
                <span className="d-lg-none">☁️</span>
            </span>
            </div>
          </div>
        </Container>
      </div>

      {/* Edit Task Modal */}
      {editingTask && (
        <EditTaskModal
          task={editingTask}
          show={showEditModal}
          onHide={handleCloseEditModal}
          onSubmit={handleUpdateTask}
          subjectSuggestions={subjectSuggestions}
        />
      )}

    </>
  );
}
