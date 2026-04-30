<?php
// api/CacheSystem.php - Server-side file caching system

class CacheSystem {
    private $cacheDir;

    public function __construct() {
        $this->cacheDir = __DIR__ . '/cache/';
        
        // Create cache directories if they don't exist
        $directories = ['pokemon', 'species', 'evolution', 'search', 'compare'];
        foreach ($directories as $dir) {
            $path = $this->cacheDir . $dir;
            if (!is_dir($path)) {
                mkdir($path, 0755, true);
            }
        }
    }

    /**
     * Get cached data
     */
    public function get($key, $duration = 3600) {
        $filename = $this->getFilename($key);
        
        if (!file_exists($filename)) {
            return null;
        }

        // Check if cache is expired
        if (time() - filemtime($filename) > $duration) {
            unlink($filename);
            return null;
        }

        $data = file_get_contents($filename);
        return json_decode($data, true);
    }

    /**
     * Set cache data
     */
    public function set($key, $data, $duration = 3600) {
        $filename = $this->getFilename($key);
        file_put_contents($filename, json_encode($data));
    }

    /**
     * Clear all cache
     */
    public function clearAllCache() {
        $directories = ['pokemon', 'species', 'evolution', 'search', 'compare'];
        
        foreach ($directories as $dir) {
            $path = $this->cacheDir . $dir . '/';
            if (is_dir($path)) {
                $files = glob($path . '*');
                foreach ($files as $file) {
                    if (is_file($file)) {
                        unlink($file);
                    }
                }
            }
        }
    }

    /**
     * Generate cache filename
     */
    private function getFilename($key) {
    // XSS PROTECTION: Prevent directory traversal
    $key = str_replace(['../', './', '/', '\\'], '', $key);
    $hash = md5($key);
    
    $dir = $this->getCacheDirectory($key);
    
    // Additional security: Ensure we're only writing to cache directory
    $fullPath = $dir . $hash . '.json';
    if (strpos(realpath(dirname($fullPath)), realpath($this->cacheDir)) !== 0) {
        throw new Exception('Invalid cache path detected');
    }
    
    return $fullPath;
}

    /**
     * Determine cache directory based on key prefix
     */
    private function getCacheDirectory($key) {
        $prefix = explode('_', $key)[0];
        
        $directories = [
            'pokemon' => 'pokemon/',
            'species' => 'species/',
            'evolution' => 'evolution/',
            'search' => 'search/',
            'compare' => 'compare/',
            'combined' => 'pokemon/',
            'all' => 'search/'
        ];

        $dir = $directories[$prefix] ?? 'pokemon/';
        return $this->cacheDir . $dir;
    }
}
?>