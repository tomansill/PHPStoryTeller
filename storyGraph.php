<?php
if($_GET['story'] == null) header("Location: storyEditor.php");
else{
	$source = json_decode(file_get_contents("stories/" . $_GET['story']), true);;
	if($source == null)  header("Location: storyEditor.php");
	$graph = array();
	$count = 0;
	foreach($source['content'] as $key => $value){
		$obj = array(
			"adjacency" => [],
			"pos" => [($count%4)*150, floor($count/4)*250],
			"force" => [0,0],
			"velocity" => [0,0],
			"color" => 'white'
		);
		$count = $count + 1;
		if($key == 'start') $obj['color'] = 'green';
		$hasSomething = false;
		for($i = 0; $i < count($value['options']); $i++){
			$insert = $value['options'][$i][1];
			array_push($obj['adjacency'], $insert);
			if(array_key_exists($insert, $source['content'])) $hasSomething = true;
		}//End of for loop
		if(!$hasSomething) $obj['color'] = 'pink';
		$graph[$key] = $obj;
	}
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
		<style>
			* { margin:0; padding:0; } /* to remove the top and left whitespace */
			html, body{ width:100%; height:100%; }
			canvas { display:block; }
		</style>
	</head>
	<body bgcolor='gray'>
		<canvas id='mainCanvas'>Your browser does not support HTML5 canvas tag.</canvas>
	</body>
</html>
