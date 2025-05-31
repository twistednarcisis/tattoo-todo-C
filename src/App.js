import React, { useState, useEffect } from 'react';
import { Check, Plus, X, ChevronUp, ChevronDown } from 'lucide-react';

const App = () => {
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
    return today.toISOString().split('T')[0]; // YYYY-MM-DD format
  };

  // Reset ongoing tasks daily
  const resetOngoingTasks = (tasks) => {
    const savedDate = localStorage.getItem('lastVisitDate');
    const currentDate = getDateKey();
    
    if (savedDate !== currentDate) {
      localStorage.setItem('lastVisitDate', currentDate);
      return tasks.map(task => 
        task.category === 'ONGOING' ? { ...task, completed: false } : task
      );
    }
    return tasks;
  };

  const [tasks, setTasks] = useState(() => {
    const savedTasks = localStorage.getItem('todoTasks');
    let initialTasks = [
      // ONGOING (Daily Reset)
      { id: 27, text: "Weekly social media batch (7 posts, 2.5 hours)", category: "ONGOING", completed: false },
      { id: 28, text: "Gather info for FB groups (Sydney/Bathurst)", category: "ONGOING", completed: false },
      { id: 29, text: "Lightroom editing for portfolio", category: "ONGOING", completed: false },
      { id: 30, text: "Write Bathurst ad for coverups/reworks", category: "ONGOING", completed: false },
      { id: 31, text: "Add healed photos alongside fresh tattoos to portfolio", category: "ONGOING", completed: false },
      { id: 32, text: "Optimize image file sizes for faster website loading", category: "ONGOING", completed: false },
      { id: 33, text: "Add Instagram feed integration to homepage", category: "ONGOING", completed: false },
      { id: 34, text: "Test site speed on mobile and desktop regularly", category: "ONGOING", completed: false },
      
      // CLIENT WORK
      { id: 35, text: "Draw sleeve project #1 - Paying client", category: "CLIENT WORK", completed: false },
      { id: 36, text: "Draw sleeve project #2 - Paying client", category: "CLIENT WORK", completed: false },
      { id: 37, text: "Draw project for Myles - Studio relationship", category: "CLIENT WORK", completed: false },
      { id: 38, text: "Draw large project for brother", category: "CLIENT WORK", completed: false },
      { id: 39, text: "Draw large project for sister-in-law", category: "CLIENT WORK", completed: false },
      
      // URGENT
      { id: 1, text: "Respond to Myles about management role - Decline politely", category: "URGENT", completed: false },
      { id: 2, text: "Assess and buy work station ($550 budget)", category: "URGENT", completed: false },
      { id: 3, text: "Check with Myles about stool/chair", category: "URGENT", completed: false },
      { id: 4, text: "Add tattoo artist license number to website footer", category: "URGENT", completed: false },
      
      // HIGH PRIORITY
      { id: 5, text: "Payment systems setup - Research Beem, PayID, Stripe", category: "HIGH PRIORITY", completed: false },
      { id: 6, text: "Stocktake and order necessary supplies", category: "HIGH PRIORITY", completed: false },
      { id: 7, text: "Complete tax year 24/25 for UK - invoices, payments, receipts, VAT", category: "HIGH PRIORITY", completed: false },
      { id: 8, text: "Find out about GST requirements", category: "HIGH PRIORITY", completed: false },
      { id: 9, text: "Set up accounting/bookkeeping system", category: "HIGH PRIORITY", completed: false },
      { id: 10, text: "Update pricing blog post with current Australian pricing (convert £ to $)", category: "HIGH PRIORITY", completed: false },
      { id: 11, text: "Review and adjust pricing tiers for Australian market", category: "HIGH PRIORITY", completed: false },
      { id: 12, text: "Update deposit amounts and design fees", category: "HIGH PRIORITY", completed: false },
      { id: 13, text: "Create homepage hero image showcasing woodcut-style work", category: "HIGH PRIORITY", completed: false },
      { id: 14, text: "Add prominent 'Book Consultation' button above the fold", category: "HIGH PRIORITY", completed: false },
      
      // MEDIUM PRIORITY
      { id: 15, text: "Go through and check all details on GETINK", category: "MEDIUM PRIORITY", completed: false },
      { id: 16, text: "Finish website work", category: "MEDIUM PRIORITY", completed: false },
      { id: 17, text: "Upload and post to Google business page", category: "MEDIUM PRIORITY", completed: false },
      { id: 18, text: "Create social media plan", category: "MEDIUM PRIORITY", completed: false },
      { id: 19, text: "Film 'who am I' video - script and record", category: "MEDIUM PRIORITY", completed: false },
      { id: 20, text: "Review all blog posts for outdated information", category: "MEDIUM PRIORITY", completed: false },
      { id: 21, text: "Create clear navigation menu (Home, Portfolio, Process, Pricing, Contact, Blog)", category: "MEDIUM PRIORITY", completed: false },
      { id: 22, text: "Add brief descriptions to featured portfolio pieces", category: "MEDIUM PRIORITY", completed: false },
      { id: 23, text: "Create dedicated contact/booking page with form", category: "MEDIUM PRIORITY", completed: false },
      { id: 24, text: "Update current studio location details and directions", category: "MEDIUM PRIORITY", completed: false },
      { id: 25, text: "Add location-specific keywords for Bathurst NSW SEO", category: "MEDIUM PRIORITY", completed: false },
      { id: 26, text: "Verify 301 redirects from .com to .co.uk domain working", category: "MEDIUM PRIORITY", completed: false }
    ];

    if (savedTasks) {
      initialTasks = JSON.parse(savedTasks);
    }
    
    return resetOngoingTasks(initialTasks);
  });

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

  // Save tasks to localStorage whenever tasks change
  useEffect(() => {
    localStorage.setItem('todoTasks', JSON.stringify(tasks));
  }, [tasks]);

  const toggleTask = (id) => {
    setTasks(tasks.map(task => 
      task.id === id ? { ...task, completed: !task.completed } : task
    ));
  };

  const deleteTask = (id) => {
    setTasks(tasks.filter(task => task.id !== id));
  };

  const moveTask = (id, direction) => {
    const taskIndex = tasks.findIndex(task => task.id === id);
    const task = tasks[taskIndex];
    const categoryTasks = tasks.filter(t => t.category === task.category);
    const taskIndexInCategory = categoryTasks.findIndex(t => t.id === id);
    
    if (direction === 'up' && taskIndexInCategory > 0) {
      const targetTask = categoryTasks[taskIndexInCategory - 1];
      const targetIndex = tasks.findIndex(t => t.id === targetTask.id);
      
      const newTasks = [...tasks];
      [newTasks[taskIndex], newTasks[targetIndex]] = [newTasks[targetIndex], newTasks[taskIndex]];
      setTasks(newTasks);
    } else if (direction === 'down' && taskIndexInCategory < categoryTasks.length - 1) {
      const targetTask = categoryTasks[taskIndexInCategory + 1];
      const targetIndex = tasks.findIndex(t => t.id === targetTask.id);
      
      const newTasks = [...tasks];
      [newTasks[taskIndex], newTasks[targetIndex]] = [newTasks[targetIndex], newTasks[taskIndex]];
      setTasks(newTasks);
    }
  };

  const changePriority = (id, newCategory) => {
    const task = tasks.find(t => t.id === id);
    if (!task || task.category === newCategory) return;
    
    // Remove task from current position
    const filteredTasks = tasks.filter(t => t.id !== id);
    
    // Update task category
    const updatedTask = { ...task, category: newCategory };
    
    // Find insertion point (end of the new category)
    const categoryIndex = categories.indexOf(newCategory);
    let insertIndex = filteredTasks.length;
    
    for (let i = categoryIndex + 1; i < categories.length; i++) {
      const nextCategoryFirstIndex = filteredTasks.findIndex(t => t.category === categories[i]);
      if (nextCategoryFirstIndex !== -1) {
        insertIndex = nextCategoryFirstIndex;
        break;
      }
    }
    
    // Insert task at the end of its new category
    const newTasks = [...filteredTasks];
    newTasks.splice(insertIndex, 0, updatedTask);
    setTasks(newTasks);
  };

  const exportTasks = () => {
    const dataToExport = {
      tasks: tasks,
      exportDate: getCurrentDate(),
      exportTime: new Date().toLocaleTimeString('en-AU', { timeZone: 'Australia/Sydney' })
    };
    const dataStr = JSON.stringify(dataToExport, null, 2);
    
    // Copy to clipboard
    navigator.clipboard.writeText(dataStr).then(() => {
      alert('Tasks exported to clipboard! You can now paste this data on another device.');
    }).catch(() => {
      // Fallback for older browsers
      const textArea = document.createElement('textarea');
      textArea.value = dataStr;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      alert('Tasks exported to clipboard! You can now paste this data on another device.');
    });
  };

  const importTasks = () => {
    try {
      const parsedData = JSON.parse(importData);
      if (parsedData.tasks && Array.isArray(parsedData.tasks)) {
        const importedTasks = resetOngoingTasks(parsedData.tasks);
        setTasks(importedTasks);
        setImportData('');
        setShowImportExport(false);
        alert(`Successfully imported ${parsedData.tasks.length} tasks from ${parsedData.exportDate || 'another device'}!`);
      } else {
        alert('Invalid data format. Please make sure you copied the complete export data.');
      }
    } catch (error) {
      alert('Error importing data. Please check the format and try again.');
    }
  };

  const addTask = () => {
    if (newTask.trim()) {
      const newId = Math.max(...tasks.map(t => t.id), 0) + 1;
      const newTaskObj = {
        id: newId,
        text: newTask,
        category: selectedCategory,
        completed: false
      };
      
      // Insert task at the end of its category
      const categoryIndex = categories.indexOf(selectedCategory);
      let insertIndex = tasks.length;
      
      for (let i = categoryIndex + 1; i < categories.length; i++) {
        const nextCategoryFirstIndex = tasks.findIndex(t => t.category === categories[i]);
        if (nextCategoryFirstIndex !== -1) {
          insertIndex = nextCategoryFirstIndex;
          break;
        }
      }
      
      const newTasks = [...tasks];
      newTasks.splice(insertIndex, 0, newTaskObj);
      setTasks(newTasks);
      setNewTask('');
    }
  };

  const groupedTasks = categories.reduce((acc, category) => {
    acc[category] = tasks.filter(task => task.category === category);
    return acc;
  }, {});

  const completedCount = tasks.filter(task => task.completed).length;
  const totalCount = tasks.length;

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white min-h-screen">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">Tattoo Business Tasks</h1>
        <p className="text-lg text-gray-600 mb-4">{getCurrentDate()}</p>
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
            Sync Devices
          </button>
        </div>
        
        {showImportExport && (
          <div className="mb-4 p-3 bg-purple-50 border border-purple-200 rounded">
            <h4 className="font-medium mb-2">Device Sync</h4>
            <div className="space-y-3">
              <div>
                <button
                  onClick={exportTasks}
                  className="w-full px-3 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
                >
                  📤 Export Tasks (Copy to Clipboard)
                </button>
                <p className="text-xs text-gray-600 mt-1">Copy your current tasks to share with another device</p>
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
                <p className="text-xs text-gray-600 mt-1">⚠️ This will replace all current tasks</p>
              </div>
            </div>
          </div>
        )}
        
        <p className="text-sm text-gray-600 mb-3">Add tasks for today or future planning</p>
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
