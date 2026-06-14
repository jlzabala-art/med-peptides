import CheckCircle2 from "lucide-react/dist/esm/icons/check-circle-2";
import Circle from "lucide-react/dist/esm/icons/circle";
import Clock from "lucide-react/dist/esm/icons/clock";
import Plus from "lucide-react/dist/esm/icons/plus";
import Filter from "lucide-react/dist/esm/icons/filter";
import User from "lucide-react/dist/esm/icons/user";
import AlertCircle from "lucide-react/dist/esm/icons/alert-circle";
import ArrowRight from "lucide-react/dist/esm/icons/arrow-right";
import React, { useState, useEffect } from 'react';
import { collection, query, where, orderBy, onSnapshot, addDoc, updateDoc, doc, serverTimestamp } from 'firebase/firestore';
import { db } from '../../firebase';








import { formatDistanceToNow } from 'date-fns';
import toast from 'react-hot-toast';
import { useNotifications } from '../../context/NotificationContext';

export default function TasksEngine({ entityId = null }) {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false);
  // New Task State
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskDesc, setNewTaskDesc] = useState('');
  const [newTaskPriority, setNewTaskPriority] = useState('Medium');

  const { notifications, markAsRead } = useNotifications();
  const actionableAlerts = notifications.filter(n => !n.read && (n.type === 'alert' || n.type === 'warning'));

  useEffect(() => {
    let q;
    const tasksRef = collection(db, 'tasks');

    if (entityId) {
      q = query(
        tasksRef, 
        where('relatedEntityId', '==', entityId),
        orderBy('createdAt', 'desc')
      );
    } else {
      // Global Tasks
      q = query(
        tasksRef,
        orderBy('createdAt', 'desc')
      );
    }

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const fetchedTasks = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      // Sort to put completed tasks at the bottom
      fetchedTasks.sort((a, b) => {
        if (a.status === 'Completed' && b.status !== 'Completed') return 1;
        if (a.status !== 'Completed' && b.status === 'Completed') return -1;
        return 0;
      });
      setTasks(fetchedTasks);
      setLoading(false);
    }, (err) => {
      console.error("Error fetching tasks:", err);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [entityId]);

  const handleCreateTask = async (e) => {
    e.preventDefault();
    if (!newTaskTitle.trim()) return;

    try {
      await addDoc(collection(db, 'tasks'), {
        title: newTaskTitle,
        description: newTaskDesc,
        priority: newTaskPriority,
        status: 'Open',
        relatedEntityId: entityId || null,
        owner: 'Current User', // Replace with actual auth user
        createdAt: serverTimestamp()
      });
      setNewTaskTitle('');
      setNewTaskDesc('');
      setIsAdding(false);
      toast.success('Task created successfully');
    } catch (err) {
      console.error("Failed to create task", err);
      toast.error('Failed to create task');
    }
  };

  const toggleTaskStatus = async (taskId, currentStatus) => {
    const newStatus = currentStatus === 'Completed' ? 'Open' : 'Completed';
    try {
      await updateDoc(doc(db, 'tasks', taskId), {
        status: newStatus,
        completedAt: newStatus === 'Completed' ? serverTimestamp() : null
      });
    } catch (err) {
      console.error("Failed to update task", err);
      toast.error('Failed to update task status');
    }
  };

  const importAlertAsTask = async (alert) => {
    try {
      await addDoc(collection(db, 'tasks'), {
        title: `Follow up: ${alert.title}`,
        description: alert.desc || alert.message || '',
        priority: 'High',
        status: 'Open',
        relatedEntityId: entityId || alert.relatedEntityId || null,
        owner: 'Current User', 
        createdAt: serverTimestamp(),
        sourceNotificationId: alert.id
      });
      await markAsRead(alert.id);
      toast.success('Alert converted to task');
    } catch (e) {
      console.error('Error importing alert', e);
      toast.error('Failed to convert alert');
    }
  };

  const getPriorityColor = (priority) => {
    switch(priority) {
      case 'High': return '#ef4444';
      case 'Medium': return '#f59e0b';
      case 'Low': return '#3b82f6';
      default: return '#64748b';
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      {/* Header */}
      <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#f8fafc', borderTopLeftRadius: '12px', borderTopRightRadius: '12px' }}>
        <h3 style={{ margin: 0, fontSize: '1rem', color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <CheckCircle2 size={18} color="var(--primary)" /> Universal Tasks
        </h3>
        <button onClick={() => setIsAdding(!isAdding)} className="gcp-btn-secondary" style={{ padding: '0.3rem 0.6rem', fontSize: '0.8rem' }}>
          <Plus size={14} /> Add Task
        </button>
      </div>

      {/* Add Task Form */}
      {isAdding && (
        <form onSubmit={handleCreateTask} style={{ padding: '1rem 1.5rem', backgroundColor: '#f1f5f9', borderBottom: '1px solid var(--border)', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          <input 
            type="text" 
            placeholder="Task Title..." 
            className="gcp-input" 
            value={newTaskTitle} 
            onChange={e => setNewTaskTitle(e.target.value)}
            autoFocus
          />
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <select className="gcp-input" value={newTaskPriority} onChange={e => setNewTaskPriority(e.target.value)} style={{ flex: 1 }}>
              <option>High</option>
              <option>Medium</option>
              <option>Low</option>
            </select>
            <button type="submit" className="gcp-btn-primary">Save</button>
          </div>
        </form>
      )}

      {/* Task List */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '1rem' }}>
        {loading ? (
          <div style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '2rem' }}>Loading tasks...</div>
        ) : tasks.length === 0 && actionableAlerts.length === 0 ? (
          <div style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '2rem', fontSize: '0.85rem' }}>
            No tasks found. You're all caught up!
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            {actionableAlerts.length > 0 && actionableAlerts.map(alert => (
              <div key={`alert-${alert.id}`} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.75rem 1rem', backgroundColor: '#fffbeb', border: '1px solid #fde68a', borderRadius: '8px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <AlertCircle size={16} color="#d97706" />
                  <div style={{ fontSize: '0.85rem', color: '#92400e', fontWeight: 600 }}>{alert.title}</div>
                </div>
                <button 
                  onClick={() => importAlertAsTask(alert)}
                  style={{ background: 'none', border: 'none', color: '#d97706', fontSize: '0.75rem', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.25rem' }}
                >
                  Convert to Task <ArrowRight size={14} />
                </button>
              </div>
            ))}
            {tasks.map(task => {
              const isCompleted = task.status === 'Completed';
              return (
                <div key={task.id} style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem', padding: '1rem', backgroundColor: isCompleted ? '#f8fafc' : 'white', border: '1px solid var(--border)', borderRadius: '8px', opacity: isCompleted ? 0.7 : 1 }}>
                  <button onClick={() => toggleTaskStatus(task.id, task.status)} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, marginTop: '2px', color: isCompleted ? '#10b981' : '#cbd5e1' }}>
                    {isCompleted ? <CheckCircle2 size={20} /> : <Circle size={20} />}
                  </button>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 600, fontSize: '0.9rem', color: isCompleted ? 'var(--text-muted)' : 'var(--text-main)', textDecoration: isCompleted ? 'line-through' : 'none' }}>
                      {task.title}
                    </div>
                    {task.description && (
                      <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>{task.description}</div>
                    )}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginTop: '0.5rem', fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', color: getPriorityColor(task.priority), fontWeight: 700 }}>
                        <Filter size={12} /> {task.priority}
                      </span>
                      {task.createdAt && (
                        <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                          <Clock size={12} /> {formatDistanceToNow(new Date(task.createdAt.seconds * 1000))} ago
                        </span>
                      )}
                      <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                        <User size={12} /> {task.owner}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}