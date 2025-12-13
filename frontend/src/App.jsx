import { useEffect, useMemo, useState } from 'react';
import './App.css';

const defaultTask = { title: '', description: '', status: 'todo', dueDate: '' };

function App() {
  const apiBase = useMemo(
    () => import.meta.env.VITE_API_BASE_URL || 'http://localhost:5001',
    []
  );

  const [user, setUser] = useState(null);
  const [authMode, setAuthMode] = useState('login');
  const [authForm, setAuthForm] = useState({
    name: '',
    email: '',
    password: '',
    role: 'user',
  });
  const [taskForm, setTaskForm] = useState(defaultTask);
  const [tasks, setTasks] = useState([]);
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const request = async (path, options = {}) => {
    const headers = { 'Content-Type': 'application/json', ...(options.headers || {}) };
    try {
      const res = await fetch(`${apiBase}${path}`, {
        ...options,
        headers,
        credentials: 'include', // Send cookies with all requests
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(data.message || `Request failed with status ${res.status}`);
      }
      return data;
    } catch (err) {
      // Handle network errors (backend not running, CORS, etc.)
      if (err.name === 'TypeError' || err.message.includes('Failed to fetch')) {
        throw new Error(
          `Cannot connect to backend at ${apiBase}. Please ensure the backend server is running.`
        );
      }
      throw err;
    }
  };

  const loadProfile = async () => {
    try {
      const data = await request('/api/v1/auth/me');
      setUser(data.user);
      setMessage('');
      return true;
    } catch (err) {
      setUser(null);
      return false;
    }
  };

  const loadTasks = async () => {
    try {
      const data = await request('/api/v1/tasks');
      setTasks(data.tasks || []);
    } catch (err) {
      setMessage(err.message);
    }
  };

  useEffect(() => {
    loadProfile().then((isAuthenticated) => {
      if (isAuthenticated) {
        loadTasks();
      }
    });
  }, []);

  const handleAuthChange = (e) => {
    setAuthForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleTaskChange = (e) => {
    setTaskForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const data = await request('/api/v1/auth/register', {
        method: 'POST',
        body: JSON.stringify(authForm),
      });
      setUser(data.user);
      await loadTasks();
      setMessage('Registered and logged in');
    } catch (err) {
      setMessage(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const data = await request('/api/v1/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email: authForm.email, password: authForm.password }),
      });
      setUser(data.user);
      await loadTasks();
      setMessage('Logged in');
    } catch (err) {
      setMessage(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await request('/api/v1/auth/logout', { method: 'POST' });
    } catch (err) {
      // Continue with logout even if request fails
    }
    setUser(null);
    setTasks([]);
    setMessage('Logged out');
  };

  const handleCreateTask = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const payload = { ...taskForm, dueDate: taskForm.dueDate || undefined };
      await request('/api/v1/tasks', {
        method: 'POST',
        body: JSON.stringify(payload),
      });
      setTaskForm(defaultTask);
      await loadTasks();
      setMessage('Task created');
    } catch (err) {
      setMessage(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateTask = async (id, updates) => {
    setLoading(true);
    try {
      await request(`/api/v1/tasks/${id}`, {
        method: 'PATCH',
        body: JSON.stringify(updates),
      });
      await loadTasks();
      setMessage('Task updated');
    } catch (err) {
      setMessage(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteTask = async (id) => {
    setLoading(true);
    try {
      await request(`/api/v1/tasks/${id}`, { method: 'DELETE' });
      await loadTasks();
      setMessage('Task deleted');
    } catch (err) {
      setMessage(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="layout">
      <header>
        <div>
          <h1>✨ Task Manager</h1>
          <p>Organize your work with style</p>
        </div>
        {user ? (
          <div className="user-chip">
            <div>
              <strong>👤 {user.name}</strong> <span className="badge">{user.role}</span>
            </div>
            <div className="muted">{user.email}</div>
            <button className="ghost" onClick={handleLogout} disabled={loading}>
              {loading ? '...' : '🚪 Logout'}
            </button>
          </div>
        ) : null}
      </header>

      {message && (
        <div
          className="toast"
          style={{
            background:
              message.toLowerCase().includes('error') ||
              message.toLowerCase().includes('failed') ||
              message.toLowerCase().includes('invalid')
                ? 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)'
                : 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
          }}
        >
          {message}
        </div>
      )}

      <section className="grid">
        <div className="card">
          <div className="tabs">
            <button
              className={authMode === 'login' ? 'active' : ''}
              onClick={() => setAuthMode('login')}
            >
              Login
            </button>
            <button
              className={authMode === 'register' ? 'active' : ''}
              onClick={() => setAuthMode('register')}
            >
              Register
            </button>
          </div>

          <form onSubmit={authMode === 'login' ? handleLogin : handleRegister} className="form">
            {authMode === 'register' && (
              <label>
                <span>Name</span>
                <input
                  name="name"
                  value={authForm.name}
                  onChange={handleAuthChange}
                  required
                  placeholder="Jane Doe"
                />
              </label>
            )}
            <label>
              <span>Email</span>
              <input
                type="email"
                name="email"
                value={authForm.email}
                onChange={handleAuthChange}
                required
                placeholder="you@example.com"
              />
            </label>
            <label>
              <span>Password</span>
              <input
                type="password"
                name="password"
                value={authForm.password}
                onChange={handleAuthChange}
                required
                minLength={6}
              />
            </label>
            {authMode === 'register' && (
              <label>
                <span>Role</span>
                <select name="role" value={authForm.role} onChange={handleAuthChange}>
                  <option value="user">User</option>
                  <option value="admin">Admin</option>
                </select>
              </label>
            )}
            <button type="submit" disabled={loading}>
              {loading && <span className="loading-spinner"></span>}
              {authMode === 'login' ? '🔐 Login' : '✨ Register'}
            </button>
          </form>
        </div>

        <div className="card">
          <div className="card-heading">
            <h3>➕ Create New Task</h3>
            <span className="muted">✨ Get organized</span>
          </div>
          {user ? (
            <form onSubmit={handleCreateTask} className="form">
              <label>
                <span>📝 Title</span>
                <input
                  name="title"
                  value={taskForm.title}
                  onChange={handleTaskChange}
                  required
                  placeholder="e.g., Complete project documentation"
                />
              </label>
              <label>
                <span>📄 Description</span>
                <textarea
                  name="description"
                  value={taskForm.description}
                  onChange={handleTaskChange}
                  placeholder="Add more details about this task..."
                />
              </label>
              <div className="two-col">
                <label>
                  <span>📊 Status</span>
                  <select name="status" value={taskForm.status} onChange={handleTaskChange}>
                    <option value="todo">📋 To do</option>
                    <option value="in-progress">⚡ In progress</option>
                    <option value="done">✅ Done</option>
                  </select>
                </label>
                <label>
                  <span>📅 Due date</span>
                  <input
                    type="date"
                    name="dueDate"
                    value={taskForm.dueDate}
                    onChange={handleTaskChange}
                  />
                </label>
              </div>
              <button type="submit" disabled={loading}>
                {loading && <span className="loading-spinner"></span>}
                ➕ Add Task
              </button>
            </form>
          ) : (
            <div className="empty-state">
              <p>🔒 Please login to create tasks</p>
            </div>
          )}
        </div>
      </section>

      <section className="card">
        <div className="card-heading">
          <h3>📋 Your Tasks</h3>
          <button className="ghost" onClick={loadTasks} disabled={!user || loading}>
            {loading ? '⏳' : '🔄 Refresh'}
          </button>
        </div>
        {!user ? (
          <div className="empty-state">
            <p>🔒 Please login to view your tasks</p>
          </div>
        ) : tasks.length === 0 ? (
          <div className="empty-state">
            <p>🎉 No tasks yet! Create your first task above.</p>
          </div>
        ) : (
          <ul className="task-list">
            {tasks.map((task) => (
              <li key={task._id} className="task">
                <div style={{ flex: 1 }}>
                  <div className="task-title">
                    <strong>{task.title}</strong>
                    <span className={`badge ${task.status}`}>{task.status}</span>
                  </div>
                  {task.description && (
                    <div className="muted" style={{ marginTop: '0.5rem', marginBottom: '0.5rem' }}>
                      {task.description}
                    </div>
                  )}
                  <div className="muted small">
                    📅 Due: {task.dueDate ? new Date(task.dueDate).toLocaleDateString() : 'No due date'}
                  </div>
                </div>
                <div className="actions">
                  <select
                    value={task.status}
                    onChange={(e) => handleUpdateTask(task._id, { status: e.target.value })}
                    disabled={loading}
                    style={{ minWidth: '140px' }}
                  >
                    <option value="todo">📋 To do</option>
                    <option value="in-progress">⚡ In progress</option>
                    <option value="done">✅ Done</option>
                  </select>
                  <button
                    className="ghost danger"
                    onClick={() => handleDeleteTask(task._id)}
                    disabled={loading}
                  >
                    🗑️ Delete
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}

export default App;
