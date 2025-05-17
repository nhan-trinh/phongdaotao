<?php
class User {
    // Database connection and table name
    private $conn;
    private $table_name = "users";
    
    // Object properties
    public $id;
    public $name;
    public $username;
    public $password;
    public $email;
    public $role;
    public $created_at;
    
    // Constructor with database connection
    public function __construct($db) {
        $this->conn = $db;
    }
    
    // Create user
    public function create() {
        // Sanitize input
        $this->name = htmlspecialchars(strip_tags($this->name));
        $this->username = htmlspecialchars(strip_tags($this->username));
        $this->email = htmlspecialchars(strip_tags($this->email));
        $this->role = htmlspecialchars(strip_tags($this->role));
        $this->password = htmlspecialchars(strip_tags($this->password));
        
        // Hash the password
        $password_hash = password_hash($this->password, PASSWORD_BCRYPT);
        
        // Query to insert new user
        $query = "INSERT INTO " . $this->table_name . "
                SET
                    name = :name,
                    username = :username,
                    password = :password,
                    email = :email,
                    role = :role,
                    created_at = :created_at";
        
        // Prepare the query
        $stmt = $this->conn->prepare($query);
        
        // Set parameter values
        $this->created_at = date('Y-m-d H:i:s');
        
        $stmt->bindParam(':name', $this->name);
        $stmt->bindParam(':username', $this->username);
        $stmt->bindParam(':password', $password_hash);
        $stmt->bindParam(':email', $this->email);
        $stmt->bindParam(':role', $this->role);
        $stmt->bindParam(':created_at', $this->created_at);
        
        // Execute the query
        if ($stmt->execute()) {
            return true;
        }
        
        return false;
    }
    
    // Check if username exists and password is correct
    public function login() {
        // Sanitize input
        $this->username = htmlspecialchars(strip_tags($this->username));
        $this->password = htmlspecialchars(strip_tags($this->password));
        
        // Query to check if username exists
        $query = "SELECT id, name, username, password, email, role
                FROM " . $this->table_name . "
                WHERE username = ?
                LIMIT 0,1";
        
        // Prepare the query
        $stmt = $this->conn->prepare($query);
        
        // Bind the username parameter
        $stmt->bindParam(1, $this->username);
        
        // Execute the query
        $stmt->execute();
        
        // Get number of rows
        $num = $stmt->rowCount();
        
        // If username exists, verify password
        if ($num > 0) {
            // Get record details
            $row = $stmt->fetch(PDO::FETCH_ASSOC);
            
            // Set values to object properties
            $this->id = $row['id'];
            $this->name = $row['name'];
            $this->email = $row['email'];
            $this->role = $row['role'];
            
            // Verify password
            if (password_verify($this->password, $row['password'])) {
                return true;
            }
        }
        
        return false;
    }
    
    // Read single user by ID
    public function readOne() {
        // Sanitize input
        $this->id = htmlspecialchars(strip_tags($this->id));
        
        // Query to get user details
        $query = "SELECT id, name, username, email, role, created_at
                FROM " . $this->table_name . "
                WHERE id = ?
                LIMIT 0,1";
        
        // Prepare the query
        $stmt = $this->conn->prepare($query);
        
        // Bind the ID parameter
        $stmt->bindParam(1, $this->id);
        
        // Execute the query
        $stmt->execute();
        
        // Get the user details
        $row = $stmt->fetch(PDO::FETCH_ASSOC);
        
        if ($row) {
            // Set values to object properties
            $this->name = $row['name'];
            $this->username = $row['username'];
            $this->email = $row['email'];
            $this->role = $row['role'];
            $this->created_at = $row['created_at'];
            
            return true;
        }
        
        return false;
    }
    
    // Check if username already exists
    public function usernameExists() {
        // Sanitize input
        $this->username = htmlspecialchars(strip_tags($this->username));
        
        // Query to check if username exists
        $query = "SELECT id
                FROM " . $this->table_name . "
                WHERE username = ?
                LIMIT 0,1";
        
        // Prepare the query
        $stmt = $this->conn->prepare($query);
        
        // Bind the username parameter
        $stmt->bindParam(1, $this->username);
        
        // Execute the query
        $stmt->execute();
        
        // Get number of rows
        $num = $stmt->rowCount();
        
        return $num > 0;
    }
}
?>
