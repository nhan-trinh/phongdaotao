<?php
class Database {
    private $host = 'localhost'; // hoặc địa chỉ IP của server MySQL
    private $db_name = 'training'; // Tên cơ sở dữ liệu
    private $username = 'root'; // Tên người dùng MySQL
    private $password = ''; // Mật khẩu MySQL (nếu có)
    public $conn;

    public function getConnection() {
        $this->conn = null;

        try {
            $this->conn = new PDO(
                "mysql:host={$this->host};dbname={$this->db_name}",
                $this->username,
                $this->password
            );
            $this->conn->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
        } catch (PDOException $exception) {
            echo "Connection error: " . $exception->getMessage();
        }

        return $this->conn;
    }
}
?>
