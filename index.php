<!DOCTYPE html>
<html>
	<head>
	</head>
	<body>
		<?php
			$jsonFile = json_decode(file_get_contents("sample.json"), true);
			if($jsonFile != null){
				if($_GET['state'] == null){
					$scene = $jsonFile['start'];
				}else{
					$scene = $jsonFile[$_GET['state']];
				}
		?>
		<?php
			if(array_key_exists('title' ,$scene)) echo "<h1>" . $scene['title'] . "</h1>";
		?>
		<div>
			&emsp;<?=$scene['body']?>
		</div>
		<h3>Choices:</h3>
		<?php
			for($i = 0; $i < count($scene['options']); $i++){
				echo "<a href='" . $_SERVER['self'] . "?state=" . $scene['options'][$i][1] .  "'>" . $scene['options'][$i][0] . "</a><br>";
			}
		?>
		<?php
			}else echo "<h1>Story file failed to open!</h1>";
		?>
	</body>
</html>
