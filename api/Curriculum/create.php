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
    if (empty($data['title'])) {
        throw new Exception("Title is required");
    }
    if (empty($data['type'])) {
        throw new Exception("Type is required");
    }

    $title = trim($data['title']);
    $description = $data['description'] ?? null;
    $type = $data['type'];
    $course_id = !empty($data['course_id']) ? (int)$data['course_id'] : null;
    $content = $data['content'] ?? null;
    $file_path = $data['file_path'] ?? null;
    $is_active = isset($data['is_active']) ? (int)$data['is_active'] : 1;

    $database = new Database();
    $db = $database->getConnection();

    $query = "INSERT INTO curriculum 
        (title, description, type, course_id, content, file_path, is_active) 
        VALUES 
        (:title, :description, :type, :course_id, :content, :file_path, :is_active)";
    
    $stmt = $db->prepare($query);
    $stmt->bindParam(':title', $title);
    $stmt->bindParam(':description', $description);
    $stmt->bindParam(':type', $type);
    $stmt->bindParam(':course_id', $course_id);
    $stmt->bindParam(':content', $content);
    $stmt->bindParam(':file_path', $file_path);
    $stmt->bindParam(':is_active', $is_active);

    if ($stmt->execute()) {
        // Get the newly created item
        $newItemId = $db->lastInsertId();
        $getQuery = "SELECT c.*, co.course_name 
                    FROM curriculum c
                    LEFT JOIN courses co ON c.course_id = co.id
                    WHERE c.id = :id";
        $getStmt = $db->prepare($getQuery);
        $getStmt->bindParam(':id', $newItemId);
        $getStmt->execute();
        $newItem = $getStmt->fetch(PDO::FETCH_ASSOC);

        $response = [
            'status' => 'success',
            'message' => 'Curriculum item created successfully',
            'records' => $newItem
        ];
        http_response_code(201);
    } else {
        $errorInfo = $stmt->errorInfo();
        throw new Exception("Failed to create curriculum item: " . $errorInfo[2]);
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