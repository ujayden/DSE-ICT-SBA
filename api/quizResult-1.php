<?php
if ($_SERVER['REQUEST_METHOD'] != 'POST') {
    http_response_code(405);
    $response = array(
        "success" => false,
        "error" => "405 Method Not Allowed",
        "errorMsg" => "Sorry, only POST requests are allowed."
    );
    header('Content-Type: application/json');
    echo json_encode($response);
    exit();
}

require_once('config.php');

$conn = new mysqli(DB_Host, DB_User, DB_Pass, DB_Name);

if ($conn->connect_error) {
    http_response_code(500);
    $response = array(
        "success" => false,
        "error" => "500 Internal Server Error",
        "errorMsg" => "Database connection failed: " . $conn->connect_error
    );
    header('Content-Type: application/json');
    echo json_encode($response);
    exit();
}

$postData = json_decode(file_get_contents('php://input'), true);

if ($postData) {
    $userID = $conn->real_escape_string($postData['userID']);
    $quizID = $conn->real_escape_string($postData['quizID']);
    $totalScore = intval($postData['totalScore']);
    $remainTime = intval($postData['remainTime']);
    $mcScore = intval($postData['mcScore']);

    // Prepare the multiple choice answers
    $mcAnswers = $postData['mcQuiz'];
    $mcUserAnswers = [];
    foreach ($mcAnswers as $key => $value) {
        $mcUserAnswers[] = $conn->real_escape_string($value['text']);
    }

    // Prepare the SQL query
    $sql = $conn->prepare("INSERT INTO quizdata1 (userID, quizID, totalScore, remainTime, mcScore, mcUserAnswer_1, mcUserAnswer_2, mcUserAnswer_3, mcUserAnswer_4, mcUserAnswer_5, mcUserAnswer_6) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)");
    $sql->bind_param("ssiiissssss", $userID, $quizID, $totalScore, $remainTime, $mcScore, ...$mcUserAnswers);
    
    if ($sql->execute()) {
        $response = array("success" => true, "message" => "Data inserted successfully");
    } else {
        http_response_code(500);
        $response = array("success" => false, "error" => "500 Internal Server Error", "errorMsg" => "Error in executing query: " . $sql->error);
    }

    $sql->close();
} else {
    http_response_code(400);
    $response = array("success" => false, "error" => "400 Bad Request", "errorMsg" => "Invalid POST data");
}

$conn->close();

header('Content-Type: application/json');
echo json_encode($response);
?>
