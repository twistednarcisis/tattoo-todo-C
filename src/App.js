import React, { useState, useEffect } from 'react';
import { Check, Plus, X, ChevronUp, ChevronDown, LogOut } from 'lucide-react';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { collection, doc, setDoc, deleteDoc, onSnapshot, query, orderBy } from 'firebase/firestore';
import { auth, db } from './firebase';
import Login from './components/Login';

const App = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [tasks, setTasks] = useState([]);
  const [newTask, setNewTask] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('URGENT');
  const [showImportExport, setShowImportExport] = useState(false);
  const [importData, setImportData] = useState('');

  const categories = ['ONGOING', 'CLIENT WORK', 'URGENT', 'HIGH PRIORITY', 'MEDIUM PRIORITY'];
  
  const categoryColors = {
    'URGENT': 'bg-red-100 border-red-300 text-red-800',
    'HIGH PRIORITY': 'bg-orange-100 border-orange-300 text-orange-800',
    'MEDIUM PRIORITY': 'bg-yellow-100 border-yellow-300 text-yellow-800',
    'ONGOING': 'bg-blue-100 border-blue-300 text-blue-800',
    'CLIENT WORK': 'bg-green-100 border-green-300 text-green-800'
  };

  const getCurrentDate = () => {
    const today = new Date();
    const options = { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric',
      timeZone: 'Australia/Sydney'
    };
    return today.toLocaleDateString('en-AU', options);
  };

  const getDateKey = () => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  };

  // Handle authentication
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // Handle Firestore real-time sync
  useEffect(() => {
    if (!user) return;

    const tasksQuery = query(
      collection(db, `users/${user.uid}/tasks`),
      orderBy('order', 'asc')
    );

    const unsubscribe = onSnapshot(tasksQuery, (snapshot) => {
      const tasksData = [];
      snapshot.forEach((doc) => {
        tasksData.push({ id: doc.id, ...doc.data() });
      });
      
      // Reset ongoing tasks if it's a new day
      const savedDate = localStorage.getItem('lastVisitDate');
      const currentDate = getDateKey();
      
      if (savedDate !== currentDate) {
        localStorage.setItem('lastVisitDate', currentDate);
        tasksData.forEach(task => {
          if (task.category === 'ONGOING') {
            updateTaskInFirebase(task.id, { ...task, completed: false });
          }
        });
      }
      
      setTasks(tasksData);
    });

    return () => unsubscribe();
  }, [user]);

  const updateTaskInFirebase = async (taskId, taskData) => {
    if (!user) return;
    
    const { id, ...dataWithoutId } = taskData;
    await setDoc(doc(db, `users/${user.uid}/tasks`, taskId), dataWithoutId);
  };

  const deleteTaskFromFirebase = async (taskId) => {
    if (!user) return;
    
    await deleteDoc(doc(db, `users/${user.uid}/tasks`, taskId));
  };

  const toggleTask = (id) => {
    const task = tasks.find(t => t.id === id);
    if (task) {
      updateTaskInFirebase(id, { ...task, completed: !task.completed });
    }
  };

  const deleteTask = (id) => {
    deleteTaskFromFirebase(id);
  };

  const moveTask = async (id, direction) => {
    const taskIndex = tasks.findIndex(task => task.id === id);
    const task = tasks[taskIndex];
    const categoryTasks = tasks.filter(t => t.category === task.category);
    const taskIndexInCategory = categoryTasks.findIndex(t => t.id === id);
    
    if (direction === 'up' && taskIndexInCategory > 0) {
      const targetTask = categoryTasks[taskIndexInCategory - 1];
      const targetIndex = tasks.findIndex(t => t.id === targetTask.id);
      
      // Swap order values
      await updateTaskInFirebase(task.id, { ...task, order: targetTask.order });
      await updateTaskInFirebase(targetTask.id, { ...targetTask, order: task.order });
    } else if (direction === 'down' && taskIndexInCategory < categoryTasks.length - 1) {
      const targetTask = categoryTasks[taskIndexInCategory + 1];
      const targetIndex = tasks.findIndex(t => t.id === targetTask.id);
      
      // Swap order values
      await updateTaskInFirebase(task.id, { ...task, order: targetTask.order });
      await updateTaskInFirebase(targetTask.id, { ...targetTask, order: task.order });
    }
  };

  const changePriority = async (id, newCategory) => {
    const task = tasks.find(t => t.id === id);
    if (!task || task.category === newCategory) return;
    
    // Find the highest order value in the new category
    const categoryTasks = tasks.filter(t => t.category === newCategory);
    const maxOrder = categoryTasks.length > 0 
      ? Math.max(...categoryTasks.map(t => t.order)) 
      : 0;
    
    await updateTaskInFirebase(id, { 
      ...task, 
      category: newCategory,
      order: maxOrder + 1
    });
  };

  const addTask = async () => {
    if (newTask.trim() && user) {
      const newId = Date.now().toString();
      
      // Find the highest order value in the category
      const categoryTasks = tasks.filter(t => t.category === selectedCategory);
      const maxOrder = categoryTasks.length > 0 
        ? Math.max(...categoryTasks.map(t => t.order)) 
        : 0;
      
      const newTaskObj = {
        text: newTask,
        category: selectedCategory,
        completed: false,
        order: maxOrder + 1,
        createdAt: new Date().toISOString()
      };
      
      await setDoc(doc(db, `users/${user.uid}/tasks`, newId), newTaskObj);
      setNewTask('');
    }
  };

  const exportTasks = () => {
    const dataToExport = {
      tasks: tasks,
      exportDate: getCurrentDate(),
      exportTime: new Date().toLocaleTimeString('en-AU', { timeZone: 'Australia/Sydney' })
    };
    const dataStr = JSON.stringify(dataToExport, null, 2);
    
    navigator.clipboard.writeText(dataStr).then(() => {
      alert('Tasks exported to clipboard!');
    });
  };

  const importTasks = async () => {
    try {
      const parsedData = JSON.parse(importData);
      if (parsedData.tasks && Array.isArray(parsedData.tasks) && user) {
        // Delete all existing tasks
        const deletePromises = tasks.map(task => deleteTaskFromFirebase(task.id));
        await Promise.all(deletePromises);
        
        // Add imported tasks
        const addPromises = parsedData.tasks.map(task => {
          const { id, ...taskData } = task;
          return setDoc(doc(db, `users/${user.uid}/tasks`, id || Date.now().toString()), taskData);
        });
        await Promise.all(addPromises);
        
        setImportData('');
        setShowImportExport(false);
        alert(`Successfully imported ${parsedData.tasks.length} tasks!`);
      }
    } catch (error) {
      alert('Error importing data. Please check the format and try again.');
    }
  };

  const handleSignOut = () => {
    signOut(auth);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl">Loading...</div>
      </div>
    );
  }

  if (!user) {
    return <Login />;
  }

  const groupedTasks = categories.reduce((acc, category) => {
    acc[category] = tasks.filter(task => task.category === category)
      .sort((a, b) => a.order - b.order);
    return acc;
  }, {});

  const completedCount = tasks.filter(task => task.completed).length;
  const totalCount = tasks.length;

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white min-h-screen">
      <div className="mb-8">
        <div className="flex justify-between items-center mb-2">
          <h1 className="text-3xl font-bold text-gray-800">Tattoo Business Tasks</h1>
          <button
            onClick={handleSignOut}
            className="flex items-center gap-2 px-3 py-1 text-sm bg-gray-200 hover:bg-gray-300 rounded transition-colors"
          >
            <LogOut size={16} />
            Sign Out
          </button>
        </div>
        <p className="text-lg text-gray-600 mb-1">{getCurrentDate()}</p>
        <p className="text-sm text-gray-500 mb-4">Syncing as: {user.email}</p>
        <div className="bg-gray-100 p-4 rounded-lg">
          <div className="flex justify-between items-center mb-2">
            <span className="text-lg font-medium">Progress</span>
            <span className="text-lg font-medium">{completedCount}/{totalCount} completed</span>
          </div>
          <div className="w-full bg-gray-300 rounded-full h-3">
            <div 
              className="bg-green-500 h-3 rounded-full transition-all duration-300"
              style={{ width: `${totalCount ? (completedCount / totalCount) * 100 : 0}%` }}
            ></div>
          </div>
        </div>
      </div>

      <div className="mb-6 p-4 bg-gray-50 rounded-lg">
        <div className="flex justify-between items-center mb-3">
          <h3 className="text-lg font-semibold">Add New Task</h3>
          <button
            onClick={() => setShowImportExport(!showImportExport)}
            className="px-3 py-1 bg-purple-500 text-white text-sm rounded hover:bg-purple-600 transition-colors"
          >
            Import/Export
          </button>
        </div>
        
        {showImportExport && (
          <div className="mb-4 p-3 bg-purple-50 border border-purple-200 rounded">
            <h4 className="font-medium mb-2">Import/Export Data</h4>
            <p className="text-xs text-gray-600 mb-3">
              Note: With cloud sync enabled, you usually don't need this feature. Use it only for backups or migrating data.
            </p>
            <div className="space-y-3">
              <div>
                <button
                  onClick={exportTasks}
                  className="w-full px-3 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
                >
                  📤 Export Tasks (Backup)
                </button>
              </div>
              <div>
                <textarea
                  value={importData}
                  onChange={(e) => setImportData(e.target.value)}
                  placeholder="Paste exported task data here..."
                  className="w-full p-2 border border-gray-300 rounded text-sm h-20 resize-none"
                />
                <div className="flex gap-2 mt-2">
                  <button
                    onClick={importTasks}
                    className="px-3 py-1 bg-green-500 text-white text-sm rounded hover:bg-green-600 transition-colors"
                    disabled={!importData.trim()}
                  >
                    📥 Import Tasks
                  </button>
                  <button
                    onClick={() => {setShowImportExport(false); setImportData('');}}
                    className="px-3 py-1 bg-gray-500 text-white text-sm rounded hover:bg-gray-600 transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
        
        <div className="flex gap-3">
          <input
            type="text"
            value={newTask}
            onChange={(e) => setNewTask(e.target.value)}
            placeholder="Enter new task..."
            className="flex-1 p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            onKeyPress={(e) => e.key === 'Enter' && addTask()}
          />
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {categories.map(category => (
              <option key={category} value={category}>{category}</option>
            ))}
          </select>
          <button
            onClick={addTask}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
          >
            <Plus size={20} />
          </button>
        </div>
      </div>

      {categories.map(category => (
        <div key={category} className="mb-8">
          <h2 className={`text-xl font-bold mb-4 px-3 py-2 rounded-lg ${categoryColors[category]}`}>
            {category} {category === 'ONGOING' && <span className="text-sm font-normal">(resets daily)</span>}
          </h2>
          <div className="space-y-2">
            {groupedTasks[category].map(task => (
              <div
                key={task.id}
                className={`flex items-center p-3 border rounded-lg transition-all ${
                  task.completed 
                    ? 'bg-gray-100 border-gray-300' 
                    : 'bg-white border-gray-200 hover:border-gray-300'
                }`}
              >
                <button
                  onClick={() => toggleTask(task.id)}
                  className={`mr-3 w-6 h-6 rounded border-2 flex items-center justify-center transition-colors ${
                    task.completed
                      ? 'bg-green-500 border-green-500 text-white'
                      : 'border-gray-300 hover:border-green-400'
                  }`}
                >
                  {task.completed && <Check size={16} />}
                </button>
                <span className={`flex-1 ${task.completed ? 'line-through text-gray-500' : 'text-gray-800'}`}>
                  {task.text}
                </span>
                <div className="flex items-center ml-2 gap-1">
                  <select
                    value={task.category}
                    onChange={(e) => changePriority(task.id, e.target.value)}
                    className="text-xs p-1 border border-gray-300 rounded bg-white hover:border-blue-400 focus:outline-none focus:ring-1 focus:ring-blue-500"
                    title="Change priority"
                  >
                    {categories.map(category => (
                      <option key={category} value={category}>
                        {category === 'ONGOING' ? 'ONGOING' : 
                         category === 'CLIENT WORK' ? 'CLIENT' :
                         category === 'HIGH PRIORITY' ? 'HIGH' :
                         category === 'MEDIUM PRIORITY' ? 'MEDIUM' :
                         'URGENT'}
                      </option>
                    ))}
                  </select>
                  <button
                    onClick={() => moveTask(task.id, 'up')}
                    className="p-1 text-gray-500 hover:text-blue-600 transition-colors"
                    title="Move up"
                  >
                    <ChevronUp size={16} />
                  </button>
                  <button
                    onClick={() => moveTask(task.id, 'down')}
                    className="p-1 text-gray-500 hover:text-blue-600 transition-colors"
                    title="Move down"
                  >
                    <ChevronDown size={16} />
                  </button>
                  <button
                    onClick={() => deleteTask(task.id)}
                    className="p-1 text-red-500 hover:text-red-700 transition-colors"
                    title="Delete task"
                  >
                    <X size={16} />
                  </button>
                </div>
              </div>
            ))}
            {groupedTasks[category].length === 0 && (
              <p className="text-gray-500 italic p-3">No tasks in this category</p>
            )}
          </div>
        </div>
      ))}
    </div>
  );
};

export default App;
