 <!-- index.php -->

<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>PokéTalk | Pokémon Chat Assistant</title>

  <!-- 🧩 Google Fonts -->
  <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@400;600&display=swap" rel="stylesheet">

  <!-- 🌈 Tailwind CSS -->
  <script src="https://cdn.tailwindcss.com"></script>
  <script>
    tailwind.config = {
      darkMode: 'class',
    }
  </script>

  <!-- 🎨 Custom Styles - FIXED ORDER -->
   <link rel="stylesheet" href="styles/evolution.css">
  <link rel="stylesheet" href="styles/pokemoncard.css" /> <!-- LOAD FIRST -->
  <link rel="stylesheet" href="styles/style.css" />

  <!-- 🪙 Favicon -->
  <link rel="icon" type="image/png" href="img/pokeball.png" />
</head>

<body class="bg-gradient-to-br from-red-100 to-yellow-100 flex flex-col items-center justify-between min-h-screen font-[Poppins] transition-colors duration-500 px-4 py-4 w-full overflow-x-hidden">

  <!-- 📱 Chat Container -->
  <div class="chat-container bg-white dark:bg-gray-900 shadow-2xl rounded-3xl overflow-hidden 
              border border-gray-200 dark:border-gray-700 flex flex-col mx-auto 
              w-[clamp(320px,95vw,1600px)] h-[clamp(600px,90vh,100vh)] transition-all duration-500">

    <!-- 🔝 Header -->
<div class="chat-header flex justify-between items-center bg-red-500 text-white py-4 px-6 shadow-md">
  <div class="flex items-center gap-2">
    <img src="img/pokeball.png" alt="Pokéball" class="w-10 h-10" />
    <h1 class="text-xl sm:text-2xl font-semibold tracking-wide">PokéTalk</h1>
  </div>
  <div class="flex items-center gap-2">
    <!-- Reset Chat Button -->
    <button id="resetChat" class="p-2 bg-white/20 hover:bg-white/30 rounded-full transition text-lg"
            aria-label="Reset chat">
      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-trash" viewBox="0 0 16 16">
        <path d="M5.5 5.5A.5.5 0 0 1 6 6v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5zm2.5 0a.5.5 0 0 1 .5.5v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5zm3 .5a.5.5 0 0 0-1 0v6a.5.5 0 0 0 1 0V6z"/>
        <path fill-rule="evenodd" d="M14.5 3a1 1 0 0 1-1 1H13v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V4h-.5a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1H6a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1h3.5a1 1 0 0 1 1 1v1zM4.118 4 4 4.059V13a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1V4.059L11.882 4H4.118zM2.5 3V2h11v1h-11z"/>
      </svg>
    </button>
    
    <button id="themeToggle" class="p-2 bg-white/20 hover:bg-white/30 rounded-full transition text-lg"
            aria-label="Toggle dark mode">
      🌙
    </button>
  </div>
</div>

<!-- Reset Confirmation Modal -->
<div id="resetModal" class="hidden">
  <div class="modal-content">
    <div class="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-2xl">
      <div class="text-center">
        <!-- Warning Icon -->
        <div class="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 dark:bg-red-900 mb-4">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-red-600 dark:text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
        </div>
        
        <h3 class="text-lg font-medium text-gray-900 dark:text-white mb-2">
          Reset Chat?
        </h3>
        <p class="text-sm text-gray-500 dark:text-gray-400 mb-6">
          Are you sure you want to delete all chats permanently? This action cannot be undone.
        </p>
        
        <div class="flex gap-3 justify-center">
          <button id="resetCancel" 
                  class="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg transition-colors">
            Cancel
          </button>
          <button id="resetConfirm" 
                  class="px-4 py-2 text-sm font-medium text-white bg-red-500 hover:bg-red-600 rounded-lg transition-colors">
            Yes, Reset
          </button>
        </div>
      </div>
    </div>
  </div>
</div>

    <!-- 💬 Chat Window -->
    <div id="chatWindow" 
         class="flex-1 overflow-y-auto p-[clamp(0.75rem,2vw,1.5rem)] space-y-[clamp(0.5rem,1vw,1rem)] 
                bg-gray-50 dark:bg-gray-800 transition-all duration-300"
         aria-live="polite">
      <div class="message bot" data-date="<?php echo date('Y-m-d'); ?>" data-timestamp="<?php echo date('c'); ?>">
  <div class="message-content">Hey man! ask me something about Pokemon</div>
  <div class="message-timestamp"><?php echo date('H:i'); ?></div>
</div>
    </div>

   <!-- Typing Indicator -->
<div id="typingIndicator" class="hidden">
  <div class="professional-typing-indicator">
    <div class="typing-dots">
      <div class="typing-dot"></div>
      <div class="typing-dot"></div>
      <div class="typing-dot"></div>
    </div>
    <span class="typing-text">PokéTalk is thinking</span>
  </div>
</div>

    <!-- Input Bar -->
    <form id="chatForm" 
          class="chat-input-bar flex items-center gap-3 p-[clamp(0.75rem,2vw,1.5rem)] 
                 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700">
      <div class="flex-1 relative">
        <label for="userInput" class="sr-only">Type your message about Pokémon</label>
        <input 
          type="text" 
          id="userInput" 
          placeholder="Type your message..." 
          autocomplete="off"
          class="w-full border border-gray-300 dark:border-gray-600 rounded-full 
                 px-[clamp(0.75rem,1.5vw,1.5rem)] py-[clamp(0.4rem,1vw,0.8rem)]
                 focus:outline-none focus:ring-2 focus:ring-red-400 dark:bg-gray-800 dark:text-white text-[clamp(0.85rem,1.5vw,1rem)]"
        />
      </div>
      <button 
        type="submit" 
        id="sendButton"
        class="flex items-center justify-center gap-2 px-[clamp(1rem,2vw,1.5rem)] py-[clamp(0.4rem,1vw,0.8rem)] 
               bg-red-500 hover:bg-red-600 text-white rounded-full shadow-md transition 
               text-[clamp(0.85rem,1.5vw,1rem)] font-medium">
        Send 
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16" class="flex-shrink-0">
          <path d="M15.854.146a.5.5 0 0 1 .11.54l-5.819 14.547a.75.75 0 0 1-1.329.124l-3.178-4.995L.643 7.184a.75.75 0 0 1 .124-1.33L15.314.037a.5.5 0 0 1 .54.11ZM6.636 10.07l2.761 4.338L14.13 2.576 6.636 10.07Zm6.787-8.201L1.591 6.602l4.339 2.76 7.494-7.493Z"/>
        </svg>
      </button>
    </form>
  </div>

  <!-- Footer -->
  <footer class="footer-container w-full flex justify-between items-center text-[clamp(0.75rem,1.2vw,0.9rem)] mt-4 
                 text-gray-600 dark:text-gray-400 px-[1.5rem]">
    <span>Developer: <strong>Potestas, JC</strong></span>
    <span>© 2025 PokéTalk — Powered by <a href="https://pokeapi.co" target="_blank" class="underline hover:text-red-500">PokeAPI.co</a></span>
  </footer>

  <!-- ⚙️ Custom JS - FIXED LOADING ORDER -->
  <script src="js/pokecard.js"></script>      <!-- Load FIRST -->
  <script src="js/pokemonlogic.js"></script>  
  <script src="js/chat.js"></script>          
  <script src="js/autocomplete.js"></script>
  <script src="js/theme.js"></script>
</body>
</html>