// React component for todo items
const TodoItem = ({ todo, onToggle, onDelete }) => {
  return (
    <div className="todo-item">
      <input
        type="checkbox"
        checked={todo.completed}
        onChange={() => onToggle(todo.id)}
      />
      <span
        style={{
          textDecoration: todo.completed ? 'line-through' : 'none',
          marginLeft: '10px',
          marginRight: '10px'
        }}
      >
        {todo.text}
      </span>
      <button
        onClick={() => onDelete(todo.id)}
        style={{
          backgroundColor: '#ff4444',
          color: 'white',
          border: 'none',
          padding: '5px 10px',
          borderRadius: '3px',
          cursor: 'pointer'
        }}
      >
        Delete
      </button>
    </div>
  );
};


// Make component available globally
if (typeof window !== 'undefined') {
  window.TodoItem = TodoItem;
}
