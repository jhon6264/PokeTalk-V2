/* assets/js/pokemonlogic.js
   Pokémon Data Logic - PHP Backend Integration
*/

const PokemonLogic = (() => {
    // PHP Backend Configuration
    const PHP_BACKEND = 'pokemon.php';
    const POKEAPI_BASE_URL = 'https://pokeapi.co/api/v2/';
    const USE_PHP_BACKEND = false;
    
    // Enhanced Pokémon Data (now only for quick lookups)
    const POKEMON_DATA = {
        popular: ['pikachu', 'charizard', 'mewtwo', 'lucario', 'garchomp', 'eevee', 'gengar', 'dragonite', 'snorlax', 'gyarados'],
        best: ['mewtwo', 'charizard', 'garchomp', 'rayquaza', 'metagross', 'salamence'],
        legendaries: [
            'mew', 'mewtwo', 'lugia', 'ho-oh', 'rayquaza', 'dialga', 'palkia', 'giratina',
            'zacian', 'zamazenta', 'reshiram', 'zekrom', 'kyogre', 'groudon', 'arceus'
        ],
        starters: [
            'bulbasaur', 'charmander', 'squirtle', 'chikorita', 'cyndaquil', 'totodile',
            'treecko', 'torchic', 'mudkip', 'turtwig', 'chimchar', 'piplup'
        ],
        allNames: [] // Will be populated from PHP
    };

    // Cache System (frontend cache for better performance)
    const dataCache = new Map();
    const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

    // Utility Functions
    const capitalize = (str) => str.charAt(0).toUpperCase() + str.slice(1);

    // ==================== ENHANCED REASONING SYSTEM ====================

    const EnhancedReasoning = {
        // Track conversation flow
        conversationFlow: [],
        
        // Understand user intent better
        analyzeIntent: function(text) {
            const intents = {
                information: /(what|how|tell me about|info|information)/i,
                comparison: /(compare|vs|versus|difference|better)/i,
                evolution: /(evolve|evolution|evo)/i,
                recommendation: /(suggest|recommend|best|good|which)/i,
                casual: /(hi|hello|hey|how are you|musta)/i
            };
            
            for (const [intent, pattern] of Object.entries(intents)) {
                if (pattern.test(text)) return intent;
            }
            return 'unknown';
        },
        
        // Build conversation context
        buildContext: function() {
            const recentMessages = this.getRecentContext();
            const preferences = this.getUserPreferences();
            
            return {
                recentTopics: recentMessages.map(msg => this.extractTopics(msg.content)),
                userPreferences: preferences,
                currentIntent: this.analyzeIntent(recentMessages[recentMessages.length-1]?.content || ''),
                conversationDepth: recentMessages.length
            };
        },
        
        extractTopics: function(text) {
            const topics = [];
            const pokemonName = extractPokemonName(text);
            if (pokemonName) topics.push(`pokemon:${pokemonName}`);
            
            // Extract types mentioned
            const types = ['fire', 'water', 'grass', 'electric', 'psychic', 'dragon', 'normal', 'fighting', 'flying', 'poison', 'ground', 'rock', 'bug', 'ghost', 'steel', 'ice', 'dark', 'fairy'];
            types.forEach(type => {
                if (text.toLowerCase().includes(type)) {
                    topics.push(`type:${type}`);
                }
            });
            
            return topics;
        },

        getRecentContext: function() {
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
        },

        getUserPreferences: function() {
            try {
                return JSON.parse(localStorage.getItem('poketalk_user_preferences')) || {};
            } catch {
                return {};
            }
        }
    };

    // ==================== IMPROVED ERROR RECOVERY ====================

    async function handlePokemonRequestWithRetry(pokemonName, retries = 2) {
        for (let attempt = 0; attempt <= retries; attempt++) {
            try {
                const result = await window.PokemonLogic.handlePokemonShow(pokemonName);
                if (result.success) return result;
                
                // Try common misspellings
                if (attempt === 0) {
                    const correctedName = correctCommonMisspellings(pokemonName);
                    if (correctedName !== pokemonName) {
                        console.log(`🔄 Trying corrected name: ${correctedName}`);
                        const correctedResult = await window.PokemonLogic.handlePokemonShow(correctedName);
                        if (correctedResult.success) return correctedResult;
                    }
                }
            } catch (error) {
                if (attempt === retries) throw error;
                await new Promise(resolve => setTimeout(resolve, 1000 * (attempt + 1)));
            }
        }
    }

    function correctCommonMisspellings(name) {
        const corrections = {
            'charzard': 'charizard',
            'mew2': 'mewtwo',
            'gyrados': 'gyarados',
            'snorlacks': 'snorlax',
            'dragonight': 'dragonite',
            'pidgey': 'pidgey',
            'pidgeotto': 'pidgeotto',
            'pidgeot': 'pidgeot'
        };
        return corrections[name.toLowerCase()] || name;
    }

    // ==================== PHP BACKEND COMMUNICATION ====================
    
    async function callPHPBackend(action, params = {}) {
        const queryString = new URLSearchParams({
            action: action,
            ...params
        }).toString();
        
        const url = `${PHP_BACKEND}?${queryString}`;
        const cacheKey = `${action}-${JSON.stringify(params)}`;
        
        // Check frontend cache first
        const cached = dataCache.get(cacheKey);
        if (cached && (Date.now() - cached.timestamp) < CACHE_DURATION) {
            return cached.data;
        }

        if (!USE_PHP_BACKEND) {
            const directData = await callDirectPokeAPI(action, params);

            dataCache.set(cacheKey, {
                data: directData,
                timestamp: Date.now()
            });

            return directData;
        }
        
        try {
            console.log(`🔄 Calling PHP backend: ${action}`, params);
            const response = await fetch(url);
            
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}`);
            }

            const contentType = response.headers.get('content-type') || '';
            if (!contentType.includes('application/json')) {
                throw new Error('PHP backend returned non-JSON response');
            }
            
            const result = await response.json();
            
            if (!result.success) {
                throw new Error(result.error || 'Backend error');
            }
            
            // Cache successful response
            dataCache.set(cacheKey, {
                data: result.data,
                timestamp: Date.now()
            });
            
            return result.data;
            
        } catch (error) {
            console.error(`❌ PHP backend call failed for ${action}:`, error);
            console.warn(`PHP backend failed for ${action}; trying direct PokeAPI fallback:`, error);
            const fallbackData = await callDirectPokeAPI(action, params);

            dataCache.set(cacheKey, {
                data: fallbackData,
                timestamp: Date.now()
            });

            return fallbackData;
        }
    }

    async function fetchPokeAPI(endpoint) {
        const response = await fetch(`${POKEAPI_BASE_URL}${endpoint}`);

        if (response.status === 404) {
            throw new Error('not_found');
        }

        if (!response.ok) {
            throw new Error(`PokeAPI HTTP ${response.status}`);
        }

        return await response.json();
    }

    async function fetchCombinedDirect(name) {
        const normalizedName = name.toLowerCase();
        const [pokemon, species] = await Promise.all([
            fetchPokeAPI(`pokemon/${normalizedName}`),
            fetchPokeAPI(`pokemon-species/${normalizedName}`)
        ]);

        return { pokemon, species };
    }

    async function getAllPokemonNamesDirect() {
        const data = await fetchPokeAPI('pokemon?limit=10000');
        return data.results.map(pokemon => pokemon.name);
    }

    async function callDirectPokeAPI(action, params = {}) {
        switch (action) {
            case 'getPokemon':
                return await fetchPokeAPI(`pokemon/${params.name.toLowerCase()}`);

            case 'getSpecies':
                return await fetchPokeAPI(`pokemon-species/${params.name.toLowerCase()}`);

            case 'getPokemonData':
                return await fetchCombinedDirect(params.name);

            case 'getEvolution': {
                const species = await fetchPokeAPI(`pokemon-species/${params.name.toLowerCase()}`);
                if (!species.evolution_chain?.url) {
                    return { chain: null, has_evolutions: false };
                }

                const evolutionResponse = await fetch(species.evolution_chain.url);
                if (!evolutionResponse.ok) {
                    throw new Error(`PokeAPI HTTP ${evolutionResponse.status}`);
                }

                const evolutionData = await evolutionResponse.json();
                return {
                    chain: evolutionData.chain,
                    id: evolutionData.id
                };
            }

            case 'getComparison': {
                const [pokemon1, pokemon2] = await Promise.all([
                    fetchCombinedDirect(params.pokemon1),
                    fetchCombinedDirect(params.pokemon2)
                ]);

                return {
                    pokemon1,
                    pokemon2,
                    comparison: {
                        total_stats_1: pokemon1.pokemon.stats.reduce((sum, stat) => sum + stat.base_stat, 0),
                        total_stats_2: pokemon2.pokemon.stats.reduce((sum, stat) => sum + stat.base_stat, 0),
                        type_advantage: 1.0
                    }
                };
            }

            case 'searchPokemon': {
                if (!params.query || params.query.length < 2) return [];

                const allPokemon = await getAllPokemonNamesDirect();
                return allPokemon
                    .filter(name => name.includes(params.query.toLowerCase()))
                    .slice(0, 10);
            }

            case 'getAllPokemonNames':
                return await getAllPokemonNamesDirect();

            case 'clearCache':
                dataCache.clear();
                return { message: 'Frontend cache cleared successfully' };

            default:
                throw new Error(`Unsupported fallback action: ${action}`);
        }
    }

    // ==================== DATA FETCHING SYSTEM ====================
    
    async function fetchPokemonData(name) {
        return await callPHPBackend('getPokemon', { name: name.toLowerCase() });
    }

    async function fetchSpeciesData(name) {
        return await callPHPBackend('getSpecies', { name: name.toLowerCase() });
    }

    async function fetchCombinedPokemonData(name) {
        return await callPHPBackend('getPokemonData', { name: name.toLowerCase() });
    }

    async function fetchEvolutionChain(pokemonName) {
        return await callPHPBackend('getEvolution', { name: pokemonName.toLowerCase() });
    }

    // ==================== POKÉMON FEATURE HANDLERS ====================
    
    async function handlePokemonShow(pokemonName) {
        try {
            console.log(`🔄 Fetching combined data for: ${pokemonName}`);
            const combinedData = await fetchCombinedPokemonData(pokemonName);
            
            if (!combinedData.pokemon || !combinedData.species) {
                throw new Error('Incomplete data received from backend');
            }
            
            // SIMPLIFIED: CSS is guaranteed to be loaded via external file
            let html;
            if (window.PokeCard && window.PokeCard.generateCard) {
                html = window.PokeCard.generateCard(combinedData.pokemon, combinedData.species);
            } else {
                html = generateFallbackCard(combinedData.pokemon, combinedData.species);
            }
            
            return {
                success: true,
                html: html,
                pokemonName: combinedData.pokemon.name,
                speciesData: combinedData.species
            };
            
        } catch (error) {
            console.error(`❌ Error fetching ${pokemonName}:`, error);
            return handlePokemonError(error, pokemonName);
        }
    }

    async function handlePokemonComparison(pokemon1Name, pokemon2Name) {
        try {
            console.log('🔄 Starting comparison via PHP:', pokemon1Name, 'vs', pokemon2Name);
            
            const comparisonData = await callPHPBackend('getComparison', {
                pokemon1: pokemon1Name.toLowerCase(),
                pokemon2: pokemon2Name.toLowerCase()
            });

            console.log('✅ Comparison data received, PokeCard available:', !!window.PokeCard);

            let html;
            if (window.PokeCard && window.PokeCard.generateComparison) {
                console.log('🎯 Using PokeCard comparison system');
                html = window.PokeCard.generateComparison(
                    { data: comparisonData.pokemon1.pokemon, species: comparisonData.pokemon1.species },
                    { data: comparisonData.pokemon2.pokemon, species: comparisonData.pokemon2.species }
                );
            } else {
                console.log('⚠️ Falling back to basic comparison');
                html = generateFallbackComparison(
                    comparisonData.pokemon1.pokemon, 
                    comparisonData.pokemon2.pokemon
                );
            }

            return { success: true, html: html };
            
        } catch (error) {
            console.error('❌ Comparison error details:', error);
            return {
                success: false,
                error: getPokemonErrorMessage(error, 'comparison')
            };
        }
    }

    async function handlePokemonEvolution(pokemonName) {
        try {
            console.log('🔄 Fetching evolution via PHP for:', pokemonName);
            const evolutionData = await fetchEvolutionChain(pokemonName);
            
            if (!evolutionData.chain) {
                console.log('❌ No evolution chain found for', pokemonName);
                return {
                    success: false,
                    html: `<div class="evolution-no-evolution">${capitalize(pokemonName)} does not evolve.</div>`
                };
            }

            console.log('🌱 Evolution data received:', evolutionData);
            
            // Get species data to get current Pokémon ID
            const speciesData = await fetchSpeciesData(pokemonName);
            const currentPokemonId = speciesData.id;
            
            let html;
            if (window.PokeCard && window.PokeCard.generateEvolution) {
                console.log('🎯 Using PokeCard evolution system with ID:', currentPokemonId);
                try {
                    html = await window.PokeCard.generateEvolution(evolutionData, currentPokemonId);
                    console.log('✅ Evolution HTML generated successfully');
                } catch (evolutionError) {
                    console.error('❌ PokeCard evolution failed, using fallback:', evolutionError);
                    html = generateBasicEvolutionHTML(evolutionData.chain, pokemonName);
                }
            } else {
                console.log('⚠️ PokeCard not available, using fallback');
                html = generateBasicEvolutionHTML(evolutionData.chain, pokemonName);
            }
            
            return {
                success: true,
                html: html,
                evolutionChain: evolutionData.chain
            };
            
        } catch (error) {
            console.error('❌ Evolution fetch error:', error);
            return handlePokemonError(error, `evolution data for ${pokemonName}`);
        }
    }

    // ==================== ERROR HANDLING ====================
    
    function handlePokemonError(error, context) {
        // More specific error handling
        if (error.message.includes('404') || error.message.includes('not_found')) {
            return {
                success: false,
                error: `I couldn't find "${capitalize(context)}". Please check the spelling!`
            };
        } else if (error.message.includes('network') || error.message.includes('fetch')) {
            return {
                success: false,
                error: "The Pokédex connection is down. Please check your internet."
            };
        } else {
            return {
                success: false,
                error: `Sorry, I couldn't find information about ${capitalize(context)}. Please try again!`
            };
        }
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

        const language = window.SocialSystem ? window.SocialSystem.getCurrentLanguage() : 'english';
        const messages = errorMessages[language] || errorMessages.english;
        
        if (error.message === 'not_found' || error.message.includes('404')) {
            return messages.not_found;
        } else if (error.message.includes('network') || error.message.includes('fetch')) {
            return messages.network;
        } else {
            return messages.default;
        }
    }

    // ==================== POKÉMON NAME EXTRACTION ====================
    
    async function loadAllPokemonNames() {
        try {
            if (POKEMON_DATA.allNames.length === 0) {
                const names = await callPHPBackend('getAllPokemonNames');
                POKEMON_DATA.allNames = names;
                console.log(`📝 Loaded ${names.length} Pokémon names from backend`);
            }
            return POKEMON_DATA.allNames;
        } catch (error) {
            console.warn('Failed to load Pokémon names from backend, using fallback list');
            // Return a basic fallback list
            return ['pikachu', 'charizard', 'bulbasaur', 'squirtle', 'eevee', 'mewtwo'];
        }
    }

    async function extractPokemonName(text) {
        const pokemonNames = await loadAllPokemonNames();
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

    async function searchPokemonNames(query) {
        if (query.length < 2) return [];
        
        try {
            const results = await callPHPBackend('searchPokemon', { query: query });
            return results;
        } catch (error) {
            console.warn('Search failed, using client-side fallback');
            const allNames = await loadAllPokemonNames();
            return allNames.filter(name => name.includes(query.toLowerCase())).slice(0, 10);
        }
    }

    // ==================== FALLBACK SYSTEMS ====================
    
    function generateFallbackCard(pokemonData, speciesData) {
        const mainType = pokemonData.types[0].type.name;
        const imgOfficial = pokemonData.sprites?.other?.['official-artwork']?.front_default || 
                          pokemonData.sprites.front_default || '';
        
        const types = pokemonData.types.map(t => capitalize(t.type.name)).join(', ');
        const abilities = pokemonData.abilities.map(a => capitalize(a.ability.name.replace('-', ' '))).join(', ');

        return `
            <div class="pokemon-card ${mainType}">
                <div class="flex flex-col items-center text-center p-4 rounded-lg">
                    <img src="${imgOfficial}" alt="${pokemonData.name}" class="w-20 h-20 mb-2" />
                    <div class="font-bold text-lg">
                        ${capitalize(pokemonData.name)} <span class="text-gray-600">#${pokemonData.id}</span>
                    </div>
                    <div class="text-sm">
                        <strong>Type:</strong> ${types}<br>
                        <strong>Height:</strong> ${pokemonData.height / 10}m |
                        <strong>Weight:</strong> ${pokemonData.weight / 10}kg<br>
                        <strong>Abilities:</strong> ${abilities}
                    </div>
                </div>
            </div>
        `;
    }

    function generateFallbackComparison(pokemon1, pokemon2) {
        return `
            <div class="comparison-container">
                <h3>${capitalize(pokemon1.name)} vs ${capitalize(pokemon2.name)}</h3>
                <div class="flex justify-around">
                    <div class="text-center">
                        <img src="${pokemon1.sprites.front_default}" alt="${pokemon1.name}" class="w-16 h-16 mx-auto" />
                        <div class="font-bold">${capitalize(pokemon1.name)}</div>
                        <div class="text-sm">#${pokemon1.id}</div>
                    </div>
                    <div class="text-center">
                        <div class="text-2xl font-bold">VS</div>
                    </div>
                    <div class="text-center">
                        <img src="${pokemon2.sprites.front_default}" alt="${pokemon2.name}" class="w-16 h-16 mx-auto" />
                        <div class="font-bold">${capitalize(pokemon2.name)}</div>
                        <div class="text-sm">#${pokemon2.id}</div>
                    </div>
                </div>
            </div>
        `;
    }

    function generateBasicEvolutionHTML(chain, pokemonName) {
        if (!chain) {
            return `<div class="evolution-no-evolution">${capitalize(pokemonName)} does not evolve.</div>`;
        }

        // Simple evolution chain display
        return `
            <div class="evolution-section">
                <h3 class="section-label">Evolution Chain</h3>
                <div class="basic-evolution-chain">
                    <p>Evolution data available. Enhanced display requires PokeCard system.</p>
                </div>
            </div>
        `;
    }

    // ==================== INITIALIZATION ====================
    
    async function initialize() {
        console.log('🔄 Initializing Pokémon Logic with PHP backend...');
        try {
            await loadAllPokemonNames();
            console.log('✅ Pokémon Logic initialized successfully');
        } catch (error) {
            console.warn('⚠️ Pokémon Logic initialization had issues:', error);
        }
    }

    // Initialize on load
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initialize);
    } else {
        initialize();
    }

    // ==================== PUBLIC API ====================
    
    return {
        // Data fetching
        fetchPokemonData,
        fetchSpeciesData,
        fetchCombinedPokemonData,
        fetchEvolutionChain,
        
        // Feature handlers
        handlePokemonShow,
        handlePokemonComparison,
        handlePokemonEvolution,
        
        // Enhanced reasoning system
        handlePokemonRequestWithRetry,
        correctCommonMisspellings,
        EnhancedReasoning,
        
        // Pokémon data access
        getAllPokemonNames: () => POKEMON_DATA.allNames,
        getPopularPokemon: () => POKEMON_DATA.popular,
        getBestPokemon: () => POKEMON_DATA.best,
        getLegendaryPokemon: () => POKEMON_DATA.legendaries,
        getStarterPokemon: () => POKEMON_DATA.starters,
        getRandomPokemon: (count = 3) => {
            const shuffled = [...POKEMON_DATA.allNames].sort(() => 0.5 - Math.random());
            return shuffled.slice(0, count);
        },
        
        // Utility functions
        extractPokemonName,
        searchPokemonNames,
        getPokemonErrorMessage,
        capitalize,
        
        // Cache management
        clearCache: () => {
            dataCache.clear();
            if (USE_PHP_BACKEND) {
                fetch(`${PHP_BACKEND}?action=clearCache`).catch(console.warn);
            }
        },
        
        // Initialization
        initialize
    };
})();

// Make available globally
window.PokemonLogic = PokemonLogic;
