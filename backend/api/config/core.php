<?php
// CORS headers
header("Access-Control-Allow-Origin: http://localhost:3000");
header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");

// Handle preflight OPTIONS request
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS");
    header("Access-Control-Allow-Headers: Content-Type, Authorization");
    http_response_code(200);
    exit;
}

// Include database connection file
require_once '../config/database.php';

// Create a response array
$response = array();

// Establish database connection
$database = new Database();
$db = $database->getConnection();

// SQL query to fetch course data
$query = "SELECT id, course_name, course_description, created_at FROM courses";  // Select only needed columns

$stmt = $db->prepare($query);

try {
    $stmt->execute();

    // Check if there are any records
    if ($stmt->rowCount() > 0) {
        $courses = array();

        // Fetch the data
        while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
            $course = array(
                'id' => $row['id'],
                'course_name' => $row['course_name'],
                'course_description' => $row['course_description'],
                'created_at' => $row['created_at']
            );
            $courses[] = $course;
        }

        // Respond with the data in JSON format
        $response['status'] = 'success';
        $response['data'] = $courses;
    } else {
        // No data found
        $response['status'] = 'error';
        $response['message'] = 'No courses found';
    }
} catch (PDOException $e) {
    // Handle any database errors
    $response['status'] = 'error';
    $response['message'] = 'Database query failed: ' . $e->getMessage();
}

// Output the response in JSON format
echo json_encode($response);

// Close the database connection
$db = null;
?>
