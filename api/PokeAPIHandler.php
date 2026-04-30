<?php
// api/PokeAPIHandler.php - Handles all PokeAPI communication

class PokeAPIHandler {
    private $baseUrl = 'https://pokeapi.co/api/v2/';
    private $cacheSystem;

    public function __construct() {
        $this->cacheSystem = new CacheSystem();
    }

    /**
     * Get combined Pokémon data (pokemon + species)
     */
    public function getCombinedPokemonData($pokemonName) {
        $cacheKey = 'combined_' . strtolower($pokemonName);
        $cached = $this->cacheSystem->get($cacheKey);
        
        if ($cached) {
            return $cached;
        }

        $pokemonData = $this->getPokemonData($pokemonName);
        $speciesData = $this->getSpeciesData($pokemonName);

        $combinedData = [
            'pokemon' => $pokemonData,
            'species' => $speciesData
        ];

        $this->cacheSystem->set($cacheKey, $combinedData);
        return $combinedData;
    }

    /**
     * Get basic Pokémon data
     */
    public function getPokemonData($pokemonName) {
        $cacheKey = 'pokemon_' . strtolower($pokemonName);
        $cached = $this->cacheSystem->get($cacheKey);
        
        if ($cached) {
            return $cached;
        }

        $url = $this->baseUrl . 'pokemon/' . strtolower($pokemonName);
        $data = $this->makeRequest($url);
        
        // Process and optimize the data
        $processedData = $this->processPokemonData($data);
        $this->cacheSystem->set($cacheKey, $processedData);
        
        return $processedData;
    }

    /**
     * Get species data
     */
    public function getSpeciesData($pokemonName) {
        $cacheKey = 'species_' . strtolower($pokemonName);
        $cached = $this->cacheSystem->get($cacheKey);
        
        if ($cached) {
            return $cached;
        }

        $url = $this->baseUrl . 'pokemon-species/' . strtolower($pokemonName);
        $data = $this->makeRequest($url);
        
        $processedData = $this->processSpeciesData($data);
        $this->cacheSystem->set($cacheKey, $processedData);
        
        return $processedData;
    }

    /**
     * Get evolution chain
     */
    public function getEvolutionChain($pokemonName) {
        $cacheKey = 'evolution_' . strtolower($pokemonName);
        $cached = $this->cacheSystem->get($cacheKey);
        
        if ($cached) {
            return $cached;
        }

        // First get species to find evolution chain URL
        $speciesData = $this->getSpeciesData($pokemonName);
        
        if (!isset($speciesData['evolution_chain']['url'])) {
            return ['chain' => null, 'has_evolutions' => false];
        }

        $evolutionUrl = $speciesData['evolution_chain']['url'];
        $evolutionData = $this->makeRequest($evolutionUrl);
        
        $processedData = $this->processEvolutionData($evolutionData);
        $this->cacheSystem->set($cacheKey, $processedData);
        
        return $processedData;
    }

    /**
     * Compare two Pokémon
     */
    public function getPokemonComparison($pokemon1, $pokemon2) {
        $cacheKey = 'compare_' . strtolower($pokemon1) . '_vs_' . strtolower($pokemon2);
        $cached = $this->cacheSystem->get($cacheKey);
        
        if ($cached) {
            return $cached;
        }

        $pokemon1Data = $this->getCombinedPokemonData($pokemon1);
        $pokemon2Data = $this->getCombinedPokemonData($pokemon2);

        $comparison = $this->generateComparison($pokemon1Data, $pokemon2Data);
        $this->cacheSystem->set($cacheKey, $comparison);
        
        return $comparison;
    }

    /**
     * Search Pokémon for autocomplete
     */
    public function searchPokemon($query) {
        if (strlen($query) < 2) {
            return [];
        }

        $cacheKey = 'search_' . strtolower($query);
        $cached = $this->cacheSystem->get($cacheKey);
        
        if ($cached) {
            return $cached;
        }

        // Get all Pokémon names (cached separately)
        $allPokemon = $this->getAllPokemonNames();
        $results = array_filter($allPokemon, function($name) use ($query) {
            return stripos($name, strtolower($query)) !== false;
        });

        $results = array_slice(array_values($results), 0, 10); // Limit to 10 results
        $this->cacheSystem->set($cacheKey, $results);
        
        return $results;
    }

    /**
     * Get all Pokémon names (cached for 24 hours)
     */
    public function getAllPokemonNames() {
        $cacheKey = 'all_pokemon_names';
        $cached = $this->cacheSystem->get($cacheKey, 86400); // 24 hours
        
        if ($cached) {
            return $cached;
        }

        $url = $this->baseUrl . 'pokemon?limit=1000';
        $data = $this->makeRequest($url);
        
        $names = array_map(function($pokemon) {
            return $pokemon['name'];
        }, $data['results']);

        $this->cacheSystem->set($cacheKey, $names, 86400);
        return $names;
    }

