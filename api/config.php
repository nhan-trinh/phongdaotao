<?php
class Database {
    private $host = "localhost"; // Thay đổi nếu cần
    private $db_name = "training"; // Thay tên database của bạn
    private $username = "root"; // Thay username của bạn
    private $password = ""; // Thay password của bạn
    public $conn;

    // Phương thức kết nối database
    public function getConnection() {
        $this->conn = null;

        try {
            $this->conn = new PDO(
                "mysql:host=" . $this->host . ";dbname=" . $this->db_name, 
                $this->username, 
                $this->password
            );
            $this->conn->exec("set names utf8");
            $this->conn->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
        } catch(PDOException $exception) {
            echo "Lỗi kết nối: " . $exception->getMessage();
        }

        return $this->conn;
    }
}
?>