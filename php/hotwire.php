<?php 
//Calculate start date from 1 year ago
$startdate = date("n/j/Y",strtotime(date("n/j/Y", strtotime($_POST['startdate'])) . "-1 year"));

//Calcuate end date 30 days from start date

$enddate = date("n/j/Y",strtotime(date("n/j/Y", strtotime($startdate)) . "+1 month"));

include('hotwireAPIkey.php');

$ch = curl_init();
$url = "http://api.hotwire.com/v1/tripstarter/air?apikey=".$hotwireAPIkey."&origin=".$_POST['origin']."&dest=".$_POST['dest']."&limit=1&format=json&startdate=".$startdate."&enddate=".$enddate;

curl_setopt($ch, CURLOPT_URL, $url);
curl_setopt($ch, CURLOPT_HEADER, 0);

$output = curl_exec($ch);
curl_close($ch);

?>