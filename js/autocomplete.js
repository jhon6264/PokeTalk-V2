/* assets/js/autocomplete.js
   Fixed horizontal scrollbar and text replacement
*/

(() => {
  const input = document.getElementById('userInput');
  if (!input) return;

  // Create dropdown container
  const dropdown = document.createElement('div');
  dropdown.className = 'autocomplete-dropdown';
  dropdown.style.cssText = `
    position: absolute;
    z-index: 10000;
    display: none;
    width: 100%;
    max-width: 400px;
    max-height: 180px;
    overflow-y: auto;
    overflow-x: hidden; /* FIX: Prevent horizontal scrollbar */
    box-sizing: border-box;
    background: white;
    border: 1px solid #e5e7eb;
    border-radius: 0.5rem;
    box-shadow: 0 10px 25px rgba(0,0,0,0.15);
  `;

  document.body.appendChild(dropdown);

  let activeIndex = -1;
  let currentList = [];
  let minLetters = 2;
  const gapAboveInput = 50;
  let originalInputValue = '';

  function positionDropdown() {
    const rect = input.getBoundingClientRect();
    const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
    
    dropdown.style.left = `${rect.left}px`;
    dropdown.style.top = `${rect.top + scrollTop - dropdown.offsetHeight - gapAboveInput}px`;
    dropdown.style.width = `${rect.width}px`;
  }

  function hideDropdown() {
    dropdown.style.display = 'none';
    activeIndex = -1;
    currentList = [];
  }

  function showDropdown(items) {
    if (!items.length) {
      hideDropdown();
      return;
    }

    currentList = items.slice(0, 5);
    dropdown.innerHTML = '';
    
    originalInputValue = input.value;
    activeIndex = -1;
    
    currentList.forEach((name, i) => {
      const item = document.createElement('div');
      item.className = 'autocomplete-item';
      item.innerHTML = `
        <div class="item-content">
          <span class="item-name">${capitalize(name)}</span>
          <span class="item-hint">Click to insert</span>
        </div>
      `;
      
      item.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        confirmSelection(name);
      });
      
      item.addEventListener('mousedown', (e) => {
        e.preventDefault();
      });
      
      item.addEventListener('mouseenter', () => {
        setActiveIndex(i, true);
      });
      
      dropdown.appendChild(item);
    });

    positionDropdown();
    dropdown.style.display = 'block';
    
    setTimeout(() => {
      positionDropdown();
    }, 0);
  }

  function updateInputWithSelection(name) {
    const currentValue = input.value;
    const cursorPosition = input.selectionStart;
    
    // Find the current word being typed at cursor position
    const currentWord = findCurrentWord(currentValue, cursorPosition);
    
    if (currentWord.word.length >= minLetters) {
      // Replace only the current word with the selected Pokémon name
      const newText = currentValue.substring(0, currentWord.start) + 
                     name + 
                     currentValue.substring(currentWord.end);
      input.value = newText;
      
      // Set cursor position after the inserted name
      const newCursorPos = currentWord.start + name.length;
      input.setSelectionRange(newCursorPos, newCursorPos);
    } else {
      // If no word to replace, just insert at cursor position
      const newText = currentValue.substring(0, cursorPosition) + 
                     name + 
                     currentValue.substring(cursorPosition);
      input.value = newText;
      
      const newCursorPos = cursorPosition + name.length;
      input.setSelectionRange(newCursorPos, newCursorPos);
    }
  }

  function confirmSelection(name) {
    const currentValue = input.value;
    const cursorPosition = input.selectionStart;
    
    // Find the current word being typed at cursor position
    const currentWord = findCurrentWord(currentValue, cursorPosition);
    
    if (currentWord.word.length >= minLetters) {
      // Replace only the current word and add a space
      const newText = currentValue.substring(0, currentWord.start) + 
                     name + ' ' + 
                     currentValue.substring(currentWord.end);
      input.value = newText;
      
      // Set cursor position after the inserted name + space
      const newCursorPos = currentWord.start + name.length + 1;
      input.setSelectionRange(newCursorPos, newCursorPos);
    } else {
      // If no word to replace, insert at cursor with space
      const newText = currentValue.substring(0, cursorPosition) + 
                     name + ' ' + 
                     currentValue.substring(cursorPosition);
      input.value = newText;
      
      const newCursorPos = cursorPosition + name.length + 1;
      input.setSelectionRange(newCursorPos, newCursorPos);
    }
    
    hideDropdown();
    input.focus();
    
    setTimeout(() => {
      input.dispatchEvent(new Event('input', { bubbles: true }));
    }, 10);
  }

  function setActiveIndex(index, fromMouse = false) {
    const previousIndex = activeIndex;
    activeIndex = index;
    
    updateActive();
    
    if (index >= 0 && currentList[index] && !fromMouse) {
      updateInputWithSelection(currentList[index]);
    }
  }

  function updateActive() {
    const items = dropdown.querySelectorAll('.autocomplete-item');
    
    // Remove active class from all items
    items.forEach(item => {
      item.classList.remove('active');
    });
    
    // Add active class only to current item
    if (activeIndex >= 0 && items[activeIndex]) {
      items[activeIndex].classList.add('active');
      scrollToActiveItem(items[activeIndex]);
    }
  }

  function scrollToActiveItem(activeItem) {
    if (!activeItem) return;
    
    const dropdownRect = dropdown.getBoundingClientRect();
    const itemRect = activeItem.getBoundingClientRect();
    
    if (itemRect.top < dropdownRect.top) {
      activeItem.scrollIntoView({ block: 'start', behavior: 'smooth' });
    } else if (itemRect.bottom > dropdownRect.bottom) {
      activeItem.scrollIntoView({ block: 'end', behavior: 'smooth' });
    }
  }

  function findCurrentWord(text, cursorPos) {
    let start = cursorPos - 1;
    let end = cursorPos;
    
    // Find word start (go backwards until non-word character)
    while (start >= 0 && /\w/.test(text[start])) {
      start--;
    }
    start++; // Move to the first letter
    
    // Find word end (go forwards until non-word character)
    while (end < text.length && /\w/.test(text[end])) {
      end++;
    }
    
    const word = text.substring(start, end);
    return {
      word: word.toLowerCase(),
      start: start,
      end: end
    };
  }

  async function onInput(e) {
    const val = input.value;
    const cursorPos = input.selectionStart;
    
    if (val.length < minLetters) {
      hideDropdown();
      return;
    }

    const currentWord = findCurrentWord(val, cursorPos);
    
    if (currentWord.word.length < minLetters) {
      hideDropdown();
      return;
    }

    try {
      const matches = await searchPokemonNames(currentWord.word);
      
      if (matches.length > 0) {
        showDropdown(matches);
      } else {
        hideDropdown();
      }
    } catch (error) {
      hideDropdown();
    }
  }

  function onKeyDown(e) {
    if (dropdown.style.display === 'none' || !currentList.length) return;

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (activeIndex === -1) {
        activeIndex = 0;
      } else {
        activeIndex = (activeIndex + 1) % currentList.length;
      }
      setActiveIndex(activeIndex);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (activeIndex === -1) {
        activeIndex = currentList.length - 1;
      } else {
        activeIndex = (activeIndex - 1 + currentList.length) % currentList.length;
      }
      setActiveIndex(activeIndex);
    } else if (e.key === 'Enter') {
      if (activeIndex >= 0 && currentList[activeIndex]) {
        e.preventDefault();
        e.stopPropagation();
        confirmSelection(currentList[activeIndex]);
      } else {
        hideDropdown();
      }
    } else if (e.key === 'Escape') {
      e.preventDefault();
      input.value = originalInputValue;
      hideDropdown();
      input.focus();
    } else if (e.key === 'Backspace' || e.key === 'Delete') {
      hideDropdown();
    }
  }

  async function searchPokemonNames(query) {
    if (!window.PokemonLogic) return [];
    try {
      return await window.PokemonLogic.searchPokemonNames(query);
    } catch (error) {
      return [];
    }
  }

  function capitalize(s) { 
    return s ? s.charAt(0).toUpperCase() + s.slice(1) : s; 
  }

  function updatePosition() {
    if (dropdown.style.display === 'block') {
      positionDropdown();
    }
  }

  // Attach listeners
  input.addEventListener('input', onInput);
  input.addEventListener('keydown', onKeyDown);
  
  input.addEventListener('focus', (e) => {
    if (e.target.value.trim().length >= minLetters) {
      onInput(e);
    }
  });

  input.addEventListener('blur', (e) => {
    setTimeout(() => {
      if (!dropdown.contains(document.activeElement)) {
        hideDropdown();
      }
    }, 150);
  });

  window.addEventListener('resize', updatePosition);
  window.addEventListener('scroll', updatePosition);

  document.addEventListener('mousedown', (e) => {
    if (!dropdown.contains(e.target) && e.target !== input) {
      hideDropdown();
    }
  });

  // Add clean CSS styles
  // Replace the CSS style block with this:
