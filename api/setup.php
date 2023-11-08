<!DOCTYPE html>
<html>
  <head>
    <title>Setup</title>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width,initial-scale=1">
    <meta name="robots" content="noindex">
    <link rel="stylesheet" href="/error_pages/assets/css/styles.css">
  </head>
  <body>
    <main id="container">
      <div class="msg_box">
        <div>
          <h1>Setup is running</h1>
          <hr>
        </div>
        <p>The server is currently running the setup process.</p>
        <p>We are sorry for the inconvenience.</p>
        <button class="menu_bt" onclick='window.location.href="javascript:window.history.back();"'>
          <a href="javascript:window.history.back();">Go Back</a>
        </button>
      </div>
    </main>
  </body>
</html>
<?php
    
    include_once('config.php');
    //Check database is built or not
    
    //Check connection first
    $conn = mysqli_connect(DB_Host, DB_User, DB_Pass);
    //Return error if connection failed
    if (!$conn) {
        die("Connection failed: " . mysqli_connect_error());
    }
    //Create database if not exist
    