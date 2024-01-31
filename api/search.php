<?php
require_once 'config.php';

// Check if the request method is GET
if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    http_response_code(405);
    header('Content-Type: application/json');
    echo json_encode([
        "success" => false,
        "error" => "Method Not Allowed",
        "errorMsg" => "Only GET requests are allowed. Please use a valid GET request."
    ]);
    exit;
}

// Check if the search term and page number are provided
if (isset($_GET['searchTerm']) && isset($_GET['page'])) {
    $searchTerm = $_GET['searchTerm'];
    $page = $_GET['page'];
    $resultsPerPage = 10;

    // Perform the search query
    $conn = new mysqli(DB_Host, DB_User, DB_Pass, DB_Name);

    if ($conn->connect_error) {
        http_response_code(500);
        header('Content-Type: application/json');
        echo json_encode([
            "success" => false,
            "error" => "Database Connection Error",
            "errorMsg" => "Failed to connect to the database."
        ]);
        exit;
    }

    $searchTerm = $conn->real_escape_string($searchTerm);

    // Count the total number of results
    $countSql = "SELECT COUNT(*) AS totalResults FROM webcontent WHERE Content LIKE '%$searchTerm%'";
    $countResult = $conn->query($countSql);
    $totalResults = $countResult->fetch_assoc()['totalResults'];

    // Calculate the total number of pages
    $totalPages = ceil($totalResults / $resultsPerPage);

    // Calculate the offset based on the current page
    $offset = ($page - 1) * $resultsPerPage;

    // Retrieve the search results for the current page
    $sql = "SELECT * FROM webcontent WHERE Content LIKE '%$searchTerm%' LIMIT $offset, $resultsPerPage";
    $result = $conn->query($sql);

    $searchResults = [];

    if ($result->num_rows > 0) {
        while ($row = $result->fetch_assoc()) {
            // Add search results to the array
            $searchResults[] = [
                'title' => $row['Title'],
                'url' => $row['URL'],
                'content' => substr($row['Content'], 0, 500),
                'hashtag' => $row['Hashtag'],
                'updateTime' => $row['UpdateTime']
            ];
        }
    }

    $conn->close();

    // Return the search results as JSON
    header('Content-Type: application/json');
    echo json_encode([
        "success" => true,
        "terms" => $searchTerm,
        "currentPage" => $page,
        "resultsPerPage" => $resultsPerPage,
        "totalResults" => $totalResults,
        "totalPages" => $totalPages,
        "result" => $searchResults
    ]);
    exit;
}

// Return an error response if the search term or page number is not provided
http_response_code(400);
header('Content-Type: application/json');
echo json_encode([
    "success" => false,
    "error" => "Bad Request",
    "errorMsg" => "Search term and page number are required. Please provide a valid search term and page number."
]);
?>