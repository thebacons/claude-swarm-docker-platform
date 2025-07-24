// React hooks for browser usage
const { useState } = React;

// TaskItem component with workflow status management

const TaskItem = ({ task, onUpdate, onDelete }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editedTask, setEditedTask] = useState(task);
  const [showWorkflow, setShowWorkflow] = useState(false);

  // Get status color
  const getStatusColor = (status) => {
    const colors = {
      'NS': '#6c757d',         // gray
      'IP': '#007bff',         // blue
      'Defect': '#dc3545',     // red
      'Completed': '#28a745',  // green
      'R4-TUT': '#17a2b8',     // cyan
      'R4-FUT': '#20c997',     // teal
      'R4-SIT': '#6610f2',     // purple
      'R4R': '#fd7e14',        // orange
      'R4-UAT': '#ffc107'      // yellow
    };
    return colors[status] || '#6c757d';
  };

  // Get next possible statuses
  const getNextStatuses = () => {
    return window.Storage.getNextStatus(task.status);
  };

  const handleSave = () => {
    onUpdate(task.id, editedTask);
    setIsEditing(false);
  };

  const handleStatusChange = (newStatus) => {
    const updated = { ...task, status: newStatus };
    onUpdate(task.id, updated);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString();
  };

  return (
    <div className="task-item" style={{
      border: '1px solid #ddd',
      borderRadius: '8px',
      padding: '15px',
      marginBottom: '10px',
      backgroundColor: '#fff',
      boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
    }}>
      {isEditing ? (
        // Edit mode
        <div>
          <input
            type="text"
            value={editedTask.title}
            onChange={(e) => setEditedTask({...editedTask, title: e.target.value})}
            style={{ width: '100%', marginBottom: '10px', padding: '5px' }}
          />
          <textarea
            value={editedTask.description}
            onChange={(e) => setEditedTask({...editedTask, description: e.target.value})}
            style={{ width: '100%', marginBottom: '10px', padding: '5px' }}
            rows="3"
          />
          <button onClick={handleSave} style={{ marginRight: '10px' }}>Save</button>
          <button onClick={() => setIsEditing(false)}>Cancel</button>
        </div>
      ) : (
        // View mode
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div style={{ flex: 1 }}>
              <h3 style={{ margin: '0 0 10px 0' }}>
                {task.id}: {task.title}
              </h3>
              <p style={{ margin: '0 0 10px 0', color: '#666' }}>{task.description}</p>
              
              {/* Status badge */}
              <div style={{ marginBottom: '10px' }}>
                <span style={{
                  backgroundColor: getStatusColor(task.status),
                  color: 'white',
                  padding: '5px 10px',
                  borderRadius: '20px',
                  fontSize: '14px',
                  fontWeight: 'bold'
                }}>
                  {window.Storage.STATUSES[task.status]}
                </span>
              </div>
              
              {/* Workflow history */}
              <div style={{ marginBottom: '10px' }}>
                <button 
                  onClick={() => setShowWorkflow(!showWorkflow)}
                  style={{ fontSize: '12px', cursor: 'pointer' }}
                >
                  {showWorkflow ? '▼' : '▶'} Workflow History ({task.workflow.length})
                </button>
                {showWorkflow && (
                  <div style={{ marginTop: '5px', paddingLeft: '20px' }}>
                    {task.workflow.map((status, index) => (
                      <span key={index} style={{
                        display: 'inline-block',
                        margin: '2px',
                        padding: '2px 8px',
                        backgroundColor: getStatusColor(status),
                        color: 'white',
                        borderRadius: '10px',
                        fontSize: '12px'
                      }}>
                        {window.Storage.STATUSES[status]}
                      </span>
                    ))}
                  </div>
                )}
              </div>
              
              {/* Dates */}
              <div style={{ fontSize: '12px', color: '#999' }}>
                Created: {formatDate(task.created)} | Updated: {formatDate(task.updated)}
              </div>
            </div>
            
            {/* Action buttons */}
            <div style={{ marginLeft: '20px' }}>
              <button 
                onClick={() => setIsEditing(true)}
                style={{ marginRight: '5px' }}
              >
                Edit
              </button>
              <button 
                onClick={() => onDelete(task.id)}
                style={{ backgroundColor: '#dc3545', color: 'white' }}
              >
                Delete
              </button>
            </div>
          </div>
          
          {/* Status transition buttons */}
          {task.status !== 'Completed' && (
            <div style={{ marginTop: '15px', borderTop: '1px solid #eee', paddingTop: '15px' }}>
              <strong>Change Status to:</strong>
              <div style={{ marginTop: '5px' }}>
                {getNextStatuses().map(status => (
                  <button
                    key={status}
                    onClick={() => handleStatusChange(status)}
                    style={{
                      margin: '2px',
                      padding: '5px 10px',
                      backgroundColor: getStatusColor(status),
                      color: 'white',
                      border: 'none',
                      borderRadius: '4px',
                      cursor: 'pointer'
                    }}
                  >
                    {window.Storage.STATUSES[status]}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};


// Make component available globally
if (typeof window !== 'undefined') {
  window.TaskItem = TaskItem;
}