    /**
     * Make HTTP request to PokeAPI
     */
    private function makeRequest($url) {
        $ch = curl_init();
        curl_setopt_array($ch, [
            CURLOPT_URL => $url,
            CURLOPT_RETURNTRANSFER => true,
            CURLOPT_TIMEOUT => 30,
            CURLOPT_FOLLOWLOCATION => true,
            CURLOPT_HTTPHEADER => [
                'User-Agent: Poketalk-App/1.0'
            ]
        ]);

        $response = curl_exec($ch);
        $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
        curl_close($ch);

        if ($httpCode !== 200) {
            throw new Exception('Pokémon not found or API error', $httpCode);
        }

        return json_decode($response, true);
    }

    /**
     * Process and optimize Pokémon data
     */
    private function processPokemonData($data) {
    // XSS PROTECTION: Sanitize all string fields
    return [
        'id' => $data['id'],
        'name' => htmlspecialchars($data['name'], ENT_QUOTES, 'UTF-8'),
        'types' => array_map(function($type) {
            return [
                'slot' => $type['slot'],
                'type' => [
                    'name' => htmlspecialchars($type['type']['name'], ENT_QUOTES, 'UTF-8'),
                    'url' => $type['type']['url'] // URLs are safe as they're from PokeAPI
                ]
            ];
        }, $data['types']),
        'stats' => array_map(function($stat) {
            return [
                'base_stat' => $stat['base_stat'],
                'effort' => $stat['effort'],
                'stat' => [
                    'name' => htmlspecialchars($stat['stat']['name'], ENT_QUOTES, 'UTF-8'),
                    'url' => $stat['stat']['url']
                ]
            ];
        }, $data['stats']),
        'abilities' => array_map(function($ability) {
            return [
                'ability' => [
                    'name' => htmlspecialchars($ability['ability']['name'], ENT_QUOTES, 'UTF-8'),
                    'url' => $ability['ability']['url']
                ],
                'is_hidden' => $ability['is_hidden'],
                'slot' => $ability['slot']
            ];
        }, $data['abilities']),
        'sprites' => [
            'front_default' => $data['sprites']['front_default'],
            'other' => [
                'official-artwork' => [
                    'front_default' => $data['sprites']['other']['official-artwork']['front_default'] ?? null
                ]
            ]
        ],
        'height' => $data['height'],
        'weight' => $data['weight'],
        'moves' => array_slice($data['moves'], 0, 6) // Limit moves for performance
    ];
}

    /**
     * Process species data
     */
    private function processSpeciesData($data) {
    // XSS PROTECTION: Sanitize text data
    $englishFlavorText = '';
    foreach ($data['flavor_text_entries'] as $entry) {
        if ($entry['language']['name'] === 'en') {
            $englishFlavorText = htmlspecialchars($entry['flavor_text'], ENT_QUOTES, 'UTF-8');
            break;
        }
    }

    // XSS PROTECTION: Sanitize genera data
    $englishGenera = array_filter($data['genera'], function($genus) {
        return $genus['language']['name'] === 'en';
    });
    
    // Sanitize the genus text
    $englishGenera = array_map(function($genus) {
        return [
            'genus' => htmlspecialchars($genus['genus'], ENT_QUOTES, 'UTF-8'),
            'language' => $genus['language']
        ];
    }, $englishGenera);

    return [
        'id' => $data['id'],
        'name' => htmlspecialchars($data['name'], ENT_QUOTES, 'UTF-8'),
        'evolution_chain' => $data['evolution_chain'],
        'flavor_text_entries' => [
            'english' => $englishFlavorText
        ],
        'genera' => $englishGenera,
        'capture_rate' => $data['capture_rate'],
        'base_happiness' => $data['base_happiness'],
        'growth_rate' => htmlspecialchars($data['growth_rate']['name'], ENT_QUOTES, 'UTF-8')
    ];
}

    /**
     * Process evolution data
     */
    private function processEvolutionData($data) {
        return [
            'chain' => $data['chain'],
            'id' => $data['id']
        ];
    }

    /**
     * Generate comparison data
     */
    private function generateComparison($pokemon1Data, $pokemon2Data) {
        return [
            'pokemon1' => $pokemon1Data,
            'pokemon2' => $pokemon2Data,
            'comparison' => [
                'total_stats_1' => array_sum(array_column($pokemon1Data['pokemon']['stats'], 'base_stat')),
                'total_stats_2' => array_sum(array_column($pokemon2Data['pokemon']['stats'], 'base_stat')),
                'type_advantage' => $this->calculateTypeAdvantage(
                    $pokemon1Data['pokemon']['types'],
                    $pokemon2Data['pokemon']['types']
                )
            ]
        ];
    }

    /**
     * Calculate type advantage
     */
    private function calculateTypeAdvantage($types1, $types2) {
        // Simplified type advantage calculation
        // You can expand this with full type chart
        return 1.0; // Neutral for now
    }
}
?>