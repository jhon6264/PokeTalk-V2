/* assets/js/theme.js
   Theme toggling + Chat reset functionality
*/

(() => {
  console.log('🎯 theme.js is loading!');

  // Theme Toggling
  const toggle = document.getElementById('themeToggle');
  if (!toggle) {
    console.error('❌ Theme toggle not found');
    return;
  }

  // Load saved preference
  const saved = localStorage.getItem('poketalk_theme');
  if (saved === 'dark') document.documentElement.classList.add('dark');

  function updateIcon() {
    const isDark = document.documentElement.classList.contains('dark');
    toggle.textContent = isDark ? '☀️' : '🌙';
  }

  toggle.addEventListener('click', () => {
    document.documentElement.classList.toggle('dark');
    const isDark = document.documentElement.classList.contains('dark');
    localStorage.setItem('poketalk_theme', isDark ? 'dark' : 'light');
    updateIcon();
  });

  updateIcon();

  // Chat Reset Functionality
  const resetButton = document.getElementById('resetChat');
  const resetModal = document.getElementById('resetModal');
  const resetCancel = document.getElementById('resetCancel');
  const resetConfirm = document.getElementById('resetConfirm');

  console.log('Reset elements:', { resetButton, resetModal, resetCancel, resetConfirm });

  if (!resetButton || !resetModal) {
    console.error('❌ Reset elements not found');
    return;
  }

  // Show modal when reset button is clicked
  resetButton.addEventListener('click', () => {
    console.log('🔥 Trash icon clicked!');
    resetModal.classList.remove('hidden');
    document.body.classList.add('modal-open');
  });

  // Hide modal when cancel is clicked
  resetCancel.addEventListener('click', () => {
    resetModal.classList.add('hidden');
    document.body.classList.remove('modal-open');
  });

  // Handle reset confirmation
  resetConfirm.addEventListener('click', () => {
    resetChatHistory();
    resetModal.classList.add('hidden');
    document.body.classList.remove('modal-open');
  });

  // Close modal when clicking outside
  resetModal.addEventListener('click', (e) => {
    if (e.target === resetModal) {
      resetModal.classList.add('hidden');
      document.body.classList.remove('modal-open');
    }
  });

  // Close modal with Escape key
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && !resetModal.classList.contains('hidden')) {
      resetModal.classList.add('hidden');
      document.body.classList.remove('modal-open');
    }
  });

  // Timestamp utility functions (ADD THESE)
  function getCurrentTimestamp() {
    const now = new Date();
    return {
      time: now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      date: now.toLocaleDateString(),
      full: now.toISOString()
    };
  }

  function formatMessageTimestamp(timestamp) {
    const messageTime = new Date(timestamp);
    const now = new Date();
    
    if (messageTime.toDateString() === now.toDateString()) {
      return messageTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }
    
    const yesterday = new Date(now);
    yesterday.setDate(yesterday.getDate() - 1);
    if (messageTime.toDateString() === yesterday.toDateString()) {
      return 'Yesterday ' + messageTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }
    
    return messageTime.toLocaleDateString() + ' ' + messageTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }

  function createDateSeparator(dateString) {
    const separator = document.createElement('div');
    separator.className = 'date-separator';
    
    const now = new Date();
    const today = now.toLocaleDateString();
    const yesterday = new Date(now);
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayString = yesterday.toLocaleDateString();
    
    let displayDate;
    if (dateString === today) {
      displayDate = 'Today';
    } else if (dateString === yesterdayString) {
      displayDate = 'Yesterday';
    } else {
      displayDate = new Date(dateString).toLocaleDateString([], { 
        weekday: 'long', 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      });
    }
    
    separator.innerHTML = `<span class="date-separator-text">${displayDate}</span>`;
    return separator;
  }

  function resetChatHistory() {
    try {
      // Clear the chat window visually
      const chatWindow = document.getElementById('chatWindow');
      if (chatWindow) {
        chatWindow.innerHTML = ''; // Clear everything
      }

      // Clear memory systems
      if (window.AdvancedMemory && window.AdvancedMemory.clear) {
        window.AdvancedMemory.clear();
      }

      if (window.ConversationFlow && window.ConversationFlow.clear) {
        window.ConversationFlow.clear();
      }

      // Clear ALL chat-related data from localStorage
      const keysToRemove = [
        'poketalk_messages',
        'poketalk_friendship',
        'poketalk_interactions',
        'poketalk_user_preferences',
        'poketalk_user_profile',
        'poketalk_conversation_history',
        'poketalk_advanced_memory',
        'poketalk_conversation_flow'
      ];
      
      keysToRemove.forEach(key => {
        localStorage.removeItem(key);
      });

      // Clear any system message histories
      if (window.ChatSystem) {
        window.ChatSystem.clearMessages();
      }
      
      // Clear Pokémon cache if exists
      if (window.PokemonLogic) {
        window.PokemonLogic.clearCache();
      }
      
      // Clear social system data if exists
      if (window.SocialSystem) {
        window.SocialSystem.clearHistory();
      }

      // Reset greeting rotation system
      if (window.ChatSystem && window.ChatSystem.ConversationManager) {
        window.ChatSystem.ConversationManager.clearPending();
        window.ChatSystem.ConversationManager.userContext = {};
        window.ChatSystem.ConversationManager.currentState = 'idle';
      }

      // Reset greeting rotation
      if (window.GreetingRotation) {
        window.GreetingRotation.lastGreeting = '';
        window.GreetingRotation.greetingCount = 0;
      }

      // Add a fresh welcome message with timestamp (FIXED VERSION)
      setTimeout(() => {
        if (chatWindow) {
          const currentTime = new Date();
          const timestampData = {
            time: currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            date: currentTime.toLocaleDateString(),
            full: currentTime.toISOString()
          };
          
          // Create date separator for today
          const dateSeparator = createDateSeparator(timestampData.date);
          chatWindow.appendChild(dateSeparator);
          
          // Create welcome message with timestamp
          const welcomeMsg = document.createElement('div');
          welcomeMsg.className = 'message bot';
          welcomeMsg.setAttribute('data-date', timestampData.date);
          welcomeMsg.setAttribute('data-timestamp', timestampData.full);
          
          welcomeMsg.innerHTML = `
            <div class="message-content">Hey man! ask me something about Pokemon</div>
            <div class="message-timestamp">${timestampData.time}</div>
          `;
          
          chatWindow.appendChild(welcomeMsg);
          
          // Save this as the only message in history to prevent duplication
          const messageData = {
            type: 'bot',
            content: 'Hey man! ask me something about Pokemon',
            timestamp: Date.now()
          };
          localStorage.setItem('poketalk_messages', JSON.stringify([messageData]));
          
          // Scroll to show the welcome message
          chatWindow.scrollTop = chatWindow.scrollHeight;
        }
      }, 100);

      // Re-initialize ContextMemory to get fresh state
      setTimeout(() => {
        if (window.ContextMemory && window.ContextMemory.init) {
          window.ContextMemory.init();
        }
      }, 1000);

      // Show success feedback
      showResetSuccess();
      console.log('✅ Chat reset successful! All context cleared.');

    } catch (error) {
      console.error('Error resetting chat:', error);
      showResetError();
    }
  }

  function showResetSuccess() {
    const successMsg = document.createElement('div');
    successMsg.className = 'success-message slide';
    successMsg.innerHTML = `
      <div class="flex items-center gap-3">
        <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-white" viewBox="0 0 20 20" fill="currentColor">
          <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd" />
        </svg>
        <span>Chat reset successfully!</span>
        <div class="message-progress"></div>
      </div>
    `;
    
    document.body.appendChild(successMsg);
    
    // Remove after animation completes
    setTimeout(() => {
      if (successMsg.parentNode) {
        successMsg.parentNode.removeChild(successMsg);
      }
    }, 3000);
  }

  function showResetError() {
    const errorMsg = document.createElement('div');
    errorMsg.className = 'error-message slide';
    errorMsg.innerHTML = `
      <div class="flex items-center gap-3">
        <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-white" viewBox="0 0 20 20" fill="currentColor">
          <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clip-rule="evenodd" />
        </svg>
        <span>Error resetting chat. Please try again.</span>
        <div class="message-progress"></div>
      </div>
    `;
    
    document.body.appendChild(errorMsg);
    
    // Remove after animation completes
    setTimeout(() => {
      if (errorMsg.parentNode) {
        errorMsg.parentNode.removeChild(errorMsg);
      }
    }, 3000);
  }

  console.log('✅ theme.js setup complete!');
})();