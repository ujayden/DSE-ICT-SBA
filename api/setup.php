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
    