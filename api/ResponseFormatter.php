<?php
// api/ResponseFormatter.php - Standardizes API responses

class ResponseFormatter {
    
    /**
     * Format successful response
     */
   public function success($data, $cacheInfo = null) {
    // XSS PROTECTION: Sanitize all output data
    $sanitizedData = $this->sanitizeOutput($data);
    
    $response = [
        'success' => true,
        'data' => $sanitizedData,
        'timestamp' => time()
    ];

    if ($cacheInfo) {
        $response['cache'] = $cacheInfo;
    }

    return json_encode($response, JSON_PRETTY_PRINT);
}

/**
 * XSS PROTECTION: Recursively sanitize all output data
 */
private function sanitizeOutput($data) {
    if (is_array($data)) {
        return array_map([$this, 'sanitizeOutput'], $data);
    }
    
    if (is_string($data)) {
        // Convert special characters to HTML entities
        return htmlspecialchars($data, ENT_QUOTES, 'UTF-8');
    }
    
    return $data;
}

    /**
     * Format error response
     */
    public function error($message, $code = 400) {
        http_response_code($code);
        
        return json_encode([
            'success' => false,
            'error' => $message,
            'code' => $code,
            'timestamp' => time()
        ], JSON_PRETTY_PRINT);
    }

    /**
     * Format not found response
     */
    public function notFound($resource) {
        return $this->error("$resource not found", 404);
    }

    /**
     * Format server error response
     */
    public function serverError($message = 'Internal server error') {
        return $this->error($message, 500);
    }
}
?>