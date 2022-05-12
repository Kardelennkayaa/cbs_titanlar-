<?php
include 'db.php';

$get_sql = "SELECT location, recorder_name, ST_AsText(geom) as geom_text, minibus_name, distance FROM public.stations";
$resultArray = pg_fetch_all(pg_query($dbcon,$get_sql));
echo json_encode($resultArray);
?>