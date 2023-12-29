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
require_once('config.php');
$payload = json_decode(file_get_contents('php://input'), true);

// Get the chat message from the POST request
if (isset($payload['chatMsg'])) {
    $userInput = $payload['chatMsg'];
} else {
    http_response_code(400);
    $chatbotResponse = array(
        "success" => false,
        "sessionID" => "999",
        "error" => "400 Bad Request",
        "errorMsg" => "Sorry, chat message is not provided.",
        //Current Payload
        "yourPayload" => $payload
    );
    header('Content-Type: application/json');
    echo json_encode($chatbotResponse);
    exit();
}

$userInput = strtolower($userInput);
function randomReplies($replies) {
    $randomIndex = array_rand($replies);
    return $replies[$randomIndex];
}

// Define the chatbot responses
function checkMatchScheme($userInput, $keywords) {
    $pattern = '/\b(' . implode('|', array_map('preg_quote', $keywords)) . ')\b/i';
    $result = preg_match($pattern, $userInput);
    return (bool) $result;
}
function checkQuizNoInChat($userInput) {
    // Regular expression pattern to match the quiz number
    $pattern = '/quiz\s+(\d+)/i';

    // Perform the regular expression match
    if (preg_match($pattern, $userInput, $matches)) {
        // Extract the quiz number from the matched results
        $quizNumber = $matches[1];
        return $quizNumber;
    }
    // Return null if no quiz number is found
    return null;
}
function checkQuizQuestionIDInChat($userInput) {
    // Regular expression pattern to match the quiz question ID
    $pattern = '/question\s+(\d+)/i';

    // Perform the regular expression match
    if (preg_match($pattern, $userInput, $matches)) {
        // Extract the quiz question ID from the matched results
        $quizQuestionID = $matches[1];
        return $quizQuestionID;
    }
    // Return null if no quiz question ID is found
    return null;
}
function checkQuestionNoInChat($userInput) {
    // Regular expression pattern to match the question number
    $pattern = '/q(?:uestion)?\s*(\d+)/i';

    // Perform the regular expression match
    if (preg_match($pattern, $userInput, $matches)) {
        // Extract the question number from the matched results
        $questionNumber = $matches[1];
        return $questionNumber;
    }

    // Return null if no question number is found
    return null;
}
//TODO: Define 3 functions for navigation, solving step and hint
function askForHint($userInput) {
    //TODO: Check what quiz is the user asking for hint
    $quizNumber = checkQuizNoInChat($userInput);
    $quizQuestionID = checkQuizQuestionIDInChat($userInput);
    //TODO: Check if the quiz number is valid
    if ($quizNumber != null) {
        //If quizQuestionID is not null, then the user is asking for hint for a specific question
        //Else the user is asking for hint for the whole quiz
        //TODO: Check the answer of the question from the ../learning/quizData/quiz<quizNumber>.json
        $quizData = null;
        try {
            $quizData = file_get_contents("../learning/quizData/quiz" . $quizNumber . ".json");
        }catch(Exception $e){
            return array('Sorry, I cannot find the quiz in your question. Maybe your quiz number is wrong?');
        }finally{
            if($quizData == null){
                return array('Sorry, I cannot find the quiz in your question. Maybe your quiz number is wrong?');
            }
        }
        $quizData = json_decode($quizData, true);
        if ($quizQuestionID != null) {
            //User is asking for hint for a specific question
            $hint = $quizData["mcQuiz"][$quizQuestionID]["hint"];
            if ($hint != null) {
                return array('The hint for question ' . $quizQuestionID . ' is: ' . $hint);
            } else {
                $hint = $quizData["LongQuiz"][$quizQuestionID]["hint"];
                if ($hint != null) {
                    return array('The hint for question ' . $quizQuestionID . ' is: ' . $hint);
                } else {
                    return array ('Sorry, I cannot find the hint in your question. Maybe use format like "How to solve quiz 1 of question 2?"');
                }
            }
        } else {
            //User is asking for hint for the whole quiz
            $hint = $quizData["hint"];
            if ($hint != null) {
                return array($hint);
            } else {
                return false;
            }
        }
    }else{
        return array('Sorry, I cannot find the quiz in your question. Maybe use format like "How to solve quiz 1 of question 2?"');
    }
}
function askForSolvingStep($userInput) {
    // TODO: Check what quiz is the user asking for solving steps
    $quizNumber = checkQuizNoInChat($userInput);
    $quizQuestionID = checkQuizQuestionIDInChat($userInput);
    
    // TODO: Check if the quiz number is valid
    if ($quizNumber != null) {
        // If quizQuestionID is not null, then the user is asking for solving steps for a specific question        
        // TODO: Check the answer of the question from the ../learning/quizData/quiz<quizNumber>.json
        $quizData = null;
        try {
            $quizData = file_get_contents("../learning/quizData/quiz" . $quizNumber . ".json");
        }catch(Exception $e){
            return array('Sorry, I cannot find the quiz in your question. Maybe your quiz number is wrong?');
        }finally{
            if($quizData == null){
                return array('Sorry, I cannot find the quiz in your question. Maybe your quiz number is wrong?');
            }
        }
        $quizData = json_decode($quizData, true);

        if ($quizQuestionID != null) {
            // User is asking for solving steps for a specific question
            $solvingSteps = $quizData["mcQuiz"][$quizQuestionID]["solvingSteps"];
            if ($solvingSteps != null) {
                $solvingSteps = $quizData["LongQuiz"][$quizQuestionID]["solvingSteps"];
                if ($solvingSteps != null) {
                    return array('The solving steps for question ' . $quizQuestionID . ' is: ' . $solvingSteps);
                } else {
                    return false;
                }
            }else {
                return array('Sorry, I cannot find the solving steps without the question number. Maybe use format like "How to solve quiz 1 of question 2?"');
            }
    } else {
        return array('Sorry, I cannot find the quiz in your question. Maybe use a format like "How to solve quiz 1 of question 2?"');
    }
}
}

