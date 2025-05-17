<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");
header("Content-Type: application/json; charset=UTF-8");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

require_once '../config.php';

$response = ['status' => 'error', 'message' => ''];

try {
    $database = new Database();
    $db = $database->getConnection();

    // Check if specific class is requested
    if (isset($_GET['id'])) {
        $id = (int)$_GET['id'];
        $query = "SELECT c.*, co.course_name, co.course_code 
                 FROM classes c
                 LEFT JOIN courses co ON c.course_id = co.id
                 WHERE c.id = :id";
        $stmt = $db->prepare($query);
        $stmt->bindParam(':id', $id, PDO::PARAM_INT);
        $stmt->execute();
        
        $class = $stmt->fetch(PDO::FETCH_ASSOC);
        
        if ($class) {
            $response = [
                'status' => 'success',
                'data' => $class
            ];
        } else {
            $response['message'] = 'Class not found';
            http_response_code(404);
        }
    } else {
        // Get all classes with course information
        $query = "SELECT c.id as class_id, c.class_name, c.semester, c.academic_year, 
                 c.start_date, c.end_date, c.status, c.location, c.max_students,
                 co.course_name, co.course_code, co.id as course_id
                 FROM classes c
                 LEFT JOIN courses co ON c.course_id = co.id
                 ORDER BY c.start_date DESC, c.class_name ASC";
        
        $stmt = $db->prepare($query);
        $stmt->execute();
        
        $classes = $stmt->fetchAll(PDO::FETCH_ASSOC);
        
        $response = [
            'status' => 'success',
            'records' => $classes
        ];
    }
} catch(PDOException $e) {
    $response['message'] = 'Database error: ' . $e->getMessage();
    error_log($e->getMessage());
    http_response_code(500);
} catch(Exception $e) {
    $response['message'] = 'Error: ' . $e->getMessage();
    http_response_code(400);
}

echo json_encode($response);
?>