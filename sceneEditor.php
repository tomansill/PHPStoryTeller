<?php
if($_GET['story'] == null) header("Location: storyEditor.php");
$storyFile = json_decode(file_get_contents("stories/" . $_GET['story']) ,true);
if($storyFile == null) header("Location: storyEditor.php?story=" . $_GET['story']);
if($_GET['scene'] != null){
	if(!array_key_exists($_GET['scene'], $storyFile['content'])) header("Location: storyEditor.php?story=" . $_GET['story']);
}
$sceneFile = $storyFile['content'][$_GET['scene']];
$options = array();
$scene = $_GET['scene'];
$body = $sceneFile['body'];
$optionError = array();
if($_POST != null){
	var_dump($_POST);
	//scene name cannot be empty or less than 3 characters
	$scene = $_POST['name'];
	$body = $_POST['body']; 
	$error = false;
	if(strlen($_POST['name']) < 3){
		$error = true;
		$name = "Name cannot have less than 3 characters!<br>";	
	}
	if(strlen($_POST['body']) < 3){
		$error = true;
		$bodyErr = "Body cannot have less than 3 characters!<br>";	
	}
	$count = 0;
	while($_POST['option' . $count] != null || $_POST['optionLink' . $count] != null){
		$option = $_POST['option' . $count];
		$optionLink = $_POST['optionLink' . $count];
		if((strlen($option) == 0 && strlen($optionLink) != 0) || (strlen($option) != 0 && strlen($optionLink) == 0)){
			$error = true;
			array_push($optionError, "Both fields must have something in it!<br>");
		}else{
			array_push($optionError, "");
		}
		$count = $count + 1;
	}
	if(!$error){
		//No problem with input, save them
		//construct new data
		$data = array(
				"body" => $_POST['body'],
				"options" => array()
			);	
		$count = 0;
		while($_POST['option' . $count] != null || $_POST['optionLink' . $count] != null){
			array_push($data['options'], [$_POST['option' . $count], $_POST['optionLink' . $count]]);
			$count = $count + 1;
		}
		//remove old key
		unset($storyFile['content'][$_GET['scene']]);
		$storyFile['content'][$_POST['name']] = $data;
		//save the new file
		$str = json_encode($storyFile, JSON_PRETTY_PRINT);
		file_put_contents('stories/' . $_GET['story'], $str);
		header("Location: storyEditor.php?story=" . $_GET['story']);
	}
}
?>
<!DOCTYPE html>
<html>
	<head>
		<script>
			var numOfOptions = <?=count($sceneFile['options'])?>;
			function addOption(){
				if(numOfOptions == 0) numOfOptions++;
				var obj = document.getElementById("options");
				obj.appendChild(document.createElement("hr"));
				obj.appendChild(document.createTextNode("Option Description: "));
				var input = document.createElement("input");
				input.type = "text";
				input.name = "option" + numOfOptions;
				obj.appendChild(input);
				obj.appendChild(document.createElement("br"));
				obj.appendChild(document.createTextNode("Option Link: "));
				var input = document.createElement("input");
				input.type = "text";
				input.name = "optionLink" + numOfOptions;
				obj.appendChild(input);
				obj.appendChild(document.createElement("br"));
				numOfOptions++;
			}
			function insertName(link){
				var name = document.getElementById('sceneName');	
				name.value=link;
			}
		</script>
	</head>
	<body>
		<?php
			$options = array();
			if($_GET['scene'] != null){
				for($i = 0; $i < count($sceneFile['options']); $i++){
					array_push($options, [$sceneFile['options'][$i][0], $sceneFile['options'][$i][1]]);
				}
			}
			if($_POST != null){
				$count = count($options);
				while($_POST['option' . $count] != null || $_POST['optionLink' . $count] != null){
					$des = $_POST['option' . $count];
					if($des == null) $des = '';
					$link = $_POST['optionLink' . $count];
					if($link == null) $link = '';
					array_push($options, [$des, $link]);
					$count = $count + 1;
				}
			}
		?>	
		<h2>Scene Editor</h2>
		<a href="storyEditor.php?story=<?=$_GET['story']?>">Go back to Story Index</a>
		<table>
			<tr><td>
				<form method="POST" action='<?=$_SERVER['SELF'] . "?story=" . $_GET['story'] . "&scene=" . $_GET['scene'] ?>'>
					<?=$name?>
					Scene Name:
					<input type="text" id="sceneName" name="name" value="<?=$scene?>"></input>	
					<br>Body:<br>
					<?=$bodyErr?>
					<textarea type="text" cols='100' rows='10' name="body"><?=$body?></textarea><br>
					Options:<br>
					<div id="options">
					<?php
						if(count($options) == 0){
							echo "Option Description: ";
							echo "<input type='text' name='option0'><br>";
							echo "Option Link: ";
							echo "<input type='text' name='optionLink'><br>";

						}else{
							for($i = 0; $i < count($options); $i++){
								if($i != 0) echo "<hr>";
								echo $optionError[$i];
								echo "Option Description: ";
								echo "<input type='text' name='option" . $i . "' value='" . $options[$i][0] . "'><br>";
								echo "Option Link: ";
								echo "<input type='text' name='optionLink" . $i . "' value='" . $options[$i][1] . "'><br>";
							}
						}
					?>
					</div>
					<input type="submit">
					<input type="button" value="More Options" onclick="addOption();">
				</form>	
			</td>
			<td>
				<h3>Existing Scenes</h3> 
				<?php
					foreach($storyFile['content'] as $key => $value){
						if($key != $_GET['scene']) echo $key . "<br>";
					}
				?>
				<h3>Empty Links</h3>
				<?php
					$store = array();
					foreach($storyFile['content'] as $key => $value){
						for($i = 0; $i < count($value['options']); $i++){
							$link = $value['options'][$i][1];
							if(!array_key_exists($link, $store)){
								$store[$link] = true;
								if(!array_key_exists($link, $storyFile['content'])) echo "<a style='text-decoration: underline; cursor:pointer'   onclick='insertName(\"" . $link . "\");'>" . $link . "</a><br>";
							}
						}
					}
				?>
			</td></tr>
		</table>
	</body>
</html>