function askForNavigation($userInput) {
    // TODO: Check what page is the user asking for navigation
    $pattern = '/(?:to|find|check|is(?:\sthe)?)(?:\s+the)?\s+([^,\s]+)/i';
    preg_match($pattern, $userInput, $matches);
    $pageName = $matches[1];
    //Remove space in the page name
    $pageName = str_replace(' ', '', $pageName);
    if ($pageName != null) {
        //Use database to check if the page name is valid
        include_once('config.php');
        $conn = mysqli_connect(DB_Host, DB_User, DB_Pass, DB_Name);
        if ($conn) {
            $sql = "SELECT pageURL FROM sitenavigation WHERE pageName = '$pageName'";
            $result = mysqli_query($conn, $sql);
            if (mysqli_num_rows($result) == 0) {
                return array('Sorry, I notice that your are looking for a page, but I cannot find the page name in your question. Maybe you can search for the page on Google?');
            }
            return array('The page you are looking for is: <a href="' . mysqli_fetch_assoc($result)['pageURL'] . '">' . $pageName . '</a>');
        } else {
            return array('Sorry, I notice that your are looking for a page, but I cannot connect to the database. Please try again later.');
        }
    }else {
        return array('Sorry, I notice that your are looking for a page, but I cannot find the page name in your question. Maybe use format like "How to go to the home page?"');
    }
}
function askForDefinition($userInput){
    global $debugValue;
    $pattern = '/\b(?:what is(?: the meaning of)?|definition of)\s+([^,\s]+)\b/i';
    preg_match($pattern, $userInput, $matches);
    $debugValue = isset($matches[1]);
    if (isset($matches[1])) {
        $term = $matches[1];
        $term = str_replace(' ', '', $term);
        $debugValue = $term;
        if ($term != null) {
            //Use database to check if the page name is valid
            include_once('config.php');
            $conn = mysqli_connect(DB_Host, DB_User, DB_Pass, DB_Name);
            if ($conn) {
                $sql = "SELECT definition FROM Glossary WHERE term = '$term'";
                $result = mysqli_query($conn, $sql);
                if (mysqli_num_rows($result) == 0) {
                    return array('Sorry, I notice that your are looking for a definition, but I cannot find the term in your question. Maybe you can search for the term on Google?');
                }
                $defination = mysqli_fetch_assoc($result)['definition'];
                return array('The definition of ' . $term . ' is: ' . $defination);
            } else {
                return array('Sorry, I notice that your are looking for a definition, but I cannot connect to the database. Please try again later.');
            }
        } else {
        return array('Sorry, I notice that your are looking for a definition, but I cannot find the term in your question. Maybe use format like "What is HTML?"');
    }}else{
        return array('Sorry, I notice that your are looking for a definition, but I cannot find the term in your question. Maybe use format like "What is HTML?"');
    }
}
$isDebug = true;
$version = VERSION;
$debugValue = "<empty>";
//TODO: Add more keywords and responses
if (checkMatchScheme($userInput, array('hello', 'hi'))) {
    $msgArray = array(
        'Hello there! What can I do for you?',
        'Hi there! I am a can give you hints and solving steps if you stuck on a question, or guide you travel on different page!',
        'Hi! Anything I can help?',
        'Hello! Do you need any help?',
        'Why hello there.'
    );
} elseif (checkMatchScheme($userInput, array('how are you', 'how are you doing'))) {
    $msgArray = array(
        'I am fine, thank you.',
        'I am good, thank you.',
        'I am doing well, thank you.',
        'I am great, thank you.'
    );
} elseif (checkMatchScheme($userInput, array('what is your name', 'who are you'))) {
    $msgArray = array(
        'My name is Chatbot.',
        'I am Chatbot.',
        'I am a Chatbot.',
        'I am a chatbot, you can call me Chatbot.'
    );
} elseif (checkMatchScheme($userInput, array('what is your purpose', 'what is your goal', 'what is your objective'))) {
    $msgArray = array(
        'I am here to help you.',
        'I am here to help you to solve your problem.',
        'I am here to help you to solve your problem and give you hints.',
        'I am here to help you to solve your problem and give you hints and solving steps.'
    );
} elseif (checkMatchScheme($userInput, array('what can you do', 'what can you help'))) {
    $msgArray = array(
        'I can give you hints and solving steps if you stuck on a question, or guide you travel on different page.',
    );
} elseif (checkMatchScheme($userInput, array('bye', 'goodbye', 'see you'))) {
    $msgArray = array(
        'Bye! See you again!',
        'Byebye!'
    );
} elseif (checkMatchScheme($userInput, array('thank you', 'thanks'))) {
    $msgArray = array(
        'You are welcome. Anything else I can help?',
        'You are welcome. Anything else I can help?',
    );
} elseif (checkMatchScheme($userInput, array('help', 'help me'))) {
    $msgArray = array(
        'What can I help?',
    );
} elseif ($isDebug && checkMatchScheme($userInput, array('debug'))) {
    $msgArray = array(
        'Debug: ' . $userInput . ' ' . date('Y-m-d H:i:s') . ' ' . json_encode($payload) . ' ' . $version
    );
} elseif (checkMatchScheme($userInput, array('show me the answer', 'what is the answer', 'can you give me the answer', 'I need the answer', 'tell me the answer', 'reveal the answer'))) {
    //Refuse to give answer if user ask for answer directly - Ask user to ask for hint or search for answer
    $msgArray = array(
        "I'm sorry, but I don't have the answer right now too. Why you don't try to ask for a hint or search for the answer on Google?",
        "Apologze for that, but I'm unable to provide the answer directly. I recommend asking for a hint or  search for the answer from the Internet.",
        "Sorry, but I can't give you the answer directly. Please consider requesting a hint or searching for the answer.",
        "I apologize, but I'm unable to provide a direct answer. Kindly ask for a hint or try searching for the answer.",
        "Sorry, I'm not able to provide the answer directly. But Feel free to ask for a hint or explore other resources for the answer.",
        "I apologize for the inconvenience, but I can't provide the answer directly. You may want to request a hint or conduct a search for the answer.",
    );
} elseif (checkMatchScheme($userInput, array('how to', 'how can', 'how do', 'any hint for'))) {
    //If user also include "go to" in the input, then the chatbot will guide the user to the page - call askForNavigation function
    if (checkMatchScheme($userInput, array('go to', 'find', 'navigate to', 'travel to', 'travel to', 'visit to', 'check'))) {
        $msgArray = askForNavigation($userInput);
    } elseif (checkMatchScheme($userInput, array('solve'))) {
        //If user also include "solve" in the input, then the chatbot will give a solving step - call askForSolvingStep function
        $msgArray = askForSolvingStep($userInput);
    } else {
        //If user input contains "how to", "how can" or "how do", then the chatbot will give a hint - call askForHint function
        $msgArray = askForHint($userInput);
    }
} elseif(checkMatchScheme($userInput, array('what is', 'definition of', 'what is the meaning of'))) {
        $msgArray = askForDefinition($userInput);
} elseif (checkMatchScheme($userInput, array('where', 'what', 'homepage'))) {
        //User request for navigation, call askForNavigation function
        $msgArray = askForNavigation($userInput);
} elseif (checkMatchScheme($userInput, array('contact you', 'contact', 'email', 'address', 'find you'))) {
        $msgArray = array(
            'You can contact us by email: <a href="mailto:admin@ictmasterhub.com">admin@ictmasterhub.com</a>. Or you can visit our <a href="about.html#ContactUs">contact page</a> to fill out the form and see more details!'
        );
} else {
    // If no keyword is matched, then the chatbot will give a random reply
    $msgArray = array(
        "I'm sorry, I didn't understand what you're asking. Could you change your question?",
        "Apologies for that, but I'm having trouble comprehending your question. Can you make it more clear?",
        "So sorry for that, but I'm having trouble understanding your question. Could you make a change for it?",
        "Sorry, I couldn't understant the meaning of your question. Could you please make a short change?"
    );
}

try {
    $chatMessage = randomReplies($msgArray);
} catch (Exception $e) {
    //Error handling for non-array input
    $chatMessage = "Sorry, I am having trouble to handle your question. Please contact my developer.";
}

$chatbotResponse = array(
    "success" => true,
    "sessionID" => "0",
    "chatID" => "0",
    "chatFrom" => "server",
    "chatMsg" => $chatMessage,
    "version" => VERSION,
    "debugValue" => $debugValue
);
header('Content-Type: application/json');
echo json_encode($chatbotResponse);
exit();
?>