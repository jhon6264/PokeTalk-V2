/* assets/js/chat.js
   Core Chat System - Message Handling & Feature Routing
*/

const ChatSystem = (() => {
    // DOM Elements
    let chatForm, userInputEl, chatWindow, typingIndicator;
    
    // Message System
    let messages = [];
    
    // ==================== ENHANCED REASONING SYSTEM ====================

    const ResponseTemplates = {
        greetings: [
            "Hey there! 👋 Ready for some Pokémon adventures?",
            "Hello trainer! What Pokémon shall we explore today?",
            "Hi! Great to see you back! Any Pokémon on your mind?",
            "Musta bai! Unsay ganahan nimo nga Pokémon karon?",
            "Hey! Ready to dive into the world of Pokémon?",
            "Hi there! Excited to explore some Pokémon with you!",
            "Hello! Your Pokédex assistant is here! What shall we discover?",
            "Hey trainer! Ready to catch 'em all with knowledge?",
            "Hi! Let's explore the amazing world of Pokémon together!",
            "Musta! Unsa nga Pokémon imong gusto mahibaw-an?"
        ],
        
        evolutionQuestions: [
            "Want to see how {pokemon} evolves?",
            "Interested in {pokemon}'s evolution chain?",
            "Shall I show you {pokemon}'s evolutionary path?",
            "Ganahan ka makakita sa evolution ni {pokemon}?",
            "Want to discover {pokemon}'s evolution story?",
            "Curious about how {pokemon} evolves?",
            "Should I show you {pokemon}'s evolution chain?",
            "Want to see {pokemon}'s evolutionary journey?"
        ],
        
        comparisons: [
            "Let me compare {pokemon1} and {pokemon2} for you!",
            "Here's how {pokemon1} stacks up against {pokemon2}:",
            "Comparing {pokemon1} vs {pokemon2} - this is exciting!",
            "Atong ikumpara si {pokemon1} ug {pokemon2}!",
            "Check out the battle stats between {pokemon1} and {pokemon2}!"
        ],
        
        thanks: [
            "You're welcome! Always happy to help! 😊",
            "No problem! Glad I could assist! 👍",
            "Anytime! Let me know if you need anything else!",
            "Walang problema! Happy to help! 😄",
            "Sige lang! Nalipay ko nga natabangan tika! 😊"
        ],
        
        help: [
            "Need help? I can show Pokémon info, compare them, show evolutions, and more! Just ask about any Pokémon!",
            "Here's what I can do: show Pokémon details, compare two Pokémon, display evolution chains, and suggest popular ones!",
            "I'm your Pokédex assistant! Ask me about any Pokémon, compare them, or explore evolution chains!"
        ]
    };

    const ConversationManager = {
        currentState: 'idle',
        lastAction: null,
        pendingFollowUp: null,
        userContext: {},
        
        setState: function(newState, action = null) {
            this.currentState = newState;
            this.lastAction = action;
            
            
        },
        
        getExpectedResponse: function() {
            switch (this.pendingFollowUp) {
                case 'evolution_suggestion':
                    return this.getRandomResponse('evolutionQuestions', {pokemon: this.userContext.lastPokemon});
                case 'more_comparisons':
                    return "Want to compare with another Pokémon?";
                case 'related_pokemon':
                    return "Interested in other Pokémon of the same type?";
                default:
                    return null;
            }
        },
        
        clearPending: function() {
            this.pendingFollowUp = null;
        },
        
        updateUserContext: function(key, value) {
            this.userContext[key] = value;
        },
        
        getRandomResponse: function(type, replacements = {}) {
            const templates = ResponseTemplates[type] || [type];
            let template = templates[Math.floor(Math.random() * templates.length)];
            
            // Replace placeholders
            Object.entries(replacements).forEach(([key, value]) => {
                if (value && typeof value === 'string') {
                    template = template.replace(`{${key}}`, value);
                }
            });
            
            return template;
        }
    };
    // ==================== TIMESTAMP SYSTEM ====================

// Timestamp utility functions
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
    
    // If message is from today, show only time
    if (messageTime.toDateString() === now.toDateString()) {
        return messageTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }
    
    // If message is from yesterday
    const yesterday = new Date(now);
    yesterday.setDate(yesterday.getDate() - 1);
    if (messageTime.toDateString() === yesterday.toDateString()) {
        return 'Yesterday ' + messageTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }
    
    // Otherwise show date and time
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

function addMessageWithTimestamp(message, type, timestamp = null, isCard = false) {
    const messageData = timestamp || getCurrentTimestamp();
    
    // Check if we need to add a date separator
    const lastMessage = chatWindow.lastElementChild;
    const lastDate = lastMessage?.getAttribute('data-date');
    
    if (!lastDate || lastDate !== messageData.date) {
        const dateSeparator = createDateSeparator(messageData.date);
        chatWindow.appendChild(dateSeparator);
    }
    
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${type}`;
    messageDiv.setAttribute('data-date', messageData.date);
    messageDiv.setAttribute('data-timestamp', messageData.full);
    
    if (isCard) {
        // For card messages, wrap the HTML content
        messageDiv.innerHTML = `
            <div class="message-content">${message}</div>
            <div class="message-timestamp">${formatMessageTimestamp(messageData.full)}</div>
        `;
    } else {
        // For regular text messages
        messageDiv.innerHTML = `
            <div class="message-content">${message}</div>
            <div class="message-timestamp">${formatMessageTimestamp(messageData.full)}</div>
        `;
    }
    
    chatWindow.appendChild(messageDiv);
    chatWindow.scrollTop = chatWindow.scrollHeight;
    
    return messageDiv;
}

    // ==================== GREETING ROTATION SYSTEM ====================

    const GreetingRotation = {
        lastGreeting: '',
        greetingCount: 0,
        
        getVariedGreeting: function(preferences) {
            const favoriteTypes = ContextMemory.getFavoriteTypes();
            const discoveredCount = preferences.discoveredPokemon?.length || 0;
            
            // Different greeting categories
            const greetingCategories = [];
            
            // Basic random greetings
            greetingCategories.push(ConversationManager.getRandomResponse('greetings'));
            
            // Personalized greetings if we have favorite types
            if (favoriteTypes.length > 0) {
                const personalized = [
                    `Welcome back! I remember you like ${favoriteTypes.join(' and ')} type Pokémon!`,
                    `Great to see you! Your favorite ${favoriteTypes[0]} types await!`,
                    `Hello! Ready to explore more ${favoriteTypes.join(' and ')} type Pokémon?`
                ];
                greetingCategories.push(personalized[Math.floor(Math.random() * personalized.length)]);
            }
            
            // Discovery-based greetings
            if (discoveredCount > 0) {
                const discovery = [
                    `Welcome back! You've explored ${discoveredCount} Pokémon!`,
                    `Great to see you! ${discoveredCount} discoveries and counting!`,
                    `Hello! With ${discoveredCount} Pokémon explored, you're becoming an expert!`
                ];
                greetingCategories.push(discovery[Math.floor(Math.random() * discovery.length)]);
            }
            
            // Action-oriented greetings
            const action = [
                "What Pokémon shall we explore today?",
                "Ready for some Pokémon adventures?",
                "Which Pokémon are you curious about?",
                "What shall we discover together?"
            ];
            greetingCategories.push(action[Math.floor(Math.random() * action.length)]);
            
            // Select a greeting, ensuring it's different from the last one
            let selectedGreeting;
            do {
                selectedGreeting = greetingCategories[Math.floor(Math.random() * greetingCategories.length)];
            } while (selectedGreeting === this.lastGreeting && greetingCategories.length > 1);
            
            this.lastGreeting = selectedGreeting;
            this.greetingCount++;
            
            return selectedGreeting;
        }
    };

    // ==================== CONTEXT MEMORY SYSTEM ====================

    const ContextMemory = (() => {
        // Memory structure matching your existing patterns
        const MEMORY_KEYS = {
            CONVERSATION_HISTORY: 'poketalk_conversation_history',
            USER_PREFERENCES: 'poketalk_user_preferences',
            USER_PROFILE: 'poketalk_user_profile'
        };

        // Initialize memory system
        function init() {
            ensureMemoryStructure();
            migrateOldData();
            loadChatHistory();
        }

        // Ensure proper memory structure exists
        function ensureMemoryStructure() {
            if (!localStorage.getItem(MEMORY_KEYS.USER_PREFERENCES)) {
                localStorage.setItem(MEMORY_KEYS.USER_PREFERENCES, JSON.stringify({
                    favoriteTypes: [],
                    favoritePokemon: [],
                    preferredLanguage: 'english',
                    interactionCount: 0,
                    discoveredPokemon: [],
                    exploredTypes: [],
                    lastActive: Date.now()
                }));
            }

            if (!localStorage.getItem(MEMORY_KEYS.USER_PROFILE)) {
                localStorage.setItem(MEMORY_KEYS.USER_PROFILE, JSON.stringify({
                    userName: null,
                    userMood: 'neutral',
                    conversationStyle: 'friendly',
                    sessionCount: 0
                }));
            }
        }

        // Migrate data from old chat history if needed
        function migrateOldData() {
            const oldMessages = localStorage.getItem('poketalk_messages');
            if (oldMessages) {
                try {
                    const messages = JSON.parse(oldMessages);
                    const preferences = getUserPreferences();
                    
                    // Extract preferences from old messages
                    messages.forEach(msg => {
                        if (msg.type === 'user') {
                            preferences.interactionCount++;
                            extractPreferencesFromMessage(msg.content, preferences);
                        }
                    });
                    
                    setUserPreferences(preferences);
                } catch (e) {
                    console.warn('Migration failed:', e);
                }
            }
        }

        // Extract user preferences from messages
        function extractPreferencesFromMessage(message, preferences) {
            const text = message.toLowerCase();
            
            // Detect language preferences
            if (text.includes('salamat') || text.includes('kaayo') || text.includes('bai')) {
                preferences.preferredLanguage = 'bisaya';
            }
            
            // Detect type mentions
            const types = ['fire', 'water', 'grass', 'electric', 'psychic', 'dragon'];
            types.forEach(type => {
                if (text.includes(type) && !preferences.favoriteTypes.includes(type)) {
                    preferences.favoriteTypes.push(type);
                }
            });
        }

        // Get user preferences
        function getUserPreferences() {
            try {
                return JSON.parse(localStorage.getItem(MEMORY_KEYS.USER_PREFERENCES)) || {};
            } catch {
                return {};
            }
        }

        // Update user preferences
        function setUserPreferences(preferences) {
            preferences.lastActive = Date.now();
            localStorage.setItem(MEMORY_KEYS.USER_PREFERENCES, JSON.stringify(preferences));
        }

        // Get user profile
        function getUserProfile() {
            try {
                return JSON.parse(localStorage.getItem(MEMORY_KEYS.USER_PROFILE)) || {};
            } catch {
                return {};
            }
        }

        // Update user profile
        function setUserProfile(profile) {
            localStorage.setItem(MEMORY_KEYS.USER_PROFILE, JSON.stringify(profile));
        }

        // Add discovered Pokémon
        function addDiscoveredPokemon(pokemonName) {
            const preferences = getUserPreferences();
            if (!preferences.discoveredPokemon) {
                preferences.discoveredPokemon = [];
            }
            
            if (!preferences.discoveredPokemon.includes(pokemonName.toLowerCase())) {
                preferences.discoveredPokemon.push(pokemonName.toLowerCase());
                setUserPreferences(preferences);
            }
        }

        // Add explored type
        function addExploredType(type) {
            const preferences = getUserPreferences();
            if (!preferences.exploredTypes) {
                preferences.exploredTypes = [];
            }
            
            if (!preferences.exploredTypes.includes(type.toLowerCase())) {
                preferences.exploredTypes.push(type.toLowerCase());
                setUserPreferences(preferences);
            }
        }

        // Update interaction count
        function updateInteractionCount() {
            const preferences = getUserPreferences();
            preferences.interactionCount = (preferences.interactionCount || 0) + 1;
            setUserPreferences(preferences);
        }

        // Get recent conversation context (last 5 messages)
        function getRecentContext() {
            try {
                const messages = JSON.parse(localStorage.getItem('poketalk_messages') || '[]');
                return messages.slice(-5).map(msg => ({
                    type: msg.type,
                    content: msg.type === 'user' ? msg.content : msg.content.substring(0, 100),
                    timestamp: msg.timestamp
                }));
            } catch {
                return [];
            }
        }

        // Check if user has discussed Pokémon before
        function hasDiscussedPokemon(pokemonName) {
            const preferences = getUserPreferences();
            return preferences.discoveredPokemon && 
                   preferences.discoveredPokemon.includes(pokemonName.toLowerCase());
        }

        // Get user's favorite types
        function getFavoriteTypes() {
            const preferences = getUserPreferences();
            return preferences.favoriteTypes || [];
        }

        // Get preferred language
        function getPreferredLanguage() {
            const preferences = getUserPreferences();
            return preferences.preferredLanguage || 'english';
        }

        // Set preferred language
        function setPreferredLanguage(language) {
            const preferences = getUserPreferences();
            preferences.preferredLanguage = language;
            setUserPreferences(preferences);
        }

        return {
            init,
            getUserPreferences,
            setUserPreferences,
            getUserProfile,
            setUserProfile,
            addDiscoveredPokemon,
            addExploredType,
            updateInteractionCount,
            getRecentContext,
            hasDiscussedPokemon,
            getFavoriteTypes,
            getPreferredLanguage,
            setPreferredLanguage,
            extractPreferencesFromMessage
        };
    })();

    // ==================== ADVANCED CONVERSATION MEMORY ====================

