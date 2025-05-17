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

try {
    // Get the raw POST data
    $json = file_get_contents('php://input');
    
    // Log the raw input for debugging
    error_log("Raw input received: " . $json);
    
    $data = json_decode($json, true);
    
    if (json_last_error() !== JSON_ERROR_NONE) {
        throw new Exception("Invalid JSON format: " . json_last_error_msg());
    }

    // Validate required field
    if (!isset($data['course_id']) || empty($data['course_id'])) {
        throw new Exception("Course ID is required and cannot be empty");
    }

    $course_id = (int)$data['course_id'];
    error_log("Attempting to delete course ID: " . $course_id);

    $database = new Database();
    $db = $database->getConnection();

    if (!$db) {
        throw new Exception("Failed to connect to database");
    }

    // First check if course exists
    $checkQuery = "SELECT id FROM courses WHERE id = :id";
    $checkStmt = $db->prepare($checkQuery);
    
    if (!$checkStmt) {
        throw new Exception("Prepare failed: " . implode(" ", $db->errorInfo()));
    }
    
    $checkStmt->bindParam(':id', $course_id, PDO::PARAM_INT);
    
    if (!$checkStmt->execute()) {
        throw new Exception("Execute failed: " . implode(" ", $checkStmt->errorInfo()));
    }

    if ($checkStmt->rowCount() === 0) {
        throw new Exception("Course not found with ID: " . $course_id);
    }

    // Check if course has any enrollments (optional safety check)
    try {
        $enrollmentQuery = "SELECT id FROM enrollments WHERE course_id = :course_id LIMIT 1";
        $enrollmentStmt = $db->prepare($enrollmentQuery);
        $enrollmentStmt->bindParam(':course_id', $course_id, PDO::PARAM_INT);
        $enrollmentStmt->execute();
        
        if ($enrollmentStmt->rowCount() > 0) {
            throw new Exception("Cannot delete course with existing enrollments");
        }
    } catch (PDOException $e) {
        // If enrollments table doesn't exist, just log and continue
        error_log("Note: enrollments table check skipped - " . $e->getMessage());
    }

    // Proceed with deletion
    $query = "DELETE FROM courses WHERE id = :id";
    $stmt = $db->prepare($query);
    
    if (!$stmt) {
        throw new Exception("Prepare failed: " . implode(" ", $db->errorInfo()));
    }
    
    $stmt->bindParam(':id', $course_id, PDO::PARAM_INT);
    
    if ($stmt->execute()) {
        $rowsAffected = $stmt->rowCount();
        
        if ($rowsAffected > 0) {
            $response = [
                'status' => 'success',
                'message' => 'Course deleted successfully',
                'deleted_id' => $course_id
            ];
            http_response_code(200);
        } else {
            throw new Exception("No rows affected - course may not have been deleted");
        }
    } else {
        $errorInfo = $stmt->errorInfo();
        throw new Exception("Delete failed: " . implode(" ", $errorInfo));
    }
} catch (PDOException $e) {
    $response['message'] = "Database error: " . $e->getMessage();
    http_response_code(500);
    error_log("PDOException: " . $e->getMessage());
} catch (Exception $e) {
    $response['message'] = $e->getMessage();
    http_response_code(400);
    error_log("Exception: " . $e->getMessage());
}

// Add debug information to response
$response['debug'] = [
    'input_data' => $data ?? null,
    'timestamp' => date('Y-m-d H:i:s')
];

echo json_encode($response);
?>