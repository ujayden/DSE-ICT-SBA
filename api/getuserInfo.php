<?php
require_once('config.php');

if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    http_response_code(405);
    header('Content-Type: application/json');
    echo json_encode([
        "success" => false,
        "error" => "Method Not Allowed",
        "errorMsg" => "Only GET requests are allowed. Please use a valid GET request.",
        "version" => VERSION
    ]);
    exit;
}

//Check if user has id and set userID and sessionToken
if (!isset($_GET['userID']) || !isset($_GET['sessionToken'])) {
    http_response_code(400);
    header('Content-Type: application/json');
    echo json_encode([
        "success" => false,
        "error" => "Bad Request",
        "errorMsg" => "Please provide a valid user ID and session token.",
        "version" => VERSION
    ]);
    exit;
}

$mysqli = new mysqli(DB_Host, DB_User, DB_Pass, DB_Name);

// Verify user is valid
$userID = $_GET['userID'];
$sessionToken = $_GET['sessionToken'];

if ($mysqli->connect_error) {
    http_response_code(500);
    header('Content-Type: application/json');
    echo json_encode([
        "success" => false,
        "error" => "Internal Server Error",
        "errorMsg" => "Error connecting to the database.",
        "version" => VERSION
    ]);
    exit;
}

// Delete expired sessions
$mysqli->query("DELETE FROM userloginsession WHERE sessionTokenExpDate < NOW()");

// Verify the session token
$sql = $mysqli->prepare("SELECT sessionTokenExpDate FROM userloginsession WHERE userID = ? AND sessionToken = ? AND sessionTokenExpDate > NOW()");
$sql->bind_param("ss", $userID, $sessionToken);
$sql->execute();
$result = $sql->get_result();

if ($result->num_rows === 0) {
    http_response_code(401);
    header('Content-Type: application/json');
    echo json_encode([
        "success" => false,
        "error" => "Unauthorized",
        "errorMsg" => "Invalid user ID or session token.",
        "version" => VERSION
    ]);
    exit;
}

// Fetch session data from the result
$sessionData = $result->fetch_assoc();

// Fetch user details
$usersql = $mysqli->prepare("SELECT username, email, level FROM users WHERE userID = ?");
$usersql->bind_param("s", $userID);
$usersql->execute();
$userResult = $usersql->get_result()->fetch_assoc();

if (!$userResult) {
    http_response_code(404);
    header('Content-Type: application/json');
    echo json_encode([
        "success" => false,
        "error" => "Not Found",
        "errorMsg" => "User not found.",
        "version" => VERSION
    ]);
    exit;
}

// Prepare the response
$response = [
    "success" => true,
    "fetchTime" => date("Y-m-d H:i:s"),
    "sessionToken" => $sessionToken,
    "sessionTokenExpDate" => $sessionData['sessionTokenExpDate'],
    "userID" => $userID,
    "userName" => $userResult['username'],
    "userEmail" => $userResult['email'],
    "level" => $userResult['level'],
    "detailedLevelPercentage" => 25,
    "nextTask" => 5,
    "achievements" => [
        [
            "id" => 1,
            "name" => "Welcome",
            "description" => "Welcome to your very first step",
            "image" => null,
            "date" => "2023-12-31 00:00:00"
        ]
    ]
];

// Output the response
header('Content-Type: application/json');
echo json_encode($response);

// Close the database connection
$mysqli->close();
?>
