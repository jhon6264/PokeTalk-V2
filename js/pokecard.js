/* assets/js/PokeCard.js
   Enhanced Pokémon Card System with Hybrid Layout & Comparison Dashboard
*/

const PokeCard = (() => {
    // Enhanced Type Gradients for Cards - MEDIUM + GLASS READY
    const TYPE_GRADIENTS = {
        normal: 'linear-gradient(145deg, #d1d5db, #9ca3af)',
        fire: 'linear-gradient(145deg, #fdba74, #fb923c)',
        water: 'linear-gradient(145deg, #7dd3fc, #0ea5e9)',
        electric: 'linear-gradient(145deg, #fde047, #eab308)',
        grass: 'linear-gradient(145deg, #86efac, #22c55e)',
        ice: 'linear-gradient(145deg, #bae6fd, #38bdf8)',
        fighting: 'linear-gradient(145deg, #f9a8d4, #ec4899)',
        poison: 'linear-gradient(145deg, #d8b4fe, #a855f7)',
        ground: 'linear-gradient(145deg, #918047ff, #bb7906ff)',
        flying: 'linear-gradient(145deg, #a5b4fc, #6366f1)',
        psychic: 'linear-gradient(145deg, #fda4af, #f43f5e)',
        bug: 'linear-gradient(145deg, #bbf7d0, #4ade80)',
        rock: 'linear-gradient(145deg, #d6d3d1, #a8a29e)',
        ghost: 'linear-gradient(145deg, #c4b5fd, #8b5cf6)',
        dragon: 'linear-gradient(145deg, #a5b4fc, #6366f1)',
        dark: 'linear-gradient(145deg, #a1a1aa, #71717a)',
        steel: 'linear-gradient(145deg, #e5e7eb, #d1d5db)',
        fairy: 'linear-gradient(145deg, #fbcfe8, #f472b6)'
    };

    // Add this after your TYPE_GRADIENTS object
    const TYPE_SOLID_COLORS = {
        normal: '#A8A878',
        fire: '#F08030',
        water: '#6890F0',
        electric: '#F8D030',
        grass: '#78C850',
        ice: '#98D8D8',
        fighting: '#C03028',
        poison: '#A040A0',
        ground: '#E0C068',
        flying: '#A890F0',
        psychic: '#F85888',
        bug: '#A8B820',
        rock: '#B8A038',
        ghost: '#705898',
        dragon: '#7038F8',
        dark: '#705848',
        steel: '#B8B8D0',
        fairy: '#EE99AC'
    };

    

// Add these utility functions to extract colors from gradients
 function extractColorsFromGradient(gradient) {
        // Extract hex colors from gradient string
        const colorMatches = gradient.match(/#[0-9a-f]{6}/gi);
        return colorMatches || ['#667eea', '#764ba2']; // fallback colors
    }


function createBlendedGradient(pokemon1, pokemon2) {
        const type1 = pokemon1.types[0].type.name;
        const type2 = pokemon2.types[0].type.name;
        
        const gradient1 = TYPE_GRADIENTS[type1] || TYPE_GRADIENTS.normal;
        const gradient2 = TYPE_GRADIENTS[type2] || TYPE_GRADIENTS.normal;
        
        const colors1 = extractColorsFromGradient(gradient1);
        const colors2 = extractColorsFromGradient(gradient2);
        
        // Use the first color from each gradient
        const color1 = colors1[0];
        const color2 = colors2[0];
        
        // Create a blended gradient
        return `linear-gradient(135deg, ${color1} 0%, ${color2} 100%)`;
    }

    

// Alternative: Use solid colors for more consistent blending
function createSolidBlendedGradient(pokemon1, pokemon2) {
        const type1 = pokemon1.types[0].type.name;
        const type2 = pokemon2.types[0].type.name;
        
        const color1 = TYPE_SOLID_COLORS[type1] || '#A8A878';
        const color2 = TYPE_SOLID_COLORS[type2] || '#A8A878';
        
        return `linear-gradient(135deg, ${color1} 0%, ${color2} 100%)`;
    }
    // Enhanced blending options
    function createAdvancedBlendedGradient(pokemon1, pokemon2, style = 'diagonal') {
        const type1 = pokemon1.types[0].type.name;
        const type2 = pokemon2.types[0].type.name;
        
        const color1 = TYPE_SOLID_COLORS[type1] || '#A8A878';
        const color2 = TYPE_SOLID_COLORS[type2] || '#A8A878';
        
        const gradients = {
            diagonal: `linear-gradient(135deg, ${color1} 0%, ${color2} 100%)`,
            horizontal: `linear-gradient(90deg, ${color1} 0%, ${color2} 100%)`,
            vertical: `linear-gradient(180deg, ${color1} 0%, ${color2} 100%)`,
            radial: `radial-gradient(circle at center, ${color1} 0%, ${color2} 100%)`,
            split: `linear-gradient(135deg, ${color1} 0%, ${color1} 50%, ${color2} 50%, ${color2} 100%)`
        };
        
        return gradients[style] || gradients.diagonal;
    }

    // Utility Functions
    const capitalize = (str) => str.charAt(0).toUpperCase() + str.slice(1);

    // Enhanced Card System with Hybrid Layout
    const CardSystem = {
        generatePokemonCard(pokemonData, speciesData = null, options = {}) {
            const mainType = pokemonData.types[0].type.name;
            const gradient = TYPE_GRADIENTS[mainType] || TYPE_GRADIENTS.normal;
            const imgOfficial = `https://cdn.statically.io/gh/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${pokemonData.id}.png`;
            
            const types = pokemonData.types.map(t => {
                const typeName = capitalize(t.type.name);
                return `<span class="type-tag ${t.type.name}">${typeName}</span>`;
            }).join('');
            
            const abilities = pokemonData.abilities.map(a => capitalize(a.ability.name.replace('-', ' '))).join(', ');
            const stats = Object.fromEntries(pokemonData.stats.map(s => [s.stat.name, s.base_stat]));
            const moves = this.extractMoves(pokemonData);
            const description = speciesData ? this.extractDescription(speciesData) : null;

            const isComparison = options.comparison;
            const sizeClass = options.compact ? 'card-compact' : 
                            isComparison ? 'card-comparison' : 'card-standard';

            if (isComparison) {
                return this.generateComparisonCard(pokemonData, mainType, gradient, imgOfficial, types);
            }

            // HYBRID LAYOUT - Standard Card
            return `
                <div class="pokemon-card ${sizeClass}" style="--card-gradient: ${gradient}">
                    <!-- Header Section -->
                    <div class="card-header">
                        <div class="sprite-container">
                            <img src="${imgOfficial}" alt="${pokemonData.name}" class="pokemon-sprite" />
                        </div>
                        <div class="header-info">
                            <div class="pokemon-name">
                                ${capitalize(pokemonData.name)} 
                                <span class="pokemon-id">#${pokemonData.id}</span>
                            </div>
                            <div class="type-container">
                                ${types}
                            </div>
                        </div>
                    </div>

                    <!-- Desktop Layout: 2-column grid -->
                    <div class="card-content-desktop">
                        <div class="card-column stats-column">
                            <!-- Stats Section -->
                            <div class="stats-section">
                                <div class="section-label">Base Stats</div>
                                <div class="stats-grid">
                                    ${Object.entries(stats).map(([key, value]) => `
                                        <div class="stat-item">
                                            <span class="stat-label">${this.formatStatName(key)}</span>
                                            <div class="stat-bar-container">
                                                <div class="stat-bar" style="width: ${(value / 255) * 100}%">
                                                    <span class="stat-value">${value}</span>
                                                </div>
                                            </div>
                                        </div>
                                    `).join('')}
                                </div>
                            </div>
                        </div>

                        <div class="card-column info-column">
                            <!-- Attributes Section -->
                            <div class="attributes-section">
                                <div class="section-label">Attributes</div>
                                <div class="attributes-grid">
                                    <div class="attribute-item">
                                        <span class="attribute-label">Height</span>
                                        <span class="attribute-value">${pokemonData.height / 10}m</span>
                                    </div>
                                    <div class="attribute-item">
                                        <span class="attribute-label">Weight</span>
                                        <span class="attribute-value">${pokemonData.weight / 10}kg</span>
                                    </div>
                                    <div class="attribute-item full-width">
                                        <span class="attribute-label">Abilities</span>
                                        <span class="attribute-value">${abilities}</span>
                                    </div>
                                </div>
                            </div>

                            <!-- Moves Section -->
                            <div class="moves-section">
                                <div class="section-label">Signature Moves</div>
                                <div class="moves-grid">
                                    ${moves.map(move => `
                                        <div class="move-item" data-move="${move.name}">
                                            <span class="move-name">${move.name}</span>
                                            <span class="move-power">${move.power || '—'}</span>
                                        </div>
                                    `).join('')}
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- Mobile Layout: Single column -->
                    <div class="card-content-mobile">
                        <!-- Attributes -->
                        <div class="attributes-section">
                            <div class="section-label">Attributes</div>
                            <div class="attributes-grid">
                                <div class="attribute-item">
                                    <span class="attribute-label">Height</span>
                                    <span class="attribute-value">${pokemonData.height / 10}m</span>
                                </div>
                                <div class="attribute-item">
                                    <span class="attribute-label">Weight</span>
                                    <span class="attribute-value">${pokemonData.weight / 10}kg</span>
                                </div>
                                <div class="attribute-item full-width">
                                    <span class="attribute-label">Abilities</span>
                                    <span class="attribute-value">${abilities}</span>
                                </div>
                            </div>
                        </div>

                        <!-- Stats -->
                        <div class="stats-section">
                            <div class="section-label">Base Stats</div>
                            <div class="stats-grid">
                                ${Object.entries(stats).map(([key, value]) => `
                                    <div class="stat-item">
                                        <span class="stat-label">${this.formatStatName(key)}</span>
                                        <div class="stat-bar-container">
                                            <div class="stat-bar" style="width: ${(value / 255) * 100}%">
                                                <span class="stat-value">${value}</span>
                                            </div>
                                        </div>
                                    </div>
                                `).join('')}
                            </div>
                        </div>

                        <!-- Moves -->
                        <div class="moves-section">
                            <div class="section-label">Signature Moves</div>
                            <div class="moves-grid">
                                ${moves.map(move => `
                                    <div class="move-item" data-move="${move.name}">
                                        <span class="move-name">${move.name}</span>
                                        <span class="move-power">${move.power || '—'}</span>
                                    </div>
                                `).join('')}
                            </div>
                        </div>
                    </div>

                    <!-- Description (only for standard cards) -->
                    ${description && !options.compact && !isComparison ? `
                        <div class="description-section">
                            <div class="section-label">Pokédex Entry</div>
                            <p class="pokemon-description">${description}</p>
                        </div>
                    ` : ''}
                </div>
            `;
        },

        // Simplified card for comparison view
        generateComparisonCard(pokemonData, mainType, gradient, imgOfficial, types) {
            return `
                <div class="pokemon-card card-comparison" style="--card-gradient: ${gradient}">
                    <div class="comparison-card-header">
                        <img src="${imgOfficial}" alt="${pokemonData.name}" class="comparison-sprite" />
                        <div class="comparison-card-info">
                            <div class="comparison-name">${capitalize(pokemonData.name)}</div>
                            <div class="comparison-id">#${pokemonData.id}</div>
                            <div class="comparison-types">${types}</div>
                        </div>
                    </div>
                </div>
            `;
        },

        extractMoves(pokemonData) {
            return pokemonData.moves.slice(0, 6).map(move => {
                const moveName = capitalize(move.move.name.replace('-', ' '));
                return {
                    name: moveName,
                    type: 'normal',
                    power: null
                };
            });
        },

        formatStatName(stat) {
            const statNames = {
                'hp': 'HP',
                'attack': 'Attack',
                'defense': 'Defense',
                'special-attack': 'Sp. Atk',
                'special-defense': 'Sp. Def',
                'speed': 'Speed'
            };
            return statNames[stat] || stat;
        },

        extractDescription(speciesData) {
    try {
        // Handle the new PHP backend structure
        if (speciesData.flavor_text_entries && speciesData.flavor_text_entries.english) {
            return this.cleanFlavorText(speciesData.flavor_text_entries.english);
        }
        
        // Fallback to the original API structure
        if (Array.isArray(speciesData.flavor_text_entries)) {
            const englishEntry = speciesData.flavor_text_entries.find(entry => 
                entry.language.name === 'en'
            );
            return englishEntry ? this.cleanFlavorText(englishEntry.flavor_text) : null;
        }
        
        return null;
    } catch {
        return null;
    }
},

        cleanFlavorText(text) {
            return text ? text.replace(/\n/g, ' ').replace(/\f/g, ' ').replace(/  +/g, ' ').trim() : '';
        }
    };


    // Enhanced Comparison System with Dashboard Layout
    const ComparisonSystem = {
        generateComparisonView(pokemon1, pokemon2) {
               const comparison = this.calculateComparison(pokemon1.data, pokemon2.data);
               const language = window.SocialSystem ? window.SocialSystem.getCurrentLanguage() : 'english';
    
                // Use advanced blending - you can change 'diagonal' to 'horizontal', 'radial', etc.
                const blendedBackground = createAdvancedBlendedGradient(pokemon1.data, pokemon2.data, 'diagonal');
            return `
        <div class="comparison-container" style="background: ${blendedBackground} !important">
            <!-- Header -->
            <div class="comparison-header">
                <h1 class="comparison-title">
                    <span class="pokemon1-name">${capitalize(pokemon1.data.name)}</span>
                    <span class="vs-text"> vs </span>
                    <span class="pokemon2-name">${capitalize(pokemon2.data.name)}</span>
                </h1>
                <div class="winner-announcement ${comparison.winner}">
                    ${this.getWinnerText(comparison.winner, pokemon1.data.name, pokemon2.data.name, language)}
                </div>
            </div>

                    <!-- Pokémon Cards - COMPARISON DASHBOARD LAYOUT -->
                     <div class="comparison-cards-container">
                ${CardSystem.generatePokemonCard(pokemon1.data, pokemon1.species, { comparison: true })}
                
                <div class="vs-separator">
                    <div class="vs-badge">
                        <span class="vs-text">VS</span>
                    </div>
                </div>
                
                ${CardSystem.generatePokemonCard(pokemon2.data, pokemon2.species, { comparison: true })}
            </div>

                    <!-- Comparison Dashboard -->
                    <div class="comparison-dashboard">
                        <!-- Advantages Section -->
                        <div class="advantages-section">
                            <div class="advantage-column advantage-pokemon1">
                                <h3 class="advantage-title">${capitalize(pokemon1.data.name)} Advantages</h3>
                                <div class="advantage-list">
                                    ${comparison.advantages.pokemon1.map(adv => `
                                        <div class="advantage-item">
                                            <span class="advantage-icon">⚡</span>
                                            <span class="advantage-text">${adv}</span>
                                        </div>
                                    `).join('')}
                                    ${comparison.advantages.pokemon1.length === 0 ? 
                                        '<div class="no-advantages">No significant advantages</div>' : ''}
                                </div>
                            </div>

                            <div class="advantage-column advantage-pokemon2">
                                <h3 class="advantage-title">${capitalize(pokemon2.data.name)} Advantages</h3>
                                <div class="advantage-list">
                                    ${comparison.advantages.pokemon2.map(adv => `
                                        <div class="advantage-item">
                                            <span class="advantage-icon">⚡</span>
                                            <span class="advantage-text">${adv}</span>
                                        </div>
                                    `).join('')}
                                    ${comparison.advantages.pokemon2.length === 0 ? 
                                        '<div class="no-advantages">No significant advantages</div>' : ''}
                                </div>
                            </div>
                        </div>

                        <!-- Stats Comparison -->
                        <div class="stats-comparison-section">
                            <h3 class="stats-comparison-title">Stats Comparison</h3>
                            <div class="stats-comparison-grid">
                                ${Object.entries(comparison.stats).map(([stat, values]) => `
                                    <div class="stat-comparison-item">
                                        <div class="stat-comparison-header">
                                            <span class="stat-name">${CardSystem.formatStatName(stat)}</span>
                                            <span class="stat-difference ${values.p1 > values.p2 ? 'p1-leads' : values.p2 > values.p1 ? 'p2-leads' : 'tie'}">
                                                ${Math.abs(values.p1 - values.p2) > 0 ? `+${Math.abs(values.p1 - values.p2)}` : 'Tie'}
                                            </span>
                                        </div>
                                        <div class="stat-comparison-bars">
                                            <div class="stat-bar-comparison p1-bar ${values.p1 > values.p2 ? 'winning' : ''}" 
                                                 style="width: ${(values.p1 / 255) * 100}%">
                                                <span class="stat-value">${values.p1}</span>
                                            </div>
                                            <div class="stat-bar-comparison p2-bar ${values.p2 > values.p1 ? 'winning' : ''}" 
                                                 style="width: ${(values.p2 / 255) * 100}%">
                                                <span class="stat-value">${values.p2}</span>
                                            </div>
                                        </div>
                                    </div>
                                `).join('')}
                            </div>
                        </div>

                        <!-- Type Effectiveness -->
                        <div class="type-effectiveness-section">
                            <h3 class="type-effectiveness-title">Type Matchup</h3>
                            <div class="type-effectiveness-grid">
                                <div class="type-effectiveness-item">
                                    <span class="type-label">${capitalize(pokemon1.data.name)} → ${capitalize(pokemon2.data.name)}</span>
                                    <span class="type-multiplier ${this.getTypeEffectiveness(pokemon1.data, pokemon2.data) > 1 ? 'super-effective' : this.getTypeEffectiveness(pokemon1.data, pokemon2.data) < 1 ? 'not-very-effective' : 'neutral'}">
                                        ${this.getTypeEffectivenessText(pokemon1.data, pokemon2.data, language)}
                                    </span>
                                </div>
                                <div class="type-effectiveness-item">
                                    <span class="type-label">${capitalize(pokemon2.data.name)} → ${capitalize(pokemon1.data.name)}</span>
                                    <span class="type-multiplier ${this.getTypeEffectiveness(pokemon2.data, pokemon1.data) > 1 ? 'super-effective' : this.getTypeEffectiveness(pokemon2.data, pokemon1.data) < 1 ? 'not-very-effective' : 'neutral'}">
                                        ${this.getTypeEffectivenessText(pokemon2.data, pokemon1.data, language)}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            `;
        },

        getWinnerText(winner, pokemon1Name, pokemon2Name, language) {
            const texts = {
                english: {
                    pokemon1: `🏆 ${capitalize(pokemon1Name)} Wins!`,
                    pokemon2: `🏆 ${capitalize(pokemon2Name)} Wins!`,
                    tie: "⚖️ It's a Tie!"
                },
                bisaya: {
                    pokemon1: `🏆 ${capitalize(pokemon1Name)} Midaog!`,
                    pokemon2: `🏆 ${capitalize(pokemon2Name)} Midaog!`,
                    tie: "⚖️ Parehas lang!"
                },
                mixed: {
                    pokemon1: `🏆 ${capitalize(pokemon1Name)} Wins!`,
                    pokemon2: `🏆 ${capitalize(pokemon2Name)} Wins!`,
                    tie: "⚖️ It's a Tie!"
                }
            };
            const langTexts = texts[language] || texts.english;
            return langTexts[winner] || langTexts.tie;
        },

        getTypeEffectiveness(pokemon1, pokemon2) {
            // GAME-ACCURATE type effectiveness chart
            const typeChart = {
                normal: {
                    rock: 0.5, ghost: 0, steel: 0.5
                },
                fire: {
                    fire: 0.5, water: 0.5, grass: 2, ice: 2, bug: 2, 
                    rock: 0.5, dragon: 0.5, steel: 2
                },
                water: {
                    fire: 2, water: 0.5, grass: 0.5, ground: 2, 
                    rock: 2, dragon: 0.5
                },
                electric: {
                    water: 2, electric: 0.5, grass: 0.5, ground: 0, 
                    flying: 2, dragon: 0.5
                },
                grass: {
                    fire: 0.5, water: 2, grass: 0.5, poison: 0.5, 
                    ground: 2, flying: 0.5, bug: 0.5, rock: 2, 
                    dragon: 0.5, steel: 0.5
                },
                ice: {
                    fire: 0.5, water: 0.5, grass: 2, ice: 0.5, 
                    ground: 2, flying: 2, dragon: 2, steel: 0.5
                },
                fighting: {
                    normal: 2, ice: 2, poison: 0.5, flying: 0.5, 
                    psychic: 0.5, bug: 0.5, rock: 2, ghost: 0, 
                    dark: 2, steel: 2, fairy: 0.5
                },
                poison: {
                    grass: 2, poison: 0.5, ground: 0.5, rock: 0.5, 
                    ghost: 0.5, steel: 0, fairy: 2
                },
                ground: {
                    fire: 2, electric: 2, grass: 0.5, poison: 2, 
                    flying: 0, bug: 0.5, rock: 2, steel: 2
                },
                flying: {
                    electric: 0.5, grass: 2, fighting: 2, bug: 2, 
                    rock: 0.5, steel: 0.5
                },
                psychic: {
                    fighting: 2, poison: 2, psychic: 0.5, dark: 0, 
                    steel: 0.5
                },
                bug: {
                    fire: 0.5, grass: 2, fighting: 0.5, poison: 0.5, 
                    flying: 0.5, psychic: 2, ghost: 0.5, dark: 2, 
                    steel: 0.5, fairy: 0.5
                },
                rock: {
                    fire: 2, ice: 2, fighting: 0.5, ground: 0.5, 
                    flying: 2, bug: 2, steel: 0.5
                },
                ghost: {
                    normal: 0, psychic: 2, ghost: 2, dark: 0.5
                },
                dragon: {
                    dragon: 2, steel: 0.5, fairy: 0
                },
                dark: {
                    fighting: 0.5, psychic: 2, ghost: 2, dark: 0.5, 
                    fairy: 0.5
                },
                steel: {
                    fire: 0.5, water: 0.5, electric: 0.5, ice: 2, 
                    rock: 2, steel: 0.5, fairy: 2
                },
                fairy: {
                    fire: 0.5, fighting: 2, poison: 0.5, dragon: 2, 
                    dark: 2, steel: 0.5
                }
            };

            let effectiveness = 1;
            
            // Calculate effectiveness for each attacking type against each defending type
            pokemon1.types.forEach(attackerType => {
                pokemon2.types.forEach(defenderType => {
                    const multiplier = typeChart[attackerType.type.name]?.[defenderType.type.name] || 1;
                    effectiveness *= multiplier;
                });
            });

            return effectiveness;
        },

        getTypeEffectivenessText(pokemon1, pokemon2, language) {
            const effectiveness = this.getTypeEffectiveness(pokemon1, pokemon2);
            const texts = {
                english: {
                    2: "Super Effective (2×)",
                    1: "Neutral (1×)",
                    0.5: "Not Very Effective (0.5×)"
                },
                bisaya: {
                    2: "Super Effective (2×)",
                    1: "Neutral (1×)", 
                    0.5: "Dili Kaayo Effective (0.5×)"
                },
                mixed: {
                    2: "Super Effective (2×)",
                    1: "Neutral (1×)",
                    0.5: "Not Very Effective (0.5×)"
                }
            };
            const langTexts = texts[language] || texts.english;
            return langTexts[effectiveness] || langTexts[1];
        },

        calculateComparison(pokemon1, pokemon2) {
            const stats1 = this.extractStats(pokemon1);
            const stats2 = this.extractStats(pokemon2);
            
            const advantages = {
                pokemon1: this.findAdvantages(pokemon1, pokemon2, stats1, stats2),
                pokemon2: this.findAdvantages(pokemon2, pokemon1, stats2, stats1)
            };

            // Get type effectiveness
            const p1vsP2 = this.getTypeEffectiveness(pokemon1, pokemon2);
            const p2vsP1 = this.getTypeEffectiveness(pokemon2, pokemon1);
            
            // 🎮 POKÉMON-GAME LOGIC: Type advantage often decides battles
            if (p1vsP2 > 1.5 && p2vsP1 < 0.5) {
                // Pokemon1 has strong type advantage
                return {
                    winner: 'pokemon1',
                    advantages: advantages,
                    stats: this.formatStatsForComparison(stats1, stats2)
                };
            } else if (p2vsP1 > 1.5 && p1vsP2 < 0.5) {
                // Pokemon2 has strong type advantage
                return {
                    winner: 'pokemon2',
                    advantages: advantages,
                    stats: this.formatStatsForComparison(stats1, stats2)
                };
            }
            
            // If type advantage isn't decisive, use weighted scores
            const baseScore1 = this.calculateBattleScore(stats1);
            const baseScore2 = this.calculateBattleScore(stats2);
            
            // Apply type multipliers
            const finalScore1 = baseScore1 * (p1vsP2 > 1 ? 1.2 : p1vsP2 < 1 ? 0.8 : 1);
            const finalScore2 = baseScore2 * (p2vsP1 > 1 ? 1.2 : p2vsP1 < 1 ? 0.8 : 1);
            
            return {
                winner: finalScore1 > finalScore2 ? 'pokemon1' : finalScore2 > finalScore1 ? 'pokemon2' : 'tie',
                advantages: advantages,
                stats: this.formatStatsForComparison(stats1, stats2)
            };
        },

        calculateBattleScore(stats) {
            // More balanced scoring based on competitive Pokémon
            return (
                stats.hp * 0.9 +
                stats.attack * 1.1 +
                stats.defense * 1.0 +
                stats['special-attack'] * 1.1 +
                stats['special-defense'] * 1.0 +
                stats.speed * 1.2
            );
        },

        extractStats(pokemon) {
            const stats = {};
            pokemon.stats.forEach(stat => {
                stats[stat.stat.name] = stat.base_stat;
            });
            return stats;
        },

        findAdvantages(pokemon1, pokemon2, stats1, stats2) {
            const advantages = [];
            
            // Stat advantages (difference > 15)
            Object.entries(stats1).forEach(([stat, value]) => {
                if (stat !== 'total' && value > (stats2[stat] || 0) + 15) {
                    advantages.push(`${CardSystem.formatStatName(stat)} +${value - stats2[stat]}`);
                }
            });

            // ✅ IMPROVED: Type advantage detection
            const typeEffectiveness = this.getTypeEffectiveness(pokemon1, pokemon2);
            if (typeEffectiveness > 1.5) {
                advantages.push(`Strong type advantage (${typeEffectiveness.toFixed(1)}×)`);
            } else if (typeEffectiveness > 1) {
                advantages.push(`Type advantage (${typeEffectiveness.toFixed(1)}×)`);
            }

            // Speed advantage (important in battles)
            if (stats1.speed > stats2.speed + 20) {
                advantages.push(`Much faster (+${stats1.speed - stats2.speed})`);
            }

            return advantages.slice(0, 4);
        },

        formatStatsForComparison(stats1, stats2) {
            const comparison = {};
            Object.keys(stats1).forEach(stat => {
                comparison[stat] = {
                    p1: stats1[stat],
                    p2: stats2[stat]
                };
            });
            return comparison;
        }
    };

    // Enhanced Evolution System
// Enhanced Evolution System

// Enhanced Evolution System with Professional UI/UX


const EvolutionSystem = {
    async generateEvolutionChain(evolutionData, currentPokemonId) {
        if (!evolutionData || !evolutionData.chain) {
            return this.generateErrorFallback('Evolution data not available');
        }
        
        try {
            console.log('🔍 Processing evolution chain for Pokémon ID:', currentPokemonId);
            const chainWithData = await this.enrichEvolutionChain(evolutionData.chain);
            console.log('📊 Enriched chain data:', chainWithData);
            
            if (!chainWithData || chainWithData.length === 0) {
                return this.generateNoEvolutionHTML(currentPokemonId);
            }
            
            // Set dynamic type colors
            this.setEvolutionTypeColors(chainWithData);
            
            const hasBranches = this.hasMultipleBranches(evolutionData.chain);
            
            const evolutionHTML = `
                <div class="evolution-section" data-layout="${hasBranches ? 'branching' : 'linear'}">
                    <div class="evolution-header">
                        <h2 class="evolution-title">Evolution Chain</h2>
                        <p class="evolution-subtitle">${chainWithData.length}-stage evolution • ${chainWithData.length} Pokémon</p>
                    </div>
                    ${hasBranches ? 
                        this.generateBranchingEvolutionUI(chainWithData, currentPokemonId) :
                        this.generateLinearEvolutionUI(chainWithData, currentPokemonId)
                    }
                    ${this.generateEvolutionFooter(chainWithData)}
                </div>
            `;
            
            console.log('✅ Evolution HTML generated successfully');
            return evolutionHTML;
            
        } catch (error) {
            console.error('Evolution chain generation failed:', error);
            return this.generateErrorFallback('Failed to load evolution chain: ' + error.message);
        }
    },

    async enrichEvolutionChain(chain) {
        const enrichedChain = [];
        const processedIds = new Set();
        
        console.log('🔍 Raw chain structure for processing:', chain);

        let currentNode = chain;
        
        while (currentNode && currentNode.species) {
            const pokemonId = this.extractPokemonId(currentNode.species.url);
            
            // Skip duplicates
            if (processedIds.has(pokemonId)) {
                console.log('⏭️ Skipping duplicate:', currentNode.species.name);
                currentNode = currentNode.evolves_to && currentNode.evolves_to.length > 0 ? currentNode.evolves_to[0] : null;
                continue;
            }
            
            processedIds.add(pokemonId);
            console.log('🔄 Processing:', currentNode.species.name, 'ID:', pokemonId);

            try {
                const pokemonData = await window.PokemonLogic.fetchPokemonData(currentNode.species.name);
                
                // FIXED: Use proper sprite URL with fallbacks
                const sprite = this.getOptimizedSprite(pokemonData);
                
                enrichedChain.push({
                    id: pokemonId,
                    name: currentNode.species.name,
                    types: pokemonData.types.map(t => t.type.name),
                    sprite: sprite,
                    evolutionDetails: currentNode.evolution_details && currentNode.evolution_details.length > 0 ? currentNode.evolution_details[0] : null,
                    height: pokemonData.height / 10,
                    weight: pokemonData.weight / 10,
                    stats: this.extractBaseStats(pokemonData)
                });
            } catch (error) {
                console.warn('Failed to fetch data for:', currentNode.species.name, error);
                // FIXED: Use proper fallback sprite URL
                enrichedChain.push({
                    id: pokemonId,
                    name: currentNode.species.name,
                    types: ['normal'],
                    sprite: `https://cdn.statically.io/gh/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${pokemonId}.png`,
                    evolutionDetails: currentNode.evolution_details && currentNode.evolution_details.length > 0 ? currentNode.evolution_details[0] : null,
                    height: 0,
                    weight: 0,
                    stats: {}
                });
            }

            // Move to next evolution
            if (currentNode.evolves_to && currentNode.evolves_to.length > 0) {
                currentNode = currentNode.evolves_to[0];
            } else {
                currentNode = null;
            }
        }
        
        console.log('📊 Final unique chain:', enrichedChain);
        return enrichedChain;
    },

    // FIXED: Add sprite optimization with multiple fallbacks
    getOptimizedSprite(pokemonData) {
        const spriteSources = [
            `https://cdn.statically.io/gh/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${pokemonData.id}.png`
        ];
        
        return spriteSources.find(src => src) || '/images/placeholder.png';
    },

    // NEW: Extract base stats for tooltips
    extractBaseStats(pokemonData) {
        const stats = {};
        if (pokemonData.stats) {
            pokemonData.stats.forEach(stat => {
                stats[stat.stat.name] = stat.base_stat;
            });
        }
        return stats;
    },

    

    generateLinearEvolutionUI(chain, currentPokemonId) {
        if (!chain || chain.length === 0) {
            return '<div class="evolution-error">No evolution data available</div>';
        }

        // If only one Pokémon in chain
        if (chain.length === 1) {
            return `
                <div class="evolution-single-pokemon">
                    ${this.generateEvolutionCard(chain[0], currentPokemonId)}
                    <div class="no-evolution-text">${this.capitalize(chain[0].name)} does not evolve further.</div>
                </div>
            `;
        }

        // HORIZONTAL LAYOUT HTML - IMPROVED
        return `
            <div class="evolution-chain linear-layout">
                ${chain.map((pokemon, index) => {
                    const evolutionDetails = pokemon.evolutionDetails;
                    return `
                        <div class="evolution-stage linear" data-stage="${index + 1}">
                            ${this.generateEvolutionCard(pokemon, currentPokemonId)}
                            ${index < chain.length - 1 ? this.generateEvolutionConnector(evolutionDetails) : ''}
                        </div>
                    `;
                }).join('')}
            </div>
        `;
    },

    generateEvolutionCard(pokemon, currentPokemonId) {
        const mainType = pokemon.types[0];
        const gradient = TYPE_GRADIENTS[mainType] || TYPE_GRADIENTS.normal;
        const isCurrent = parseInt(pokemon.id) === parseInt(currentPokemonId);

        return `
            <div class="pokemon-evolution-card ${isCurrent ? 'current-pokemon' : ''}" 
                 style="--card-gradient: ${gradient}"
                 data-pokemon-id="${pokemon.id}"
                 data-pokemon-name="${pokemon.name}"
                 onclick="EvolutionSystem.handleEvolutionCardClick('${pokemon.name}')">
                
                <div class="evolution-sprite">
                    <img src="${pokemon.sprite}"
                         alt="${pokemon.name}"
                         loading="lazy"
                         onerror="this.src='https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${pokemon.id}.png'" />
                </div>
                
                <div class="evolution-info">
                    <div class="evolution-name">${this.capitalize(pokemon.name)}</div>
                    <div class="evolution-id">#${pokemon.id.toString().padStart(3, '0')}</div>
                    
                    <div class="evolution-types">
                        ${pokemon.types.map(type => `
                            <span class="type-tag ${type}" title="${this.capitalize(type)} type">${this.capitalize(type)}</span>
                        `).join('')}
                    </div>
                </div>
                
                ${isCurrent ? '<div class="current-indicator">Current</div>' : ''}
                
                <!-- Stats Tooltip -->
                <div class="evolution-stats-tooltip">
                    <div class="stats-summary">
                        ${pokemon.stats.hp ? `HP: ${pokemon.stats.hp} | ATK: ${pokemon.stats.attack || '?'}` : 'Loading stats...'}
                    </div>
                </div>
            </div>
        `;
    },

    generateEvolutionConnector(evolutionDetails) {
        const trigger = this.formatEvolutionTrigger(evolutionDetails);
        
        return `
            <div class="evolution-connector linear">
                <div class="evolution-arrow">→</div>
                <div class="evolution-trigger" title="${this.getEvolutionTooltip(evolutionDetails)}">
                    ${trigger}
                </div>
            </div>
        `;
    },

    // NEW: Enhanced evolution tooltip
    getEvolutionTooltip(details) {
        if (!details) return 'Evolves through level up';
        
        const conditions = [];
        
        if (details.min_level) conditions.push(`Level ${details.min_level}`);
        if (details.min_happiness) conditions.push(`Happiness ${details.min_happiness}`);
        if (details.time_of_day) conditions.push(`${this.capitalize(details.time_of_day)} time`);
        if (details.item) conditions.push(`Use ${this.capitalize(details.item.name.replace('-', ' '))}`);
        if (details.held_item) conditions.push(`Holding ${this.capitalize(details.held_item.name)}`);
        if (details.location) conditions.push(`At ${this.capitalize(details.location.name)}`);
        
        return conditions.length > 0 ? conditions.join(', ') : 'Special conditions';
    },

    setEvolutionTypeColors(chain) {
        if (!chain || chain.length === 0) return;
        
        const primaryType = chain[0].types[0];
        const primaryColor = TYPE_SOLID_COLORS[primaryType] || '#A8A878';
        
        const secondaryPokemon = chain[chain.length - 1] || chain[Math.floor(chain.length / 2)];
        const secondaryType = secondaryPokemon.types[0];
        const secondaryColor = TYPE_SOLID_COLORS[secondaryType] || primaryColor;
        
        document.documentElement.style.setProperty('--evolution-primary-color', primaryColor);
        document.documentElement.style.setProperty('--evolution-secondary-color', secondaryColor);
    },

    formatEvolutionTrigger(details) {
        if (!details) return 'Level up';

        const triggers = {
            'level-up': details.min_level ? `Lv. ${details.min_level}` : 'Level up',
            'use-item': details.item ? `Use ${this.capitalize(details.item.name.replace('-', ' '))}` : 'Use item',
            'trade': details.trade_species ? `Trade for ${this.capitalize(details.trade_species.name)}` : 'Trade',
            'shed': 'Empty spot + Pokéball',
            'spin': 'Spin around',
            'tower-of-darkness': 'Tower of Darkness',
            'tower-of-waters': 'Tower of Waters',
            'three-critical-hits': '3 Critical Hits',
            'take-damage': 'Take damage',
            'other': 'Special'
        };

        const triggerName = details.trigger?.name || 'level-up';
        return triggers[triggerName] || this.capitalize(triggerName.replace('-', ' '));
    },

    generateBranchingEvolutionUI(chain, currentPokemonId) {
        const basePokemon = chain[0];
        const branches = chain.slice(1);
        
        return `
            <div class="evolution-chain branching-layout">
                <div class="evolution-branches">
                    <div class="branch-base">
                        ${this.generateEvolutionCard(basePokemon, currentPokemonId)}
                    </div>
                    <div class="branch-options">
                        ${branches.map(pokemon => `
                            <div class="branch-option">
                                <div class="branch-connector">
                                    <div class="branch-line"></div>
                                    <div class="evolution-arrow">↓</div>
                                    <div class="evolution-trigger">${this.formatEvolutionTrigger(pokemon.evolutionDetails)}</div>
                                </div>
                                ${this.generateEvolutionCard(pokemon, currentPokemonId)}
                            </div>
                        `).join('')}
                    </div>
                </div>
                <div class="evolution-note">
                    <p>✨ This Pokémon has multiple evolution paths! Each branch leads to different strengths and abilities.</p>
                </div>
            </div>
        `;
    },

    // NEW: Evolution footer with stats
    generateEvolutionFooter(chain) {
        if (chain.length <= 1) return '';
        
        const totalStats = chain.reduce((sum, pokemon) => {
            const pokemonStats = Object.values(pokemon.stats).reduce((a, b) => a + b, 0) || 0;
            return sum + pokemonStats;
        }, 0);
        
        const avgStats = Math.round(totalStats / chain.length);
        
        return `
            <div class="evolution-footer">
                <div class="evolution-stats">
                    <span class="stat-item">Chain Length: ${chain.length}</span>
                    <span class="stat-item">Avg. Stats: ${avgStats}</span>
                    <span class="stat-item">Types: ${new Set(chain.flatMap(p => p.types)).size}</span>
                </div>
            </div>
        `;
    },

    // NEW: No evolution state
    generateNoEvolutionHTML(pokemonName) {
        return `
            <div class="evolution-single-pokemon">
                <div class="no-evolution-card">
                    <div class="no-evolution-icon">🌿</div>
                    <div class="no-evolution-title">No Evolution</div>
                    <div class="no-evolution-text">
                        ${this.capitalize(pokemonName)} does not evolve. This Pokémon is in its final form!
                    </div>
                </div>
            </div>
        `;
    },

    generateErrorFallback(message) {
        return `
            <div class="evolution-error">
                <div class="error-icon">⚠️</div>
                <div class="error-message">${message}</div>
                <button class="retry-button" onclick="EvolutionSystem.retryEvolutionChain()">Try Again</button>
            </div>
        `;
    },

    // NEW: Interactive features
    handleEvolutionCardClick(pokemonName) {
        console.log('🎯 Evolution card clicked:', pokemonName);
        
        // Add to chat input for quick search
        const input = document.getElementById('userInput');
        if (input) {
            input.value = pokemonName;
            input.focus();
        }
        
        // Visual feedback
        if (event && event.currentTarget) {
            const card = event.currentTarget;
            card.style.transform = 'scale(0.95)';
            setTimeout(() => {
                card.style.transform = '';
            }, 150);
        }
    },

    retryEvolutionChain() {
        if (window.ChatSystem && window.SocialSystem) {
            const lastPokemon = window.SocialSystem.getLastPokemon();
            if (lastPokemon) {
                window.ChatSystem.handleEvolutionQuery(`evolution ${lastPokemon}`);
            }
        }
    },

    // Utility methods
    extractPokemonId(url) {
        const matches = url.match(/\/(\d+)\/$/);
        return matches ? matches[1] : '000';
    },

    capitalize(str) {
        return str.charAt(0).toUpperCase() + str.slice(1);
    },

    hasMultipleBranches(chain) {
        if (!chain.evolves_to) return false;
        
        const checkBranches = (node) => {
            if (node.evolves_to && node.evolves_to.length > 1) {
                return true;
            }
            
            if (node.evolves_to) {
                for (const evolution of node.evolves_to) {
                    if (checkBranches(evolution)) {
                        return true;
                    }
                }
            }
            
            return false;
        };
        
        return checkBranches(chain);
    }
};



// Make sure to add these global functions for HTML event handlers
window.EvolutionSystem = EvolutionSystem;

    // SIMPLIFIED: No CSS injection - CSS is loaded externally
    function initialize() {
        console.log('🎨 Pokémon Card System initialized (CSS loaded externally)');
    }

 // Public API
   return {
        init: initialize,

        async generateEvolution(evolutionData, currentPokemonId) {
        return await EvolutionSystem.generateEvolutionChain(evolutionData, currentPokemonId);
        },

        generateCard(pokemonData, speciesData = null, options = {}) {
            return CardSystem.generatePokemonCard(pokemonData, speciesData, options);
        },

        generateComparison(pokemon1, pokemon2) {
            return ComparisonSystem.generateComparisonView(pokemon1, pokemon2);
        },

        // Utility methods
        capitalize,
        
        // Type utilities
        getTypeGradient(type) {
            return TYPE_GRADIENTS[type] || TYPE_GRADIENTS.normal;
        },

        // Enhanced systems for external use
        CardSystem,
        ComparisonSystem,
        EvolutionSystem
    };

})();


// Simple initialization
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => PokeCard.init());
} else {
    PokeCard.init();
}

// Make available globally
window.PokeCard = PokeCard;