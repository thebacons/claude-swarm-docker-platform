import React, { useState, useCallback, useEffect, useRef } from 'react';
import PropTypes from 'prop-types';

/**
 * A perfect, production-ready counter component that addresses all edge cases
 * and follows React best practices.
 */
const PerfectCounter = ({
  initialValue = 0,
  min = Number.MIN_SAFE_INTEGER,
  max = Number.MAX_SAFE_INTEGER,
  step = 1,
  onChange = null,
  onMinReached = null,
  onMaxReached = null,
  label = "Counter",
  disabled = false,
  allowKeyboardControl = true,
  persistToLocalStorage = false,
  storageKey = 'counterValue',
  className = '',
  style = {},
  incrementButtonText = '+',
  decrementButtonText = '-',
  resetButtonText = 'Reset',
  showReset = true,
  animateChanges = true,
  ariaLabel = null,
  testId = 'counter-component'
}) => {
  // Initialize state with validation
  const getValidatedInitialValue = () => {
    const savedValue = persistToLocalStorage 
      ? parseInt(localStorage.getItem(storageKey), 10) 
      : null;
    
    const value = savedValue !== null && !isNaN(savedValue) 
      ? savedValue 
      : initialValue;
    
    // Ensure value is within bounds
    return Math.max(min, Math.min(max, value));
  };

  const [count, setCount] = useState(getValidatedInitialValue);
  const [isAnimating, setIsAnimating] = useState(false);
  const previousCountRef = useRef(count);
  const containerRef = useRef(null);

  // Validate props
  useEffect(() => {
    if (min > max) {
      console.error('PerfectCounter: min value cannot be greater than max value');
    }
    if (step <= 0) {
      console.error('PerfectCounter: step must be a positive number');
    }
    if (!Number.isInteger(step) && (Number.isInteger(min) || Number.isInteger(max))) {
      console.warn('PerfectCounter: Using non-integer step with integer bounds');
    }
  }, [min, max, step]);

  // Handle count changes
  useEffect(() => {
    // Trigger animation
    if (animateChanges && count !== previousCountRef.current) {
      setIsAnimating(true);
      const timer = setTimeout(() => setIsAnimating(false), 300);
      previousCountRef.current = count;
      return () => clearTimeout(timer);
    }
  }, [count, animateChanges]);

  // Persist to localStorage
  useEffect(() => {
    if (persistToLocalStorage) {
      try {
        localStorage.setItem(storageKey, count.toString());
      } catch (error) {
        console.error('Failed to save counter value to localStorage:', error);
      }
    }
  }, [count, persistToLocalStorage, storageKey]);

  // Call onChange callback
  useEffect(() => {
    if (onChange && typeof onChange === 'function') {
      onChange(count);
    }
  }, [count, onChange]);

  // Check boundaries and call callbacks
  useEffect(() => {
    if (count === min && onMinReached && typeof onMinReached === 'function') {
      onMinReached();
    }
    if (count === max && onMaxReached && typeof onMaxReached === 'function') {
      onMaxReached();
    }
  }, [count, min, max, onMinReached, onMaxReached]);

  // Memoized handlers to prevent unnecessary re-renders
  const updateCount = useCallback((newValue) => {
    const validatedValue = Math.max(min, Math.min(max, newValue));
    setCount(validatedValue);
  }, [min, max]);

  const increment = useCallback(() => {
    if (!disabled) {
      updateCount(count + step);
    }
  }, [count, step, disabled, updateCount]);

  const decrement = useCallback(() => {
    if (!disabled) {
      updateCount(count - step);
    }
  }, [count, step, disabled, updateCount]);

  const reset = useCallback(() => {
    if (!disabled) {
      updateCount(initialValue);
    }
  }, [initialValue, disabled, updateCount]);

  // Keyboard controls
  useEffect(() => {
    if (!allowKeyboardControl || disabled) return;

    const handleKeyDown = (event) => {
      // Only handle keyboard events when the component is focused
      if (!containerRef.current?.contains(document.activeElement)) return;

      switch (event.key) {
        case 'ArrowUp':
        case '+':
          event.preventDefault();
          increment();
          break;
        case 'ArrowDown':
        case '-':
          event.preventDefault();
          decrement();
          break;
        case 'Home':
          event.preventDefault();
          updateCount(min);
          break;
        case 'End':
          event.preventDefault();
          updateCount(max);
          break;
        case 'r':
        case 'R':
          if (showReset) {
            event.preventDefault();
            reset();
          }
          break;
        default:
          break;
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [allowKeyboardControl, disabled, increment, decrement, updateCount, min, max, reset, showReset]);

  // Format the display value
  const formatValue = (value) => {
    if (Number.isInteger(value)) {
      return value.toLocaleString();
    }
    return value.toLocaleString(undefined, { maximumFractionDigits: 2 });
  };

  // Computed properties
  const canIncrement = count + step <= max;
  const canDecrement = count - step >= min;
  const isAtMin = count === min;
  const isAtMax = count === max;

  // Styles
  const containerStyles = {
    display: 'inline-flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '1rem',
    padding: '1rem',
    borderRadius: '0.5rem',
    backgroundColor: disabled ? '#f5f5f5' : '#ffffff',
    border: '1px solid #e0e0e0',
    transition: 'all 0.3s ease',
    opacity: disabled ? 0.6 : 1,
    ...style
  };

  const buttonStyles = {
    padding: '0.5rem 1rem',
    fontSize: '1rem',
    borderRadius: '0.25rem',
    border: '1px solid #ccc',
    backgroundColor: '#ffffff',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    minWidth: '2.5rem',
    fontWeight: 'bold',
  };

  const disabledButtonStyles = {
    ...buttonStyles,
    cursor: 'not-allowed',
    opacity: 0.4,
    backgroundColor: '#f5f5f5',
  };

  const valueStyles = {
    fontSize: '2rem',
    fontWeight: 'bold',
    minWidth: '4rem',
    textAlign: 'center',
    transition: 'transform 0.3s ease',
    transform: isAnimating ? 'scale(1.1)' : 'scale(1)',
    color: isAtMin || isAtMax ? '#ff6b6b' : '#333',
  };

  const labelStyles = {
    fontSize: '1rem',
    fontWeight: '500',
    color: '#666',
    marginBottom: '0.5rem',
  };

  const buttonContainerStyles = {
    display: 'flex',
    gap: '0.5rem',
    alignItems: 'center',
  };

  return (
    <div
      ref={containerRef}
      className={`perfect-counter ${className}`}
      style={containerStyles}
      data-testid={testId}
      role="group"
      aria-label={ariaLabel || `${label} counter`}
      tabIndex={allowKeyboardControl && !disabled ? 0 : -1}
    >
      {label && (
        <label style={labelStyles} id={`${testId}-label`}>
          {label}
        </label>
      )}
      
      <div 
        style={valueStyles}
        role="status"
        aria-live="polite"
        aria-atomic="true"
        aria-label={`Current value: ${count}`}
      >
        {formatValue(count)}
      </div>

      <div style={buttonContainerStyles}>
        <button
          onClick={decrement}
          disabled={disabled || !canDecrement}
          style={disabled || !canDecrement ? disabledButtonStyles : buttonStyles}
          aria-label={`Decrease ${label} by ${step}`}
          data-testid={`${testId}-decrement`}
          type="button"
        >
          {decrementButtonText}
        </button>

        <button
          onClick={increment}
          disabled={disabled || !canIncrement}
          style={disabled || !canIncrement ? disabledButtonStyles : buttonStyles}
          aria-label={`Increase ${label} by ${step}`}
          data-testid={`${testId}-increment`}
          type="button"
        >
          {incrementButtonText}
        </button>

        {showReset && (
          <button
            onClick={reset}
            disabled={disabled}
            style={disabled ? disabledButtonStyles : { ...buttonStyles, marginLeft: '0.5rem' }}
            aria-label={`Reset ${label} to ${initialValue}`}
            data-testid={`${testId}-reset`}
            type="button"
          >
            {resetButtonText}
          </button>
        )}
      </div>

      {allowKeyboardControl && !disabled && (
        <div 
          style={{ 
            fontSize: '0.75rem', 
            color: '#999', 
            textAlign: 'center',
            marginTop: '0.5rem' 
          }}
          aria-hidden="true"
        >
          Use ↑/↓ or +/- keys • Home/End for min/max{showReset && ' • R to reset'}
        </div>
      )}

      {(isAtMin || isAtMax) && (
        <div 
          style={{ 
            fontSize: '0.875rem', 
            color: '#ff6b6b', 
            fontWeight: '500' 
          }}
          role="alert"
        >
          {isAtMin ? 'Minimum value reached' : 'Maximum value reached'}
        </div>
      )}
    </div>
  );
};

// PropTypes for runtime validation
PerfectCounter.propTypes = {
  initialValue: PropTypes.number,
  min: PropTypes.number,
  max: PropTypes.number,
  step: PropTypes.number,
  onChange: PropTypes.func,
  onMinReached: PropTypes.func,
  onMaxReached: PropTypes.func,
  label: PropTypes.string,
  disabled: PropTypes.bool,
  allowKeyboardControl: PropTypes.bool,
  persistToLocalStorage: PropTypes.bool,
  storageKey: PropTypes.string,
  className: PropTypes.string,
  style: PropTypes.object,
  incrementButtonText: PropTypes.node,
  decrementButtonText: PropTypes.node,
  resetButtonText: PropTypes.node,
  showReset: PropTypes.bool,
  animateChanges: PropTypes.bool,
  ariaLabel: PropTypes.string,
  testId: PropTypes.string,
};

export default PerfectCounter;

// Example usage with all features
export const ExampleUsage = () => {
  const [globalCount, setGlobalCount] = useState(0);

  return (
    <div style={{ padding: '2rem' }}>
      <h1>Perfect Counter Component Examples</h1>
      
      <h2>Basic Counter</h2>
      <PerfectCounter />
      
      <h2>Counter with Bounds</h2>
      <PerfectCounter 
        min={0} 
        max={10} 
        label="Limited Counter"
        onMinReached={() => console.log('Minimum reached!')}
        onMaxReached={() => console.log('Maximum reached!')}
      />
      
      <h2>Counter with Custom Step</h2>
      <PerfectCounter 
        step={5} 
        label="Step by 5" 
      />
      
      <h2>Persistent Counter</h2>
      <PerfectCounter 
        persistToLocalStorage={true}
        storageKey="myAppCounter"
        label="Saved Counter"
      />
      
      <h2>Disabled Counter</h2>
      <PerfectCounter 
        disabled={true}
        initialValue={42}
        label="Read Only"
      />
      
      <h2>Connected Counter</h2>
      <PerfectCounter 
        onChange={setGlobalCount}
        label="Updates Global State"
      />
      <p>Global count value: {globalCount}</p>
      
      <h2>Styled Counter</h2>
      <PerfectCounter 
        style={{ 
          backgroundColor: '#f0f8ff', 
          border: '2px solid #4169e1',
          padding: '2rem' 
        }}
        label="Custom Styled"
        incrementButtonText="➕"
        decrementButtonText="➖"
        resetButtonText="🔄"
      />
    </div>
  );
};