// Accessibility Enhancement Script for Expense Tracker

(function() {
  'use strict';

  // Focus Management Utilities
  const FocusManager = {
    // Store last focused element before modal/dialog
    lastFocusedElement: null,

    // Trap focus within an element
    trapFocus: function(element) {
      const focusableElements = element.querySelectorAll(
        'a[href], button, textarea, input[type="text"], input[type="radio"], input[type="checkbox"], select, [tabindex]:not([tabindex="-1"])'
      );
      
      const firstFocusable = focusableElements[0];
      const lastFocusable = focusableElements[focusableElements.length - 1];

      element.addEventListener('keydown', function(e) {
        if (e.key === 'Tab') {
          if (e.shiftKey) { // Shift + Tab
            if (document.activeElement === firstFocusable) {
              lastFocusable.focus();
              e.preventDefault();
            }
          } else { // Tab
            if (document.activeElement === lastFocusable) {
              firstFocusable.focus();
              e.preventDefault();
            }
          }
        }
        
        if (e.key === 'Escape') {
          FocusManager.restoreFocus();
        }
      });

      // Focus first element
      if (firstFocusable) {
        firstFocusable.focus();
      }
    },

    // Store current focus
    storeFocus: function() {
      this.lastFocusedElement = document.activeElement;
    },

    // Restore focus to last element
    restoreFocus: function() {
      if (this.lastFocusedElement && this.lastFocusedElement.focus) {
        this.lastFocusedElement.focus();
      }
    }
  };

  // Keyboard Navigation Enhancement
  const KeyboardNav = {
    init: function() {
      // Add roving tabindex to lists
      this.initRovingTabindex();
      
      // Add keyboard shortcuts help
      this.addKeyboardHelp();
      
      // Enhance form navigation
      this.enhanceFormNav();
    },

    initRovingTabindex: function() {
      const lists = document.querySelectorAll('[role="list"]');
      
      lists.forEach(list => {
        const items = list.querySelectorAll('[role="listitem"]');
        if (items.length === 0) return;

        // Set initial tabindex
        items.forEach((item, index) => {
          item.setAttribute('tabindex', index === 0 ? '0' : '-1');
        });

        // Handle keyboard navigation
        list.addEventListener('keydown', (e) => {
          const currentItem = document.activeElement;
          if (!currentItem || currentItem.getAttribute('role') !== 'listitem') return;

          let nextItem = null;

          switch(e.key) {
            case 'ArrowDown':
              nextItem = currentItem.nextElementSibling;
              if (nextItem && nextItem.getAttribute('role') === 'listitem') {
                e.preventDefault();
                this.focusItem(currentItem, nextItem);
              }
              break;
              
            case 'ArrowUp':
              nextItem = currentItem.previousElementSibling;
              if (nextItem && nextItem.getAttribute('role') === 'listitem') {
                e.preventDefault();
                this.focusItem(currentItem, nextItem);
              }
              break;
              
            case 'Home':
              e.preventDefault();
              nextItem = items[0];
              this.focusItem(currentItem, nextItem);
              break;
              
            case 'End':
              e.preventDefault();
              nextItem = items[items.length - 1];
              this.focusItem(currentItem, nextItem);
              break;
          }
        });
      });
    },

    focusItem: function(currentItem, nextItem) {
      currentItem.setAttribute('tabindex', '-1');
      nextItem.setAttribute('tabindex', '0');
      nextItem.focus();
    },

    addKeyboardHelp: function() {
      const helpButton = document.createElement('button');
      helpButton.className = 'keyboard-help-button sr-only-focusable';
      helpButton.textContent = 'Keyboard shortcuts help';
      helpButton.setAttribute('aria-label', 'Show keyboard shortcuts help');
      
      helpButton.addEventListener('click', () => {
        this.showKeyboardHelp();
      });

      document.body.insertBefore(helpButton, document.body.firstChild);
    },

    showKeyboardHelp: function() {
      const dialog = document.createElement('div');
      dialog.setAttribute('role', 'dialog');
      dialog.setAttribute('aria-labelledby', 'keyboard-help-title');
      dialog.setAttribute('aria-modal', 'true');
      dialog.className = 'keyboard-help-dialog';
      
      dialog.innerHTML = `
        <div class="dialog-content">
          <h2 id="keyboard-help-title">Keyboard Shortcuts</h2>
          <button class="close-button" aria-label="Close dialog">&times;</button>
          <dl>
            <dt>Alt + N</dt>
            <dd>Add new expense</dd>
            <dt>Alt + C</dt>
            <dd>View charts</dd>
            <dt>Alt + E</dt>
            <dd>View expenses</dd>
            <dt>Alt + F</dt>
            <dd>Focus filter</dd>
            <dt>Tab / Shift+Tab</dt>
            <dd>Navigate through form fields</dd>
            <dt>Arrow keys</dt>
            <dd>Navigate through expense list</dd>
            <dt>Escape</dt>
            <dd>Close dialogs or cancel actions</dd>
            <dt>Enter</dt>
            <dd>Activate buttons or submit forms</dd>
            <dt>Ctrl + Shift + P</dt>
            <dd>Toggle performance monitor</dd>
          </dl>
        </div>
        <div class="dialog-backdrop"></div>
      `;

      document.body.appendChild(dialog);
      
      // Trap focus
      FocusManager.storeFocus();
      FocusManager.trapFocus(dialog.querySelector('.dialog-content'));
      
      // Close dialog
      const closeButton = dialog.querySelector('.close-button');
      closeButton.addEventListener('click', () => {
        document.body.removeChild(dialog);
        FocusManager.restoreFocus();
      });
      
      // Close on backdrop click
      dialog.querySelector('.dialog-backdrop').addEventListener('click', () => {
        document.body.removeChild(dialog);
        FocusManager.restoreFocus();
      });
    },

    enhanceFormNav: function() {
      // Add Enter key submission for forms
      document.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' && e.target.tagName === 'INPUT' && e.target.type !== 'submit') {
          const form = e.target.closest('form');
          if (form) {
            const submitButton = form.querySelector('[type="submit"]');
            if (submitButton) {
              e.preventDefault();
              submitButton.click();
            }
          }
        }
      });
    }
  };

  // Live Region Manager
  const LiveRegionManager = {
    init: function() {
      // Create live regions if they don't exist
      if (!document.getElementById('sr-announcements')) {
        const politeRegion = document.createElement('div');
        politeRegion.id = 'sr-announcements';
        politeRegion.className = 'sr-only';
        politeRegion.setAttribute('aria-live', 'polite');
        politeRegion.setAttribute('aria-atomic', 'true');
        document.body.appendChild(politeRegion);
      }

      if (!document.getElementById('sr-alerts')) {
        const assertiveRegion = document.createElement('div');
        assertiveRegion.id = 'sr-alerts';
        assertiveRegion.className = 'sr-only';
        assertiveRegion.setAttribute('aria-live', 'assertive');
        assertiveRegion.setAttribute('aria-atomic', 'true');
        document.body.appendChild(assertiveRegion);
      }
    },

    announce: function(message, priority = 'polite') {
      const regionId = priority === 'assertive' ? 'sr-alerts' : 'sr-announcements';
      const region = document.getElementById(regionId);
      
      if (region) {
        // Clear and set new message
        region.textContent = '';
        setTimeout(() => {
          region.textContent = message;
        }, 100);
        
        // Clear after announcement
        setTimeout(() => {
          region.textContent = '';
        }, 3000);
      }
    }
  };

  // Form Validation Enhancement
  const FormValidation = {
    init: function() {
      // Enhance all forms
      document.querySelectorAll('form').forEach(form => {
        this.enhanceForm(form);
      });

      // Watch for new forms
      const observer = new MutationObserver((mutations) => {
        mutations.forEach(mutation => {
          mutation.addedNodes.forEach(node => {
            if (node.nodeName === 'FORM') {
              this.enhanceForm(node);
            } else if (node.querySelectorAll) {
              node.querySelectorAll('form').forEach(form => {
                this.enhanceForm(form);
              });
            }
          });
        });
      });

      observer.observe(document.body, { childList: true, subtree: true });
    },

    enhanceForm: function(form) {
      // Add ARIA attributes to required fields
      form.querySelectorAll('[required]').forEach(field => {
        field.setAttribute('aria-required', 'true');
        
        // Add error container if not exists
        if (!field.getAttribute('aria-describedby')) {
          const errorId = field.id + '-error';
          field.setAttribute('aria-describedby', errorId);
          
          if (!document.getElementById(errorId)) {
            const errorSpan = document.createElement('span');
            errorSpan.id = errorId;
            errorSpan.className = 'field-error';
            errorSpan.setAttribute('aria-live', 'polite');
            field.parentNode.appendChild(errorSpan);
          }
        }
      });

      // Handle form validation
      form.addEventListener('submit', (e) => {
        const isValid = this.validateForm(form);
        if (!isValid) {
          e.preventDefault();
          LiveRegionManager.announce('Please fix the errors in the form', 'assertive');
        }
      });

      // Handle field validation on blur
      form.querySelectorAll('input, select, textarea').forEach(field => {
        field.addEventListener('blur', () => {
          this.validateField(field);
        });
      });
    },

    validateForm: function(form) {
      let isValid = true;
      form.querySelectorAll('[required]').forEach(field => {
        if (!this.validateField(field)) {
          isValid = false;
        }
      });
      return isValid;
    },

    validateField: function(field) {
      const errorId = field.getAttribute('aria-describedby');
      const errorElement = errorId ? document.getElementById(errorId) : null;
      
      if (field.hasAttribute('required') && !field.value.trim()) {
        field.setAttribute('aria-invalid', 'true');
        if (errorElement) {
          errorElement.textContent = `${field.labels[0]?.textContent || field.name} is required`;
        }
        return false;
      } else {
        field.setAttribute('aria-invalid', 'false');
        if (errorElement) {
          errorElement.textContent = '';
        }
        return true;
      }
    }
  };

  // Color Contrast Checker
  const ContrastChecker = {
    init: function() {
      // Check for user preference
      if (window.matchMedia('(prefers-contrast: high)').matches) {
        document.body.classList.add('high-contrast');
      }

      // Watch for changes
      window.matchMedia('(prefers-contrast: high)').addEventListener('change', (e) => {
        if (e.matches) {
          document.body.classList.add('high-contrast');
        } else {
          document.body.classList.remove('high-contrast');
        }
      });
    }
  };

  // Motion Preference Handler
  const MotionHandler = {
    init: function() {
      // Check for reduced motion preference
      if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
        document.body.classList.add('reduce-motion');
      }

      // Watch for changes
      window.matchMedia('(prefers-reduced-motion: reduce)').addEventListener('change', (e) => {
        if (e.matches) {
          document.body.classList.add('reduce-motion');
        } else {
          document.body.classList.remove('reduce-motion');
        }
      });
    }
  };

  // Initialize all enhancements when DOM is ready
  document.addEventListener('DOMContentLoaded', function() {
    KeyboardNav.init();
    LiveRegionManager.init();
    FormValidation.init();
    ContrastChecker.init();
    MotionHandler.init();

    // Expose global functions
    window.FocusManager = FocusManager;
    window.LiveRegionManager = LiveRegionManager;
    
    // Make announcements available globally
    if (!window.announceToScreenReader) {
      window.announceToScreenReader = function(message, priority) {
        LiveRegionManager.announce(message, priority);
      };
    }

    console.log('Accessibility enhancements loaded successfully');
  });

  // Add styles for keyboard help dialog
  const style = document.createElement('style');
  style.textContent = `
    .keyboard-help-dialog {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      z-index: 10000;
    }
    
    .keyboard-help-dialog .dialog-content {
      position: fixed;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      background: white;
      padding: 2rem;
      border-radius: 8px;
      box-shadow: 0 10px 25px rgba(0, 0, 0, 0.3);
      max-width: 500px;
      max-height: 80vh;
      overflow-y: auto;
      z-index: 10001;
    }
    
    .keyboard-help-dialog .dialog-backdrop {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(0, 0, 0, 0.5);
      z-index: 10000;
    }
    
    .keyboard-help-dialog h2 {
      margin-top: 0;
      margin-bottom: 1.5rem;
    }
    
    .keyboard-help-dialog .close-button {
      position: absolute;
      top: 1rem;
      right: 1rem;
      background: none;
      border: none;
      font-size: 1.5rem;
      cursor: pointer;
      padding: 0.5rem;
      line-height: 1;
    }
    
    .keyboard-help-dialog dl {
      display: grid;
      grid-template-columns: auto 1fr;
      gap: 0.5rem 1rem;
    }
    
    .keyboard-help-dialog dt {
      font-weight: bold;
      font-family: monospace;
      background: #f3f4f6;
      padding: 0.25rem 0.5rem;
      border-radius: 4px;
    }
    
    .keyboard-help-dialog dd {
      margin: 0;
      align-self: center;
    }
    
    .keyboard-help-button {
      position: fixed;
      top: 1rem;
      right: 1rem;
      z-index: 1000;
    }
  `;
  document.head.appendChild(style);

})();