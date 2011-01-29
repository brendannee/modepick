<?php 

include('hotwireAPIkey.php');

$ch = curl_init();
$url = "http://api.hotwire.com/v1/tripstarter/hotel?apikey=".$hotwireAPIkey."&price=*~75&sort=date&limit=1&format=json";

curl_setopt($ch, CURLOPT_URL, $url);
curl_setopt($ch, CURLOPT_HEADER, 0);

$output = curl_exec($ch);
curl_close($ch);

echo $output;


?>