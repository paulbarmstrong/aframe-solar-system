/**
	Javascript script: handle-on-click
	
	Author: Paul Armstrong
	
	Description:
		This script will handle the onclick for buttons in the a-frame scene.
	
**/


function handleOnClick(str) {
	
	var satelliteSystem = document.querySelector('a-scene').systems["satellite"];
	var target = document.querySelector("#"+str);
	if (satelliteSystem != null && target != null) {
		satelliteSystem.target = target;
	}
}



