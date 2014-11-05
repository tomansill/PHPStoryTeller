$('document').ready(function(){
	initialize();
});
//var adjListomp= {"v1": {"adjacency": ["v2", "v3", "v4"],"pos": [10,10]},"v2": {"adjacency": ["v3","v4"],"pos": [100,40]}, "v3": { "adjacency": ["v2","v4"],"pos": [60,100]},"v4": {"adjacency": ["v2","v3","v1"],"pos": [100,100]}};
//adjList = {"v1": {"adjacency": ["v2", "v3"],"pos": [140,120],"force": [0,0],"velocity": [0,0]}, "v2": {"adjacency": ["v1", "v3"],"pos": [0,0],"force": [0,0],"velocity": [0,0]}, "v3": {"adjacency": ["v1", "v2"],"pos":[120,50],"force": [0,0],"velocity": [0,0]}};
var context;
var mouseup = true;
var mouseOver = false;
var oldMousePos;
var width;
var height;
var clip = {"top":0, "right":0, "bottom":0, "left":0};
var live = false;
function initialize(){
	console.log(adjList);
	var element = document.getElementById("mainCanvas");
	context = element.getContext("2d");
	width = context.canvas.width;
	height = context.canvas.height;
	clip['right'] = width;
	clip['bottom'] = height;
	console.log(clip);
	element.addEventListener("mousedown", doMouseDown, false);
	element.addEventListener("mouseup", doMouseUp, false);
	element.addEventListener("mousemove", doMouseMove, false);
	element.addEventListener("mouseover", doMouseOver, false);
	element.addEventListener("mouseout", doMouseOut, false);
	element.addEventListener("mousewheel", doMouseWheel, false);
	element.addEventListener("DOMMouseScroll", doMouseWheel, false);
	window.addEventListener("keydown", keyboardPress, false);
	render(context, clip);
	setInterval(function(){update();}, 1000/60);
}
function update(){
	if(live){
		//physics simulation
		var undirectedLines = new Array();
		for(var key in adjList){
			console.log("key: " + key + " pos: " + adjList[key]['pos']);
			//physics simulation on each vertices
			for(var target in adjList){
				if(key != target){
					console.log("target: " + target);
					//calculate distance between two vertices		
					var x = adjList[key]['pos'][0] - adjList[target]['pos'][0];
					var y = adjList[key]['pos'][1] - adjList[target]['pos'][1];
					//console.log("x: " + x + " y: " + y);
					var dist = Math.sqrt(Math.pow(x, 2) + Math.pow(y, 2));
					//console.log("distance between " + key + " and " + target + " is " + dist);
					//repulsive force, find amount of force
					var force = (1/dist);
					var deg = Math.atan(y/x);
					//console.log("force: " + force + " deg: " + (deg*57.2957795));
					var dispx = force*Math.cos(deg);
					var dispy = force*Math.sin(deg);
					if(x < 0 && y < 0){
						dispx *= -1;
						dispy *= -1;
					}
					//console.log("repulsive displacement in x: " + dispx + " y: " + dispy);
					//add force
					adjList[key]['force'] = [adjList[key]['force'][0]+dispx, adjList[key]['force'][1]+dispy];
				}
			}//End of for loop
			//physics simulation on each edge of vertex
			for(var i = 0; i < adjList[key]['adjacency'].length; i++){
				var target = adjList[key]['adjacency'][i];
				if(target in adjList){
					if(![key, target] in undirectedLines && ![target, key] in undirectedLines){
						undirectedLines[[key, target]] = 1;
						//console.log("adjacency");
						//sometimes people didn't finish developing keys after they added a key in adjacency list
						//calculate distance
						var x = adjList[key]['pos'][0] - adjList[target]['pos'][0];
						var y = adjList[key]['pos'][1] - adjList[target]['pos'][1];
						//console.log("x: " + x + " y: " + y);
						var dist = Math.sqrt(Math.pow(x, 2) + Math.pow(y, 2));
						console.log("distance between " + key + " and " + target + " is " + dist);
						//attractive force, find amount of force
						//var force = Math.sqrt(dist/100);;
						var force = dist*0.001;
						var deg = Math.atan(y/x);
						//console.log("force: " + force + " deg: " + (deg*57.2957795));
						var dispx = -force*Math.cos(deg);
						var dispy = -force*Math.sin(deg);
						if(x < 0 && y < 0){
							dispx *= -1;
							dispy *= -1;
						}
						console.log("attraction displacement in x: " + dispx + " y: " + dispy);
						//add force
						adjList[key]['force'] = [adjList[key]['force'][0]+dispx, adjList[key]['force'][1]+dispy];
						adjList[target]['force'] = [adjList[target]['force'][0]-dispx, adjList[target]['force'][1]-dispy];
					}
				}
			}//End of for loop
			console.log("force: " + adjList[key]['force']);
		}//End of for loop
		//update
		for(var key in adjList){
			//add velocity
			adjList[key]['velocity'][0] += adjList[key]['force'][0];
			adjList[key]['velocity'][1] += adjList[key]['force'][1];
			//apply some friction
			var fricx = Math.abs(adjList[key]['velocity'][0]) - 0.01;
			var fricy = Math.abs(adjList[key]['velocity'][0]) - 0.01;
			if(fricx < 0) fricx = 0;
			if(fricy < 0) fricy = 0;
			if(adjList[key]['velocity'][0] < 0) fricx *= -1;
			if(adjList[key]['velocity'][1] < 0) fricy *= -1;
			adjList[key]['velocity'][0] = fricx;
			adjList[key]['velocity'][1] = fricy;
			//move the vertex
			adjList[key]['pos'][0] += (adjList[key]['velocity'][0])*(1000/60);
			adjList[key]['pos'][1] += (adjList[key]['velocity'][1])*(1000/60);
			adjList[key]['force'] = [0,0];
		}//End of for loop
		//draw
		render(context, clip);	
	}
}
function doMouseDown(event){
	mouseup = false;
	oldMousePos = [event.pageX, event.pageY];
}
function doMouseMove(event){
	if(!mouseup){
		var dx = event.pageX - oldMousePos[0];
		var dy = event.pageY - oldMousePos[1];
		oldMousePos[0] = event.pageX;
		oldMousePos[1] = event.pageY;
		translateClip(-dx, -dy);
	}
}
function keyboardPress(event){
	if(live) live = false;
	else live = true;	
	render(context, clip);
}
function doMouseUp(event){
	mouseup = true;
}
function doMouseOver(event){
	mouseOver = true;
}
function doMouseOut(event){
	mouseOver = true;
}
function doMouseWheel(event){
	if(mouseOver){
		var delta = Math.max(-1, Math.min(1, (event.wheelDelta || -event.detail)));
		scaleClip(delta);
	}
}
function translateClip(dx, dy){
	var scale = Math.min(width/(clip['right']-clip['left']), height/(clip['bottom']-clip['top']));
	dx /= scale;
	dy /= scale;
	clip['left'] += dx;
	clip['right'] += dx;
	clip['top'] += dy;
	clip['bottom'] += dy;
	render(context, clip);
}
function scaleClip(delta){
	var zoomLevel = 20;
	var x = (clip['right'] - clip['left'])/2;
	var y = (clip['bottom'] - clip['top'])/2;
	var xzoomLevel = zoomLevel;
	var yzoomLevel = (y/x)*zoomLevel;
	x += (xzoomLevel*delta);
	y += (yzoomLevel*delta);
	clip['left'] = (clip['left'] + ((clip['right'] - clip['left'])/2)) - x;
	clip['right'] = (clip['right'] - ((clip['right'] - clip['left'])/2)) + x;
	clip['top'] = (clip['top'] + ((clip['bottom'] - clip['top'])/2)) - y;
	clip['bottom'] = (clip['bottom'] - ((clip['bottom'] - clip['top'])/2)) + y;
	render(context, clip);
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
function drawLine(ctx, x0, y0, x1, y1, scale){
	ctx.beginPath();
	ctx.lineTo(x0, y0);
	ctx.lineTo(x1, y1);
	ctx.strokeStyle='black';
	ctx.lineWidth = 2*scale;
	ctx.stroke();
}

function clipLine(start, end, clip){
	//console.log("start: " + start + " end: " + end);
	//check if vertical or horizontal
	if(start[0] == end[0]){
		//vertical
		if(start[1] < clip['top']) start[1] = clip['top'];
		if(end[1] > clip['bottom']) end[1] = clip['bottom'];
		if(end[1] < clip['top']) end[1] = clip['top'];
		if(start[1] > clip['bottom']) start[1] = clip['bottom'];
		console.log("vert " + start + " " + end);
	}else if(start[1] == end[1]){
		//horizontal
		if(start[0] < clip['left']) start[0] = clip['left'];
		if(end[0] > clip['right']) end[0] = clip['right'];
		if(end[0] < clip['left']) end[0] = clip['left'];
		if(start[0] > clip['right']) start[0] = clip['right'];
		console.log("horiz " + start + " " + end);
	}else{
		//start with the easy part
		if(end[0] >= clip['right']){
			var locx = Math.abs(end[0] - start[0]);
			var locy = Math.abs(end[1] - start[1]);
			var newx = locx - clip['right'];
			var newy = (locy*newx)/locx;
			end[0] = clip['right'];
			end[1] = Math.floor(newy + start[1]);
		}
		if(start[0] < clip['left']){
			var locx = Math.abs(end[0] - start[0]);
			var locy = Math.abs(end[1] - start[1]);
			var newx =  locx - clip['left'];
			var newy = (locy*newx)/locx;
			start[0] = clip['left'];
			start[1] = Math.floor((locy - newy));
		}
		console.log("modified start: " + start + " end: " + end);

		//now the hard part
		////upper
		if(end[1] < clip['top']){
			var locx = Math.abs(end[0] - start[0]);
			var locy = Math.abs(end[1] - start[1]);
			console.log("locx: " + locx + " locy: " + locy);
			var newy = locy - clip['top'];
			var newx = (locx*newy)/locy;
			console.log("newx: " + newx + " newy: " + newy);
			end[0] = Math.floor(newx + start[0]);
			end[1] = clip['top'];
			console.log("end: " + end);
		}
		if(start[1] < clip['top']){
			var locx = Math.abs(end[0] - start[0]);
			var locy = Math.abs(end[1] - start[1]);
			console.log("locx: " + locx + " locy: " + locy);
			var newy = locy - clip['top'];
			var newx = (locx*newy)/locy;
			console.log("newx: " + newx + " newy: " + newy);
			start[0] = Math.floor(newx + start[0]);
			start[1] = clip['top'];
			console.log("start: " + start);
		}
		////lower
	}
	return [start, end];
}

function render(ctx, clip){
	//background
	ctx.fillStyle='#FFFFFF';
	ctx.fillRect(0,0,width,height);
	//add all lines to lines list and add all visible vertices in renderlist
	var lines = new Array();
	var renderlist = new Array();
	var scale = Math.min(width/(clip['right']-clip['left']), height/(clip['bottom']-clip['top']));
	var xscale = width/(clip['right'] - clip['left']);
	var yscale = height/(clip['bottom'] - clip['top']);
	for(var vertex in adjList){
		var pos = adjList[vertex]['pos'];
		//vertex
		if(pos[0]+10 >= clip['left'] && pos[0]-10 < clip['right'] && pos[1]+10 >= clip['top'] && pos[1]-10 < clip['bottom']){
			var x = Math.floor((pos[0] - clip['left'])*xscale);
			var y = Math.floor((pos[1] - clip['top'])*yscale);
			renderlist.push(['circle', x, y]);
		}
		//edge
		for(var i = 0; i < adjList[vertex]['adjacency'].length; i++){
			var key = adjList[vertex]['adjacency'][i];
			if(key in adjList){
				var obj = [pos, adjList[key]['pos']];
				lines.push(obj);
			}
		}//End of for loop
	}//End of for loop
	//clean up lines and remove any lines that is outside of the canvas
	for(var i = 0; i < lines.length; i++){
		var start = lines[i][0];
		var end = lines[i][1];
		if(start[0]>end[0]){
			//switch the arrays
			var temp = end;
			end = start;
			start = temp;
		}
		//check if within the area
		if(end[0] >= clip['left'] && Math.max(start[1], end[1]) >= clip['top'] && Math.min(start[1], end[1]) < clip['bottom'] && start[0] < clip['right']){
			//console.log("clipping started");
			//var returned = clipLine(start, end, clip);
			//start = returned[0];
			//end = returned[1];
			//console.log("return: " + start + " " + end);
			if(start[0] != end[0] || start[1] != end[1]){ //check if line is not reduced to a point or simply too small
				var obj = ['line', Math.floor((start[0]-clip['left'])*xscale), Math.floor((start[1]-clip['top'])*yscale), Math.floor((end[0]-clip['left'])*xscale), Math.floor((end[1]-clip['top'])*yscale)];
				renderlist.unshift(obj);
			}
			
		}
	}//End of for loop
	for(var i = 0; i < renderlist.length; i++){
		//console.log(renderlist[i]);
		if(renderlist[i][0] == 'circle'){
			drawCircle(ctx, renderlist[i][1], renderlist[i][2], scale);
		}else if(renderlist[i][0] == 'line'){
			drawLine(ctx, renderlist[i][1], renderlist[i][2], renderlist[i][3], renderlist[i][4], scale);
		}
	}//End of for loop
	//insert text
	if(live){
		ctx.font="30px Verdana";
		ctx.fillStyle = 'black';
		ctx.fillText("simulation",5,30);
	}
}
