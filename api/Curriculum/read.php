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

    // Check if specific item is requested
    if (isset($_GET['id'])) {
        $id = (int)$_GET['id'];
        $query = "SELECT c.*, co.course_name 
                 FROM curriculum c
                 LEFT JOIN courses co ON c.course_id = co.id
                 WHERE c.id = :id";
        $stmt = $db->prepare($query);
        $stmt->bindParam(':id', $id, PDO::PARAM_INT);
        $stmt->execute();
        
        $item = $stmt->fetch(PDO::FETCH_ASSOC);
        
        if ($item) {
            $response = [
                'status' => 'success',
                'data' => $item
            ];
        } else {
            $response['message'] = 'Curriculum item not found';
            http_response_code(404);
        }
    } else {
        // Get all curriculum items with course names
        $query = "SELECT c.id as curriculum_id, c.title, c.description, c.type, 
                 c.course_id, c.content, c.file_path, c.is_active, c.created_at,
                 co.course_name, co.course_code
                 FROM curriculum c
                 LEFT JOIN courses co ON c.course_id = co.id
                 ORDER BY c.created_at DESC";
        
        $stmt = $db->prepare($query);
        $stmt->execute();
        
        $items = $stmt->fetchAll(PDO::FETCH_ASSOC);
        
        $response = [
            'status' => 'success',
            'records' => $items
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