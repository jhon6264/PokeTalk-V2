<?php
// pokemon.php - Pokémon API Backend Handler
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST');


require_once 'api/RateLimiter.php';
try {
    $rateLimiter = new RateLimiter(60, 60); // 60 requests per 60 seconds
    $rateLimiter->checkRateLimit();
} catch (Exception $e) {
    // If rate limiting fails, still allow the request (fail-open for reliability)
    error_log("Rate limiting error: " . $e->getMessage());
}

// XSS PROTECTION: Input sanitization function
function sanitizeInput($input, $type = 'name') {
    if (!is_string($input)) return '';
    
    $input = trim($input);
    
    // XSS PROTECTION: Remove HTML tags from all inputs
    $input = strip_tags($input);
    
    if ($type === 'action') {
        $allowed_actions = [
            'getPokemon', 'getSpecies', 'getEvolution', 'getPokemonData', 
            'getComparison', 'searchPokemon', 'clearCache', 
            'getAllPokemonNames', 'getA11PokemonNames' // TEMPORARY - accept both
        ];
        if (!in_array($input, $allowed_actions)) {
            throw new Exception('Invalid action: ' . $input);
        }
        
        // NORMALIZE: Convert the typo to correct spelling
        if ($input === 'getA11PokemonNames') {
            $input = 'getAllPokemonNames';
        }
    }
    
    return $input;
}


// Enable error reporting for development
error_reporting(E_ALL);
ini_set('display_errors', 1);

// Main configuration
define('CACHE_DURATION', 3600); // 1 hour cache
define('POKEAPI_BASE_URL', 'https://pokeapi.co/api/v2/');

// Include required modules
require_once 'api/PokeAPIHandler.php';
require_once 'api/CacheSystem.php';
require_once 'api/ResponseFormatter.php';

try {
    // Get and SANITIZE request parameters
    $action = sanitizeInput($_GET['action'] ?? $_POST['action'] ?? '', 'action');
    $name = sanitizeInput($_GET['name'] ?? $_POST['name'] ?? '', 'name');
    $pokemon1 = sanitizeInput($_GET['pokemon1'] ?? $_POST['pokemon1'] ?? '', 'name');
    $pokemon2 = sanitizeInput($_GET['pokemon2'] ?? $_POST['pokemon2'] ?? '', 'name');
    $query = sanitizeInput($_GET['query'] ?? $_POST['query'] ?? '', 'query');

    // Initialize handlers
    $apiHandler = new PokeAPIHandler();
    $cacheSystem = new CacheSystem();
    $formatter = new ResponseFormatter();

    // Route actions
    switch ($action) {
        case 'getPokemon':
            if (!$name) throw new Exception('Pokémon name is required');
            $data = $apiHandler->getPokemonData($name);
            echo $formatter->success($data);
            break;

        case 'getSpecies':
            if (!$name) throw new Exception('Pokémon name is required');
            $data = $apiHandler->getSpeciesData($name);
            echo $formatter->success($data);
            break;

        case 'getEvolution':
            if (!$name) throw new Exception('Pokémon name is required');
            $data = $apiHandler->getEvolutionChain($name);
            echo $formatter->success($data);
            break;

        case 'getPokemonData':
            if (!$name) throw new Exception('Pokémon name is required');
            $data = $apiHandler->getCombinedPokemonData($name);
            echo $formatter->success($data);
            break;

        case 'getComparison':
            if (!$pokemon1 || !$pokemon2) throw new Exception('Both Pokémon names are required');
            $data = $apiHandler->getPokemonComparison($pokemon1, $pokemon2);
            echo $formatter->success($data);
            break;

        case 'searchPokemon':
            $data = $apiHandler->searchPokemon($query);
            echo $formatter->success($data);
            break;

        case 'clearCache':
            $cacheSystem->clearAllCache();
            RateLimiter::cleanupOldFiles(); // Clean rate limit files too
            echo $formatter->success(['message' => 'Cache cleared successfully']);
            break;

        case 'getAllPokemonNames':
            $data = $apiHandler->getAllPokemonNames();
            echo $formatter->success($data);
            break;

        default:
            throw new Exception('Invalid action specified');
    }

} catch (Exception $e) {
    $formatter = new ResponseFormatter();
    echo $formatter->error($e->getMessage(), 400);
}
?>