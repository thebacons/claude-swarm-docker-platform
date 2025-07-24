// React hooks for browser usage
const { useState } = React;

function App() {
  const [todos, setTodos] = useState([]);
  const [input, setInput] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (input.trim() === '') return;
    
    setTodos([
      ...todos,
      {
        id: Date.now(),
        text: input,
        completed: false
      }
    ]);
    setInput('');
  };

  const toggleTodo = (id) => {
    setTodos(
      todos.map(todo =>
        todo.id === id ? { ...todo, completed: !todo.completed } : todo
      )
    );
  };

  const deleteTodo = (id) => {
    setTodos(todos.filter(todo => todo.id !== id));
  };

  return (
    <div className="App">
      <h1>Todo List</h1>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Add a new todo"
        />
        <button type="submit">Add Todo</button>
      </form>
      
      <ul style={{ listStyle: 'none', padding: 0 }}>
        {todos.map(todo => (
          <li key={todo.id}>
            <TodoItem 
              todo={todo}
              onToggle={toggleTodo}
              onDelete={deleteTodo}
            />
          </li>
        ))}
      </ul>
    </div>
  );
}


// Make component available globally
if (typeof window !== 'undefined') {
  window.App = App;
}
