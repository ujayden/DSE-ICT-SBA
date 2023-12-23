<?php
// Reject non POST requests
if ($_SERVER['REQUEST_METHOD'] != 'POST') {
    http_response_code(405);
    $response = array(
        "success" => false,
        "error" => "405 Method Not Allowed",
        "errorMsg" => "Sorry, only POST request is allowed."
    );
    header('Content-Type: application/json');
    echo json_encode($response);
    exit();
}
require_once('config.php');
$payload = json_decode(file_get_contents('php://input'), true);

// Check if the request is valid
if ($payload === null) {
    http_response_code(400);
    $response = array(
        "success" => false,
        "error" => "400 Bad Request",
        "errorMsg" => "Sorry, your request is invalid."
    );
    header('Content-Type: application/json');
    echo json_encode($response);
    exit();
}

// Check if the request has all the required parameters
if (!isset($payload['mode']) || !isset($payload['name']) || !isset($payload['email']) || !isset($payload['subject']) || !isset($payload['message'])) {
    http_response_code(400);
    $response = array(
        "success" => false,
        "error" => "400 Bad Request",
        "errorMsg" => "Sorry, your request is invalid."
    );
    header('Content-Type: application/json');
    echo json_encode($response);
    exit();
}

//Switch-case to handle different modes

switch ($payload['mode']){
    case 'submitContactForm':
        handleContactForm($payload);
        break;
    default:
        // Invalid mode
        http_response_code(400);
        $response = array(
            "success" => false,
            "error" => "400 Bad Request",
            "errorMsg" => "Sorry, your request is invalid."
        );
        header('Content-Type: application/json');
        echo json_encode($response);
        exit();
}

// Reject non POST requests
if ($_SERVER['REQUEST_METHOD'] != 'POST') {
    http_response_code(405);
    $response = array(
        "success" => false,
        "error" => "405 Method Not Allowed",
        "errorMsg" => "Sorry, only POST request is allowed."
    );
    header('Content-Type: application/json');
    echo json_encode($response);
    exit();
}
require_once('config.php');
$payload = json_decode(file_get_contents('php://input'), true);

// Check if the request is valid
if ($payload === null) {
    http_response_code(400);
    $response = array(
        "success" => false,
        "error" => "400 Bad Request",
        "errorMsg" => "Sorry, your request is invalid."
    );
    header('Content-Type: application/json');
    echo json_encode($response);
    exit();
}

// Check if the request has all the required parameters
if (!isset($payload['mode']) || !isset($payload['name']) || !isset($payload['email']) || !isset($payload['subject']) || !isset($payload['message'])) {
    http_response_code(400);
    $response = array(
        "success" => false,
        "error" => "400 Bad Request",
        "errorMsg" => "Sorry, your request is invalid."
    );
    header('Content-Type: application/json');
    echo json_encode($response);
    exit();
}

// Switch-case to handle different modes

switch ($payload['mode']) {
    case 'submitContactForm':
        handleContactForm($payload);
        break;
    default:
        // Invalid mode
        http_response_code(400);
        $response = array(
            "success" => false,
            "error" => "400 Bad Request",
            "errorMsg" => "Sorry, your request is invalid."
        );
        header('Content-Type: application/json');
        echo json_encode($response);
        exit();
}

function handleContactForm($payload){
    $conn = new mysqli(DB_Host, DB_User, DB_Pass, DB_Name);

    // Check the connection
    if ($conn->connect_error) {
        $response = array(
            "success" => false,
            "error" => "500 Internal Server Error",
            "errorMsg" => "Database connection error."
        );
        header('Content-Type: application/json');
        echo json_encode($response);
        exit();
    }

    // Sanitize user inputs to prevent SQL injection
    $mode = "contact_form_ask_for_contact";
    $name = $conn->real_escape_string($payload['name']);
    $email = $conn->real_escape_string($payload['email']);
    $subject = $conn->real_escape_string($payload['subject']);
    $message = $conn->real_escape_string($payload['message']);
    $currentTime = date("Y-m-d H:i:s");


    // Insert data into the database
    $query = "INSERT INTO `user_feedback` (`mode`, `name`, `email`, `subject`, `message`, `created_at`) VALUES ('$mode', '$name', '$email', '$subject', '$message', '$currentTime')";

    if ($conn->query($query) === TRUE) {
        // Successful insertion
        $response = array("success" => true);
    } else {
        // Error during insertion
        $response = array(
            "success" => false,
            "error" => "500 Internal Server Error",
            "errorMsg" => "Error saving to the database."
        );
    }

    // Respond with JSON
    header('Content-Type: application/json');
    echo json_encode($response);
    exit();
}