const style = document.createElement('style');
style.textContent = `
    .autocomplete-dropdown {
      transition: all 0.2s ease-in-out;
      opacity: 0;
      transform: translateY(-8px);
      pointer-events: none;
      font-family: inherit;
    }
    
    .autocomplete-dropdown[style*="display: block"] {
      opacity: 1;
      transform: translateY(0);
      pointer-events: all;
    }
    
    .autocomplete-item {
      padding: 0.75rem 1rem;
      cursor: pointer;
      border-bottom: 1px solid #f3f4f6;
      transition: all 0.15s ease;
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 1rem;
      min-height: 3rem;
      overflow: hidden;
    }
    
    .autocomplete-item:last-child {
      border-bottom: none;
    }
    
    .autocomplete-item:hover {
      background-color: #fef2f2;
      transform: translateX(4px);
    }
    
    .autocomplete-item.active {
      background-color: #fef2f2 !important;
      transform: translateX(4px);
    }
    
    .item-content {
      display: flex;
      align-items: center;
      justify-content: space-between;
      width: 100%;
      gap: 1rem;
      min-width: 0;
    }
    
    .item-name {
      font-weight: 600;
      color: #1f2937;
      font-size: 0.9rem;
      flex: 1;
      min-width: 0;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }
    
    .item-hint {
      font-size: 0.7rem;
      color: #6b7280;
      background: #f3f4f6;
      padding: 0.2rem 0.5rem;
      border-radius: 0.25rem;
      white-space: nowrap;
      flex-shrink: 0;
    }
    
    /* Dark mode styles - UPDATED: Match scrollbar background */
    .dark .autocomplete-dropdown {
      background: #1f2937 !important; /* Match dark scrollbar background */
      border-color: #374151;
    }
    
    .dark .autocomplete-item {
      border-bottom-color: #374151;
      background: #1f2937; /* Ensure items match dropdown background */
    }
    
    .dark .autocomplete-item:hover {
      background-color: #374151 !important;
    }
    
    .dark .autocomplete-item.active {
      background-color: #374151 !important;
    }
    
    .dark .item-name {
      color: #f9fafb;
    }
    
    .dark .item-hint {
      color: #d1d5db;
      background: #374151; /* Darker background for hint */
    }
    
    /* Scrollbar styling - UPDATED: Consistent dark colors */
    .autocomplete-dropdown::-webkit-scrollbar {
      width: 6px;
    }
    
    .autocomplete-dropdown::-webkit-scrollbar-track {
      background: #f1f5f9;
      border-radius: 3px;
    }
    
    .autocomplete-dropdown::-webkit-scrollbar-thumb {
      background: #cbd5e1;
      border-radius: 3px;
    }
    
    .autocomplete-dropdown::-webkit-scrollbar-thumb:hover {
      background: #94a3b8;
    }
    
    .dark .autocomplete-dropdown::-webkit-scrollbar-track {
      background: #1f2937 !important; /* Same as dropdown background */
    }
    
    .dark .autocomplete-dropdown::-webkit-scrollbar-thumb {
      background: #4b5563;
    }
    
    .dark .autocomplete-dropdown::-webkit-scrollbar-thumb:hover {
      background: #6b7280;
    }
    
    .autocomplete-dropdown {
      scrollbar-width: thin;
      scrollbar-color: #cbd5e1 #f1f5f9;
    }
    
    .dark .autocomplete-dropdown {
      scrollbar-color: #4b5563 #1f2937 !important; /* Match background */
    }
    
    /* Responsive adjustments */
    @media (max-width: 480px) {
      .autocomplete-item {
        padding: 0.6rem 0.8rem;
        gap: 0.5rem;
      }
      
      .item-name {
        font-size: 0.85rem;
      }
      
      .item-hint {
        font-size: 0.65rem;
        padding: 0.15rem 0.4rem;
      }
    }
    
    /* Force dark mode styles to override any other styles */
    .dark .autocomplete-dropdown,
    .dark .autocomplete-dropdown * {
      color-scheme: dark;
    }
`;
  document.head.appendChild(style);

  console.log('✅ Fixed autocomplete - no horizontal scrollbar + proper text replacement');

})();