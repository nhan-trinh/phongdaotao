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
    if (empty($data['course_code'])) {
        throw new Exception("Course code is required");
    }
    if (empty($data['course_name'])) {
        throw new Exception("Course name is required");
    }
    if (!isset($data['credits'])) {
        throw new Exception("Credits are required");
    }

    $course_code = trim($data['course_code']);
    $course_name = trim($data['course_name']);
    $description = $data['course_description'] ?? null;
    $credits = (int)$data['credits'];
    $prerequisites = $data['prerequisites'] ?? null;
    $department = $data['department'] ?? null;
    $is_active = isset($data['is_active']) ? (int)$data['is_active'] : 1;

    $database = new Database();
    $db = $database->getConnection();

    $query = "INSERT INTO courses 
        (course_code, course_name, course_description, credits, prerequisites, department, is_active) 
        VALUES 
        (:code, :name, :desc, :credits, :prerequisites, :department, :is_active)";
    
    $stmt = $db->prepare($query);
    $stmt->bindParam(':code', $course_code);
    $stmt->bindParam(':name', $course_name);
    $stmt->bindParam(':desc', $description);
    $stmt->bindParam(':credits', $credits);
    $stmt->bindParam(':prerequisites', $prerequisites);
    $stmt->bindParam(':department', $department);
    $stmt->bindParam(':is_active', $is_active);

    if ($stmt->execute()) {
        // Get the newly created course
        $newCourseId = $db->lastInsertId();
        $getQuery = "SELECT * FROM courses WHERE id = :id";
        $getStmt = $db->prepare($getQuery);
        $getStmt->bindParam(':id', $newCourseId);
        $getStmt->execute();
        $newCourse = $getStmt->fetch(PDO::FETCH_ASSOC);

        $response = [
            'status' => 'success',
            'message' => 'Course created successfully',
            'records' => $newCourse
        ];
        http_response_code(201);
    } else {
        $errorInfo = $stmt->errorInfo();
        throw new Exception("Failed to create course: " . $errorInfo[2]);
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