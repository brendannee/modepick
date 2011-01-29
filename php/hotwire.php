<?php 

include('hotwireAPIkey.php');

$ch = curl_init("http://api.hotwire.com/");
$fp = fopen("v1/tripstarter/hotel?apikey=".$hotwireAPIkey."&price=*~75&sort=date&limit=1&format=json", "w");

curl_setopt($ch, CURLOPT_FILE, $fp);
curl_setopt($ch, CURLOPT_HEADER, 0);

$output = curl_exec($ch);
curl_close($ch);
fclose($fp);

echo $output;


?>