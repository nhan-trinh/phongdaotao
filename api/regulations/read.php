<?php
// CORS headers
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With");
header("Content-Type: application/json; charset=UTF-8");

// Handle preflight OPTIONS request
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

// Include database connection
require_once '../config.php';

// Create response array
$response = ['status' => 'error', 'message' => ''];

try {
    $database = new Database();
    $db = $database->getConnection();

    // Kiểm tra nếu có id trong request (cho trường hợp edit)
    if (isset($_GET['id'])) {
        $id = $_GET['id'];
        $query = "SELECT * FROM courses WHERE id = :id";
        $stmt = $db->prepare($query);
        $stmt->bindParam(':id', $id);
        $stmt->execute();
        $course = $stmt->fetch(PDO::FETCH_ASSOC);
        
        if ($course) {
            $response = [
                'status' => 'success',
                'data' => $course
            ];
        } else {
            $response['message'] = 'Course not found';
        }
    } else {
        // Lấy tất cả courses
        $query = "SELECT id as course_id, course_code, course_name, 
                 course_description as description, credits, 
                 prerequisites, department, 
                 is_active, created_at 
                 FROM courses";
        $stmt = $db->prepare($query);
        $stmt->execute();

        $courses = $stmt->fetchAll(PDO::FETCH_ASSOC);
        
        if ($courses) {
            $response = [
                'status' => 'success',
                'records' => $courses
            ];
        } else {
            $response['message'] = 'No courses found';
        }
    }
} catch(PDOException $e) {
    // ... phần catch giữ nguyên ...
}

// Output JSON response
echo json_encode($response);
?>