import { useEffect, useState, useMemo } from 'react';
import { Container, Row, Col, Button, Spinner, Card, ProgressBar, Modal } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import type { Task } from '../types';
import { getTasks, getCompletedTasks } from '../storage';
import TaskTimeline from '../components/TaskTimeline';
import { useSessionState } from '../hooks/useSessionState';
import { useTheme } from '../hooks/useTheme';

export default function TimelinePage() {
  const navigate = useNavigate();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [completed, setCompleted] = useState<Task[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [showModal, setShowModal] = useState<boolean>(false);
  const [modalContent, setModalContent] = useState<{ title: string; content: JSX.Element } | null>(null);

  // Load data effect
  useEffect(() => {
    const loadData = async () => {
      try {
        console.log('Loading data for timeline...');
        const [allTasks, completedTasks] = await Promise.all([
          getTasks(),
          getCompletedTasks()
        ]);
        
        setTasks(allTasks);
        setCompleted(completedTasks);
        setIsLoading(false);
        console.log('Timeline data loaded successfully');
      } catch (error) {
        console.error('Error loading timeline data:', error);
        setIsLoading(false);
      }
    };

    loadData();
  }, []);

  // Use the new theme system
  useTheme();

  // Analytics calculations
  const analytics = useMemo(() => {
    const allTasks = [...tasks, ...completed];
    const completedTasks = completed;
    const activeTasks = tasks;
    
    // Basic stats
    const totalTasks = allTasks.length;
    const completionRate = totalTasks > 0 ? (completedTasks.length / totalTasks) * 100 : 0;
    
    // Time analytics
    const tasksWithDuration = completedTasks.filter(task => 
      task.startDate && task.completedAt && task.endDate
    );
    
    const averageCompletionTime = tasksWithDuration.length > 0 
      ? tasksWithDuration.reduce((sum, task) => {
          const start = new Date(`${task.startDate}T${task.startTime || '00:00'}`).getTime();
          const end = task.completedAt!;
          return sum + (end - start);
        }, 0) / tasksWithDuration.length
      : 0;
    
    const averagePlannedDuration = tasksWithDuration.length > 0
      ? tasksWithDuration.reduce((sum, task) => {
          const start = new Date(`${task.startDate}T${task.startTime || '00:00'}`).getTime();
          const plannedEnd = new Date(`${task.endDate}T${task.endTime || '23:59'}`).getTime();
          return sum + (plannedEnd - start);
        }, 0) / tasksWithDuration.length
      : 0;
    
    // Subject analytics
    const subjectStats = allTasks.reduce((acc, task) => {
      const subject = task.subject || 'No Subject';
      if (!acc[subject]) {
        acc[subject] = { total: 0, completed: 0, active: 0 };
      }
      acc[subject].total++;
      if (task.completedAt) {
        acc[subject].completed++;
      } else {
        acc[subject].active++;
      }
      return acc;
    }, {} as Record<string, { total: number; completed: number; active: number }>);
    
    // Overdue analysis
    const overdueTasks = activeTasks.filter(task => 
      task.endDate && new Date(`${task.endDate}T${task.endTime || '23:59'}`) < new Date()
    );
    
    // Weekly completion trends (last 8 weeks)
    const weeklyTrends = Array.from({ length: 8 }, (_, i) => {
      const weekStart = new Date();
      weekStart.setDate(weekStart.getDate() - (i * 7 + 7));
      const weekEnd = new Date();
      weekEnd.setDate(weekEnd.getDate() - (i * 7));
      
      const weekCompletions = completedTasks.filter(task => 
        task.completedAt && 
        task.completedAt >= weekStart.getTime() && 
        task.completedAt < weekEnd.getTime()
      ).length;
      
      return {
        week: weekStart.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        completions: weekCompletions
      };
    }).reverse();
    
    // Productivity score (based on completion rate and on-time completion)
    const onTimeCompletions = completedTasks.filter(task => {
      if (!task.endDate) return true;
      const dueDate = new Date(`${task.endDate}T${task.endTime || '23:59'}`).getTime();
      return task.completedAt! <= dueDate;
    }).length;
    
    const onTimeRate = completedTasks.length > 0 ? (onTimeCompletions / completedTasks.length) * 100 : 0;
    const productivityScore = (completionRate * 0.6) + (onTimeRate * 0.4);
    
    return {
      totalTasks,
      completionRate,
      averageCompletionTime,
      averagePlannedDuration,
      subjectStats,
      overdueTasks: overdueTasks.length,
      weeklyTrends,
      productivityScore,
      onTimeRate,
      tasksWithDuration: tasksWithDuration.length
    };
  }, [tasks, completed]);

  // Helper functions
  const formatDuration = (ms: number): string => {
    if (ms === 0) return 'No data';
    const hours = Math.floor(ms / (1000 * 60 * 60));
    const days = Math.floor(hours / 24);
    const remainingHours = hours % 24;
    
    if (days > 0) {
      return `${days}d ${remainingHours}h`;
    }
    return `${hours}h`;
  };

  const getProductivityColor = (score: number): string => {
    if (score >= 80) return 'success';
    if (score >= 60) return 'warning';
    return 'danger';
  };

  const getProductivityLabel = (score: number): string => {
    if (score >= 80) return 'Excellent';
    if (score >= 60) return 'Good';
    if (score >= 40) return 'Fair';
    return 'Needs Improvement';
  };

  // Explanation data for each metric
  const explanations = {
    completionRate: {
      title: "📈 Completion Rate",
      content: (
        <div>
          <p><strong>What it measures:</strong> The percentage of all your tasks that have been completed.</p>
          <p><strong>Calculation:</strong> (Completed Tasks ÷ Total Tasks) × 100</p>
          <p><strong>What it tells you:</strong></p>
          <ul>
            <li><strong>High rate (70%+):</strong> You're good at finishing what you start</li>
            <li><strong>Medium rate (40-70%):</strong> Room for improvement in task completion</li>
            <li><strong>Low rate (&lt;40%):</strong> Consider breaking tasks into smaller pieces</li>
          </ul>
          <p><strong>Tips to improve:</strong> Set realistic deadlines, break large tasks into smaller ones, and focus on completing tasks rather than starting new ones.</p>
        </div>
      )
    },
    productivityScore: {
      title: "⚡ Productivity Score",
      content: (
        <div>
          <p><strong>What it measures:</strong> A composite score that combines your completion rate and on-time completion rate.</p>
          <p><strong>Calculation:</strong> (Completion Rate × 0.6) + (On-Time Rate × 0.4)</p>
          <p><strong>Scoring:</strong></p>
          <ul>
            <li><strong>80-100:</strong> Excellent - You're highly productive and reliable</li>
            <li><strong>60-79:</strong> Good - Solid productivity with room for improvement</li>
            <li><strong>40-59:</strong> Fair - Consider improving time management</li>
            <li><strong>0-39:</strong> Needs Improvement - Focus on planning and execution</li>
          </ul>
          <p><strong>What it tells you:</strong> This score balances both quantity (how much you complete) and quality (how well you meet deadlines).</p>
        </div>
      )
    },
    averageCompletionTime: {
      title: "⏱️ Average Completion Time",
      content: (
        <div>
          <p><strong>What it measures:</strong> The average time it takes you to complete tasks from start to finish.</p>
          <p><strong>Calculation:</strong> Sum of all task durations ÷ Number of completed tasks</p>
          <p><strong>What it tells you:</strong></p>
          <ul>
            <li><strong>Shorter than planned:</strong> You're efficient and may be underestimating complexity</li>
            <li><strong>Similar to planned:</strong> Good time estimation skills</li>
            <li><strong>Longer than planned:</strong> Consider improving time estimation or task planning</li>
          </ul>
          <p><strong>Note:</strong> Only includes tasks with both start and end dates. This helps you understand your actual working patterns.</p>
        </div>
      )
    },
    onTimeRate: {
      title: "🎯 On-Time Completion Rate",
      content: (
        <div>
          <p><strong>What it measures:</strong> The percentage of tasks completed by their due date.</p>
          <p><strong>Calculation:</strong> (Tasks completed on time ÷ Total completed tasks) × 100</p>
          <p><strong>What it tells you:</strong></p>
          <ul>
            <li><strong>High rate (80%+):</strong> Excellent deadline management</li>
            <li><strong>Medium rate (60-80%):</strong> Good but could improve time management</li>
            <li><strong>Low rate (&lt;60%):</strong> Consider better planning and time estimation</li>
          </ul>
          <p><strong>Tips to improve:</strong> Set realistic deadlines, add buffer time, and prioritize urgent tasks.</p>
        </div>
      )
    },
    weeklyTrends: {
      title: "📅 Weekly Completion Trend",
      content: (
        <div>
          <p><strong>What it measures:</strong> Your task completion patterns over the last 8 weeks.</p>
          <p><strong>What it shows:</strong></p>
          <ul>
            <li><strong>Rising trend:</strong> Your productivity is improving</li>
            <li><strong>Falling trend:</strong> You may be taking on too much or losing focus</li>
            <li><strong>Consistent pattern:</strong> Stable productivity habits</li>
            <li><strong>Irregular pattern:</strong> Inconsistent work habits</li>
          </ul>
          <p><strong>How to use it:</strong> Look for patterns in your most/least productive weeks. Consider what factors (workload, deadlines, personal events) affect your productivity.</p>
        </div>
      )
    },
    subjectBreakdown: {
      title: "🏷️ Subject Breakdown",
      content: (
        <div>
          <p><strong>What it measures:</strong> Task completion rates by subject or category.</p>
          <p><strong>What it shows:</strong></p>
          <ul>
            <li><strong>High completion subjects:</strong> Areas where you excel</li>
            <li><strong>Low completion subjects:</strong> Areas that need attention</li>
            <li><strong>Subject distribution:</strong> Where you spend most of your time</li>
          </ul>
          <p><strong>How to use it:</strong> Focus on improving completion rates in low-performing subjects. Consider if certain subjects are too complex or if you need different approaches.</p>
        </div>
      )
    },
    timeAnalysis: {
      title: "⏰ Time Analysis",
      content: (
        <div>
          <p><strong>What it measures:</strong> Comparison between planned and actual task durations.</p>
          <p><strong>Key metrics:</strong></p>
          <ul>
            <li><strong>Average Actual Duration:</strong> How long tasks really take</li>
            <li><strong>Average Planned Duration:</strong> How long you planned them to take</li>
            <li><strong>Efficiency Ratio:</strong> Planned time ÷ Actual time (higher = more efficient)</li>
          </ul>
          <p><strong>What it tells you:</strong></p>
          <ul>
            <li><strong>Ratio &gt; 100%:</strong> You're completing tasks faster than planned</li>
            <li><strong>Ratio ≈ 100%:</strong> Excellent time estimation</li>
            <li><strong>Ratio &lt; 100%:</strong> Tasks take longer than expected</li>
          </ul>
        </div>
      )
    }
  };

  const showExplanation = (key: keyof typeof explanations) => {
    setModalContent(explanations[key]);
    setShowModal(true);
  };

  // Show loading spinner while loading data
  if (isLoading) {
    return (
      <Container fluid className="my-4">
        <Row className="justify-content-center">
          <Col xs="auto">
            <div className="text-center">
              <Spinner animation="border" role="status" className="mb-3">
                <span className="visually-hidden">Loading timeline...</span>
              </Spinner>
              <p className="text-muted">Loading timeline data...</p>
            </div>
          </Col>
        </Row>
      </Container>
    );
  }

  return (
    <Container fluid className="my-4">
      {/* Header */}
      <Row className="mb-4">
        <Col>
          <div className="d-flex align-items-center justify-content-between">
            <div>
              <h1 className="mb-2">Task Timeline</h1>
              <p className="text-muted mb-0">
                Visual overview of all your tasks and their due dates
              </p>
            </div>
            <div className="d-flex gap-2">
              <Button
                variant="outline-primary"
                onClick={() => navigate('/')}
                className="d-flex align-items-center gap-1"
              >
                ← Back to Tasks
              </Button>
              <Button
                variant="outline-primary"
                onClick={() => navigate('/quotes')}
                className="d-flex align-items-center gap-1"
              >
                📌 Quotes
              </Button>
            </div>
          </div>
        </Col>
      </Row>

      {/* Timeline */}
      <Row>
        <Col>
          <TaskTimeline tasks={tasks} completedTasks={completed} />
        </Col>
      </Row>

      {/* Analytics Dashboard */}
      <Row className="mt-4">
        <Col>
          <h4 className="mb-4">📊 Task Analytics Dashboard</h4>
          
          {/* Key Metrics */}
          <Row className="mb-4">
            <Col md={3}>
              <Card className="analytics-card clickable-card" onClick={() => showExplanation('completionRate')}>
                <Card.Body className="text-center">
                  <div className="analytics-icon">📈</div>
                  <div className="analytics-number">{analytics.completionRate.toFixed(1)}%</div>
                  <div className="analytics-label">Completion Rate</div>
                  <ProgressBar 
                    now={analytics.completionRate} 
                    variant="success" 
                    className="mt-2"
                    style={{ height: '6px' }}
                  />
                </Card.Body>
              </Card>
            </Col>
            <Col md={3}>
              <Card className="analytics-card clickable-card" onClick={() => showExplanation('productivityScore')}>
                <Card.Body className="text-center">
                  <div className="analytics-icon">⚡</div>
                  <div className="analytics-number">{analytics.productivityScore.toFixed(0)}</div>
                  <div className="analytics-label">Productivity Score</div>
                  <div className={`analytics-badge badge bg-${getProductivityColor(analytics.productivityScore)}`}>
                    {getProductivityLabel(analytics.productivityScore)}
                  </div>
                </Card.Body>
              </Card>
            </Col>
            <Col md={3}>
              <Card className="analytics-card clickable-card" onClick={() => showExplanation('averageCompletionTime')}>
                <Card.Body className="text-center">
                  <div className="analytics-icon">⏱️</div>
                  <div className="analytics-number">{formatDuration(analytics.averageCompletionTime)}</div>
                  <div className="analytics-label">Avg Completion Time</div>
                  <div className="analytics-subtext">
                    {analytics.tasksWithDuration} tasks analyzed
                  </div>
                </Card.Body>
              </Card>
            </Col>
            <Col md={3}>
              <Card className="analytics-card clickable-card" onClick={() => showExplanation('onTimeRate')}>
                <Card.Body className="text-center">
                  <div className="analytics-icon">🎯</div>
                  <div className="analytics-number">{analytics.onTimeRate.toFixed(1)}%</div>
                  <div className="analytics-label">On-Time Completion</div>
                  <ProgressBar 
                    now={analytics.onTimeRate} 
                    variant="info" 
                    className="mt-2"
                    style={{ height: '6px' }}
                  />
                </Card.Body>
              </Card>
            </Col>
          </Row>

          {/* Task Overview */}
          <Row className="mb-4">
            <Col md={6}>
              <Card className="analytics-card">
                <Card.Header>
                  <h6 className="mb-0">📋 Task Overview</h6>
                </Card.Header>
                <Card.Body>
                  <div className="row g-3">
                    <div className="col-6">
                      <div className="stat-item">
                        <div className="stat-number text-primary">{tasks.length}</div>
                        <div className="stat-label">Active Tasks</div>
                      </div>
                    </div>
                    <div className="col-6">
                      <div className="stat-item">
                        <div className="stat-number text-success">{completed.length}</div>
                        <div className="stat-label">Completed Tasks</div>
                      </div>
                    </div>
                    <div className="col-6">
                      <div className="stat-item">
                        <div className="stat-number text-warning">{analytics.overdueTasks}</div>
                        <div className="stat-label">Overdue Tasks</div>
                      </div>
                    </div>
                    <div className="col-6">
                      <div className="stat-item">
                        <div className="stat-number text-info">{analytics.totalTasks}</div>
                        <div className="stat-label">Total Tasks</div>
                      </div>
                    </div>
                  </div>
                </Card.Body>
              </Card>
            </Col>
            <Col md={6}>
              <Card className="analytics-card clickable-card" onClick={() => showExplanation('weeklyTrends')}>
                <Card.Header>
                  <h6 className="mb-0">📅 Weekly Completion Trend</h6>
                </Card.Header>
                <Card.Body>
                  <div className="trend-chart">
                    {analytics.weeklyTrends.map((week, index) => {
                      const maxCompletions = Math.max(...analytics.weeklyTrends.map(w => w.completions));
                      const height = maxCompletions > 0 ? (week.completions / maxCompletions) * 100 : 0;
                      return (
                        <div key={index} className="trend-bar">
                          <div 
                            className="trend-bar-fill"
                            style={{ height: `${height}%` }}
                            title={`${week.week}: ${week.completions} tasks`}
                          />
                          <div className="trend-label">{week.week}</div>
                        </div>
                      );
                    })}
                  </div>
                </Card.Body>
              </Card>
            </Col>
          </Row>

          {/* Subject Breakdown */}
          <Row className="mb-4">
            <Col>
              <Card className="analytics-card clickable-card" onClick={() => showExplanation('subjectBreakdown')}>
                <Card.Header>
                  <h6 className="mb-0">🏷️ Subject Breakdown</h6>
                </Card.Header>
                <Card.Body>
                  <div className="row g-3">
                    {Object.entries(analytics.subjectStats).map(([subject, stats]) => {
                      const completionRate = stats.total > 0 ? (stats.completed / stats.total) * 100 : 0;
                      return (
                        <div key={subject} className="col-md-4">
                          <div className="subject-card">
                            <div className="subject-header">
                              <span className="subject-name">{subject}</span>
                              <span className="subject-total">{stats.total} tasks</span>
                            </div>
                            <div className="subject-stats">
                              <div className="subject-stat">
                                <span className="stat-label">Completed:</span>
                                <span className="stat-value text-success">{stats.completed}</span>
                              </div>
                              <div className="subject-stat">
                                <span className="stat-label">Active:</span>
                                <span className="stat-value text-primary">{stats.active}</span>
                              </div>
                            </div>
                            <ProgressBar 
                              now={completionRate} 
                              variant="success" 
                              className="mt-2"
                              style={{ height: '4px' }}
                            />
                            <div className="subject-rate">{completionRate.toFixed(1)}% complete</div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </Card.Body>
              </Card>
            </Col>
          </Row>

          {/* Time Analysis */}
          {analytics.tasksWithDuration > 0 && (
            <Row className="mb-4">
              <Col md={6}>
                <Card className="analytics-card clickable-card" onClick={() => showExplanation('timeAnalysis')}>
                  <Card.Header>
                    <h6 className="mb-0">⏰ Time Analysis</h6>
                  </Card.Header>
                  <Card.Body>
                    <div className="time-analysis">
                      <div className="time-item">
                        <div className="time-label">Average Actual Duration</div>
                        <div className="time-value">{formatDuration(analytics.averageCompletionTime)}</div>
                      </div>
                      <div className="time-item">
                        <div className="time-label">Average Planned Duration</div>
                        <div className="time-value">{formatDuration(analytics.averagePlannedDuration)}</div>
                      </div>
                      <div className="time-item">
                        <div className="time-label">Efficiency Ratio</div>
                        <div className="time-value">
                          {analytics.averagePlannedDuration > 0 
                            ? ((analytics.averagePlannedDuration / analytics.averageCompletionTime) * 100).toFixed(1) + '%'
                            : 'N/A'
                          }
                        </div>
                      </div>
                    </div>
                  </Card.Body>
                </Card>
              </Col>
              <Col md={6}>
                <Card className="analytics-card">
                  <Card.Header>
                    <h6 className="mb-0">💡 Insights</h6>
                  </Card.Header>
                  <Card.Body>
                    <div className="insights">
                      {analytics.completionRate > 70 && (
                        <div className="insight-item text-success">
                          🎉 Great job! You're maintaining a high completion rate.
                        </div>
                      )}
                      {analytics.overdueTasks > 0 && (
                        <div className="insight-item text-warning">
                          ⚠️ You have {analytics.overdueTasks} overdue task{analytics.overdueTasks > 1 ? 's' : ''}. Consider prioritizing them.
                        </div>
                      )}
                      {analytics.onTimeRate < 60 && (
                        <div className="insight-item text-info">
                          💡 Try breaking down large tasks into smaller, more manageable pieces.
                        </div>
                      )}
                      {analytics.weeklyTrends[analytics.weeklyTrends.length - 1]?.completions > 
                       analytics.weeklyTrends[analytics.weeklyTrends.length - 2]?.completions && (
                        <div className="insight-item text-success">
                          📈 Your productivity is trending upward this week!
                        </div>
                      )}
                    </div>
                  </Card.Body>
                </Card>
              </Col>
            </Row>
          )}
        </Col>
      </Row>

      {/* Explanation Modal */}
      <Modal show={showModal} onHide={() => setShowModal(false)} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>{modalContent?.title}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {modalContent?.content}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowModal(false)}>
            Close
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
}
