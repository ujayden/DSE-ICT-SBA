<?php
include_once('config.php');
include_once('library/otphp/src/OTPInterface.php');
include_once('library/otphp/src/ParameterTrait.php');
include_once('library/otphp/src/OTP.php');
include_once('library/otphp/src/TOTPInterface.php');
include_once('library/otphp/src/TOTP.php');
use OTPHP\TOTP;

// Check if the request method is POST
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

// Try to connect to the database
$conn = new mysqli(DB_Host, DB_User, DB_Pass, DB_Name);
//Use mysqli_error($conn) to debug connection errors

if ($conn->connect_error) {
    http_response_code(500);
    header('Content-Type: application/json');
    echo json_encode([
        "success" => false,
        "error" => "Database Connection Error",
        "errorMsg" => "Failed to connect to the database. Error: " . $conn->connect_error
    ]);
    exit;
}

// Check requestMode in POST json body
$jsonPayload = json_decode(file_get_contents('php://input'), true);

if ($jsonPayload === null) {
    http_response_code(400);
    header('Content-Type: application/json');
    echo json_encode([
        "success" => false,
        "error" => "Bad Request",
        "errorMsg" => "Please provide a valid JSON payload.",
        "payload" => $jsonPayload
    ]);
    exit;
}

$mode = $jsonPayload['mode'];

/**
 * Verify reCAPTCHA response
 */
function checkRecaptcha($recaptchaToken){
    $recaptchaUrl = 'https://www.google.com/recaptcha/api/siteverify';
    $recaptchaSecret = null;
    $recaptchaResponse = file_get_contents($recaptchaUrl . '?secret=' . $recaptchaSecret . '&response=' . $recaptchaToken);
    $recaptchaResponse = json_decode($recaptchaResponse);
    if (true || $recaptchaResponse->success) {//<-- Remove true to enable reCAPTCHA
        return true;
    } else {
        http_response_code(400);
        header('Content-Type: application/json');
        echo json_encode([
            "success" => false,
            "error" => "Bad Request",
            "errorMsg" => "Invalid reCAPTCHA response."
        ]);
    }
}
function verifyTOTP($otpSecret, $otpCode) {
    // Initialize a TOTP instance with the secret
    $totp = TOTP::create($otpSecret);

    // Validate the provided OTP code
    $isValid = $totp->verify($otpCode);

    return $isValid;
}
function generateSessionToken($userID) {
    global $conn;
    $sessionToken = bin2hex(random_bytes(16));

    $expiryDate = date('Y-m-d H:i:s', strtotime('+3 months'));
    $sql = "INSERT INTO userLoginSession (userID, sessionToken, sessionTokenExpDate) 
            VALUES ('$userID', '$sessionToken', '$expiryDate')";
    mysqli_query($conn, $sql);

    return $sessionToken;
}
function handleLogin($jsonPayload) {
    global $conn;
    // Extract data from the JSON payload
    $username = $jsonPayload['username'];
    $password = $jsonPayload['password'];
    $recaptchaToken = $jsonPayload['recaptchaToken'];
    $mfaCode = $jsonPayload['mfaCode'];

    // Your recaptcha check function, replace it with your actual implementation
    if (!checkRecaptcha($recaptchaToken)) {
        http_response_code(400);
        header('Content-Type: application/json');
        echo json_encode([
            "success" => false,
            "error" => "Bad Request",
            "errorMsg" => "Invalid recaptcha token."
        ]);
        exit;
    }

    // Query the user table to check if the username exists
    $sql = "SELECT * FROM users WHERE username = '$username'";
    $result = mysqli_query($conn, $sql);

    if (mysqli_num_rows($result) > 0) {
        // User exists, fetch user data
        $row = mysqli_fetch_assoc($result);
        $userID = $row['userID'];
        $hashedPassword = $row['password'];

        // Verify the password
        if (password_verify($password, $hashedPassword)) {
            // Check if MFA is enabled for the user
            $mfaEnabled = $row['useOTP'] === 'totp';

            if ($mfaEnabled) {
                // MFA is enabled, check if the MFA code is null or empty
                if (empty($mfaCode)|| $mfaCode === null) {
                    // MFA code is empty, return error
                    http_response_code(200);
                    header('Content-Type: application/json');
                    echo json_encode([
                        "success" => false,
                        "userID" => $userID,
                        "mfa_enabled" => true,
                        "error" => "Addition Authentication Required",
                        "errorMsg" => "MFA code is required."
                    ]);
                    exit;
                }
                if (!empty($mfaCode) && verifyTOTP($row['otpSecret'], $mfaCode)) {
                    // MFA code is valid, generate session token
                    $sessionToken = generateSessionToken($userID);
                    // Handle successful login with MFA
                    handleSuccessfulLogin($userID, $row['username'], $sessionToken, $row['level']);
                } else {
                    // MFA code is invalid
                    http_response_code(200);
                    header('Content-Type: application/json');
                    echo json_encode([
                        "success" => false,
                        "userID" => $userID,
                        "mfa_enabled" => true,
                        "error" => "Bad Request",
                        "errorMsg" => "Invalid MFA code."
                    ]);
                }
            } else {
                // MFA is not enabled, generate session token
                $sessionToken = generateSessionToken($userID);
                // Handle successful login without MFA
                handleSuccessfulLogin($userID, $row['username'], $sessionToken, $row['level']);
            }
        } else {
            // Password is incorrect
            http_response_code(200);
            header('Content-Type: application/json');
            echo json_encode([
                "success" => false,
                "userID" => $userID,
                "error" => "Bad Request",
                "errorMsg" => "Invalid password."
            ]);
        }
    } else {
        // User does not exist
        http_response_code(200);
        header('Content-Type: application/json');
        echo json_encode([
            "success" => false,
            "error" => "Bad Request",
            "errorMsg" => "Invalid username."
        ]);
    }
}

