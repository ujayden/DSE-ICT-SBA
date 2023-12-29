<?php
require_once 'config.php';

// Database connection
function callDatabase() {
    $conn = new mysqli(DB_Host, DB_User, DB_Pass, DB_Name);
    if ($conn->connect_error) {
        die("Connection failed: " . $conn->connect_error);
    }
    return $conn;
}

// Function to get username from userSysID
function getUserNameFromID($id) {
    static $cacheIDtoName = [];

    if (isset($cacheIDtoName[$id])) {
        return $cacheIDtoName[$id];
    }

    $conn = callDatabase();
    $sql = $conn->prepare("SELECT username FROM Users WHERE userSysID = ?");
    $sql->bind_param("i", $id);
    $sql->execute();
    $result = $sql->get_result();

    if ($result->num_rows > 0) {
        $row = $result->fetch_assoc();
        $cacheIDtoName[$id] = $row['username'];
        return $row['username'];
    } else {
        return "Unknown"; 
    }
}

function createNewPost($jsonPayload) {
    $conn = callDatabase();

    // Validate required fields
    if (!isset($jsonPayload['title'], $jsonPayload['category'], $jsonPayload['content'], $jsonPayload['userID'], $jsonPayload['sessionToken'])) {
        callErrorHandling("Missing required fields");
        return; // Stop execution
    }

    $title = $jsonPayload['title'];
    $category = $jsonPayload['category'];
    $content = $jsonPayload['content'];
    $tags = $jsonPayload['tags'] ?? '';
    $userID = $jsonPayload['userID'];
    $sessionToken = $jsonPayload['sessionToken'];

    $userIDinSysID = $conn->prepare("SELECT userSysID FROM Users WHERE userID = ?");
    $userIDinSysID->bind_param("s", $userID);
    $userIDinSysID->execute();
    $result = $userIDinSysID->get_result();


    // Check user session
    if (!validateUserSession($userIDinSysID, $sessionToken, $conn)) {
        callErrorHandling("Invalid user or session token");
        return; // Stop execution
    }

    // Prepend tags to content if not empty
    if (!empty($tags)) {
        $content = $tags . "\n" . $content;
    }

    $postDate = date('Y-m-d H:i:s'); 

    // Prepare SQL to insert the new post
    $sql = $conn->prepare("INSERT INTO df_post (postTitle, postContent, postDate, postAuthor, channelID) VALUES (?, ?, ?, ?, ?)");
    $sql->bind_param("ssssi", $title, $content, $postDate, $userID, $category);

    // Execute the query
    if ($sql->execute()) {
        echo json_encode(["success" => true, "message" => "Post created successfully"]);
    } else {
        echo json_encode(["success" => false, "message" => "Failed to create post"]);
    }

    $sql->close();
}
function validateUserSession($userID, $sessionToken, $conn) {
    // Prepare SQL to check the user session
    $sql = $conn->prepare("
        SELECT user_sessions.userSysID 
        FROM userloginsession AS user_sessions
        INNER JOIN users AS user_accounts ON user_sessions.userSysID = user_accounts.userSysID
        WHERE user_accounts.userID = ? AND user_sessions.sessionToken = ?
    ");
    $sql->bind_param("ss", $userID, $sessionToken);
    $sql->execute();
    $result = $sql->get_result();

    if ($result->num_rows > 0) {
        // Session is valid
        $row = $result->fetch_assoc();
        return true;
    } else {
        // Session is invalid
        callErrorHandling("Invalid user or session token");
        return false;
    }
}



function postReply($jsonPayload) {
    $conn = callDatabase();

    // Validate required fields
    if (!isset($jsonPayload['title'], $jsonPayload['category'], $jsonPayload['content'], $jsonPayload['userID'], $jsonPayload['sessionToken'], $jsonPayload['replyPostID'])) {
        callErrorHandling("Missing required fields");
        return; // Stop execution
    }

    $title = $jsonPayload['title'];
    $category = $jsonPayload['category'];
    $content = $jsonPayload['content'];
    $tags = $jsonPayload['tags'] ?? '';
    $userID = $jsonPayload['userID'];
    $sessionToken = $jsonPayload['sessionToken'];
    $replyPostID = $jsonPayload['replyPostID'];

    // Check user session
    if (!validateUserSession($userID, $sessionToken, $conn)) {
        callErrorHandling("Invalid user or session token");
        return; // Stop execution
    }

    // Prepend tags to content if not empty
    if (!empty($tags)) {
        $content = $tags . "\n" . $content;
    }

    $postDate = date('Y-m-d H:i:s'); 

    // Prepare SQL to insert the new reply
    $sql = $conn->prepare("INSERT INTO df_post (postTitle, postContent, postDate, postAuthor, channelID, replyID) VALUES (?, ?, ?, ?, ?, ?)");
    $sql->bind_param("ssssii", $title, $content, $postDate, $userID, $category, $replyPostID);

    // Execute the query
    if ($sql->execute()) {
        echo json_encode(["success" => true, "message" => "Reply posted successfully"]);
    } else {
        echo json_encode(["success" => false, "message" => "Failed to post reply"]);
    }

    $sql->close();
}


function updateVote($jsonPayload) {
    if (!isset($jsonPayload['postSysID']) || !is_numeric($jsonPayload['postSysID'])) {
        callErrorHandling("Invalid or missing postSysID");
        return false; 
    }

    $postSysID = $jsonPayload['postSysID'];

    $response = [
        "success" => true,
        "postSysID" => $postSysID,
        "netVoteCount" => "-",
        "message" => "Sorry, vote system is not available now"
    ];

    header('Content-Type: application/json');
    echo json_encode($response);
}

function viewPostDetail($postID) {
    $conn = callDatabase();

    $sql = $conn->prepare("
        SELECT postSysID, postID, postTitle, postContent, postDate, postAuthor, votes
        FROM df_post
        WHERE postID = ? OR replyID = ?
        ORDER BY postSysID ASC
    ");

    $sql->bind_param("ii", $postID, $postID);
    $sql->execute();
    $result = $sql->get_result();

    $content = [];
    $postTitle = "";

    while ($row = $result->fetch_assoc()) {
        $postAuthorName = getUserNameFromID($row['postAuthor']);

        $postItem = [
            "postAuthor" => $postAuthorName,
            "postDate" => $row['postDate'],
            "postTitle" => $row['postTitle'],
            "postContent" => $row['postContent'],
            "postSysID" => $row['postSysID'],
            "votes" => $row['votes']
        ];

        // Set the main post title
        if ($postTitle === "" && $row['postID'] == $postID) {
            $postTitle = $row['postTitle'];
        }

        // Add the post item to the content array
        $content[] = $postItem;
    }

    // Prepare the response
    $response = [
        "success" => true,
        "postID" => $postID,
        "postTitle" => $postTitle,
        "content" => $content
    ];

    // Send the JSON response
    header('Content-Type: application/json');
    echo json_encode($response);
}


function loadPostList($channel, $searchTerms, $page) {
    //Check if page is a number
    if (!is_numeric($page) || $page < 1) {
        $page = 1;
    }
    //Check if channel is in acceptable word list and search terms is present
    if (!in_array($channel, ["general", "beginner", "basic", "advanced", "expert"]) || $searchTerms == "") {
        callErrorHandling("Invalid channel or search terms");
    }


    $conn = callDatabase();
    $postsPerPage = 20; 
    $pageOffset = ($page - 1) * $postsPerPage;
    $sql_SearchTeams = "%$searchTerms%";

    $sql = $conn->prepare("SELECT df_post.postID, df_post.postTitle, df_post.postContent, df_post.postDate, df_post.postAuthor, df_post.votes, df_post.views,
        (SELECT COUNT(*) FROM df_post as replyCount WHERE replyCount.replyID = df_post.postID) as replyCount,
        (SELECT MAX(latestReply.postDate) FROM df_post as latestReply WHERE latestReply.replyID = df_post.postID) as latestReplyDate,
        (SELECT postAuthor FROM df_post as latestReplyAuthor WHERE latestReplyAuthor.replyID = df_post.postID ORDER BY latestReplyAuthor.postDate DESC LIMIT 1) as latestReplyAuthor
        FROM df_post
        WHERE df_post.channelID = ? AND df_post.postTitle LIKE ? AND df_post.replyID = 0
        ORDER BY df_post.postDate DESC
        LIMIT ?, ?");

    $sql->bind_param("ssii", $channel, $sql_SearchTeams, $pageOffset, $postsPerPage);

    $sql->execute();

    $result = $sql->get_result();
    $posts = [];
    while ($row = $result->fetch_assoc()) {
        // Fetch the username of the post author and the last reply author
        $postAuthorName = getUserNameFromID($row['postAuthor']);
        $lastReplyAuthorName = getUserNameFromID($row['latestReplyAuthor']);
    
        // Prepare the post content preview (if needed, truncate it to a certain length)
        $postContentPreview = substr($row['postContent'], 0, 200); // Example: truncate to 200 characters
    
        // Create an array for each post
        $postItem = [
            "postTitle" => $row['postTitle'],
            "postDate" => $row['postDate'],
            "postAuthor" => $postAuthorName, // Assuming you want to display the author's name
            "postContentPreview" => $postContentPreview,
            "postID" => $row['postID'],
            "lastReplyTime" => $row['latestReplyDate'],
            "lastReplyAuthor" => $lastReplyAuthorName, // Assuming you want to display the last reply author's name
            "votes" => $row['votes'],
            "views" => $row['views'],
            "comments" => $row['replyCount']
        ];
    
        // Add the post item to the posts array
        $posts[] = $postItem;
    }    

    $sqlCount = $conn->prepare("SELECT COUNT(DISTINCT postID) FROM df_post WHERE channelID = ? AND postTitle LIKE ?");
    $sqlCount->bind_param("ss", $channel, $sql_SearchTeams);
    $sqlCount->execute();
    $resultCount = $sqlCount->get_result();
    $totalPosts = $resultCount->fetch_assoc()['COUNT(DISTINCT postID)'];
    $totalPages = ceil($totalPosts / $postsPerPage);
    
    $response = [
        "success" => true,
        "searchTerm" => $searchTerms,
        "inChannel" => $channel,
        "page" => $page,
        "totalPages" => $totalPages,
        "returnedPost" => $posts
    ];

    header('Content-Type: application/json');
    echo json_encode($response);
}


function callErrorHandling($message) {
    http_response_code(400);
    header('Content-Type: application/json');
    echo json_encode(["success" => false, "errorMsg" => $message]);
    exit;
}

// Main request handling
$method = $_SERVER['REQUEST_METHOD'];

if ($method === 'POST') {
    // Decode the JSON payload
    $jsonPayload = json_decode(file_get_contents('php://input'), true);
    
    if (isset($jsonPayload['mode'])) {
        switch ($jsonPayload['mode']) {
            case 'newPost':
                createNewPost($jsonPayload);
                break;
            case 'reply':
                postReply($jsonPayload);
                break;
            case 'updateVote':
                updateVote($jsonPayload);
                break;
            default:
                callErrorHandling("Invalid mode in POST request");
                break;
        }
    } else {
        callErrorHandling("Missing mode in POST request");
    }
} elseif ($method === 'GET') {
    if (isset($_GET['postID'])) {
        viewPostDetail($_GET['postID']);
    } elseif (isset($_GET['searchTerms'])) {
        loadPostList($_GET['channel'], $_GET['searchTerms'], $_GET['page']);
    } else {
        callErrorHandling("Invalid GET request", );
    }
} else {
    callErrorHandling("Invalid request method");
}
?>
