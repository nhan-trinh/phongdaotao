<?php
class Course {
    // Database connection and table name
    private $conn;
    private $table_name = "courses";
    
    // Object properties
    public $course_id;
    public $course_code;
    public $course_name;
    public $credits;
    public $description;
    public $prerequisites;
    public $department;
    public $is_active;
    public $created_at;
    public $updated_at;
    
    // Constructor with database connection
    public function __construct($db) {
        $this->conn = $db;
    }
    
    // Create course
    public function create() {
        // Sanitize input
        $this->course_code = htmlspecialchars(strip_tags($this->course_code));
        $this->course_name = htmlspecialchars(strip_tags($this->course_name));
        $this->credits = htmlspecialchars(strip_tags($this->credits));
        $this->description = htmlspecialchars(strip_tags($this->description));
        $this->prerequisites = htmlspecialchars(strip_tags($this->prerequisites));
        $this->department = htmlspecialchars(strip_tags($this->department));
        $this->is_active = htmlspecialchars(strip_tags($this->is_active));
        
        // Query to insert new course
        $query = "INSERT INTO " . $this->table_name . "
                SET
                    course_code = :course_code,
                    course_name = :course_name,
                    credits = :credits,
                    description = :description,
                    prerequisites = :prerequisites,
                    department = :department,
                    is_active = :is_active,
                    created_at = :created_at,
                    updated_at = :updated_at";
        
        // Prepare the query
        $stmt = $this->conn->prepare($query);
        
        // Set parameter values
        $this->created_at = date('Y-m-d H:i:s');
        $this->updated_at = date('Y-m-d H:i:s');
        
        $stmt->bindParam(':course_code', $this->course_code);
        $stmt->bindParam(':course_name', $this->course_name);
        $stmt->bindParam(':credits', $this->credits);
        $stmt->bindParam(':description', $this->description);
        $stmt->bindParam(':prerequisites', $this->prerequisites);
        $stmt->bindParam(':department', $this->department);
        $stmt->bindParam(':is_active', $this->is_active);
        $stmt->bindParam(':created_at', $this->created_at);
        $stmt->bindParam(':updated_at', $this->updated_at);
        
        // Execute the query
        if ($stmt->execute()) {
            $this->course_id = $this->conn->lastInsertId();
            return true;
        }
        
        return false;
    }
    
    // Read all courses
    public function read() {
        // Query to get all courses
        $query = "SELECT * FROM " . $this->table_name . " ORDER BY course_code ASC";
        
        // Prepare the query
        $stmt = $this->conn->prepare($query);
        
        // Execute the query
        $stmt->execute();
        
        return $stmt;
    }
    
    // Read single course
    public function readOne() {
        // Sanitize input
        $this->course_id = htmlspecialchars(strip_tags($this->course_id));
        
        // Query to get a single course
        $query = "SELECT * FROM " . $this->table_name . " WHERE course_id = ? LIMIT 0,1";
        
        // Prepare the query
        $stmt = $this->conn->prepare($query);
        
        // Bind the ID parameter
        $stmt->bindParam(1, $this->course_id);
        
        // Execute the query
        $stmt->execute();
        
        // Get the course details
        $row = $stmt->fetch(PDO::FETCH_ASSOC);
        
        if ($row) {
            // Set values to object properties
            $this->course_code = $row['course_code'];
            $this->course_name = $row['course_name'];
            $this->credits = $row['credits'];
            $this->description = $row['description'];
            $this->prerequisites = $row['prerequisites'];
            $this->department = $row['department'];
            $this->is_active = $row['is_active'];
            $this->created_at = $row['created_at'];
            $this->updated_at = $row['updated_at'];
            
            return true;
        }
        
        return false;
    }
    
    // Update course
    public function update() {
        // Sanitize input
        $this->course_id = htmlspecialchars(strip_tags($this->course_id));
        $this->course_code = htmlspecialchars(strip_tags($this->course_code));
        $this->course_name = htmlspecialchars(strip_tags($this->course_name));
        $this->credits = htmlspecialchars(strip_tags($this->credits));
        $this->description = htmlspecialchars(strip_tags($this->description));
        $this->prerequisites = htmlspecialchars(strip_tags($this->prerequisites));
        $this->department = htmlspecialchars(strip_tags($this->department));
        $this->is_active = htmlspecialchars(strip_tags($this->is_active));
        
        // Query to update course
        $query = "UPDATE " . $this->table_name . "
                SET
                    course_code = :course_code,
                    course_name = :course_name,
                    credits = :credits,
                    description = :description,
                    prerequisites = :prerequisites,
                    department = :department,
                    is_active = :is_active,
                    updated_at = :updated_at
                WHERE
                    course_id = :course_id";
        
        // Prepare the query
        $stmt = $this->conn->prepare($query);
        
        // Set parameter values
        $this->updated_at = date('Y-m-d H:i:s');
        
        $stmt->bindParam(':course_code', $this->course_code);
        $stmt->bindParam(':course_name', $this->course_name);
        $stmt->bindParam(':credits', $this->credits);
        $stmt->bindParam(':description', $this->description);
        $stmt->bindParam(':prerequisites', $this->prerequisites);
        $stmt->bindParam(':department', $this->department);
        $stmt->bindParam(':is_active', $this->is_active);
        $stmt->bindParam(':updated_at', $this->updated_at);
        $stmt->bindParam(':course_id', $this->course_id);
        
        // Execute the query
        if ($stmt->execute()) {
            return true;
        }
        
        return false;
    }
    
    // Delete course
    public function delete() {
        // Sanitize input
        $this->course_id = htmlspecialchars(strip_tags($this->course_id));
        
        // Query to delete course
        $query = "DELETE FROM " . $this->table_name . " WHERE course_id = ?";
        
        // Prepare the query
        $stmt = $this->conn->prepare($query);
        
        // Bind the ID parameter
        $stmt->bindParam(1, $this->course_id);
        
        // Execute the query
        if ($stmt->execute()) {
            return true;
        }
        
        return false;
    }
    
    // Search courses
    public function search($keywords) {
        // Sanitize input
        $keywords = htmlspecialchars(strip_tags($keywords));
        $keywords = "%{$keywords}%";
        
        // Query to search courses
        $query = "SELECT *
                FROM " . $this->table_name . "
                WHERE
                    course_code LIKE ? OR
                    course_name LIKE ? OR
                    description LIKE ?
                ORDER BY
                    course_code ASC";
        
        // Prepare the query
        $stmt = $this->conn->prepare($query);
        
        // Bind the search parameters
        $stmt->bindParam(1, $keywords);
        $stmt->bindParam(2, $keywords);
        $stmt->bindParam(3, $keywords);
        
        // Execute the query
        $stmt->execute();
        
        return $stmt;
    }
    
    // Check if course code already exists
    public function codeExists() {
        // Sanitize input
        $this->course_code = htmlspecialchars(strip_tags($this->course_code));
        
        // Query to check if course code exists
        $query = "SELECT course_id
                FROM " . $this->table_name . "
                WHERE course_code = ?
                LIMIT 0,1";
        
        // Prepare the query
        $stmt = $this->conn->prepare($query);
        
        // Bind the course code parameter
        $stmt->bindParam(1, $this->course_code);
        
        // Execute the query
        $stmt->execute();
        
        // Get number of rows
        $num = $stmt->rowCount();
        
        return $num > 0;
    }
}
?>
