// React hooks for browser usage
const { useState } = React;


 TestComponent() {
  const [count, setCount] = useState(0);
  
  return (
    <div>
      <h1>Test Component</h1>
      <p>Count: {count}</p>
      <button onClick={() => setCount(count + 1)}>
        Increment
      </button>
    </div>
  );
}

// Make component available globally
if (typeof window !== 'undefined') {
  window.function = function;
}
