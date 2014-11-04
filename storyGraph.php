<!DOCTYPE html>
<html>
	<head>
		<script src="//code.jquery.com/jquery-1.11.0.min.js"></script>
		<script>
			$('document').ready(function(){
				mainLoop();	
			});
			var adjList = {"v1": {"adjacency": ["v2", "v3", "v4"],"pos": [0,0]},"v2": {"adjacency": ["v3","v4"],"pos": [100,0]}, "v3": { "adjacency": ["v2","v4"],"pos": [0,100]},"v4": {"adjacency": ["v2","v3","v1"],"pos": [100,100]}};
			function mainLoop(){
				var ctx = document.getElementById("mainCanvas").getContext("2d");
				var clip = {"top":-100, "right":300, "bottom":200, "left":-100};
				var cont = true;
				while(cont){
					//input
					//update
					render(ctx, clip);
					cont = false;
				}
			}
			function drawCircle(ctx, x, y, scale){
				ctx.beginPath();
				ctx.arc(x, y, 10*scale, 0, 2*Math.PI);
				ctx.closePath();
				ctx.fillStyle="gray";
				ctx.fill();	
				ctx.beginPath();
				ctx.arc(x, y, 8*scale, 0, 2*Math.PI);
				ctx.closePath();
				ctx.fillStyle="white";
				ctx.fill();	
			}
			function render(ctx, clip){
				//background
				ctx.fillStyle='#FFFFFF';
				ctx.fillRect(0,0,600,400);
				//normalize to screen coordinates
				var screen = [];
				for(var key in adjList){
					//left
					if((clip['left'] - 5) <= adjList[key]['pos'][0]){
						if((clip['top'] - 5) <= adjList[key]['pos'][1]){
							if((clip['right'] + 5) > adjList[key]['pos'][0]){
								if((clip['bottom'] + 5) > adjList[key]['pos'][1]){
									//inside the clip space
									//convert coordinates
									//var newObj = {"pos":[0,0]};
									//newObj['pos'][0] = (adjList[key]['pos'][0] - clip['left'])*(600/(clip['right']-clip['left']));
									//newObj['pos'][1] = (adjList[key]['pos'][1] - clip['top'])*(500/(clip['bottom']-clip['top']));
									screen.push(key);
								}
							}
						}
					}
				}
				//get scale for clip space
				var scale = 600/(clip['right']-clip['left']);
				console.log("scale: " + scale);
				//draw lines first then  everything
				console.log(screen);
				for(var i = 0; i < screen.length; i++){
					if(adjList[screen[i]]['adjacency'].length > 0){
						for(var j = 0; j < adjList[screen[i]]['adjacency'].length; j++){
							var neighbor = adjList[screen[i]]['adjacency'][j];
							console.log("key: " + neighbor);
							if($.inArray(neighbor, screen)){
								var startx = (adjList[screen[i]]['pos'][0] - clip['left'])*(600/(clip['right']-clip['left']));
								var starty = (adjList[screen[i]]['pos'][1] - clip['top'])*(500/(clip['bottom']-clip['top']));
								var endx = (adjList[neighbor]['pos'][0] - clip['left'])*(600/(clip['right']-clip['left']));
								var endy = (adjList[neighbor]['pos'][1] - clip['top'])*(500/(clip['bottom']-clip['top']));
								ctx.beginPath();
								ctx.lineTo(startx, starty);
								ctx.lineTo(endx, endy);
								ctx.lineWidth = 5;
								ctx.lineStyle = 'blue';
								ctx.stroke();
							}else{
								console.log("not in!");
							}
						}
					}
				}
				for(var i = 0; i < screen.length; i++){
					var x = (adjList[screen[i]]['pos'][0] - clip['left'])*(600/(clip['right']-clip['left']));
					var y = (adjList[screen[i]]['pos'][1] - clip['top'])*(500/(clip['bottom']-clip['top']));
					drawCircle(ctx, x, y, scale);	
				}
			}
		</script>
	</head>
	<body bgcolor='gray'>
		<canvas id='mainCanvas' width='600px' height='400px'>Your browser does not support HTML5 canvas tag.</canvas>
	</body>
</html>