function handleSuccessfulLogin($userID, $username, $sessionToken, $userLevel) {
    global $conn;
    // Calculate the session token expiration date (assuming 3 months)
    $sessionTokenExpDate = date('Y-m-d H:i:s', strtotime('+3 months'));

    // Insert the session information into the userLoginSession table
    $sql = "INSERT INTO userLoginSession (userID, sessionToken, sessionTokenExpDate) VALUES ('$userID', '$sessionToken', '$sessionTokenExpDate')";
    mysqli_query($conn, $sql);

    // Return the success response with user information
    http_response_code(200);
    header('Content-Type: application/json');
    echo json_encode([
        "success" => true,
        "userID" => $userID,
        "userName" => $username,
        "sessionToken" => $sessionToken,
        "sessionTokenExpDate" => $sessionTokenExpDate,
        "level" => $userLevel
    ]);
    exit;
}
function handleRegistration($jsonPayload) {
    global $conn;

    // Extract data from the JSON payload
    $username = $jsonPayload['username'];
    $password = $jsonPayload['password'];
    $useTOTP = $jsonPayload['useTOTP'];
    $totpSecret = $jsonPayload['totpSecret'];
    $recaptchaToken = $jsonPayload['recaptchaToken'];

    // Your recaptcha check function, replace it with your actual implementation
    if (!checkRecaptcha($recaptchaToken)) {
        http_response_code(400);
        header('Content-Type: application/json');
        echo json_encode([
            "success" => false,
            "error" => "Bad Request",
            "errorMsg" => "Invalid reCAPTCHA response."
        ]);
        exit;
    }
    //Use n/a if totp is not enabled
    if (!$useTOTP) {
        $totpSecret = 'n/a';
    }
    // Check if the username already exists
    $sqlCheckUser = "SELECT * FROM users WHERE username = '$username'";
    $resultCheckUser = mysqli_query($conn, $sqlCheckUser);

    if (mysqli_num_rows($resultCheckUser) > 0) {
        // Username already exists, return error
        http_response_code(200);
        header('Content-Type: application/json');
        echo json_encode([
            "success" => false,
            "error" => "Bad Request",
            "errorMsg" => "Username already exists."
        ]);
        exit;
    }

    // Hash the password
    $hashedPassword = password_hash($password, PASSWORD_DEFAULT);

    // Insert user data into the users table
    $sqlInsertUser = "INSERT INTO users (username, password, useOTP, otpSecret, level) VALUES ('$username', '$hashedPassword', " . ($useTOTP ? "'totp', '$totpSecret'" : "'false', NULL") . ", 'Beginner')";
    $resultInsertUser = mysqli_query($conn, $sqlInsertUser);

    if ($resultInsertUser) {
        // Registration successful, generate session token
        $userID = mysqli_insert_id($conn);
        $sessionToken = generateSessionToken($userID);

        // Return success response with user information
        http_response_code(200);
        header('Content-Type: application/json');
        echo json_encode([
            "success" => true,
            "userID" => $userID,
            "userName" => $username,
            "sessionToken" => $sessionToken,
            "sessionTokenExpDate" => date('Y-m-d H:i:s', strtotime('+3 months')),
            "level" => 'Beginner'
        ]);
        exit;
    } else {
        // Registration failed, return error
        http_response_code(500);
        header('Content-Type: application/json');
        echo json_encode([
            "success" => false,
            "error" => "Internal Server Error",
            "errorMsg" => "Failed to register the user."
        ]);
        exit;
    }
}
function handleForgotPassword($jsonPayload) {
    global $conn;

    // Extract data from the JSON payload
    $username = $jsonPayload['username'];
    $newPassword = $jsonPayload['password'];
    $recaptchaToken = $jsonPayload['recaptchaToken'];
    $verifyMode = $jsonPayload['verifyMode'];
    $verifyCode = $jsonPayload['verifyCode'];

    // Your recaptcha check function, replace it with your actual implementation
    if (!checkRecaptcha($recaptchaToken)) {
        http_response_code(400);
        header('Content-Type: application/json');
        echo json_encode([
            "success" => false,
            "error" => "Bad Request",
            "errorMsg" => "Invalid reCAPTCHA response."
        ]);
        exit;
    }

    // Check the verification mode
    switch ($verifyMode) {
        case 'email':
            // Verify the email verification code
            $sqlVerifyEmailCode = "SELECT * FROM resetPasswordEmailCode WHERE username = '$username' AND code = '$verifyCode'";
            $resultVerifyEmailCode = mysqli_query($conn, $sqlVerifyEmailCode);

            if (mysqli_num_rows($resultVerifyEmailCode) > 0) {
                // Email verification code is valid, update the user password
                $hashedNewPassword = password_hash($newPassword, PASSWORD_DEFAULT);
                $sqlUpdatePassword = "UPDATE users SET password = '$hashedNewPassword' WHERE username = '$username'";
                mysqli_query($conn, $sqlUpdatePassword);

                // Return success response
                http_response_code(200);
                header('Content-Type: application/json');
                echo json_encode([
                    "success" => true
                ]);
                exit;
            } else {
                // Email verification code is invalid
                http_response_code(200);
                header('Content-Type: application/json');
                echo json_encode([
                    "success" => false,
                    "error" => "Bad Request",
                    "errorMsg" => "Invalid email verification code."
                ]);
                exit;
            }
            break;

        case 'totp':
            // Verify TOTP
            // Extract the user's TOTP secret from the database
            $sqlTOTPSecret = "SELECT * FROM users WHERE username = '$username'";
            $resultTOTPSecret = mysqli_query($conn, $sqlTOTPSecret);

            if (mysqli_num_rows($resultTOTPSecret) > 0) {
                $rowTOTPSecret = mysqli_fetch_assoc($resultTOTPSecret);
                $userTOTPSecret = $rowTOTPSecret['otpSecret'];

                // Verify the provided TOTP code
                if (!empty($verifyCode) && verifyTOTP($userTOTPSecret, $verifyCode)) {
                    // TOTP code is valid, update the user password
                    $hashedNewPassword = password_hash($newPassword, PASSWORD_DEFAULT);
                    $sqlUpdatePasswordTOTP = "UPDATE users SET password = '$hashedNewPassword' WHERE username = '$username'";
                    mysqli_query($conn, $sqlUpdatePasswordTOTP);

                    // Return success response
                    http_response_code(200);
                    header('Content-Type: application/json');
                    echo json_encode([
                        "success" => true
                    ]);
                    exit;
                } else {
                    // TOTP code is invalid
                    http_response_code(200);
                    header('Content-Type: application/json');
                    echo json_encode([
                        "success" => false,
                        "error" => "Bad Request",
                        "errorMsg" => "Invalid TOTP code."
                    ]);
                    exit;
                }
            } else {
                // User not found
                http_response_code(200);
                header('Content-Type: application/json');
                echo json_encode([
                    "success" => false,
                    "error" => "Bad Request",
                    "errorMsg" => "User not found."
                ]);
                exit;
            }
            break;

        case 'securityQuestion':
            // Verify security question
            // Extract the user's security question and answer from the database
            $sqlSecurityQuestion = "SELECT * FROM users WHERE username = '$username'";
            $resultSecurityQuestion = mysqli_query($conn, $sqlSecurityQuestion);

            if (mysqli_num_rows($resultSecurityQuestion) > 0) {
                $rowSecurityQuestion = mysqli_fetch_assoc($resultSecurityQuestion);
                $userSecurityQuestion = $rowSecurityQuestion['securityQuestion'];
                $userSecurityAnswer = $rowSecurityQuestion['securityAnswer'];

                // Verify the provided security question answer
                if (!empty($verifyCode) && $verifyCode === $userSecurityAnswer) {
                    // Security question answer is valid, update the user password
                    $hashedNewPassword = password_hash($newPassword, PASSWORD_DEFAULT);
                    $sqlUpdatePasswordSecurityQuestion = "UPDATE users SET password = '$hashedNewPassword' WHERE username = '$username'";
                    mysqli_query($conn, $sqlUpdatePasswordSecurityQuestion);

                    // Return success response
                    http_response_code(200);
                    header('Content-Type: application/json');
                    echo json_encode([
                        "success" => true
                    ]);
                    exit;
                } else {
                    // Security question answer is invalid
                    http_response_code(200);
                    header('Content-Type: application/json');
                    echo json_encode([
                        "success" => false,
                        "error" => "Bad Request",
                        "errorMsg" => "Invalid security question answer."
                    ]);
                    exit;
                }
            } else {
                // User not found
                http_response_code(200);
                header('Content-Type: application/json');
                echo json_encode([
                    "success" => false,
                    "error" => "Bad Request",
                    "errorMsg" => "User not found."
                ]);
                exit;
            }
            break;

        default:
            // Invalid verification mode
            http_response_code(400);
            header('Content-Type: application/json');
            echo json_encode([
                "success" => false,
                "error" => "Bad Request",
                "errorMsg" => "Invalid verification mode."
            ]);
            exit;
    }
}
function handleForgotPasswordSendEmailGetCode($jsonPayload) {
    global $conn;

    // Extract data from the JSON payload
    $username = $jsonPayload['username'];
    $email = $jsonPayload['email'];
    $recaptchaToken = $jsonPayload['recaptchaToken'];

    // Your recaptcha check function, replace it with your actual implementation
    if (!checkRecaptcha($recaptchaToken)) {
        http_response_code(400);
        header('Content-Type: application/json');
        echo json_encode([
            "success" => false,
            "error" => "Bad Request",
            "errorMsg" => "Invalid reCAPTCHA response."
        ]);
        exit;
    }

    // Check if the provided username and email match
    $sqlCheckUserEmail = "SELECT * FROM users WHERE username = '$username' AND email = '$email'";
    $resultCheckUserEmail = mysqli_query($conn, $sqlCheckUserEmail);

    if (mysqli_num_rows($resultCheckUserEmail) > 0) {
        // User and email match, generate a 6-digit code
        $verificationCode = mt_rand(100000, 999999);

        // Save the verification code in the resetPasswordEmailCode table
        $sqlSaveVerificationCode = "INSERT INTO resetPasswordEmailCode (username, code) VALUES ('$username', '$verificationCode')";
        mysqli_query($conn, $sqlSaveVerificationCode);

        // Send the verification code to the user's email
        sendVerificationCodeToEmailForPasswordReset($email, $verificationCode);
        // Return success response
        http_response_code(200);
        header('Content-Type: application/json');
        echo json_encode([
            "success" => true
        ]);
        exit;
    } else {
        // User and email do not match
        http_response_code(200);
        header('Content-Type: application/json');
        echo json_encode([
            "success" => true
        ]);
        exit;
    }
}
function sendVerificationCodeToEmailForPasswordReset($email, $verificationCode) {
    // Send the verification code to the user's email
    // ...
}
function handleChangePassword($jsonPayload) {
    global $conn;
    
    // Extract data from the JSON payload
    $username = $jsonPayload['username'];
    $currentPassword = $jsonPayload['currentPassword'];
    $newPassword = $jsonPayload['newPassword'];
    $recaptchaToken = $jsonPayload['recaptchaToken'];

    // Your recaptcha check function, replace it with your actual implementation
    if (!checkRecaptcha($recaptchaToken)) {
        http_response_code(400);
        header('Content-Type: application/json');
        echo json_encode([
            "success" => false,
            "error" => "Bad Request",
            "errorMsg" => "Invalid recaptcha token."
        ]);
        exit;
    }

    // Query the user table to check if the username exists
    $sql = "SELECT * FROM users WHERE username = '$username'";
    $result = mysqli_query($conn, $sql);

    if (mysqli_num_rows($result) > 0) {
        // User exists, fetch user data
        $row = mysqli_fetch_assoc($result);
        $userID = $row['userID'];
        $hashedPassword = $row['password'];

        // Verify the current password
        if (password_verify($currentPassword, $hashedPassword)) {
            // Current password is correct, update the password
            $newHashedPassword = password_hash($newPassword, PASSWORD_DEFAULT);
            $updateSql = "UPDATE users SET password = '$newHashedPassword' WHERE userID = '$userID'";
            mysqli_query($conn, $updateSql);

            // Return success response
            http_response_code(200);
            header('Content-Type: application/json');
            echo json_encode([
                "success" => true,
                "message" => "Password updated successfully."
            ]);
            exit;
        } else {
            // Current password is incorrect
            http_response_code(200);
            header('Content-Type: application/json');
            echo json_encode([
                "success" => false,
                "error" => "Bad Request",
                "errorMsg" => "Invalid current password."
            ]);
            exit;
        }
    } else {
        // User does not exist
        http_response_code(200);
        header('Content-Type: application/json');
        echo json_encode([
            "success" => false,
            "error" => "Bad Request",
            "errorMsg" => "Invalid username."
        ]);
        exit;
    }
}

switch ($mode) {
    case 'login':
        // Handle login
        handleLogin($jsonPayload);
        break;

    case 'register':
        // Handle registration
        handleRegistration($jsonPayload);
        break;

    case 'forgotPassword':
        // Handle forgot password
        handleForgotPassword($jsonPayload);
        break;

    case 'forgotPasswordSendEmailGetCode':
        // Handle password reset request
        handleForgotPasswordSendEmailGetCode($jsonPayload);
        break;

    case 'changePassword':
        // Handle password change
        handleChangePassword($jsonPayload);
        break;

    default:
        // Invalid mode, return error
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
