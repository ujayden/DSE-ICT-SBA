<?php
    include_once('config.php');
    //OTPHP TOTP is at /api/library/otphp/src/TOTP.php
    include_once('library/otphp/src/TOTP.php');

    //Check if the request method is POST
    if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
        http_response_code(405);
        header('Content-Type: application/json');
        echo json_encode([
            "success" => false,
            "error" => "Method Not Allowed",
            "errorMsg" => "Only POST requests are allowed. Please use a valid POST request."
        ]);
        exit;
    }

    //Try to connect to the database
    $conn = new mysqli(DB_Host, DB_User, DB_Pass, DB_Name);
    if (!$conn) {
        http_response_code(500);
        header('Content-Type: application/json');
        echo json_encode([
            "success" => false,
            "error" => "Database Connection Error",
            "errorMsg" => "Failed to connect to the database."
        ]);
        exit;
    }

    //Check requestMode in POST json body
    $jsonPayload = json_decode(file_get_contents('php://input'), true);
    $data = json_decode($jsonPayload, true);
    if ($data = null) {
        http_response_code(400);
        header('Content-Type: application/json');
        echo json_encode([
            "success" => false,
            "error" => "Bad Request",
            "errorMsg" => "Please provide a valid JSON payload."
        ]);
        exit;
    }
    $secretKey = JWT_Secret;
    function generateJWT($id, $userID) {
        $header = json_encode(['typ' => 'JWT', 'alg' => 'HS256']);
        $payload = json_encode(['user_id' => $id, 'userID' => $userID]);
    
        $base64UrlHeader = str_replace(['+', '/', '='], ['-', '_', ''], base64_encode($header));
        $base64UrlPayload = str_replace(['+', '/', '='], ['-', '_', ''], base64_encode($payload));
    
        $signature = hash_hmac('sha256', $base64UrlHeader . "." . $base64UrlPayload, JWT_Secret, true);
        $base64UrlSignature = str_replace(['+', '/', '='], ['-', '_', ''], base64_encode($signature));
    
        $jwt = $base64UrlHeader . "." . $base64UrlPayload . "." . $base64UrlSignature;
    
        return $jwt;
    }
    function verifyTOTP($otpSecret, $otpCode){
        $otpValid = false;
        $totp = TOTP::create($otpSecret);
        for ($i = 0; $i < 3; $i++) {
            if ($totp->verify($otpCode)) {
                $otpValid = true;
                break;
            }
        }
        //Wait for 3 seconds to prevent brute force
        sleep(3);
        return $otpValid;
    }
    function sentNotification($userID, $userAvailableAuthMode){
        if (in_array("email", $userAvailableAuthMode)){
            //WIP
        }
        exit;
    }

    if ($data['mode'] === 'login'){
        $userID = $data['userID'];
        $password = $data['password'];
        $recaptchaToken = $data['recaptchaToken'];
        //Check if any of the fields are empty
        if (empty($userID) || empty($password) || empty($recaptchaToken)) {
            http_response_code(400);
            header('Content-Type: application/json');
            echo json_encode([
                "success" => false,
                "error" => "Bad Request",
                "errorMsg" => "Please provide a valid userID, password and recaptchaToken."
            ]);
            exit;
        }else{
            //Check if the recaptchaToken is valid
            $recaptchaUrl = 'https://www.google.com/recaptcha/api/siteverify';
            $recaptchaResponse = file_get_contents($recaptchaUrl . '?secret=' . $recaptchaSecretKey . '&response=' . $recaptchaToken);
            $recaptchaData = json_decode($recaptchaResponse);
            if ($recaptchaData -> success !== true) {
                //recaptchaToken is not valid, return error
                http_response_code(400);
                header('Content-Type: application/json');
                echo json_encode([
                    "success" => false,
                    "error" => "Bad Request",
                    "errorMsg" => "Invaild recaptcha Token."
                ]);
                exit;
            }else{
                //Perform login
                $sql = "SELECT * FROM users WHERE userID = '$userID'";
                $result = mysqli_query($conn, $sql);
                //Check if the userID exists
                if (mysqli_num_rows($result) >0){
                    //User exists, check if the password is correct
                    $row = mysqli_fetch_assoc($result);
                    if (password_verify($password, $row['password'])){
                        //Check if user requires 2FA
                        if ($row['useOTP'] == 'totp'){
                            //User requires 2FA, return ask client to perform 2FA
                            http_response_code(200);
                            header('Content-Type: application/json');
                            echo json_encode([
                                "success" => false,
                                "userName" => $row['username'],
                                "2fa_enabled" => true
                            ]);
                            exit;
                        }else{
                            //User does not require 2FA, return JWT token
                            $token = generateJWT($row['id'], $row['userID']);
                            http_response_code(200);
                            header('Content-Type: application/json');
                            echo json_encode([
                                "success" => true,
                                "userName" => $row['username'],
                                "token" => $token
                            ]);
                            exit;
                        }
                    }else{
                        //Password is incorrect, return error
                        http_response_code(400);
                        header('Content-Type: application/json');
                        echo json_encode([
                            "success" => false,
                            "error" => "Bad Request",
                            "errorMsg" => "Invaild password."
                        ]);
                    }
                    exit;
                }else{
                    //User does not exist, return error
                    http_response_code(400);
                    header('Content-Type: application/json');
                    echo json_encode([
                        "success" => false,
                        "error" => "Bad Request",
                        "errorMsg" => "Invaild userID."
                    ]);
                    exit;
                }
            }
        }
    }else if ($data['mode'] === 'login' && $data['useOTP'] == true){
        //User is performing 2FA
        //Check if any of the fields are empty
        if (empty($userID) || empty($password) || empty($recaptchaToken) || empty($otp)) {
            http_response_code(400);
            header('Content-Type: application/json');
            echo json_encode([
                "success" => false,
                "error" => "Bad Request",
                "errorMsg" => "Please provide a valid userID, password, recaptchaToken and otp."
            ]);
            exit;
        }else{
            //Check if the recaptchaToken is valid
            $recaptchaUrl = 'https://www.google.com/recaptcha/api/siteverify';
            $recaptchaResponse = file_get_contents($recaptchaUrl . '?secret=' . $recaptchaSecretKey . '&response=' . $recaptchaToken);
            $recaptchaData = json_decode($recaptchaResponse);
            if ($recaptchaData -> success !== true) {
                //recaptchaToken is not valid, return error
                http_response_code(400);
                header('Content-Type: application/json');
                echo json_encode([
                    "success" => false,
                    "error" => "Bad Request",
                    "errorMsg" => "Invaild recaptcha Token."
                ]);
                exit;
            }else{
                //Perform login
                $sql = "SELECT * FROM users WHERE userID = '$userID'";
                $result = mysqli_query($conn, $sql);
                //Check if the userID exists
                if (mysqli_num_rows($result) >0){
                    //User exists, check if the password is correct
                    $row = mysqli_fetch_assoc($result);
                    if (password_verify($password, $row['password'])){
                        //Check if the totp is correct
                        $otpValid = verifyTOTP($row['otpSecret'], $otp);
                        if ($otpValid == true){
                            //TOTP is correct, return JWT token
                            $token = generateJWT($row['id'], $row['userID']);
                            http_response_code(200);
                            header('Content-Type: application/json');
                            echo json_encode([
                                "success" => true,
                                "userName" => $row['username'],
                                "token" => $token
                            ]);
                            exit;
                        }else{
                            //OTP is incorrect, return error
                            http_response_code(400);
                            header('Content-Type: application/json');
                            echo json_encode([
                                "success" => false,
                                "error" => "Bad Request",
                                "errorMsg" => "Invaild OTP."
                            ]);
                        }
                        exit;
                    }else{
                        //Password is incorrect, return error
                        http_response_code(400);
                        header('Content-Type: application/json');
                        echo json_encode([
                            "success" => false,
                            "error" => "Bad Request",
                            "errorMsg" => "Invaild password."
                        ]);
                    }
                    exit;
                }else{
                    //User does not exist, return error
                    http_response_code(400);
                    header('Content-Type: application/json');
                    echo json_encode([
                        "success" => false,
                        "error" => "Bad Request",
                        "errorMsg" => "Invaild userID."
                    ]);
                    exit;
                }
            }
        }
    }else if ($data['mode'] === 'register'){
        //User is registering
        $regUserID = $data['regUserID'];
        $regUserName = $data['regUserName'];
        $regPassword = $data['regPassword'];
        $regRecaptchaToken = $data['regRecaptchaToken'];
        $regUseOTP = $data['regUseOTP']; //TRUE or FALSE
        //Check if any of the fields are empty
        if (empty($regUserID) || empty($regUserName) || empty($regPassword) || empty($regRecaptchaToken) || empty($regUseOTP)) {
            http_response_code(400);
            header('Content-Type: application/json');
            echo json_encode([
                "success" => false,
                "error" => "Bad Request",
                "errorMsg" => "Please provide a valid userID, username, password, recaptchaToken and useOTP."
            ]);
            exit;
        }else{
            //TODO: Check if the recaptchaToken is valid
            $recaptchaUrl = 'https://www.google.com/recaptcha/api/siteverify';
            $recaptchaResponse = file_get_contents($recaptchaUrl . '?secret=' . $recaptchaSecretKey . '&response=' . $regRecaptchaToken);
            $recaptchaData = json_decode($recaptchaResponse);
            if ($recaptchaData -> success !== true) {
                //recaptchaToken is not valid, return error
                http_response_code(400);
                header('Content-Type: application/json');
                echo json_encode([
                    "success" => false,
                    "error" => "Bad Request",
                    "errorMsg" => "Invaild recaptcha Token."
                ]);
                exit;
            }
            //Check if the userID is already taken
            $sql = "SELECT * FROM users WHERE userID = '$regUserID'";
            $result = mysqli_query($conn, $sql);
            if (mysqli_num_rows($result) >0){
                //User exists, return error
                http_response_code(400);
                header('Content-Type: application/json');
                echo json_encode([
                    "success" => false,
                    "error" => "Bad Request",
                    "errorMsg" => "UserID is already taken."
                ]);
                exit;
            }
            //Check if the OTP is enabled
            if ($regUseOTP == true){
                //TOTP secret is generate from client side
                $regTOTPSecret = $data['regTOTPSecret'];
                $regTryOTP = $data['regTryOTP'];
                //Check if any of the fields are empty
                if (empty($regTOTPSecret) || empty($regTryOTP)) {
                    http_response_code(400);
                    header('Content-Type: application/json');
                    echo json_encode([
                        "success" => false,
                        "error" => "Bad Request",
                        "errorMsg" => "Please provide a valid OTP code to verify that you have successful to setup."
                    ]);
                    exit;
                }else{
                    //TODO: Verify the OTP code
                    $otpValid = verifyTOTP($regTOTPSecret, $regTryOTP);
                    //Return error if OTP is invalid
                    if ($otpValid == false){
                        http_response_code(400);
                        header('Content-Type: application/json');
                        echo json_encode([
                            "success" => false,
                            "error" => "Bad Request",
                            "errorMsg" => "Invaild OTP to verify. Try again."
                        ]);
                        exit;
                    }
                }
            }
            //Hash the password
            $hashedPassword = password_hash($regPassword, PASSWORD_DEFAULT);
            //Insert the user into the database
            //Insert all the data except the OTP-related data
            $sql = "INSERT INTO users (userID, username, password) VALUES ('$regUserID', '$regUserName', '$hashedPassword')";
            mysqli_query($conn, $sql);
            //Insert the OTP-related data if OTP is enabled - $row['useOTP'] == 'totp'

            if ($regUseOTP == true){
                //TODO: Insert the OTP-related data
                $sql = "UPDATE users SET useOTP = 'totp', otpSecret = '$regTOTPSecret' WHERE userID = '$regUserID'";
                mysqli_query($conn, $sql);
            }
            //Return success
            http_response_code(200);
            header('Content-Type: application/json');
            echo json_encode([
                "success" => true,
                "userID" => $regUserID,
                "message" => "User registered successfully."
            ]);
            exit;
        }
    }else if ($data['mode'] === 'resetPassword'){
        //TODO: User is requesting to reset password
        $resetUserID = $data['resetUserID'];
        $resetRecaptchaToken = $data['resetRecaptchaToken'];
        $resetTraceUUID = $data['resetTraceUUID'];
        //Check if any of the fields are empty
        if (empty($resetUserID) || empty($resetRecaptchaToken) || empty($resetTraceUUID)) {
            http_response_code(400);
            header('Content-Type: application/json');
            echo json_encode([
                "success" => false,
                "error" => "Bad Request",
                "errorMsg" => "Please provide a valid userID, recaptchaToken and traceUUID."
            ]);
            exit;
        }else{
            //TODO: Check if the recaptchaToken is valid
            $recaptchaUrl = 'https://www.google.com/recaptcha/api/siteverify';
            $recaptchaResponse = file_get_contents($recaptchaUrl . '?secret=' . $recaptchaSecretKey . '&response=' . $resetRecaptchaToken);
            $recaptchaData = json_decode($recaptchaResponse);
            if ($recaptchaData -> success !== true) {
                //recaptchaToken is not valid, return error
                http_response_code(400);
                header('Content-Type: application/json');
                echo json_encode([
                    "success" => false,
                    "error" => "Bad Request",
                    "errorMsg" => "Invaild recaptcha Token."
                ]);
                exit;
            }
            //Check if the userID exists
            $sql = "SELECT * FROM users WHERE userID = '$resetUserID'";
            $result = mysqli_query($conn, $sql);
            //User not found, return error
            if (mysqli_num_rows($result) == 0){
                http_response_code(400);
                header('Content-Type: application/json');
                echo json_encode([
                    "success" => false,
                    "error" => "Bad Request",
                    "errorMsg" => "User not found."
                ]);
                exit;
            }
            //Store the traceUUID and UserID into the database
            //Get current time - delete records older than 1 hour
            $currentTime = time();
            $sql = "INSERT INTO password_reset (userID, traceUUID, requestTime) VALUES ('$resetUserID', '$resetTraceUUID, '$currentTime')";
            mysqli_query($conn, $sql);
            //Return success
            $userAvailableAuthMode = ["email"];
            //TODO: Check if the user has enabled OTP
            $sql = "SELECT * FROM users WHERE userID = '$resetUserID'";
            $result = mysqli_query($conn, $sql);
            $row = mysqli_fetch_assoc($result);
            if ($row['useOTP'] == 'totp'){
                array_push($userAvailableAuthMode, "totp");
            }
            sentNotification($resetUserID, $userAvailableAuthMode);
            http_response_code(200);
            header('Content-Type: application/json');
            echo json_encode([
                "success" => true,
                "userID" => $resetUserID,
                "resetMode" => $userAvailableAuthMode,
                "message" => "Password reset is in progress and will be valid for 1 hour."
            ]);
            exit;
        }
    }else if ($data['mode'] === 'resetPasswordEnterCode'){
        //Check if any of the fields are empty
        if (empty($resetUserID) || empty($resetTraceUUID) || empty($resetMode) || empty($resetCode) || empty($resetPassword)) {
            http_response_code(400);
            header('Content-Type: application/json');
            echo json_encode([
                "success" => false,
                "error" => "Bad Request",
                "errorMsg" => "Please provide a valid userID, recaptchaToken, traceUUID, resetMode and resetCode."
            ]);
            exit;
        }else{
            //TODO: Check if the resetTraceUUID and resetUserID exists in the database
            //Clear all the records older than 1 hour
            $currentTime = time();
            $sql = "DELETE FROM password_reset WHERE requestTime < '$currentTime' - 3600";
            mysqli_query($conn, $sql);
            //Check if the resetTraceUUID and resetUserID exists in the database
            $sql = "SELECT * FROM password_reset WHERE userID = '$resetUserID' AND traceUUID = '$resetTraceUUID'";
            $result = mysqli_query($conn, $sql);
            //User not found, return error
            if (mysqli_num_rows($result) == 0){
                http_response_code(400);
                header('Content-Type: application/json');
                echo json_encode([
                    "success" => false,
                    "error" => "Bad Request",
                    "errorMsg" => "User not found."
                ]);
                exit;
            }
            //Check if the resetCode is valid based on the resetMode
            //Email: Find the code in the database "resetCode" column
            //TOTP: Verify the code using OTP
            if ($resetMode == "email"){
                $resetCodeInDatabase = $result['resetCode'];
                if($resetCodeInDatabase !== $resetCode){
                    //Code is invalid, return error
                    http_response_code(400);
                    header('Content-Type: application/json');
                    echo json_encode([
                        "success" => false,
                        "error" => "Bad Request",
                        "errorMsg" => "Invaild reset code."
                    ]);
                    exit;
                }                
            }else if ($resetMode == "totp"){
                //TODO: Verify the OTP code
                $sql = "SELECT * FROM users WHERE userID = '$resetUserID'";
                $result = mysqli_query($conn, $sql);
                $row = mysqli_fetch_assoc($result);
                $otpValid = verifyTOTP($row['otpSecret'], $resetCode);
                //Return error if OTP is invalid
                if ($otpValid == false){
                    http_response_code(400);
                    header('Content-Type: application/json');
                    echo json_encode([
                        "success" => false,
                        "error" => "Bad Request",
                        "errorMsg" => "Invaild OTP to verify. Try again."
                    ]);
                    exit;
                }
            }else{
                //resetMode is invalid, return error
                http_response_code(400);
                header('Content-Type: application/json');
                echo json_encode([
                    "success" => false,
                    "error" => "Bad Request",
                    "errorMsg" => "Invaild reset mode."
                ]);
                exit;
            }
            //Hash the password
            $hashedPassword = password_hash($resetPassword, PASSWORD_DEFAULT);
            //Update the password in the database
            $sql = "UPDATE users SET password = '$hashedPassword' WHERE userID = '$resetUserID'";
            mysqli_query($conn, $sql);
            //Return success
            http_response_code(200);
            header('Content-Type: application/json');
            echo json_encode([
                "success" => true,
                "userID" => $resetUserID,
                "message" => "Password reset successfully."
            ]);
            exit;
        }
    }else if ($data['mode'] === 'changePassword') {
        // User is requesting to change the password
        // Check if any of the fields are empty
        if (empty($data['token']) || empty($data['newPassword'])) {
            http_response_code(400);
            header('Content-Type: application/json');
            echo json_encode([
                "success" => false,
                "error" => "Bad Request",
                "errorMsg" => ""
            ]);
            exit;
        }
        // Verify the JWT token
        $token = $data['token'];
        // Validate the JWT structure
        $tokenParts = explode('.', $token);
        if (count($tokenParts) !== 3) {
            // Invalid JWT
            // Handle the error accordingly
            http_response_code(400);
            header('Content-Type: application/json');
            echo json_encode([
                "success" => false,
                "error" => "Bad Request",
                "errorMsg" => "Invalid JWT token."
            ]);
            exit;
        }
    
        $header = base64_decode($tokenParts[0]);
        $headerData = json_decode($header, true);
        $algorithm = $headerData['alg'];
        $signature = base64_decode($tokenParts[2]);
    
        // Verify the signature using the JWT secret
        $isValidSignature = hash_equals(
            hash_hmac('sha256', $tokenParts[0] . '.' . $tokenParts[1], JWT_Secret, true),
            $signature
        );
    
        if (!$isValidSignature) {

            http_response_code(400);
            header('Content-Type: application/json');
            echo json_encode([
                "success" => false,
                "error" => "Bad Request",
                "errorMsg" => "Invalid JWT token."
            ]);
            exit;
        }
        $payload = base64_decode($tokenParts[1]);
        $payloadData = json_decode($payload, true);
        
        // Check if the token is expired
        //Verify the SessionID inside the JWT token
        $SessionID = $payloadData['SessionID'];
        $sql = "SELECT * FROM sessions WHERE SessionID = '$SessionID'";
        $result = mysqli_query($conn, $sql);
        //SessionID not found, return error
        if (mysqli_num_rows($result) == 0){
            http_response_code(400);
            header('Content-Type: application/json');
            echo json_encode([
                "success" => false,
                "error" => "Bad Request",
                "errorMsg" => "SessionID not found."
            ]);
            exit;
        }
        //Change the password
        $userID = $payloadData['userID'];
        $newPassword = $data['newPassword'];
        $hashedPassword = password_hash($newPassword, PASSWORD_DEFAULT);
        $sql = "UPDATE users SET password = '$hashedPassword' WHERE userID = '$userID'";
        mysqli_query($conn, $sql);
        //Return success
        http_response_code(200);
        header('Content-Type: application/json');
        echo json_encode([
            "success" => true,
            "userID" => $userID,
            "message" => "Password changed successfully."
        ]);
    }else{
        //Invalid mode, return error
        http_response_code(400);
        header('Content-Type: application/json');
        echo json_encode([
            "success" => false,
            "error" => "Bad Request",
            "errorMsg" => "Invalid mode."
        ]);
        exit;
    }
?>