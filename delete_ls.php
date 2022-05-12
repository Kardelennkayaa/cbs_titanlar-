<?php include_once("home.html"); ?>
<?php
include 'db.php';



$location = $_POST['delete_ls'];

$delete_query = "DELETE FROM public.stations WHERE location='$location'";
$query = pg_query($dbcon,$delete_query);

if ($query){
    echo json_encode(array("statusCode"=>200));
} else {
    echo json_encode(array("statusCode"=>201));

}
?>