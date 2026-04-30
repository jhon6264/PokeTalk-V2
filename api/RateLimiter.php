<?php
class RateLimiter {
    private $limit;
    private $window;
    private $ip;
    private $storage_dir;

    public function __construct($limit = 60, $window = 60) {
        // 60 requests per 60 seconds (1 minute) by default
        $this->limit = $limit;
        $this->window = $window;
        $this->ip = $this->getClientIP();
        $this->storage_dir = __DIR__ . '/../rate_limit_data/';
        
        // Create storage directory if it doesn't exist
        if (!is_dir($this->storage_dir)) {
            mkdir($this->storage_dir, 0755, true);
        }
    }

    private function getClientIP() {
        // Get real IP address (handles proxies)
        if (!empty($_SERVER['HTTP_CLIENT_IP'])) {
            return $_SERVER['HTTP_CLIENT_IP'];
        } elseif (!empty($_SERVER['HTTP_X_FORWARDED_FOR'])) {
            return $_SERVER['HTTP_X_FORWARDED_FOR'];
        } else {
            return $_SERVER['REMOTE_ADDR'];
        }
    }

    private function getStorageFile() {
        // Create a safe filename from IP address
        $ip_hash = md5($this->ip);
        return $this->storage_dir . $ip_hash . '.json';
    }

    public function checkRateLimit() {
        $storage_file = $this->getStorageFile();
        $now = time();
        
        // Read existing data or initialize
        if (file_exists($storage_file)) {
            $data = json_decode(file_get_contents($storage_file), true);
            $requests = $data['requests'] ?? [];
            
            // Remove requests outside the current time window
            $window_start = $now - $this->window;
            $requests = array_filter($requests, function($time) use ($window_start) {
                return $time > $window_start;
            });
        } else {
            $requests = [];
        }

        // Check if limit exceeded
        if (count($requests) >= $this->limit) {
            $this->sendRateLimitResponse();
        }

        // Add current request
        $requests[] = $now;
        
        // Save updated data
        $data = [
            'requests' => $requests,
            'ip' => $this->ip,
            'last_updated' => $now
        ];
        
        file_put_contents($storage_file, json_encode($data));
        
        // Set headers to inform client of their rate limit status
        $this->setRateLimitHeaders(count($requests), $this->limit, $this->window);
        
        return true;
    }

    private function setRateLimitHeaders($current, $limit, $window) {
        header("X-RateLimit-Limit: {$limit}");
        header("X-RateLimit-Remaining: " . max(0, $limit - $current));
        header("X-RateLimit-Reset: " . (time() + $window));
    }

    private function sendRateLimitResponse() {
        http_response_code(429);
        header('Content-Type: application/json');
        
        $response = [
            'success' => false,
            'error' => 'Rate limit exceeded',
            'message' => 'Too many requests. Please slow down and try again in a minute.',
            'code' => 429
        ];
        
        echo json_encode($response);
        exit;
    }

    // Optional: Method to clean up old rate limit files
    public static function cleanupOldFiles($max_age = 3600) {
        $storage_dir = __DIR__ . '/../rate_limit_data/';
        if (!is_dir($storage_dir)) return;
        
        $files = glob($storage_dir . '*.json');
        $now = time();
        
        foreach ($files as $file) {
            if (filemtime($file) < ($now - $max_age)) {
                unlink($file);
            }
        }
    }
}
?>