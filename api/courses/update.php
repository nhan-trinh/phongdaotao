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
    $json = file_get_contents('php://input');
    $data = json_decode($json, true);
    
    if (json_last_error() !== JSON_ERROR_NONE) {
        throw new Exception("Invalid JSON format");
    }

    // Validate required fields
    if (empty($data['course_id'])) {
        throw new Exception("Course ID is required");
    }
    if (empty($data['course_code'])) {
        throw new Exception("Course code is required");
    }
    if (empty($data['course_name'])) {
        throw new Exception("Course name is required");
    }
    if (!isset($data['credits'])) {
        throw new Exception("Credits are required");
    }

    $course_id = (int)$data['course_id'];
    $course_code = trim($data['course_code']);
    $course_name = trim($data['course_name']);
    $description = $data['course_description'] ?? null;
    $credits = (int)$data['credits'];
    $prerequisites = $data['prerequisites'] ?? null;
    $department = $data['department'] ?? null;
    $is_active = isset($data['is_active']) ? (int)$data['is_active'] : 1;

    $database = new Database();
    $db = $database->getConnection();

    // First check if course exists
    $checkQuery = "SELECT id FROM courses WHERE id = :id";
    $checkStmt = $db->prepare($checkQuery);
    $checkStmt->bindParam(':id', $course_id);
    $checkStmt->execute();

    if ($checkStmt->rowCount() === 0) {
        throw new Exception("Course not found");
    }

    $query = "UPDATE courses SET 
        course_code = :code,
        course_name = :name,
        course_description = :desc,
        credits = :credits,
        prerequisites = :prerequisites,
        department = :department,
        is_active = :is_active
        WHERE id = :id";
    
    $stmt = $db->prepare($query);
    $stmt->bindParam(':code', $course_code);
    $stmt->bindParam(':name', $course_name);
    $stmt->bindParam(':desc', $description);
    $stmt->bindParam(':credits', $credits);
    $stmt->bindParam(':prerequisites', $prerequisites);
    $stmt->bindParam(':department', $department);
    $stmt->bindParam(':is_active', $is_active);
    $stmt->bindParam(':id', $course_id);

    if ($stmt->execute()) {
        // Get the updated course
        $getQuery = "SELECT * FROM courses WHERE id = :id";
        $getStmt = $db->prepare($getQuery);
        $getStmt->bindParam(':id', $course_id);
        $getStmt->execute();
        $updatedCourse = $getStmt->fetch(PDO::FETCH_ASSOC);

        $response = [
            'status' => 'success',
            'message' => 'Course updated successfully',
            'data' => $updatedCourse
        ];
        http_response_code(200);
    } else {
        $errorInfo = $stmt->errorInfo();
        throw new Exception("Failed to update course: " . $errorInfo[2]);
    }
} catch (PDOException $e) {
    $response['message'] = "Database error: " . $e->getMessage();
    http_response_code(500);
    error_log($e->getMessage());
} catch (Exception $e) {
    $response['message'] = $e->getMessage();
    http_response_code(400);
}

echo json_encode($response);
?>