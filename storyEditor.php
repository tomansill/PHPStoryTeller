<!DOCTYPE html>
<html>
	<head>
	</head>
	<body>
		<?php
		if($_GET['new'] != null){
			$error = "";
			if($_POST['name'] != null || $_POST['name'] == ''){
				if(strlen($_POST['name']) < 3){
					$error = "The name must be 3 characters long or greater<br>";
				}else{
					if(file_exists("stories/" . $_POST['name'] . ".json")){
						$error = "A story with that name already exists!<br>";
					}else{
						$array = array(
								"title" => $_POST['name'],
								"content" => array( "start" => array( "body" => "beginning of the story", "options" => []) ) 
								);
						$str = json_encode($array, JSON_PRETTY_PRINT);
						file_put_contents("stories/" . $_POST['name'] . ".json", $str);
						header("Location: " . $_SERVER['SELF'] . "?story=" . $_POST['name']);
					}
				}
			}
			?>
				<h1>New Story</h1>
				<form method="POST" action="<?=$_SERVER['SELF']?>?new=true">
				<?=$error?>
				Story Name: 
				<input name='name' type="text" autofocus>
				<br>
				<input type="submit">
				</form>
				<?php
		}else if($_GET['story'] == null){
			//choose story
			echo "<h1>Story Chooser</h1><hr>";
			$storyList = scandir("stories/", SCANDIR_SORT_ASCENDING);
			if($storyList == false) echo "Something is wrong, directory not found";
			for($i = 0; $i < count($storyList); $i++){
				if($storyList[$i] != '.' && $storyList[$i] != '..') 
					echo "<a href='" . $_SERVER['SELF'] . "?story=" . $storyList[$i] . "'>" .$storyList[$i] . "</a><br>";
			}//End of for loop
			echo "<hr> <a href='" . $_SERVER['SELF'] . "?new=true'" . ">Create your own story</a>";
		}else{
			$storyFile = json_decode(file_get_contents('stories/' . $_GET['story']), true);
			if($storyFile == null){
				echo "Story file failed to open!";
			}else{
				//make entire page
				echo "<h1>" . $storyFile['title'] . "</h1>";
				echo "<a href='storyGraph.php?story=" . $_GET['story'] . "'> View Graph</a><br>";
				echo "<a href='sceneEditor.php?story=" . $_GET['story'] . "'> Create new scene </a>";
				echo "<hr>";
				echo "There are " . count($storyFile['content']) . " scenes.<br>";
				foreach($storyFile['content'] as $key => $value){
					echo "<a href='sceneEditor.php?story=" . $_GET['story'] . "&scene=" . $key . "'>" . $key . "</a><br>"; 
				}
			}
		}
		?>
	</body>
</html>
