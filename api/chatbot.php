<?php
// Reject non POST requests
if ($_SERVER['REQUEST_METHOD'] != 'POST') {
    http_response_code(405);
    $chatbotResponse = array(
        "success" => false,
        "sessionID" => "999",
        "error" => "405 Method Not Allowed",
        "errorMsg" => "Sorry, only POST request is allowed."
    );
    header('Content-Type: application/json');
    echo json_encode($chatbotResponse);
    exit();
}

// Get the chat message from the POST request

$chatbotResponse = array(
    "success" => $isSuccess,
    "sessionID" => "0",
    "chatID" => "0",
    "chatFrom" => "server",
    "chatMsg" => $chatMessage
);
header('Content-Type: application/json');
echo json_encode($chatbotResponse);
exit();
?>