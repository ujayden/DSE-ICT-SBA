<?php
    require_once('config.php');
    $conn = new mysqli(DB_Host, DB_User, DB_Pass, DB_Name);
    if ($conn->connect_error) {
        die("Connection failed: " . $conn->connect_error);
    }
    $sql = "SELECT * FROM users";
    $result = $conn->query($sql);
    echo json_encode($result->fetch_all(MYSQLI_ASSOC));
    
?>
