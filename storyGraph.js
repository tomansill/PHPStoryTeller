$('document').ready(function(){
	initialize();
});
//adjList = {"v1": {"adjacency": ["v2"],"pos": [140,10],"force": [0,0],"velocity": [0,0], "color":"blue"}, "v2": {"adjacency": ["v1", "v3"],"pos": [0,0],"force": [0,0],"velocity": [0,0], "color":"white"}, "v3": {"adjacency": ["v1","v4"],"pos":[140,100],"force": [0,0],"velocity": [0,0], "color":"red"}, "v4": {"adjacency": ["v3"],"pos":[10,100],"force": [0,0],"velocity": [0,0], "color":"green"}};
//adjList = {"v1": {"adjacency": ["v2"],"pos": [140,10],"force": [0,0],"velocity": [0,0], "color":"blue"}, "v2": {"adjacency": ["v1"],"pos": [0,0],"force": [0,0],"velocity": [0,0], "color":"white"}};
var ctx;
var mouseDownOn = null;
var mouseOver = false;
var oldMousePos;
var width;
var height;
var clip = {"top":0, "right":0, "bottom":0, "left":0};
var simulation = false;
function initialize(){
	console.log(adjList);
	var element = document.getElementById("mainCanvas");
	ctx = element.getContext("2d");
	element.addEventListener("mousedown", doMouseDown, false);
	element.addEventListener("mouseup", doMouseUp, false);
	element.addEventListener("mousemove", doMouseMove, false);
	element.addEventListener("mouseover", doMouseOver, false);
	element.addEventListener("mouseout", doMouseOut, false);
	element.addEventListener("mousewheel", doMouseWheel, false);
	element.addEventListener("DOMMouseScroll", doMouseWheel, false);
	window.addEventListener("keydown", keyboardPress, false);
	window.addEventListener('resize', resizeCanvas, false);
	width = window.innerWidth;
	height = window.innerHeight;
	clip['right'] = window.innerWidth;
	clip['bottom'] = window.innerHeight;
	centerClip();
	centerGraph();
	resizeCanvas();
	render();
	simulation = true;
	setInterval(function(){simulate();}, 1000/60);
}
function simulate(){
	if(simulation){
		//physics simulation
		for(var key in adjList) adjList[key]['force'] = [0,0];
		var edgeList = new Array();
		for(var key in adjList){
			for(var target in adjList){
				if(key != target){
					//get height and width
					var x = adjList[target]['pos'][0] - adjList[key]['pos'][0];		
					var y = adjList[target]['pos'][1] - adjList[key]['pos'][1];		
					var dist = Math.sqrt(Math.pow(x, 2) + Math.pow(y, 2));
					var force = 100000*(1/Math.pow(dist,2));
					var xforce = (x*force)/dist; 
					var yforce = (y*force)/dist; 
					adjList[key]['force'] = [adjList[key]['force'][0]-xforce,adjList[key]['force'][1]-yforce];
				}
			}//End of for loop	
			for(var i = 0; i < adjList[key]['adjacency'].length; i++){
				var target = adjList[key]['adjacency'][i];
				if(target in adjList && !([adjList[key]['pos'], adjList[target]['pos']] in edgeList || [adjList[target]['pos'], adjList[key]['pos']] in edgeList)){
					edgeList[[adjList[key]['pos'], adjList[target]['pos']]] = 1;
					var x = adjList[target]['pos'][0] - adjList[key]['pos'][0];		
					var y = adjList[target]['pos'][1] - adjList[key]['pos'][1];		
					var dist = Math.sqrt(Math.pow(x, 2) + Math.pow(y, 2));
					var force = -dist*0.2;
					var xforce = (x*force)/dist; 
					var yforce = (y*force)/dist; 
					adjList[key]['force'] = [adjList[key]['force'][0]-xforce,adjList[key]['force'][1]-yforce];
					adjList[target]['force'] = [adjList[target]['force'][0]+xforce,adjList[target]['force'][1]+yforce];
				}
			}
		}//End of for loop
		//update
		var continueSim = true;
		for(var key in adjList){
			//add velocity
			adjList[key]['velocity'][0] += (adjList[key]['force'][0]/100);
			adjList[key]['velocity'][1] += (adjList[key]['force'][1]/100);
			//add friction
			var fricCoeff = 0.008;
			var fricx = Math.abs(adjList[key]['velocity'][0]) - (fricCoeff*Math.abs(adjList[key]['force'][0])); 
			var fricy = Math.abs(adjList[key]['velocity'][1]) - (fricCoeff*Math.abs(adjList[key]['force'][1])); 
			if(fricx < 0) fricx = 0;
			if(fricy < 0) fricy = 0;
			if(adjList[key]['velocity'][0] < 0) fricx *= -1; 
			if(adjList[key]['velocity'][1] < 0) fricy *= -1; 
			adjList[key]['velocity'][0] = fricx;
			adjList[key]['velocity'][1] = fricy;
			//check if graph stopped moving
			var sensitivity = 0.0001
			if((adjList[key]['velocity'][0] > sensitivity ||  adjList[key]['velocity'][0] < -sensitivity) 
				&& (adjList[key]['velocity'][1] > sensitivity || adjList[key]['velocity'][1] < -sensitivity)){
				if((adjList[key]['force'][0] > sensitivity ||  adjList[key]['force'][0] < -sensitivity) 
					&& (adjList[key]['force'][1] > sensitivity || adjList[key]['force'][1] < -sensitivity)){
					continueSim = false;
				}
			}
			//move the vertex
			adjList[key]['pos'][0] += (adjList[key]['velocity'][0])*(1000/60);
			adjList[key]['pos'][1] += (adjList[key]['velocity'][1])*(1000/60);
		}//End of for loop
		//stop simulation if graph stopped moving
		if(continueSim) simulation = false;
		//draw
		render();	
	}
}
function doMouseMove(event){
	if(mouseDownOn != null){
		var dx = event.pageX - oldMousePos[0];
		var dy = event.pageY - oldMousePos[1];
		oldMousePos[0] = event.pageX;
		oldMousePos[1] = event.pageY;
		if(mouseDownOn == true) translateClip(-dx, -dy);
		else translateVertex(mouseDownOn, dx, dy);
	}
}
function keyboardPress(event){
	if(simulation) simulation = false;
	else simulation = true;	
	render();
}
function doMouseDown(event){
	oldMousePos = [event.pageX, event.pageY];
	var scale = Math.min(width/(clip['right']-clip['left']), height/(clip['bottom']-clip['top']));
	//get surface
	for(var key in adjList){
		var pos = adjList[key]['pos'];
		var x = event.pageX - ((pos[0] - clip['left'])*(width/(clip['right']-clip['left'])));
		var y = event.pageY - ((pos[1] - clip['top'])*(height/(clip['bottom']-clip['top'])));
		var dist = Math.sqrt(Math.pow(x, 2) + Math.pow(y, 2));
		//console.log("key: " + key + " x: " + x + " y: " + y + " dist: " + dist); 
		if(dist < 20*scale){
			mouseDownOn = key;
		}
	}
	if(mouseDownOn == null) mouseDownOn = true;
}
function doMouseUp(event){
	mouseDownOn = null;
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
function translateVertex(key, dx, dy){
	var scale = Math.min(width/(clip['right']-clip['left']), height/(clip['bottom']-clip['top']));
	dx /= scale;
	dy /= scale;
	adjList[key]['pos'][0] += dx;	
	adjList[key]['pos'][1] += dy;	
	render();
}
function translateClip(dx, dy){
	var scale = Math.min(width/(clip['right']-clip['left']), height/(clip['bottom']-clip['top']));
	dx /= scale;
	dy /= scale;
	clip['left'] += dx;
	clip['right'] += dx;
	clip['top'] += dy;
	clip['bottom'] += dy;
	render();
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
	render();
}
function drawCircle(ctx, x, y, scale, color){
	ctx.beginPath();
	ctx.arc(x, y, 10*scale, 0, 2*Math.PI);
	ctx.closePath();
	ctx.fillStyle="gray";
	ctx.fill();	
	ctx.beginPath();
	ctx.arc(x, y, 8*scale, 0, 2*Math.PI);
	ctx.closePath();
	ctx.fillStyle=color;
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
function drawDebugArrow(ctx, x0, y0, dx, dy){
	ctx.beginPath();
	ctx.lineTo(x0, y0);
	ctx.lineTo(x0 + dx, y0 + dy);
	ctx.strokeStyle="red";
	ctx.stroke();	
}
function drawArrowhead(ctx, x0, y0, x1, y1, scale){
	//console.log("arrowhead function start x0: " + x0 + " y0: " + y0 + " x1: " + x1 + " y1: " + y1);
	//find location on edge of circle
	var x = x1 - x0;
	var y = y1 - y0;
	var h = Math.sqrt(Math.pow(x, 2) + Math.pow(y, 2));
	//console.log("x: " + x + " y: " + y + " h: " + h);
	var newX = (10*scale*x)/h;
	var newY = (10*scale*y)/h;
	//console.log("newX: " + newX + " newY: " + newY);
	ctx.beginPath();
	ctx.lineTo(x0 + (x-newX), y0 + (y-newY));
	//console.log("first point: x: " + (x-newX) + " y: " + (y-newY)); 
	//now find point down the line a little
	newX = (20*scale*x)/h;
	newY = (20*scale*y)/h;
	//console.log("newX: " + newX + " newY: " + newY);
	x -= newX;
	y -= newY;
	//console.log("updated x: " + x + " y: " + y + " h: " + h);
	//go to next point where corner of arrow will be located at 
	newX = (5*scale*x)/h;
	newY = (5*scale*y)/h;
	//console.log("newX: " + newX + " newY: " + newY);
	ctx.lineTo(x0 + (x-newX), y0 + (y+newY));
	//console.log("second point: x: " + (x-newX) + " y: " + (y-newY)); 
	//find the last point
	ctx.lineTo(x0 + (x+newX), y0 + (y-newY));
	//console.log("final point: x: " + (x-newX) + " y: " + (y-newY)); 
	//console.log(" ");
	//close the loop and fill the loop
	ctx.closePath();
	ctx.fillStyle='black';
	ctx.fill();
}
function resizeCanvas(){
	var widthDiff = window.innerWidth - width;
	var heightDiff = window.innerHeight - height;
	width = window.innerWidth;
	height = window.innerHeight;
	ctx.canvas.width = width;
	ctx.canvas.height = height;
	clip['right'] += widthDiff/2;
	clip['bottom'] += heightDiff/2;;
	clip['left'] -= widthDiff/2;
	clip['top'] -= heightDiff/2;;
	render();
}
function centerClip(){
	clip['right'] = width/2;
	clip['left'] = -width/2;
	clip['bottom'] = height/2;
	clip['top'] = -height/2;
}
function centerGraph(){
	var leftpoint = null;
	var rightpoint = null;
	var toppoint = null;
	var bottompoint = null;
	for(var key in adjList){
		var pos = adjList[key]['pos'];
		if(leftpoint == null)	leftpoint = pos[0];
		else leftpoint = Math.min(leftpoint, pos[0]);
		if(rightpoint == null)	rightpoint = pos[0];
		else rightpoint = Math.max(rightpoint, pos[0]);
		if(toppoint == null)	toppoint = pos[1];
		else toppoint = Math.min(toppoint, pos[1]);
		if(bottompoint == null)	bottompoint = pos[1];
		else bottompoint = Math.max(bottompoint, pos[1]);	
	}
	var x = (rightpoint - leftpoint)/2;
	var y = (bottompoint - toppoint)/2;
	for(var key in adjList){
		adjList[key]['pos'][0] -= x;	
		adjList[key]['pos'][1] -= y;	
	}
}

function render(){
	console.log("");
	console.log("render");
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
			renderlist.push(['circle', x, y, adjList[vertex]['color'], adjList[vertex]['force']]);
		}
		//edge
		for(var i = 0; i < adjList[vertex]['adjacency'].length; i++){
			var key = adjList[vertex]['adjacency'][i];
			if(key in adjList){
				var obj = [pos, adjList[key]['pos']];
				lines.push(obj);
				console.log(vertex + " to " + key);
			}
		}//End of for loop
	}//End of for loop

	//clean up lines and remove any lines that is outside of the canvas
	var visitedLines = new Array();
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
				console.log("lines");
				if(!([start, end] in visitedLines)){
					var obj = ['line', Math.floor((start[0]-clip['left'])*xscale), Math.floor((start[1]-clip['top'])*yscale), Math.floor((end[0]-clip['left'])*xscale), Math.floor((end[1]-clip['top'])*yscale)];
					renderlist.unshift(obj);
				}
				var arrow = ['arrowhead', Math.floor((lines[i][0][0]-clip['left'])*xscale), Math.floor((lines[i][0][1]-clip['top'])*yscale), Math.floor((lines[i][1][0]-clip['left'])*xscale), Math.floor((lines[i][1][1]-clip['top'])*yscale)];
				renderlist.unshift(arrow);
			}

		}
	}//End of for loop
	for(var i = 0; i < renderlist.length; i++){
		//console.log(renderlist[i]);
		if(renderlist[i][0] == 'circle'){
			//drawDebugArrow(ctx, renderlist[i][1], renderlist[i][2], renderlist[i][4][0], renderlist[i][4][1]);
			drawCircle(ctx, renderlist[i][1], renderlist[i][2], scale, renderlist[i][3]);
		}else if(renderlist[i][0] == 'line'){
			drawLine(ctx, renderlist[i][1], renderlist[i][2], renderlist[i][3], renderlist[i][4], scale);
		}else if(renderlist[i][0] == 'arrowhead'){
			drawArrowhead(ctx, renderlist[i][1], renderlist[i][2], renderlist[i][3], renderlist[i][4], scale);
		}
	}//End of for loop
	//insert text
	if(simulation){
		ctx.font="30px Verdana";
		ctx.fillStyle = 'black';
		ctx.fillText("simulation",5,30);
	}
}
/*
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
		//console.log("horiz " + start + " " + end);
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
*/
