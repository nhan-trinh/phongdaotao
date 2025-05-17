<?php
ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);

header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");
header("Content-Type: application/json; charset=UTF-8");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

require_once '../config.php';

$response = ['status' => 'error', 'message' => ''];
$log = []; // For debugging

try {
    // Get and validate input
    $json = file_get_contents('php://input');
    $data = json_decode($json, true);
    
    if (json_last_error() !== JSON_ERROR_NONE) {
        throw new Exception("Invalid JSON format: " . json_last_error_msg());
    }

    if (empty($data['class_id'])) {
        throw new Exception("Class ID is required");
    }

    $class_id = (int)$data['class_id'];
    $log['input'] = ['class_id' => $class_id];

    // Database connection
    $database = new Database();
    $db = $database->getConnection();
    
    if (!$db) {
        throw new Exception("Failed to connect to database");
    }

    // Check if item exists
    $checkQuery = "SELECT id, class_name FROM classes WHERE id = :id";
    $checkStmt = $db->prepare($checkQuery);
    $checkStmt->bindParam(':id', $class_id, PDO::PARAM_INT);
    
    if (!$checkStmt->execute()) {
        $errorInfo = $checkStmt->errorInfo();
        throw new Exception("Check query failed: " . $errorInfo[2]);
    }

    $item = $checkStmt->fetch(PDO::FETCH_ASSOC);
    $log['item_exists'] = $item ? true : false;

    if (!$item) {
        throw new Exception("Class not found with ID: $class_id");
    }

    // Temporarily disable foreign key checks
    $db->exec("SET FOREIGN_KEY_CHECKS=0");
    $log['foreign_key_checks'] = 'disabled';

    // Perform deletion
    $deleteQuery = "DELETE FROM classes WHERE id = :id";
    $deleteStmt = $db->prepare($deleteQuery);
    $deleteStmt->bindParam(':id', $class_id, PDO::PARAM_INT);
    
    $log['delete_attempt'] = [
        'query' => $deleteQuery,
        'params' => ['id' => $class_id]
    ];

    $success = $deleteStmt->execute();
    $rowsAffected = $deleteStmt->rowCount();
    $log['delete_result'] = [
        'success' => $success,
        'rows_affected' => $rowsAffected
    ];

    // Re-enable foreign key checks
    $db->exec("SET FOREIGN_KEY_CHECKS=1");
    $log['foreign_key_checks'] = 'enabled';

    if (!$success || $rowsAffected === 0) {
        $errorInfo = $deleteStmt->errorInfo();
        throw new Exception("Delete operation failed: " . ($errorInfo[2] ?? 'No rows affected'));
    }

    $response = [
        'status' => 'success',
        'message' => 'Class "' . $item['class_name'] . '" deleted successfully',
        'deleted_id' => $class_id
    ];
    http_response_code(200);

} catch (PDOException $e) {
    // Ensure foreign key checks are re-enabled if error occurs
    if (isset($db)) {
        $db->exec("SET FOREIGN_KEY_CHECKS=1");
    }
    $response['message'] = "Database error: " . $e->getMessage();
    http_response_code(500);
    $log['error'] = $e->getMessage();
    error_log("PDOException: " . $e->getMessage());
} catch (Exception $e) {
    if (isset($db)) {
        $db->exec("SET FOREIGN_KEY_CHECKS=1");
    }
    $response['message'] = $e->getMessage();
    http_response_code(400);
    $log['error'] = $e->getMessage();
    error_log("Exception: " . $e->getMessage());
}

// Add debug info to response in development environment
if ($_SERVER['HTTP_HOST'] === 'localhost' || $_SERVER['SERVER_NAME'] === 'localhost') {
    $response['debug'] = $log;
}

echo json_encode($response);

// Log the complete transaction for debugging
file_put_contents('class_delete.log', date('Y-m-d H:i:s') . " - " . json_encode($log) . "\n", FILE_APPEND);
?>