/**
	A-Frame Component/System: satellite
	
	Author: Paul
	
	Description:
		This component will turn the entity into a sphere revolving its parent location.
		It will also create a pin entity in sceneEl to show the location of the sphere.
	
	Schema:
		color - A hex color to be applied to the sphere
		radius - Radius of the satellite in units (Think of it as astronomical units)
		distance - Distance from the parent body in units (Think of it as astronomical units)
		period - Period of the satellite in minutes (Think of it as earth years)
		pin - Boolean of whether or not to create a pin
		project - Boolean of whether or not to project a line to the floor

**/

AFRAME.registerSystem("satellite", {
	init: function () {
		
		// Bind functions
		this.registerSat = this.registerSat.bind(this);
		this.unregisterSat = this.unregisterSat.bind(this);
		
		// Set starting variables
		this.target = this.el.sceneEl.querySelector("#Sun");
		this.frameOfRef = this.el.sceneEl.querySelector("#frame-of-reference");
		this.camera = this.el.sceneEl.querySelector("#camera");
		this.satellites = [];
		
		// Define a function to check for satellite name changes
		this.nameCheck = AFRAME.utils.throttle(function (sat) {
			for (var i = 0; i < this.satellites.length; i++) {
				var sat = this.satellites[i];
								
				if (sat != null && sat.pinObj != null) {
					if (sat.el.id != sat.name) {
						sat.name = sat.el.id;
						sat.pinObj.setAttribute("text", {value: sat.name});
					}
				}
			}
		}, 1000, this);
		
	},
	tick: function (time, deltaTime) {
				
		for (var i = 0; i < this.satellites.length; i++) {
			
			var sat = this.satellites[i];
			
			// Move the satellite
			var specificTime = Math.PI*time/(sat.data.period*30000);
			var newPos = new THREE.Vector3(Math.sin(specificTime)*sat.data.distance, 0, Math.cos(specificTime)*sat.data.distance);
			sat.el.object3D.position.copy(newPos);
			
			if (sat.pinObj != null && this.camera != null) {
				
				// Rescale and rotate the pinObj to face the camera at the correct scale
				var oldFactor = sat.pinObj.object3D.scale.x;
				var newFactor = sat.el.object3D.getWorldPosition().distanceTo(this.camera.object3D.position)/sat.el.object3D.getWorldScale().x;
				sat.pinObj.object3D.scale.lerp(new THREE.Vector3(newFactor, newFactor, newFactor), oldFactor < 0.01 ? 0.05 : 1);
				sat.pinObj.object3D.setRotationFromEuler(this.camera.object3D.rotation);
				
				// Change the visibility of the pinObj if the text scale factor is very crazy
				sat.pinObj.object3D.visible = oldFactor > 0.005;
			}
		}
		
		// Perform a name check every second (function is throttled)
		this.nameCheck();
		
		// Translate the frame of reference to offset the position of the target
		if (this.frameOfRef != null && this.target != null) {
			this.frameOfRef.object3D.position.copy(this.frameOfRef.object3D.worldToLocal(this.target.object3D.getWorldPosition()).multiplyScalar(-1));
		}
		
	},
	registerSat: function (satRef) {
		this.satellites.push(satRef);
	},
	unregisterSat: function (satRef) {
		var index = this.satellites.indexOf(satRef);
		if (index > 0) {
			this.satellites.splice(index, 1);
		}
	}
});

AFRAME.registerComponent("satellite", {
	schema: {
		color: {type: "string", default: "#ffffff"},
		radius: {type: "number", default: 1},
		distance: {type: "number", default: 0},
		period: {type: "number", default: 1},
		pin: {type: "boolean", default: true},
		project: {type: "boolean", default: true}
	},
	init: function () {
		
		// Bind functions
		this.getMesh = this.getMesh.bind(this);
		
		// Register with the system
		this.system.registerSat(this);
		
		// Set starting variables
		this.orbitTime = 0;
		this.camera = this.el.sceneEl.querySelector("#camera");
		this.name = this.el.id;
		
	},
	update: function () {
		
		// Give this entity geometry, material, and position
		this.el.setAttribute("geometry", "primitive: sphere; radius: 1");
		this.el.setAttribute("material", "color:"+this.data.color);
		this.el.setAttribute("position", (new THREE.Vector3(1,1,1)).multiplyScalar(this.data.distance));
		
		// Set the scale of the three.js mesh directly (to avoid affecting children's scale factor)
		var mesh = this.getMesh(this.el.object3D);
		if (mesh != null) {
			mesh.scale.set(this.data.radius, this.data.radius, this.data.radius);
		}
		
		// Handle changes of whether or not to have a pin
		if (this.data.pin) {
			if (this.pinObj == null) {
				this.pinObj = document.createElement("a-entity");
				this.el.appendChild(this.pinObj);
				this.pinObj.setAttribute("id", this.el.id+"-pin");
				this.pinObj.setAttribute("line", "start: 0 0 0; end: 0.1 0 0; color: white");
				this.pinObj.setAttribute("text", "value:"+this.el.id+"; align: center; xOffset: 0.2");
			}
		} else {
			if (this.pinObj != null) {
				this.pinObj.parentNode.removeChild(this.pinObj);
				this.pinObj = null;
			}
		}
		
		// Handle changes of whether or not to project
		if (this.data.project) {
			this.el.setAttribute("line", "start: 0 0 0; end: 0 -.5 0; color: white");
		} else {
			this.el.removeAttribute("line");
		}
	},
	remove: function () {
		
		// Remove attributes
		this.el.removeAttribute("geometry");
		this.el.removeAttribute("material");
		this.el.removeAttribute("position");
		this.el.removeAttribute("line");
		
		// Unregister with the system
		this.system.unregisterSat(this);
		
		// Remove the pin
		if (this.pinObj != null) {
			this.pinObj.parentNode.removeChild(this.pinObj);
			this.pinObj = null;
		}
	},
	getMesh: function (object3D) {
		
		// Do a breadth first search to find the mesh object3D at the highest possible level of the object3D tree
		var queue = [object3D];
		while (queue.length > 0) {
			object3D = queue.shift();
			if (object3D.type == "Mesh") {
				return object3D;
			}
			for (var i = 0; i < object3D.children.length; i++) {
				queue.push(object3D.children[i]);
			}
			object3D = object3D.children[0];
		}
		return null;
	}
});