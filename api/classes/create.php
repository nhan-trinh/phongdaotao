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
    if (empty($data['class_name'])) {
        throw new Exception("Class name is required");
    }
    if (empty($data['semester'])) {
        throw new Exception("Semester is required");
    }
    if (empty($data['academic_year'])) {
        throw new Exception("Academic year is required");
    }

    $class_name = trim($data['class_name']);
    $course_id = !empty($data['course_id']) ? (int)$data['course_id'] : null;
    $semester = $data['semester'];
    $academic_year = $data['academic_year'];
    $start_date = !empty($data['start_date']) ? $data['start_date'] : null;
    $end_date = !empty($data['end_date']) ? $data['end_date'] : null;
    $schedule_info = $data['schedule_info'] ?? null;
    $location = $data['location'] ?? null;
    $max_students = isset($data['max_students']) ? (int)$data['max_students'] : 30;
    $status = $data['status'] ?? 'Upcoming';
    $notes = $data['notes'] ?? null;

    $database = new Database();
    $db = $database->getConnection();

    $query = "INSERT INTO classes 
        (class_name, course_id, semester, academic_year, start_date, end_date, 
         schedule_info, location, max_students, status, notes)
        VALUES 
        (:class_name, :course_id, :semester, :academic_year, :start_date, :end_date,
         :schedule_info, :location, :max_students, :status, :notes)";
    
    $stmt = $db->prepare($query);
    $stmt->bindParam(':class_name', $class_name);
    $stmt->bindParam(':course_id', $course_id);
    $stmt->bindParam(':semester', $semester);
    $stmt->bindParam(':academic_year', $academic_year);
    $stmt->bindParam(':start_date', $start_date);
    $stmt->bindParam(':end_date', $end_date);
    $stmt->bindParam(':schedule_info', $schedule_info);
    $stmt->bindParam(':location', $location);
    $stmt->bindParam(':max_students', $max_students);
    $stmt->bindParam(':status', $status);
    $stmt->bindParam(':notes', $notes);

    if ($stmt->execute()) {
        // Get the newly created class with course info
        $newClassId = $db->lastInsertId();
        $getQuery = "SELECT c.*, co.course_name, co.course_code 
                    FROM classes c
                    LEFT JOIN courses co ON c.course_id = co.id
                    WHERE c.id = :id";
        $getStmt = $db->prepare($getQuery);
        $getStmt->bindParam(':id', $newClassId);
        $getStmt->execute();
        $newClass = $getStmt->fetch(PDO::FETCH_ASSOC);

        $response = [
            'status' => 'success',
            'message' => 'Class created successfully',
            'records' => $newClass
        ];
        http_response_code(201);
    } else {
        $errorInfo = $stmt->errorInfo();
        throw new Exception("Failed to create class: " . $errorInfo[2]);
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