const AdvancedMemory = {
    // Track conversation flow and patterns
    conversationFlow: [],
    userInterests: {},
    conversationDepth: 0,
    topicHistory: [],
    userKnowledgeLevel: 'beginner', // beginner, intermediate, expert
    
    // Initialize advanced memory
    init: function() {
        this.loadAdvancedMemory();
        this.analyzeExistingHistory();
    },
    
    // Track conversation topics and patterns
    trackConversationFlow: function(userInput, botResponse) {
        const topics = this.extractTopics(userInput);
        const intent = this.analyzeIntent(userInput);
        
        // Add to conversation flow
        this.conversationFlow.push({
            timestamp: Date.now(),
            userInput: userInput,
            botResponse: botResponse,
            topics: topics,
            intent: intent,
            mood: this.detectMood(userInput)
        });
        
        // Keep only last 20 interactions to prevent memory bloat
        if (this.conversationFlow.length > 20) {
            this.conversationFlow = this.conversationFlow.slice(-20);
        }
        
        // Update topic history
        this.updateTopicHistory(topics);
        
        // Update user knowledge level
        this.updateKnowledgeLevel(userInput);
        
        // Save to localStorage
        this.saveAdvancedMemory();
    },
    
    // Extract detailed topics from user input
    extractTopics: function(text) {
        const topics = [];
        const lowerText = text.toLowerCase();
        
        // Pokémon names
        const pokemonName = extractPokemonName(text);
        if (pokemonName) {
            topics.push({
                type: 'pokemon',
                value: pokemonName,
                confidence: 0.9
            });
        }
        
        // Pokémon types
        const types = ['fire', 'water', 'grass', 'electric', 'psychic', 'dragon', 
                      'normal', 'fighting', 'flying', 'poison', 'ground', 'rock', 
                      'bug', 'ghost', 'steel', 'ice', 'dark', 'fairy'];
        
        types.forEach(type => {
            if (lowerText.includes(type)) {
                topics.push({
                    type: 'pokemon_type',
                    value: type,
                    confidence: 0.8
                });
                
                // Update user interests
                this.updateUserInterest('types', type);
            }
        });
        
        // Game mechanics
        const mechanics = {
            evolution: ['evolve', 'evolution', 'evo'],
            battle: ['battle', 'fight', 'attack', 'defense', 'hp'],
            stats: ['stats', 'statistics', 'strong', 'weak', 'powerful'],
            abilities: ['ability', 'abilities', 'skill'],
            moves: ['move', 'moves', 'attack move'],
            items: ['item', 'items', 'hold item']
        };
        
        Object.entries(mechanics).forEach(([mechanic, keywords]) => {
            if (keywords.some(keyword => lowerText.includes(keyword))) {
                topics.push({
                    type: 'mechanic',
                    value: mechanic,
                    confidence: 0.7
                });
            }
        });
        
        // Generations
        for (let gen = 1; gen <= 9; gen++) {
            if (lowerText.includes(`generation ${gen}`) || lowerText.includes(`gen ${gen}`)) {
                topics.push({
                    type: 'generation',
                    value: gen,
                    confidence: 0.8
                });
            }
        }
        
        return topics;
    },
    
    // Analyze user intent more deeply
    analyzeIntent: function(text) {
        const lowerText = text.toLowerCase();
        
        // Expanded intent detection
        const intents = {
            information_request: /(what|how|tell me about|explain|information|info)/i,
            comparison: /(compare|vs|versus|difference|better|stronger|weaker)/i,
            evolution: /(evolve|evolution|evo|evolves)/i,
            recommendation: /(suggest|recommend|best|good|which should|what.*should)/i,
            casual: /(hi|hello|hey|how are you|musta|sup)/i,
            technical: /(stats?|ability|moves?|base.*stat|iv|ev)/i,
            story: /(lore|story|history|background|origin)/i,
            battle: /(battle|fight|attack|defense|win against)/i
        };
        
        for (const [intent, pattern] of Object.entries(intents)) {
            if (pattern.test(lowerText)) {
                return intent;
            }
        }
        
        return 'general_query';
    },
    
    // Detect user mood from text
    detectMood: function(text) {
        const lowerText = text.toLowerCase();
        
        const moodPatterns = {
            excited: [/\b(wow|awesome|amazing|cool|nice|great)\b/, /!{2,}/, /\b(love|like|favorite)\b/],
            curious: [/\b(how|what|why|when|where|explain|tell me)\b/, /\?/],
            frustrated: [/\b(no|wrong|error|problem|issue|can't|cannot)\b/, /\b(not working|broken)\b/],
            casual: [/\b(hi|hello|hey|sup|yo|thanks|thank you)\b/]
        };
        
        for (const [mood, patterns] of Object.entries(moodPatterns)) {
            if (patterns.some(pattern => pattern.test(lowerText))) {
                return mood;
            }
        }
        
        return 'neutral';
    },
    
    // Update topic history with frequency tracking
    updateTopicHistory: function(topics) {
        topics.forEach(topic => {
            const existingTopic = this.topicHistory.find(t => t.value === topic.value && t.type === topic.type);
            
            if (existingTopic) {
                existingTopic.frequency++;
                existingTopic.lastDiscussed = Date.now();
            } else {
                this.topicHistory.push({
                    type: topic.type,
                    value: topic.value,
                    frequency: 1,
                    firstDiscussed: Date.now(),
                    lastDiscussed: Date.now()
                });
            }
        });
        
        // Sort by frequency and recency
        this.topicHistory.sort((a, b) => {
            if (b.frequency !== a.frequency) {
                return b.frequency - a.frequency;
            }
            return b.lastDiscussed - a.lastDiscussed;
        });
        
        // Keep only top 15 topics
        this.topicHistory = this.topicHistory.slice(0, 15);
    },
    
    // Update user interests based on conversation
    updateUserInterest: function(category, value) {
        if (!this.userInterests[category]) {
            this.userInterests[category] = {};
        }
        
        if (!this.userInterests[category][value]) {
            this.userInterests[category][value] = 1;
        } else {
            this.userInterests[category][value]++;
        }
    },
    
    // Estimate user's Pokémon knowledge level
    updateKnowledgeLevel: function(userInput) {
        const lowerText = userInput.toLowerCase();
        
        // Advanced terminology indicates higher knowledge
        const advancedTerms = ['iv', 'ev', 'base stat', 'competitive', 'nature', 'ability', 'hidden ability', 'shiny'];
        const technicalTerms = ['special attack', 'special defense', 'speed stat', 'hp stat'];
        
        const advancedCount = advancedTerms.filter(term => lowerText.includes(term)).length;
        const technicalCount = technicalTerms.filter(term => lowerText.includes(term)).length;
        
        if (advancedCount >= 2 || technicalCount >= 3) {
            this.userKnowledgeLevel = 'expert';
        } else if (technicalCount >= 1 || this.conversationDepth > 10) {
            this.userKnowledgeLevel = 'intermediate';
        }
        
        this.conversationDepth++;
    },
    
    // Get recent conversation context
    getRecentContext: function(maxMessages = 5) {
        return this.conversationFlow.slice(-maxMessages);
    },
    
    // Get user's favorite topics
    getFavoriteTopics: function() {
        return this.topicHistory.slice(0, 5);
    },
    
    // Get most discussed Pokémon
    getFavoritePokemon: function() {
        const pokemonTopics = this.topicHistory.filter(topic => topic.type === 'pokemon');
        return pokemonTopics.slice(0, 3).map(topic => topic.value);
    },
    
    // Get preferred types
    getPreferredTypes: function() {
        if (!this.userInterests.types) return [];
        
        return Object.entries(this.userInterests.types)
            .sort(([,a], [,b]) => b - a)
            .slice(0, 3)
            .map(([type]) => type);
    },
    
    // Check if topic was recently discussed
    wasRecentlyDiscussed: function(topicType, topicValue, minutes = 10) {
        const recentTime = Date.now() - (minutes * 60 * 1000);
        
        return this.conversationFlow.some(interaction => 
            interaction.topics.some(topic => 
                topic.type === topicType && 
                topic.value === topicValue &&
                interaction.timestamp > recentTime
            )
        );
    },
    
    // Save to localStorage
    saveAdvancedMemory: function() {
        const memoryData = {
            conversationFlow: this.conversationFlow,
            userInterests: this.userInterests,
            conversationDepth: this.conversationDepth,
            topicHistory: this.topicHistory,
            userKnowledgeLevel: this.userKnowledgeLevel
        };
        
        localStorage.setItem('poketalk_advanced_memory', JSON.stringify(memoryData));
    },
    
    // Load from localStorage
    loadAdvancedMemory: function() {
        try {
            const saved = localStorage.getItem('poketalk_advanced_memory');
            if (saved) {
                const memoryData = JSON.parse(saved);
                Object.assign(this, memoryData);
            }
        } catch (error) {
            console.warn('Failed to load advanced memory:', error);
        }
    },
    
    // Analyze existing chat history
    analyzeExistingHistory: function() {
        try {
            const messages = JSON.parse(localStorage.getItem('poketalk_messages') || '[]');
            
            messages.forEach(msg => {
                if (msg.type === 'user') {
                    this.trackConversationFlow(msg.content, '');
                }
            });
        } catch (error) {
            console.warn('Failed to analyze existing history:', error);
        }
    },
    
    // Clear advanced memory (for reset)
    clear: function() {
        this.conversationFlow = [];
        this.userInterests = {};
        this.conversationDepth = 0;
        this.topicHistory = [];
        this.userKnowledgeLevel = 'beginner';
        localStorage.removeItem('poketalk_advanced_memory');
    }
};


// ==================== INTELLIGENT CONVERSATION FLOW ====================

const ConversationFlow = {
    // Track conversation state and transitions
    currentTopic: null,
    previousTopics: [],
    topicDepth: 0,
    lastPokemonContext: null,
    
    // Initialize flow system
    init: function() {
        this.loadFlowState();
    },
    
    // Update conversation flow with new interaction
    updateFlow: function(userInput, botResponse, topics) {
        const previousTopic = this.currentTopic;
        
        // Analyze topic transition
        if (topics.length > 0) {
            this.currentTopic = topics[0]; // Primary topic
            this.trackTopicTransition(previousTopic, this.currentTopic);
        }
        
        // Update topic depth (how long we've been on similar topics)
        if (this.isRelatedTopic(previousTopic, this.currentTopic)) {
            this.topicDepth++;
        } else {
            this.topicDepth = 1;
        }
        
        // Track Pokémon context for follow-ups
        const pokemonTopic = topics.find(t => t.type === 'pokemon');
        if (pokemonTopic) {
            this.lastPokemonContext = {
                name: pokemonTopic.value,
                timestamp: Date.now(),
                discussedEvolutions: false,
                discussedComparisons: false,
                discussedType: false
            };
        }
        
        this.saveFlowState();
    },
    
    // Check if topics are related
    isRelatedTopic: function(topic1, topic2) {
        if (!topic1 || !topic2) return false;
        
        // Same Pokémon
        if (topic1.type === 'pokemon' && topic2.type === 'pokemon') {
            return topic1.value === topic2.value;
        }
        
        // Same type
        if (topic1.type === 'pokemon_type' && topic2.type === 'pokemon_type') {
            return topic1.value === topic2.value;
        }
        
        // Pokémon and its type
        if ((topic1.type === 'pokemon' && topic2.type === 'pokemon_type') ||
            (topic1.type === 'pokemon_type' && topic2.type === 'pokemon')) {
            // We'd need Pokémon type data here - this is simplified
            return true;
        }
        
        return false;
    },
    
    // Track how topics transition
    trackTopicTransition: function(fromTopic, toTopic) {
        if (fromTopic && toTopic) {
            this.previousTopics.push({
                from: fromTopic,
                to: toTopic,
                timestamp: Date.now()
            });
            
            // Keep only recent transitions
            if (this.previousTopics.length > 10) {
                this.previousTopics = this.previousTopics.slice(-10);
            }
        }
    },
    
    // Generate natural topic transitions
    generateTopicTransition: function(currentTopics) {
        const transitions = [];
        
        // If we have a Pokémon topic, suggest related content
        const pokemonTopic = currentTopics.find(t => t.type === 'pokemon');
        if (pokemonTopic) {
            const pokemonName = pokemonTopic.value;
            
            // Evolution transition
            if (!this.lastPokemonContext || !this.lastPokemonContext.discussedEvolutions) {
                transitions.push(`Speaking of ${capitalize(pokemonName)}, have you seen its evolution?`);
            }
            
            // Type advantage transition
            if (!this.lastPokemonContext || !this.lastPokemonContext.discussedType) {
                transitions.push(`By the way, ${capitalize(pokemonName)}'s type has some interesting advantages!`);
            }
            
            // Comparison transition
            if (!this.lastPokemonContext || !this.lastPokemonContext.discussedComparisons) {
                transitions.push(`${capitalize(pokemonName)} is cool! Want to see how it compares to other similar Pokémon?`);
            }
        }
        
        // Type-based transitions
        const typeTopic = currentTopics.find(t => t.type === 'pokemon_type');
        if (typeTopic) {
            const typeName = typeTopic.value;
            
            transitions.push(
                `Speaking of ${typeName} types, there are some really powerful ones you might like!`,
                `Since we're talking about ${typeName} types, have you explored their strengths and weaknesses?`,
                `I love ${typeName} types too! Want me to show you some of the best ones?`
            );
        }
        
        // Mechanic-based transitions
        const mechanicTopic = currentTopics.find(t => t.type === 'mechanic');
        if (mechanicTopic) {
            const mechanic = mechanicTopic.value;
            
            if (mechanic === 'evolution') {
                transitions.push("Evolution is fascinating! Some Pokémon have really unique evolution methods...");
            } else if (mechanic === 'battle') {
                transitions.push("Battles are where Pokémon really shine! Want to learn some battle strategies?");
            }
        }
        
        return transitions.length > 0 ? transitions[Math.floor(Math.random() * transitions.length)] : null;
    },
    
    // Generate intelligent follow-up questions
   generateFollowUpQuestion: function(currentTopics) {
    const pokemonTopic = currentTopics.find(t => t.type === 'pokemon');
    
    if (pokemonTopic) {
        const pokemonName = pokemonTopic.value;
        const followUps = [];
        
        // EVOLUTION QUESTION
        if (!this.lastPokemonContext || !this.lastPokemonContext.discussedEvolutions) {
            followUps.push({
                type: 'evolution_suggestion',
                question: `Want to see ${capitalize(pokemonName)}'s evolution chain?`
            });
        }
        
        // SIMILAR POKÉMON QUESTION
        followUps.push({
            type: 'related_pokemon', 
            question: `Should I show you other Pokémon similar to ${capitalize(pokemonName)}?`
        });
        
        // COMPARISON QUESTION
        if (!this.lastPokemonContext || !this.lastPokemonContext.discussedComparisons) {
            followUps.push({
                type: 'more_comparisons',
                question: `Want to compare ${capitalize(pokemonName)} with another Pokémon?`
            });
        }
        
        // TYPE ADVANTAGES QUESTION
        if (!this.lastPokemonContext || !this.lastPokemonContext.discussedType) {
            followUps.push({
                type: 'type_advantages',
                question: `Interested in ${capitalize(pokemonName)}'s type advantages?`
            });
        }
        
        // Select a random follow-up
        if (followUps.length > 0) {
            const selected = followUps[Math.floor(Math.random() * followUps.length)];
            ConversationManager.pendingFollowUp = selected.type;
            console.log('🎯 GENERATED FOLLOW-UP:');
            console.log('   - Selected type:', selected.type);
            console.log('   - Question:', selected.question);
            console.log('   - All options:', followUps.map(f => f.type));
            return selected.question;
        }
    }
    
    return null;
},


    
    // Build on previous questions instead of repeating
    buildOnPreviousContext: function(userInput, currentTopics) {
        const recentContext = AdvancedMemory.getRecentContext(3);
        
        // Check if this continues a previous topic
        for (let i = recentContext.length - 1; i >= 0; i--) {
            const pastInteraction = recentContext[i];
            const pastTopics = pastInteraction.topics || [];
            
            // Find related topics
            const relatedTopic = pastTopics.find(pastTopic => 
                currentTopics.some(currentTopic => 
                    this.areTopicsRelated(pastTopic, currentTopic)
                )
            );
            
            if (relatedTopic) {
                return this.generateContinuation(relatedTopic, currentTopics);
            }
        }
        
        return null;
    },
    
    // Check if topics are related for continuation
    areTopicsRelated: function(topic1, topic2) {
        if (!topic1 || !topic2) return false;
        
        // Same type of topic
        if (topic1.type === topic2.type) {
            if (topic1.type === 'pokemon') {
                return topic1.value === topic2.value; // Same Pokémon
            }
            return true; // Same topic type (type, mechanic, etc.)
        }
        
        // Related types (Pokémon and its type, etc.)
        if ((topic1.type === 'pokemon' && topic2.type === 'pokemon_type') ||
            (topic1.type === 'pokemon_type' && topic2.type === 'pokemon')) {
            return true;
        }
        
        return false;
    },
    
    // Generate continuation phrases
    generateContinuation: function(previousTopic, currentTopics) {
        const currentPokemon = currentTopics.find(t => t.type === 'pokemon');
        
        if (previousTopic.type === 'pokemon' && currentPokemon) {
            if (previousTopic.value === currentPokemon.value) {
                return `Continuing with ${capitalize(currentPokemon.value)}...`;
            } else {
                return `Building on our talk about ${capitalize(previousTopic.value)}...`;
            }
        }
        
        if (previousTopic.type === 'pokemon_type') {
            const currentType = currentTopics.find(t => t.type === 'pokemon_type');
            if (currentType && previousTopic.value === currentType.value) {
                return `More about ${previousTopic.value} types...`;
            }
        }
        
        return null;
    },
    
    // Recall previous discussions (5-10 messages ago)
    recallPreviousDiscussion: function(currentTopics) {
        const olderContext = AdvancedMemory.getRecentContext(10).slice(0, 5); // Messages 5-10 ago
        
        for (const interaction of olderContext) {
            const pastTopics = interaction.topics || [];
            const currentMainTopic = currentTopics[0];
            
            // Find if we discussed something related before
            const relatedPastTopic = pastTopics.find(pastTopic => 
                this.areTopicsRelated(pastTopic, currentMainTopic)
            );
            
            if (relatedPastTopic) {
                return this.generateRecallPhrase(relatedPastTopic, currentMainTopic);
            }
        }
        
        return null;
    },
    
    // Generate recall phrases
    generateRecallPhrase: function(pastTopic, currentTopic) {
        if (pastTopic.type === 'pokemon' && currentTopic.type === 'pokemon') {
            if (pastTopic.value === currentTopic.value) {
                return `We talked about ${capitalize(pastTopic.value)} before! `;
            } else {
                return `Remember when we discussed ${capitalize(pastTopic.value)}? `;
            }
        }
        
        if (pastTopic.type === 'pokemon_type' && currentTopic.type === 'pokemon_type') {
            if (pastTopic.value === currentTopic.value) {
                return `We've explored ${pastTopic.value} types together before! `;
            }
        }
        
        return null;
    },
    
    // Mark topics as discussed
    markAsDiscussed: function(topicType, pokemonName = null) {
        if (pokemonName && this.lastPokemonContext && this.lastPokemonContext.name === pokemonName) {
            switch(topicType) {
                case 'evolution':
                    this.lastPokemonContext.discussedEvolutions = true;
                    break;
                case 'comparison':
                    this.lastPokemonContext.discussedComparisons = true;
                    break;
                case 'type':
                    this.lastPokemonContext.discussedType = true;
                    break;
            }
            this.saveFlowState();
        }
    },
    
    // Save/Load state
    saveFlowState: function() {
        const flowData = {
            currentTopic: this.currentTopic,
            previousTopics: this.previousTopics,
            topicDepth: this.topicDepth,
            lastPokemonContext: this.lastPokemonContext
        };
        localStorage.setItem('poketalk_conversation_flow', JSON.stringify(flowData));
    },
    
    loadFlowState: function() {
        try {
            const saved = localStorage.getItem('poketalk_conversation_flow');
            if (saved) {
                const flowData = JSON.parse(saved);
                Object.assign(this, flowData);
            }
        } catch (error) {
            console.warn('Failed to load conversation flow:', error);
        }
    },
    
    // Clear flow state (for reset)
    clear: function() {
        this.currentTopic = null;
        this.previousTopics = [];
        this.topicDepth = 0;
        this.lastPokemonContext = null;
        localStorage.removeItem('poketalk_conversation_flow');
    }
};

// ==================== ADD MISSING SIMILAR POKÉMON FUNCTION ====================

async function showSimilarPokemon(pokemonName) {
    showTyping(true);
    
    try {
        // Get the Pokémon data to find its type
        const pokemonData = await window.PokemonLogic.fetchPokemonData(pokemonName);
        const primaryType = pokemonData.types[0].type.name;
        
        // Show message first
        const response = `Since you like ${capitalize(pokemonName)}, here are some other ${capitalize(primaryType)}-type Pokémon:`;
        await smartBotReply(response, `similar to ${pokemonName}`);
        
        // Show 2 similar Pokémon based on type
        const similarPokemon = getSimilarPokemonByType(primaryType, pokemonName);
        
        for (const similarName of similarPokemon.slice(0, 2)) {
            await delay(1000);
            const result = await window.PokemonLogic.handlePokemonShow(similarName);
            if (result.success) {
                appendBotMessage(result.html);
            }
        }
        
    } catch (error) {
        console.error('Error finding similar Pokémon:', error);
        await smartBotReply("Sorry, I had trouble finding similar Pokémon.", `similar to ${pokemonName}`);
    }
    
    showTyping(false);
}

async function showTypeAdvantages(pokemonName, showDetailed = false) {
    showTyping(true);
    
    try {
        const pokemonData = await window.PokemonLogic.fetchPokemonData(pokemonName);
        const types = pokemonData.types.map(t => t.type.name);
        
        const typeText = types.map(t => capitalize(t)).join('/');
        
        if (!showDetailed) {
            // First time - ask if they want detailed info
            const response = `${capitalize(pokemonName)} is ${typeText} type. ` +
                           `It's strong against certain types and weak against others. ` +
                           `Want me to show you a detailed type matchup?`;
            
            await smartBotReply(response, `type advantages of ${pokemonName}`);
            
            // Set up for detailed follow-up
            ConversationManager.updateUserContext('lastPokemon', pokemonName);
            ConversationManager.pendingFollowUp = 'show_detailed_type_matchup';
        } else {
            // Show detailed type matchup
            const detailedResponse = await generateDetailedTypeMatchup(pokemonName, types);
            await smartBotReply(detailedResponse, `detailed type matchup for ${pokemonName}`);
        }
        
    } catch (error) {
        console.error('Error showing type advantages:', error);
        await smartBotReply("Sorry, I couldn't load type information.", `type advantages of ${pokemonName}`);
    }
    
    showTyping(false);
}

// Add this new function for detailed type matchups
async function generateDetailedTypeMatchup(pokemonName, types) {
    // Complete type effectiveness chart based on Pokémon games
    const typeMatchups = {
        normal: {
            strong_against: [],
            weak_against: ['Rock', 'Steel'],
            resistant_to: [],
            weak_to: ['Fighting']
        },
        fire: {
            strong_against: ['Grass', 'Ice', 'Bug', 'Steel'],
            weak_against: ['Fire', 'Water', 'Rock', 'Dragon'],
            resistant_to: ['Fire', 'Grass', 'Ice', 'Bug', 'Steel', 'Fairy'],
            weak_to: ['Water', 'Ground', 'Rock']
        },
        water: {
            strong_against: ['Fire', 'Ground', 'Rock'],
            weak_against: ['Water', 'Grass', 'Dragon'],
            resistant_to: ['Fire', 'Water', 'Ice', 'Steel'],
            weak_to: ['Electric', 'Grass']
        },
        electric: {
            strong_against: ['Water', 'Flying'],
            weak_against: ['Electric', 'Grass', 'Dragon'],
            resistant_to: ['Electric', 'Flying', 'Steel'],
            weak_to: ['Ground']
        },
        grass: {
            strong_against: ['Water', 'Ground', 'Rock'],
            weak_against: ['Fire', 'Grass', 'Poison', 'Flying', 'Bug', 'Dragon', 'Steel'],
            resistant_to: ['Water', 'Electric', 'Grass', 'Ground'],
            weak_to: ['Fire', 'Ice', 'Poison', 'Flying', 'Bug']
        },
        ice: {
            strong_against: ['Grass', 'Ground', 'Flying', 'Dragon'],
            weak_against: ['Fire', 'Water', 'Ice', 'Steel'],
            resistant_to: ['Ice'],
            weak_to: ['Fire', 'Fighting', 'Rock', 'Steel']
        },
        fighting: {
            strong_against: ['Normal', 'Ice', 'Rock', 'Dark', 'Steel'],
            weak_against: ['Poison', 'Flying', 'Psychic', 'Bug', 'Fairy'],
            resistant_to: ['Bug', 'Rock', 'Dark'],
            weak_to: ['Flying', 'Psychic', 'Fairy']
        },
        poison: {
            strong_against: ['Grass', 'Fairy'],
            weak_against: ['Poison', 'Ground', 'Rock', 'Ghost'],
            resistant_to: ['Grass', 'Fighting', 'Poison', 'Bug', 'Fairy'],
            weak_to: ['Ground', 'Psychic']
        },
        ground: {
            strong_against: ['Fire', 'Electric', 'Poison', 'Rock', 'Steel'],
            weak_against: ['Grass', 'Bug'],
            resistant_to: ['Poison', 'Rock'],
            weak_to: ['Water', 'Grass', 'Ice']
        },
        flying: {
            strong_against: ['Grass', 'Fighting', 'Bug'],
            weak_against: ['Electric', 'Rock', 'Steel'],
            resistant_to: ['Grass', 'Fighting', 'Bug'],
            weak_to: ['Electric', 'Ice', 'Rock']
        },
        psychic: {
            strong_against: ['Fighting', 'Poison'],
            weak_against: ['Psychic', 'Steel'],
            resistant_to: ['Fighting', 'Psychic'],
            weak_to: ['Bug', 'Ghost', 'Dark']
        },
        bug: {
            strong_against: ['Grass', 'Psychic', 'Dark'],
            weak_against: ['Fire', 'Fighting', 'Poison', 'Flying', 'Ghost', 'Steel', 'Fairy'],
            resistant_to: ['Grass', 'Fighting', 'Ground'],
            weak_to: ['Fire', 'Flying', 'Rock']
        },
        rock: {
            strong_against: ['Fire', 'Ice', 'Flying', 'Bug'],
            weak_against: ['Fighting', 'Ground', 'Steel'],
            resistant_to: ['Normal', 'Fire', 'Poison', 'Flying'],
            weak_to: ['Water', 'Grass', 'Fighting', 'Ground', 'Steel']
        },
        ghost: {
            strong_against: ['Psychic', 'Ghost'],
            weak_against: ['Dark'],
            resistant_to: ['Poison', 'Bug'],
            weak_to: ['Ghost', 'Dark']
        },
        dragon: {
            strong_against: ['Dragon'],
            weak_against: ['Steel'],
            resistant_to: ['Fire', 'Water', 'Electric', 'Grass'],
            weak_to: ['Ice', 'Dragon', 'Fairy']
        },
        dark: {
            strong_against: ['Psychic', 'Ghost'],
            weak_against: ['Fighting', 'Dark', 'Fairy'],
            resistant_to: ['Ghost', 'Dark'],
            weak_to: ['Fighting', 'Bug', 'Fairy']
        },
        steel: {
            strong_against: ['Ice', 'Rock', 'Fairy'],
            weak_against: ['Fire', 'Water', 'Electric', 'Steel'],
            resistant_to: ['Normal', 'Grass', 'Ice', 'Flying', 'Psychic', 'Bug', 'Rock', 'Dragon', 'Steel', 'Fairy'],
            weak_to: ['Fire', 'Fighting', 'Ground']
        },
        fairy: {
            strong_against: ['Fighting', 'Dragon', 'Dark'],
            weak_against: ['Fire', 'Poison', 'Steel'],
            resistant_to: ['Fighting', 'Bug', 'Dark'],
            weak_to: ['Poison', 'Steel']
        }
    };
    
    let matchupText = `**${capitalize(pokemonName)} Type Matchup (${types.map(t => capitalize(t)).join('/')})**\n\n`;
    
    // Calculate combined effectiveness for dual types
    const defensiveWeaknesses = calculateDefensiveWeaknesses(types, typeMatchups);
    const defensiveResistances = calculateDefensiveResistances(types, typeMatchups);
    const offensiveStrengths = calculateOffensiveStrengths(types, typeMatchups);
    
    matchupText += `**Defensive Capabilities:**\n`;
    matchupText += `• Weak to: ${defensiveWeaknesses.length > 0 ? defensiveWeaknesses.join(', ') : 'None'}\n`;
    matchupText += `• Resists: ${defensiveResistances.length > 0 ? defensiveResistances.join(', ') : 'None'}\n`;
    matchupText += `• Immune to: ${getImmunities(types).length > 0 ? getImmunities(types).join(', ') : 'None'}\n\n`;
    
    matchupText += `**Offensive Capabilities:**\n`;
    matchupText += `• Strong against: ${offensiveStrengths.length > 0 ? offensiveStrengths.join(', ') : 'None'}\n\n`;
    
    // Individual type breakdown
    types.forEach(type => {
        const matchup = typeMatchups[type];
        if (matchup) {
            matchupText += `**${capitalize(type)} Type Details:**\n`;
            matchupText += `• Super effective against: ${matchup.strong_against.join(', ') || 'None'}\n`;
            matchupText += `• Not very effective against: ${matchup.weak_against.join(', ') || 'None'}\n`;
            matchupText += `• Resists: ${matchup.resistant_to.join(', ') || 'None'}\n`;
            matchupText += `• Weak to: ${matchup.weak_to.join(', ') || 'None'}\n\n`;
        }
    });
    
    matchupText += `As a ${types.map(t => capitalize(t)).join('/')} type, ${capitalize(pokemonName)} has unique battle advantages!`;
    
    return matchupText;
}

// Helper functions for dual-type calculations
function calculateDefensiveWeaknesses(types, typeMatchups) {
    const weaknesses = new Set();
    
    types.forEach(type => {
        const matchup = typeMatchups[type];
        if (matchup && matchup.weak_to) {
            matchup.weak_to.forEach(weakness => weaknesses.add(weakness));
        }
    });
    
    // Remove resistances (if one type resists what the other is weak to)
    types.forEach(type => {
        const matchup = typeMatchups[type];
        if (matchup && matchup.resistant_to) {
            matchup.resistant_to.forEach(resistance => {
                if (weaknesses.has(resistance)) {
                    weaknesses.delete(resistance);
                }
            });
        }
    });
    
    return Array.from(weaknesses);
}

function calculateDefensiveResistances(types, typeMatchups) {
    const resistances = new Set();
    
    types.forEach(type => {
        const matchup = typeMatchups[type];
        if (matchup && matchup.resistant_to) {
            matchup.resistant_to.forEach(resistance => resistances.add(resistance));
        }
    });
    
    return Array.from(resistances);
}

function calculateOffensiveStrengths(types, typeMatchups) {
    const strengths = new Set();
    
    types.forEach(type => {
        const matchup = typeMatchups[type];
        if (matchup && matchup.strong_against) {
            matchup.strong_against.forEach(strength => strengths.add(strength));
        }
    });
    
    return Array.from(strengths);
}

function getImmunities(types) {
    const immunities = [];
    
    // Ghost is immune to Normal and Fighting
    if (types.includes('ghost')) {
        immunities.push('Normal', 'Fighting');
    }
    
    // Normal is immune to Ghost (but Ghost hits Normal neutrally in newer games)
    if (types.includes('normal')) {
        immunities.push('Ghost');
    }
    
    // Ground is immune to Electric
    if (types.includes('ground')) {
        immunities.push('Electric');
    }
    
    // Flying is immune to Ground
    if (types.includes('flying')) {
        immunities.push('Ground');
    }
    
    // Dark is immune to Psychic
    if (types.includes('dark')) {
        immunities.push('Psychic');
    }
    
    // Fairy is immune to Dragon
    if (types.includes('fairy')) {
        immunities.push('Dragon');
    }
    
    // Steel is immune to Poison
    if (types.includes('steel')) {
        immunities.push('Poison');
    }
    
    return immunities;
}

function getSimilarPokemonByType(type, excludePokemon) {
    const typeSuggestions = {
        electric: ['raichu', 'jolteon', 'electabuzz', 'magnemite'],
        fire: ['arcanine', 'ninetales', 'rapidash', 'magmar'],
        water: ['blastoise', 'gyarados', 'vaporeon', 'lapras'],
        grass: ['venusaur', 'victreebel', 'exeggutor', 'tangela'],
        psychic: ['alakazam', 'mewtwo', 'mr-mime', 'jynx']
    };
    
    return (typeSuggestions[type] || ['pikachu', 'eevee']).filter(p => p !== excludePokemon);
}

function getSimilarPokemonByType(type, excludePokemon) {
    // Simple type-based suggestions
    const typeSuggestions = {
        electric: ['raichu', 'jolteon', 'electabuzz', 'magnemite'],
        fire: ['charizard', 'arcanine', 'ninetales', 'rapidash'],
        water: ['blastoise', 'gyarados', 'vaporeon', 'lapras'],
        grass: ['venusaur', 'victreebel', 'exeggutor', 'tangela'],
        psychic: ['alakazam', 'mewtwo', 'mr-mime', 'jynx'],
        normal: ['eevee', 'snorlax', 'chansey', 'kangaskhan'],
        flying: ['pidgeot', 'fearow', 'butterfree', 'gyarados'],
        bug: ['butterfree', 'beedrill', 'venomoth', 'parasect'],
        rock: ['golem', 'onix', 'rhydon', 'omastar'],
        ground: ['sandslash', 'dugtrio', 'marowak', 'rhydon'],
        poison: ['venusaur', 'nidoking', 'muk', 'weezing'],
        fighting: ['machamp', 'primeape', 'hitmonlee', 'hitmonchan'],
        ghost: ['gengar', 'haunter', 'gastly'],
        ice: ['lapras', 'dewgong', 'cloyster', 'articuno'],
        dragon: ['dragonite', 'gyarados', 'charizard'], // Note: some aren't pure dragon
        fairy: ['clefable', 'wigglytuff', 'mr-mime'] // Gen 1 equivalents
    };
    
    return (typeSuggestions[type] || ['pikachu', 'eevee']).filter(p => p !== excludePokemon);
}
// ==================== FLOW-AWARE RESPONSE GENERATION ====================

async function generateFlowAwareResponse(userInput, baseResponse, topics) {
    let enhancedResponse = baseResponse;
    
    // 1. Add topic transitions (30% chance)
    if (Math.random() < 0.3) {
        const transition = ConversationFlow.generateTopicTransition(topics);
        if (transition) {
            enhancedResponse = transition + " " + enhancedResponse;
        }
    }
    
    // 2. Add context continuation (if building on previous topic)
    const continuation = ConversationFlow.buildOnPreviousContext(userInput, topics);
    if (continuation) {
        enhancedResponse = continuation + " " + enhancedResponse;
    }
    
    // 3. Add memory recall (20% chance for older topics)
    if (Math.random() < 0.2) {
        const recall = ConversationFlow.recallPreviousDiscussion(topics);
        if (recall) {
            enhancedResponse = recall + enhancedResponse;
        }
    }
    
    return enhancedResponse;
}

// Update your botReply function to use flow-aware responses
async function smartBotReply(baseResponse, userInput = '') {
    const topics = AdvancedMemory.extractTopics(userInput);
    const smartResponse = await generateFlowAwareResponse(userInput, baseResponse, topics);
    
    showTyping(true);
    await delay(600 + Math.random() * 400);
    showTyping(false);
    appendBotMessage(smartResponse);
    ConversationFlow.updateFlow(userInput, smartResponse, topics);
}
// ==================== ENHANCED RESPONSE GENERATION ====================

function generateContextAwareResponse(userInput, baseResponse) {
    const recentContext = AdvancedMemory.getRecentContext(3);
    const favoritePokemon = AdvancedMemory.getFavoritePokemon();
    const preferredTypes = AdvancedMemory.getPreferredTypes();
    const knowledgeLevel = AdvancedMemory.userKnowledgeLevel;
    
    let enhancedResponse = baseResponse;
    
    // Add personalized references
    if (favoritePokemon.length > 0 && Math.random() > 0.7) {
        const favorite = favoritePokemon[0];
        if (!AdvancedMemory.wasRecentlyDiscussed('pokemon', favorite)) {
            enhancedResponse += ` By the way, I remember you like ${capitalize(favorite)}!`;
        }
    }
    
    // Adjust explanation depth based on knowledge level
    if (knowledgeLevel === 'beginner' && baseResponse.length > 100) {
        enhancedResponse = simplifyExplanation(enhancedResponse);
    }
    
    // Reference previous topics if relevant
    const currentTopics = AdvancedMemory.extractTopics(userInput);
    if (currentTopics.length > 0) {
        const previousMentions = recentContext.flatMap(ctx => ctx.topics);
        const relatedTopics = previousMentions.filter(topic => 
            currentTopics.some(current => 
                current.type === topic.type && 
                current.value !== topic.value
            )
        );
        
        if (relatedTopics.length > 0 && Math.random() > 0.5) {
            const relatedTopic = relatedTopics[0];
            enhancedResponse += ` That reminds me of our chat about ${capitalize(relatedTopic.value)}!`;
        }
    }
    
    return enhancedResponse;
}

function simplifyExplanation(text) {
    // Simple text simplification (you can enhance this)
    return text
        .replace(/competitive battling/gi, 'battles')
        .replace(/base stats/gi, 'stats')
        .replace(/evolutionary/gi, 'evolution')
        .replace(/approximately/gi, 'about');
}

    // ==================== CORE SYSTEM INITIALIZATION ====================

    function checkForMilestones() {
        // This will be implemented when SocialSystem is available
        if (window.SocialSystem && window.SocialSystem.checkMilestones) {
            window.SocialSystem.checkMilestones();
        }
    }

    // ==================== XSS PROTECTION ====================
    
    function sanitizeUserInput(text) {
        if (typeof text !== 'string') return '';
        
        // Basic protection - reject obvious script tags
        const scriptPattern = /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi;
        if (scriptPattern.test(text)) {
            console.warn('XSS attempt blocked:', text.substring(0, 50));
            return 'Invalid input detected';
        }
        
        // Trim and limit length
        return text.trim().substring(0, 500);
    }

    function init() {
        initializeDOMElements();
        attachEvents();
        ContextMemory.init();
        loadChatHistory();
        checkForMilestones();
    }

    function initializeDOMElements() {
        chatForm = document.getElementById('chatForm');
        userInputEl = document.getElementById('userInput');
        chatWindow = document.getElementById('chatWindow');
        typingIndicator = document.getElementById('typingIndicator');
        sendButton = document.getElementById('sendButton'); 
    }

    function attachEvents() {
    if (!chatForm) return;
    
    chatForm.addEventListener('submit', e => {
        e.preventDefault();
        
        // Prevent spam if already processing
        if (isButtonDisabled()) {
            return;
        }
        
        const text = userInputEl.value.trim();
        if (!text) return;
        
        // DISABLE BUTTON IMMEDIATELY
        disableSendButton();
        
        const sanitizedText = sanitizeUserInput(text);
        appendUserMessage(sanitizedText);
        userInputEl.value = '';
        handleUserMessage(text);
    });

    userInputEl.addEventListener('keydown', e => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            chatForm.dispatchEvent(new Event('submit'));
        }
    });
}

    // ==================== ENHANCED MESSAGE SYSTEM ====================
    
    function appendUserMessage(text) {
    ContextMemory.updateInteractionCount();
    const preferences = ContextMemory.getUserPreferences();
    ContextMemory.extractPreferencesFromMessage(text, preferences);
    ContextMemory.setUserPreferences(preferences);
    
    // Update social context
    if (window.SocialSystem) {
        window.SocialSystem.learnUserLanguageStyle(text);
    }
    
    const messageData = {
        type: 'user',
        content: text,
        timestamp: Date.now(),
        mood: window.SocialSystem ? window.SocialSystem.getUserMood(text) : 'neutral',
        language: window.SocialSystem ? window.SocialSystem.getUserLanguage(text) : 'english'
    };
    messages.push(messageData);
    
    if (window.SocialSystem) {
        window.SocialSystem.updateConversationHistory(messageData);
        window.SocialSystem.updateFriendship(2);
    }
    
    // Use the new timestamp function
    const msg = addMessageWithTimestamp(text, 'user');
    scrollToBottom();
    saveChatHistory();
}
    
    function appendBotMessage(html) {
    const messageData = {
        type: 'bot',
        content: html,
        timestamp: Date.now(),
        language: window.SocialSystem ? window.SocialSystem.getCurrentLanguage() : 'english'
    };
    messages.push(messageData);
    AdvancedMemory.trackConversationFlow('', html);

    if (html.includes('pokemon-card')) {
        // Extract Pokémon name from HTML or use last context
        const lastPokemon = ConversationFlow.lastPokemonContext;
        if (lastPokemon) {
            ConversationFlow.markAsDiscussed('basic_info', lastPokemon.name);
        }
    }
    
    if (html.includes('evolution')) {
        const lastPokemon = ConversationFlow.lastPokemonContext;
        if (lastPokemon) {
            ConversationFlow.markAsDiscussed('evolution', lastPokemon.name);
        }
    }
    
    if (html.includes('comparison')) {
        const lastPokemon = ConversationFlow.lastPokemonContext;
        if (lastPokemon) {
            ConversationFlow.markAsDiscussed('comparison', lastPokemon.name);
        }
    }
        
    if (window.SocialSystem) {
        window.SocialSystem.updateConversationHistory(messageData);
    }
    
    // Use the new timestamp function with isCard detection
    const hasPokemonCard = html.includes('pokemon-card');
    const hasComparison = html.includes('comparison-container');
    const isCard = hasPokemonCard || hasComparison || html.includes('evolution-section');
    
    const wrapper = addMessageWithTimestamp(html, 'bot', null, isCard);
    
    // SPECIAL HANDLING FOR POKÉMON CARDS
    if (hasPokemonCard || hasComparison) {
        wrapper.style.width = '100%';
        wrapper.style.minWidth = '0';
        wrapper.style.maxWidth = 'none';
    }
    
    scrollToBottom();
    saveChatHistory();
}

    function showTyping(show = true) {
    if (!typingIndicator) return;
    typingIndicator.classList.toggle('hidden', !show);
    if (show) {
        typingIndicator.scrollIntoView({ behavior: 'smooth', block: 'end' });
    } else {
        // RE-ENABLE BUTTON WHEN TYPING STOPS (bot finished)
        enableSendButton();
    }
}

    function scrollToBottom() {
        setTimeout(() => {
            if (chatWindow) {
                const lastMessage = chatWindow.lastElementChild;
                if (lastMessage) {
                    lastMessage.scrollIntoView({ 
                        behavior: 'smooth', 
                        block: 'start' 
                    });
                }
            }
        }, 100);
    }

    // ==================== ENHANCED FEATURE HANDLERS ====================

    function detectAndSaveLanguage(text) {
        const bisayaPatterns = [
            /\b(salamat|kaayo|bai|pre|pare|musta|kumusta|huy|uy|oy|nindot|ayos)\b/,
            /\b(maayong buntag|maayong hapon|maayong gabii)\b/
        ];

        const isBisaya = bisayaPatterns.some(pattern => pattern.test(text.toLowerCase()));
        
        if (isBisaya) {
            ContextMemory.setPreferredLanguage('bisaya');
            return 'bisaya';
        }
        
        return 'english';
    }

    function getEnhancedEvolutionQuestion(pokemonName) {
        const hasDiscussedBefore = ContextMemory.hasDiscussedPokemon(pokemonName);
        
        if (hasDiscussedBefore) {
            return ConversationManager.getRandomResponse('evolutionQuestions', {pokemon: capitalize(pokemonName)});
        }
        
        // Default question
        return ConversationManager.getRandomResponse('evolutionQuestions', {pokemon: capitalize(pokemonName)});
    }

    async function handleEnhancedGreeting() {
        const preferences = ContextMemory.getUserPreferences();
        const profile = ContextMemory.getUserProfile();
        
        // Get a varied greeting
        const response = GreetingRotation.getVariedGreeting(preferences);
        
        await smartBotReply(response, userInput);
        
        
        // Update session count
        profile.sessionCount = (profile.sessionCount || 0) + 1;
        ContextMemory.setUserProfile(profile);
        
        // Clear any pending follow-ups when starting fresh
        ConversationManager.clearPending();
    }

    function generateProactiveSuggestions() {
    const suggestions = [];
    const preferences = ContextMemory.getUserPreferences();
    const recentContext = AdvancedMemory.getRecentContext(5); // Use advanced memory
    
    // Don't suggest if we've suggested recently
    if (hasRecentSuggestion()) {
        return suggestions;
    }
    
    // Check if we have valid recent context
    if (!recentContext || recentContext.length === 0) {
        return suggestions;
    }

    // Suggest comparisons for similar Pokémon - but only if not recently suggested
    try {
        const lastUserMessage = recentContext.filter(msg => msg.userInput).pop();
        if (lastUserMessage && lastUserMessage.userInput && window.PokemonLogic) {
            const lastPokemon = extractPokemonName(lastUserMessage.userInput);
            if (lastPokemon && !AdvancedMemory.wasRecentlyDiscussed('pokemon', lastPokemon, 5)) {
                suggestions.push(`Want to compare ${capitalize(lastPokemon)} with another Pokémon?`);
            }
        }
    } catch (error) {
        console.warn('Error generating comparison suggestion:', error);
    }
    
    // Suggest type exploration - but only if not recently discussed
    if (preferences.favoriteTypes && preferences.favoriteTypes.length > 0) {
        const type = preferences.favoriteTypes[0];
        if (type && typeof type === 'string' && !AdvancedMemory.wasRecentlyDiscussed('pokemon_type', type, 10)) {
            suggestions.push(`Interested in other ${type} type Pokémon?`);
        }
    }
    
    // Suggest based on discovery count - less frequently
    if (preferences.discoveredPokemon && Array.isArray(preferences.discoveredPokemon) && 
        preferences.discoveredPokemon.length > 10 && Math.random() > 0.8) {
        suggestions.push("You've discovered many Pokémon! Want to see some legendary ones?");
    }
    
    return suggestions;
}

    function isAffirmativeResponse(text) {
    const affirmativePatterns = [
        /\b(yes|yeah|yep|sure|ok|okay|go ahead|please|do it|show me)\b/i,
        /\b(oo|sige|pwede|go|let's go|game)\b/i
    ];
    const result = affirmativePatterns.some(pattern => pattern.test(text));
    console.log('✅ Affirmative check:', text, '->', result);
    return result;
}

    function isSimpleGreeting(text) {
        const simpleGreetings = [
            'hey', 'hi', 'hello', 'yo', 'sup', 'wsup',
            'huy', 'uy', 'oy', 'musta', 'kumusta'
        ];
        return simpleGreetings.includes(text.toLowerCase().trim());
    }

    async function handleThanks() {
        if (!window.SocialSystem) {
            await smartBotReply(ConversationManager.getRandomResponse('thanks'));
            return;
        }
        
        const response = window.SocialSystem.getThanksResponse();
        await smartBotReply(response, userInput);
        window.SocialSystem.updateFriendship(2);
    }



// ==================== REQUEST QUEUE SYSTEM ====================

let isProcessing = false;
let sendButton = null;
let pendingResponses = 0; // Track multiple bot responses

function disableSendButton() {
    if (!sendButton) {
        sendButton = document.getElementById('sendButton');
    }
    if (sendButton) {
        sendButton.disabled = true;
        isProcessing = true;
        pendingResponses++; // Increment counter
    }
}

function enableSendButton() {
    if (sendButton && isProcessing) {
        pendingResponses--; // Decrement counter
        
        // Only re-enable when ALL responses are done
        if (pendingResponses <= 0) {
            sendButton.disabled = false;
            isProcessing = false;
            pendingResponses = 0; // Reset counter
        }
    }
}

function isButtonDisabled() {
    return isProcessing;
}

    // ==================== FIXED FOLLOW-UP HANDLER ====================

async function handlePendingFollowUp(input) {
    // Get the pending question type BEFORE clearing it
    const pendingType = ConversationManager.pendingFollowUp;
    const lastPokemon = ConversationManager.userContext.lastPokemon;
    
    console.log('🔄 handlePendingFollowUp called with:');
    console.log('   - pendingType:', pendingType);
    console.log('   - lastPokemon:', lastPokemon);
    console.log('   - user input:', input);
    
    // Route to the correct action based on the pending question type
    switch (pendingType) {
        case 'evolution_suggestion':
            console.log('🎯 Routing to EVOLUTION');
            ConversationManager.clearPending();
            await handleEvolutionQuery(`evolution of ${lastPokemon}`);
            break;
            
        case 'more_comparisons':
            console.log('🎯 Routing to COMPARISON SETUP');
            // Store the first Pokémon for comparison
            ConversationManager.updateUserContext('comparisonPokemon1', lastPokemon);
            // Set a new pending state for the second Pokémon
            ConversationManager.pendingFollowUp = 'awaiting_comparison_target';
            await smartBotReply(`Great! Which Pokémon would you like to compare with ${capitalize(lastPokemon)}?`, input);
            break;
            
        case 'awaiting_comparison_target':
            console.log('🎯 User provided comparison target:', input);
            const pokemon1 = ConversationManager.userContext.comparisonPokemon1;
            const pokemon2 = extractPokemonName(input);
            
            if (pokemon1 && pokemon2) {
                console.log('🎯 Starting comparison:', pokemon1, 'vs', pokemon2);
                ConversationManager.clearPending();
                await handleComparison(`${pokemon1} vs ${pokemon2}`);
            } else {
                console.log('❌ Missing Pokémon for comparison:', {pokemon1, pokemon2});
                await smartBotReply("I need two Pokémon to compare! Try something like 'compare Mewtwo with Pikachu'", input);
                ConversationManager.clearPending();
            }
            break;

        case 'show_detailed_type_matchup':
    console.log('🎯 Routing to DETAILED TYPE MATCHUP');
    ConversationManager.clearPending();
    await showTypeAdvantages(lastPokemon, true); // true means show detailed
    break;
            
        case 'related_pokemon':
            console.log('🎯 Routing to SIMILAR POKÉMON');
            ConversationManager.clearPending();
            await showSimilarPokemon(lastPokemon);
            break;
            
        case 'type_advantages':
            console.log('🎯 Routing to TYPE ADVANTAGES');
            ConversationManager.clearPending();
            await showTypeAdvantages(lastPokemon, false);
            break;
            
        default:
            console.log('❌ UNKNOWN pendingType:', pendingType);
            ConversationManager.clearPending();
            await smartBotReply("What would you like to explore about this Pokémon?", input);
    }
}

    async function handleEnhancedCasualChat(input) {
    const normalized = preprocessText(input);
    
    // FIRST: Check if this is answering a pending question
    const pendingResponse = ConversationManager.getExpectedResponse();
    if (pendingResponse && isAffirmativeResponse(normalized)) {
        await handlePendingFollowUp(normalized);
        return;
    }

    // SECOND: Check if user is asking "what?" or seems confused
    if (isConfusionResponse(normalized)) {
        await handleConfusion(normalized);
        return;
    }

    // THIRD: Check if user is giving simple "yes/no" without context
    if (isSimpleAffirmative(normalized) && !ConversationManager.pendingFollowUp) {
        await handleSimpleAffirmative(normalized);
        return;
    }

    // FOURTH: Check if user is giving simple "no" without context
    if (isNegativeResponse(normalized) && !ConversationManager.pendingFollowUp) {
        await handleSimpleNegative(normalized);
        return;
    }

    // FIFTH: If user just says simple greetings repeatedly, suggest actions
    if (isSimpleGreeting(normalized)) {
        // Only suggest actions if we haven't shown many recently
        const recentMessages = AdvancedMemory.getRecentContext(3);
        const recentSuggestions = recentMessages.filter(msg => 
            msg.botResponse && isSuggestionMessage(msg.botResponse)
        ).length;
        
        if (recentSuggestions < 2) {
            const suggestions = [
                "Want to see a specific Pokémon? Just tell me its name!",
                "I can show you Pokémon info, comparisons, or evolutions!",
                "Try asking about a Pokémon like 'Pikachu' or 'Charizard'!",
                "Want to see random Pokémon, legendaries, or starters?",
                "I'm here to help with all things Pokémon! What would you like to explore?"
            ];
            const randomSuggestion = suggestions[Math.floor(Math.random() * suggestions.length)];
            await smartBotReply(randomSuggestion, userInput);
            return;
        }
    }

    // SIXTH: Generate proactive suggestions (but less frequently)
    const suggestions = generateProactiveSuggestions();
    
    // Only show suggestions 30% of the time to avoid spam
    if (suggestions.length > 0 && Math.random() > 0.7 && !hasRecentSuggestion()) {
        await smartBotReply(suggestions[0]);
        ConversationManager.clearPending();
        return;
    }

    // FINAL: Default casual responses
    if (!window.SocialSystem) {
        const casualResponses = [
            "That's really interesting! Tell me more about Pokémon! 😊",
            "Fascinating! What Pokémon are you thinking about?",
            "I love talking about Pokémon! Want to explore some together?",
            "That's cool! Which Pokémon would you like to know more about?",
            "Interesting! Shall we look up some Pokémon info?",
            "Awesome! Want to discover some Pokémon facts?",
            "Great! Ready for some Pokémon adventures?",
            "Nice! What Pokémon shall we explore next?",
            "I see! Did you have a specific Pokémon in mind?",
            "Cool! Want to learn about a particular Pokémon?"
        ];
        const response = casualResponses[Math.floor(Math.random() * casualResponses.length)];
        await smartBotReply(response, userInput);
    } else {
        const response = window.SocialSystem.getCasualResponse();
        await botReply(response, userInput);
        window.SocialSystem.updateFriendship(1);
    }
}


// ==================== ENHANCED RESPONSE HANDLERS ====================

function isConfusionResponse(text) {
    const confusionPatterns = [
        /^\?+$/,
        /^what\??$/i,
        /^huh\??$/i,
        /^confused$/i,
        /^i don't understand$/i,
        /^what do you mean\??$/i
    ];
    return confusionPatterns.some(pattern => pattern.test(text.trim()));
}

function isSimpleAffirmative(text) {
    const simpleAffirmatives = [
        'yes', 'yeah', 'yep', 'sure', 'ok', 'okay', 'go ahead',
        'oo', 'sige', 'pwede', 'go', 'game'
    ];
    return simpleAffirmatives.includes(text.toLowerCase().trim());
}

function isNegativeResponse(text) {
    const negativePatterns = [
        'no', 'nope', 'nah', 'not really', 'maybe later',
        'dili', 'wa', 'ayaw'
    ];
    return negativePatterns.includes(text.toLowerCase().trim());
}

function isSuggestionMessage(text) {
    const suggestionKeywords = [
        'want to', 'try asking', 'i can show', 'interested in',
        'how about', 'suggest', 'recommend'
    ];
    return suggestionKeywords.some(keyword => 
        text.toLowerCase().includes(keyword)
    );
}

function hasRecentSuggestion() {
    const recentMessages = AdvancedMemory.getRecentContext(3);
    return recentMessages.some(msg => 
        msg.botResponse && isSuggestionMessage(msg.botResponse)
    );
}

async function handleConfusion(input) {
    const confusionResponses = [
        "Oh! Let me clarify - I'm your Pokémon assistant! You can ask me about any Pokémon, compare them, or see their evolutions!",
        "Sorry if I wasn't clear! I can show you Pokémon information, help compare them, or display evolution chains. What would you like to do?",
        "My bad! Let me explain better - just tell me a Pokémon name like 'Pikachu' or ask to compare Pokémon like 'Charizard vs Blastoise'!",
        "I see the confusion! Try asking about a specific Pokémon, or say 'help' to see all the things I can do!",
        "Let me help! You can:\n• Ask about Pokémon: 'Show me Pikachu'\n• Compare: 'Pikachu vs Raichu'\n• See evolutions: 'Evolution of Eevee'\nWhat would you like to try?"
    ];
    const response = confusionResponses[Math.floor(Math.random() * confusionResponses.length)];
    await smartBotReply(response, userInput);
}

async function handleSimpleAffirmative(input) {
    const affirmativeResponses = [
        "Great! What Pokémon would you like to explore?",
        "Awesome! Which Pokémon are you curious about?",
        "Okay! Tell me which Pokémon you want to learn about!",
        "Sounds good! What's the name of the Pokémon you're interested in?",
        "Perfect! Just say the name of any Pokémon you'd like to see!",
        "Excellent! Which Pokémon shall we discover together?"
    ];
    const response = affirmativeResponses[Math.floor(Math.random() * affirmativeResponses.length)];
    await smartBotReply(response, userInput);
}

async function handleSimpleNegative(input) {
    const negativeResponses = [
        "No problem! What would you like to do instead?",
        "Okay! Is there something else you're curious about?",
        "Understood! What Pokémon topic interests you?",
        "Alright! Feel free to ask about any Pokémon whenever you're ready!",
        "No worries! Just let me know what you'd like to explore!"
    ];
    const response = negativeResponses[Math.floor(Math.random() * negativeResponses.length)];
    await smartBotReply(response, userInput);
}

    // ==================== MAIN MESSAGE HANDLER ====================
    
    async function handleUserMessage(text) {
         console.log('🔍 User said:', text);
    console.log('📝 BEFORE - pendingFollowUp:', ConversationManager.pendingFollowUp);
    
    const normalized = preprocessText(text);
    const topics = AdvancedMemory.extractTopics(text);
    ConversationFlow.updateFlow(text, '', topics);
    AdvancedMemory.trackConversationFlow(text, '');
    const detectedLanguage = detectAndSaveLanguage(text);
    ContextMemory.setPreferredLanguage(detectedLanguage);

    // Handle pending questions first - ADD DEBUGGING HERE
   // Handle pending questions first
if (ConversationManager.pendingFollowUp) {
    console.log('🎯 Pending question detected:', ConversationManager.pendingFollowUp);
    
    // Special case: if we're awaiting a comparison target, handle ANY input (not just affirmative)
    if (ConversationManager.pendingFollowUp === 'awaiting_comparison_target') {
        console.log('🎯 User is providing comparison target:', normalized);
        await handlePendingFollowUp(normalized);
        return;
    }
    
    // For other pending questions, only handle affirmative responses
    if (isAffirmativeResponse(normalized)) {
        console.log('✅ Affirmative response - routing to:', ConversationManager.pendingFollowUp);
        await handlePendingFollowUp(normalized);
        return;
    } else if (isNegativeResponse(normalized)) {
        console.log('❌ Negative response - clearing pending');
        ConversationManager.clearPending();
        await smartBotReply("No problem! What would you like to explore instead?", text);
        return;
    }
}
        // Update social context
        if (window.SocialSystem) {
            window.SocialSystem.setUserLanguage(text);
            window.SocialSystem.setUserMood(text);
        }

        // Handle pending questions first
        if (window.SocialSystem && window.SocialSystem.handlePendingQuestion(normalized)) {
            return;
        }

        // Personal Relationship Queries
        if (window.PersonalSystem && window.PersonalSystem.handlePersonalQueries(normalized)) {
            return;
        }

        // Enhanced greeting detection
        if (detectGreetingIntent(normalized)) {
            await handleEnhancedGreeting();
            return;
        }

        // Enhanced thanks detection
        if (detectThanksIntent(normalized)) {
            await handleThanks();
            return;
        }

        // Help detection
        if (detectHelpIntent(normalized)) {
            await showHelpGuide();
            return;
        }

        // Check for affirmative responses to pending questions
    
        if (ConversationManager.pendingFollowUp) {
            console.log('🎯 Pending question detected:', ConversationManager.pendingFollowUp);
            
            if (ConversationManager.pendingFollowUp === 'awaiting_comparison_target') {
                console.log('🎯 User is providing comparison target');
                await handlePendingFollowUp(normalized);
                return;
            }
            
            if (isAffirmativeResponse(normalized)) {
                console.log('✅ Affirmative response - routing to:', ConversationManager.pendingFollowUp);
                await handlePendingFollowUp(normalized);
                return;
            } else if (isNegativeResponse(normalized)) {
                console.log('❌ Negative response - clearing pending');
                ConversationManager.clearPending();
                await smartBotReply("No problem! What would you like to explore instead?", text);
                return;
            }
        }

        // Handle comparisons
        if (detectComparisonIntent(normalized)) {
            await handleComparison(normalized);
            return;
        }

        // Handle evolution queries
        if (detectEvolutionIntent(normalized)) {
            await handleEvolutionQuery(normalized);
            return;
        }

        // Handle special commands
        if (await handleSpecialCommands(normalized)) {
            return;
        }

        // Handle Pokémon names with enhanced reasoning
        const pokemonName = extractPokemonName(normalized);
        if (pokemonName) {
            await handlePokemonRequest(pokemonName);
            return;
        }

        // Final fallback - enhanced casual chat
        await handleEnhancedCasualChat(normalized);
    }

    // ==================== ENHANCED INTENT DETECTION ====================
    
    function detectGreetingIntent(text) {
        if (!text || typeof text !== 'string') return false;
        
        const greetingPatterns = [
            /\b(hi|hello|hey|yo|sup|wsup|good morning|good afternoon|good evening)\b/,
            /\b(musta|kumusta|huy|uy|oy|bai|pre|pare|maayong buntag|maayong hapon|maayong gabii)\b/,
            /\b(hi bai|hello pre|hey musta|yo bai)\b/,
            /\b(bai|pre|pare|dude|bro)\s+\w+/,
            /^(hi|hello|hey|musta|kumusta|huy|uy|oy)$/
        ];

        return greetingPatterns.some(pattern => pattern.test(text));
    }

    function detectThanksIntent(text) {
        if (!text || typeof text !== 'string') return false;
        
        const thanksPatterns = [
            /\b(thanks|thank you|ty|thx|tnx|salamat|slamat)\b/,
            /\b(salamat kaayo|thank you so much|thanks a lot)\b/,
            /\b(appreciate it|nice one|ayos|nindot)\b/
        ];

        return thanksPatterns.some(pattern => pattern.test(text));
    }

    function detectHelpIntent(text) {
        if (!text || typeof text !== 'string') return false;
        
        const helpPatterns = [
            /\b(help|tabang|assist|unsa|unsaon|how to|what can|guide)\b/,
            /\b(pwede ba|can you|how do i|unsay buhaton)\b/
        ];

        return helpPatterns.some(pattern => pattern.test(text));
    }

    function detectComparisonIntent(text) {
        if (!text || typeof text !== 'string') return false;
        
        const comparisonPatterns = [
            /\b(compare|kumpara|vs|versus|difference|stronger|better|against)\b/,
            /\b(\w+)\s+(vs|versus|against)\s+(\w+)/,
            /\b(compare|kumpara)\s+(\w+)\s+(and|ug|\+)\s+(\w+)/
        ];

        return comparisonPatterns.some(pattern => pattern.test(text));
    }

    function detectEvolutionIntent(text) {
        if (!text || typeof text !== 'string') return false;
        
        const evolutionPatterns = [
            /\b(evolve|evolution|evolves|nag evolve|nag evolve)\b/i,
            /\b(\w+)\s+(evolution|evolve|evolves)\b/i,
            /\b(evolution|evolve)\s+of\s+(\w+)/i,
            /\b(evolution|evolve)\s+(\w+)/i,
            /\b(\w+)\s+evolution\s+chain\b/i,
            /\b(show|see|what is)\s+(\w+)'?s?\s+evolution\b/i,
            /\b(evolution|evolve)\s+chain\s+of\s+(\w+)/i,
            /\b(\w+)\s+evolve\s+into\b/i,
            /\bhow\s+to\s+evolve\s+(\w+)/i,
            /\b(\w+)\s+evolves?\s+from\b/i,
            /\b(\w+)\s+evo\b/i,
            /\bevo\s+(\w+)\b/i
        ];

        return evolutionPatterns.some(pattern => pattern.test(text.toLowerCase()));
    }

    // ==================== FEATURE ROUTING ====================
    
    async function handleGreeting() {
        if (!window.SocialSystem) {
            await smartBotReply(ConversationManager.getRandomResponse('greetings'));
            return;
        }
        
        const response = window.SocialSystem.getGreetingResponse();
        await smartBotReply(response, userInput);
        window.SocialSystem.updateFriendship(3);
    }

    async function handlePokemonRequest(pokemonName) {
    showTyping(true);
    
    try {
        if (!window.PokemonLogic) {
            throw new Error('Pokémon system not available');
        }
        
        const result = await window.PokemonLogic.handlePokemonShow(pokemonName);
        
        if (result.success) {
            // 1. Show the Pokémon card
            appendBotMessage(result.html);
            
            // 2. Update ALL memory systems
            ContextMemory.addDiscoveredPokemon(pokemonName);
            ConversationManager.updateUserContext('lastPokemon', pokemonName);
            
            // 3. Update Advanced Memory with the Pokémon display
            const topics = AdvancedMemory.extractTopics(pokemonName);
            AdvancedMemory.trackConversationFlow(`show me ${pokemonName}`, result.html);
            
            // 4. Update Conversation Flow
            ConversationFlow.updateFlow(`show me ${pokemonName}`, result.html, topics);
            ConversationFlow.markAsDiscussed('basic_info', pokemonName);

            if (result.speciesData && result.speciesData.types) {
                result.speciesData.types.forEach(type => 
                    ContextMemory.addExploredType(type.type.name)
                );
            }
            
            // 5. Use SMART follow-up question with conversation flow
            setTimeout(async () => {
                const currentTopics = AdvancedMemory.extractTopics(pokemonName);
                
                // Generate intelligent follow-up based on conversation flow
                let followUpQuestion = ConversationFlow.generateFollowUpQuestion(currentTopics);
                
                if (!followUpQuestion) {
                    // Fallback to evolution question
                    followUpQuestion = getEnhancedEvolutionQuestion(pokemonName);
                }
                
                // Use smartBotReply for flow-aware responses
                await smartBotReply(followUpQuestion, `show me ${pokemonName}`);
                
                
            }, 1000);
            
        } else {
            // Use smartBotReply for errors too
            await smartBotReply(result.error, `show me ${pokemonName}`);
        }
    } catch (error) {
        console.error('Pokemon request error:', error);
        await smartBotReply(getPokemonErrorMessage(error, pokemonName), `show me ${pokemonName}`);
    }
    
    showTyping(false);
}

    async function handleComparison(normalizedText) {
        const patterns = [
            /(?:compare|kumpara)\s+(\w+)\s+(?:and|&|\+|\s)\s+(\w+)/i,
            /(\w+)\s+(?:vs|versus)\s+(\w+)/i,
            /(\w+)\s+ug\s+(\w+)/i,
            /(\w+)\s+and\s+(\w+)/i
        ];
        
        let pokemon1, pokemon2;
        for (const pattern of patterns) {
            const match = normalizedText.match(pattern);
            if (match) {
                pokemon1 = match[1];
                pokemon2 = match[2] || match[3];
                break;
            }
        }
        
        if (pokemon1 && pokemon2) {
            showTyping(true);
            try {
                if (!window.PokemonLogic) {
                    throw new Error('Pokémon system not available');
                }
                
                const result = await window.PokemonLogic.handlePokemonComparison(pokemon1, pokemon2);
                
                if (result.success) {
                    appendBotMessage(result.html);
                    ConversationManager.setState('waiting_response', 'comparison_done');
                    ConversationManager.updateUserContext('lastComparison', {pokemon1, pokemon2});
                    
                    if (window.SocialSystem) {
                        window.SocialSystem.updateFriendship(5);
                    }
                } else {
                    await smartBotReply(result.error);
                }
            } catch (error) {
                await smartBotReply(getPokemonErrorMessage(error, 'comparison'));
            }
            showTyping(false);
        } else {
            await smartBotReply(`Tell me which Pokémon to compare! Like 'compare Pikachu and Raichu' or 'Charizard vs Blastoise' ⚔️`);
        }
    }

    async function handleEvolutionQuery(normalizedText) {
        console.log('🔍 Handling evolution query:', normalizedText);
        
        const evolutionMatch = normalizedText.match(/(?:evolution|evolve)\s+(?:of\s+)?(\w+)/i) || 
                              normalizedText.match(/(\w+)\s+evolution/i) ||
                              normalizedText.match(/how\s+to\s+evolve\s+(\w+)/i);
        
        const lastPokemon = window.SocialSystem ? window.SocialSystem.getLastPokemon() : null;
        
        let pokemonName = null;
        
        if (evolutionMatch && evolutionMatch[1]) {
            pokemonName = evolutionMatch[1].toLowerCase();
            console.log('📝 Extracted Pokémon from query:', pokemonName);
        } else if (lastPokemon) {
            pokemonName = lastPokemon;
            console.log('📝 Using last Pokémon:', pokemonName);
        } else if (ConversationManager.userContext.lastPokemon) {
            pokemonName = ConversationManager.userContext.lastPokemon;
            console.log('📝 Using context Pokémon:', pokemonName);
        }
        
        if (pokemonName) {
            showTyping(true);
            try {
                if (!window.PokemonLogic) {
                    throw new Error('Pokémon system not available');
                }
                
                console.log('🔄 Fetching evolution data for:', pokemonName);
                const result = await window.PokemonLogic.handlePokemonEvolution(pokemonName);
                
                if (result.success) {
                    console.log('✅ Evolution data fetched successfully');
                    
                    appendBotMessage(result.html);
                    ConversationManager.setState('waiting_response', 'evolution_shown');
                    
                    setTimeout(() => {
                        scrollToBottom();
                        
                        const evolutionElements = document.querySelectorAll('.evolution-section, .evolution-chain');
                        evolutionElements.forEach(el => {
                            void el.offsetHeight;
                            el.style.display = 'block';
                            
                            if (el.classList.contains('linear-layout')) {
                                el.style.display = 'flex';
                                el.style.flexDirection = 'row';
                                el.style.justifyContent = 'center';
                                el.style.alignItems = 'center';
                            }
                        });
                    }, 50);
                    
                    if (window.SocialSystem) {
                        window.SocialSystem.updateFriendship(3);
                        window.SocialSystem.addDiscoveredPokemon(pokemonName);
                    }
                } else {
                    console.error('❌ Evolution fetch failed:', result.error);
                    await smartBotReply(result.error);
                }
            } catch (error) {
                console.error('❌ Evolution query error:', error);
                await smartBotReply(`Sorry, I couldn't load evolution data for ${capitalize(pokemonName)}. Please try again!`);
            }
            showTyping(false);
        } else {
            console.log('❌ No Pokémon name found in evolution query');
            await smartBotReply("Which Pokémon's evolution do you want to see? Try 'evolution of Pikachu' or 'show me Charizard evolution' 🌱");
        }
    }

    async function handleSpecialCommands(normalized) {
        if (!window.PokemonLogic) return false;

        const bestMatch = normalized.match(/(?:best|top)\s*(\d{1,2})?/);
        if (bestMatch) {
            const n = parseInt(bestMatch[1]) || 3;
            await sendMultiplePokemon(window.PokemonLogic.getBestPokemon().slice(0, n));
            return true;
        }

        if (normalized.includes('legendary')) {
            await sendMultiplePokemon(window.PokemonLogic.getLegendaryPokemon().slice(0, 3));
            return true;
        }

        if (normalized.includes('popular')) {
            await sendMultiplePokemon(window.PokemonLogic.getPopularPokemon().slice(0, 3));
            return true;
        }

        if (normalized.includes('starter')) {
            await sendMultiplePokemon(window.PokemonLogic.getStarterPokemon().slice(0, 3));
            return true;
        }

        if (normalized.includes('random')) {
            const picks = window.PokemonLogic.getRandomPokemon(3);
            await sendMultiplePokemon(picks);
            return true;
        }

        return false;
    }

    // ==================== UTILITY FUNCTIONS ====================
    
    function preprocessText(text) {
        if (typeof text !== 'string') return '';
        return text.toLowerCase()
            .replace(/[^\w\s-]/g, '')
            .replace(/\s+/g, ' ')
            .trim();
    }

    function capitalize(str) {
        if (!str || typeof str !== 'string') return '';
        return str.charAt(0).toUpperCase() + str.slice(1);
    }

    function delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    async function smartBotReply(message) {
        showTyping(true);
        await delay(600 + Math.random() * 400);
        showTyping(false);
        appendBotMessage(message);
    }

    function extractPokemonName(text) {
        if (!window.PokemonLogic) return null;
        
        const pokemonNames = window.PokemonLogic.getAllPokemonNames();
        if (!pokemonNames || !Array.isArray(pokemonNames)) return null;
        
        const pokemonSet = new Set(pokemonNames);
        const words = text.toLowerCase().split(/\s+/);
        
        for (const word of words) {
            if (pokemonSet.has(word)) {
                return word;
            }
        }
        
        const commonVariations = {
            'pika': 'pikachu',
            'charzard': 'charizard',
            'mew2': 'mewtwo',
            'garados': 'gyarados',
            'snorlacks': 'snorlax',
            'dragonight': 'dragonite'
        };
        
        for (const word of words) {
            if (commonVariations[word]) {
                return commonVariations[word];
            }
        }
        
        return null;
    }

    async function sendMultiplePokemon(names) {
        showTyping(true);
        await delay(600);
        
        appendBotMessage(`Here are some awesome Pokémon! 🎉`);
        
        for (const name of names) {
            await delay(800);
            if (window.PokemonLogic) {
                const result = await window.PokemonLogic.handlePokemonShow(name);
                if (result.success) {
                    appendBotMessage(result.html);
                }
            }
        }
        
        // Add proactive suggestion after showing multiple Pokémon
        setTimeout(async () => {
            const suggestions = generateProactiveSuggestions();
            if (suggestions.length > 0) {
                await smartBotReply(suggestions[0]);
            }
        }, 1000);
    }

    function getPokemonErrorMessage(error, context) {
        const errorMessages = {
            english: {
                not_found: `I couldn't find "${capitalize(context)}". Please check the spelling!`,
                network: "The Pokédex connection is down. Please check your internet.",
                default: "Something went wrong. Please try again!"
            },
            bisaya: {
                not_found: `Wa ko makita si "${capitalize(context)}". Check sa ang spelling!`,
                network: "Naay problema sa connection sa Pokédex. Check sa imong internet.",
                default: "Naay problema. Try again!"
            },
            mixed: {
                not_found: `Wa ko makita si "${capitalize(context)}". Please check the spelling!`,
                network: "Naay problema sa connection. Please check your internet.",
                default: "Naay problem. Please try again!"
            }
        };

        const language = ContextMemory.getPreferredLanguage();
        const messages = errorMessages[language] || errorMessages.english;
        
        if (error.message === 'not_found' || error.message.includes('404')) {
            return messages.not_found;
        } else if (error.message.includes('network') || error.message.includes('fetch')) {
            return messages.network;
        } else {
            return messages.default;
        }
    }

    async function showHelpGuide() {
        await smartBotReply(ConversationManager.getRandomResponse('help'));
    }

    // ==================== DATA MANAGEMENT ====================
    
function loadChatHistory() {
    const saved = localStorage.getItem('poketalk_messages');
    const chatWindow = document.getElementById('chatWindow');
    
    if (saved) {
        try {
            messages = JSON.parse(saved);
            // Clear any existing messages (like the HTML one)
            chatWindow.innerHTML = '';
            
            messages.forEach(msg => {
                if (msg.type === 'bot') {
                    addMessageWithTimestamp(msg.content, 'bot', { 
                        time: formatMessageTimestamp(msg.timestamp),
                        date: new Date(msg.timestamp).toLocaleDateString(),
                        full: msg.timestamp 
                    });
                } else {
                    addMessageWithTimestamp(msg.content, 'user', { 
                        time: formatMessageTimestamp(msg.timestamp),
                        date: new Date(msg.timestamp).toLocaleDateString(),
                        full: msg.timestamp 
                    });
                }
            });
            scrollToBottom();
        } catch (e) {
            console.warn('Failed to load chat history:', e);
            addFreshWelcomeMessage();
        }
    } else {
        // No saved history, add fresh welcome message
        addFreshWelcomeMessage();
    }
}

// Helper function for fresh welcome message
function addFreshWelcomeMessage() {
    const chatWindow = document.getElementById('chatWindow');
    if (!chatWindow) return;
    
    // Clear any existing content
    chatWindow.innerHTML = '';
    
    const timestampData = getCurrentTimestamp();
    
    // Create date separator for today
    const dateSeparator = createDateSeparator(timestampData.date);
    chatWindow.appendChild(dateSeparator);
    
    // Create welcome message with timestamp
    addMessageWithTimestamp('Hey man! ask me something about Pokemon', 'bot', timestampData);
    
    // Save to localStorage
    const messageData = {
        type: 'bot',
        content: 'Hey man! ask me something about Pokemon',
        timestamp: Date.now()
    };
    messages = [messageData];
    saveChatHistory();
}

    function saveChatHistory() {
        localStorage.setItem('poketalk_messages', JSON.stringify(messages));
    }

    // ==================== PUBLIC API ====================
  

    
    return {
        init,
        clearCache: () => {
        if (window.PokemonLogic) {
            window.PokemonLogic.clearCache();
        }
    },
    getMessages: () => messages,
    clearMessages: () => {
        messages = [];
        const chatWindow = document.getElementById('chatWindow');
        if (chatWindow) {
            chatWindow.innerHTML = '';
        }
        saveChatHistory();
    },
    // Expose enhanced systems for debugging and reset
    ConversationManager,
    ResponseTemplates,
    ContextMemory,
    AdvancedMemory,
    
    ConversationFlow, 
    };
})();

// Initialize the application when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    ChatSystem.init();
});