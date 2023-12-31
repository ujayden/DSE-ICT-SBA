<?php
if ($_SERVER['REQUEST_METHOD'] != 'POST') {
    http_response_code(405);
    $response = array(
        "success" => false,
        "sessionID" => "999",
        "error" => "405 Method Not Allowed",
        "errorMsg" => "Sorry, only POST request is allowed."
    );
    header('Content-Type: application/json');
    echo json_encode($chatbotResponse);
    exit();
}
require_once('config.php');
