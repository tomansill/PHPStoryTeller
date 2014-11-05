<?php
$source = json_decode(file_get_contents('sample.json'), true);;
$graph = array();
$count = 0;
foreach($source as $key => $value){
	$obj = array(
		"adjacency" => [],
		"pos" => [($count%4)*50, floor($count/4)*50],
		"force" => [0,0],
		"velocity" => [0,0]
	);
	$count = $count + 1;
	for($i = 0; $i < count($value['options']); $i++){
		$insert = $value['options'][$i][1];
		array_push($obj['adjacency'], $insert);
	}//End of for loop
	$graph[$key] = $obj;
}//End of for loop
?>
<!DOCTYPE html>
<html>
	<head>
		<script src="//code.jquery.com/jquery-1.11.0.min.js"></script>
		<script>
			var adjList = <?=json_encode($graph)?>;
		</script>
		<script src="storyGraph.js"></script>
	</head>
	<body bgcolor='gray'>
		<canvas id='mainCanvas' width='1000' height='600'>Your browser does not support HTML5 canvas tag.</canvas>
	</body>
</html>
