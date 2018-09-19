/**
	A-Frame Component: satellite
	
	Author: Paul Armstrong
	
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
		this.setPos = this.setPos.bind(this);
		this.setScale = this.setScale.bind(this);
		
		// Set starting variables
		this.orbitTime = 0;
		this.camera = this.el.sceneEl.querySelector("#camera");
		this.name = this.el.id;
		
	},
	update: function () {
		
		// Give this entity geometry, material, and position
		this.el.setAttribute("geometry", "primitive: sphere; radius:"+this.data.radius);
		this.el.setAttribute("material", "color:"+this.data.color);
		this.el.setAttribute("position", (new THREE.Vector3(1,1,1)).multiplyScalar(this.data.distance));		
		
		// Handle changes of whether or not to have a pin
		if (this.data.pin) {
			if (this.pinObj == null) {
				this.pinObj = document.createElement("a-entity");
				this.el.sceneEl.appendChild(this.pinObj);
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
	tick: function (time, timeDelta) {
		
		// Move the satellite
		this.el.object3D.position.set(Math.sin(this.orbitTime)*this.data.distance, 0, Math.cos(this.orbitTime)*this.data.distance);
		this.orbitTime += Math.PI*timeDelta/(this.data.period*30000);
		
		if (this.pinObj != null && this.camera != null) {
			
			// Move/scale/rotate the pin
			this.setPos(this.pinObj.object3D, this.el.object3D.getWorldPosition());
			this.setScale(this.pinObj.object3D, (new THREE.Vector3(1,1,1)).multiplyScalar(
							1*this.pinObj.object3D.position.distanceTo(this.camera.object3D.position)));
			this.pinObj.object3D.setRotationFromEuler(this.camera.object3D.rotation);
			
			// If the name updates, change the text
			if (this.el.id !== this.name) {
				this.name = this.el.id;
				this.pinObj.setAttribute("text",{value: this.name});
			}
		}
	},
	remove: function () {
		
		// Remove attributes
		this.el.removeAttribute("geometry");
		this.el.removeAttribute("material");
		this.el.removeAttribute("position");
		this.el.removeAttribute("line");
		
		// Remove the pin
		if (this.pinObj != null) {
			this.pinObj.parentNode.removeChild(this.pinObj);
			this.pinObj = null;
		}
	},
	setPos: function (obj, newPos) {
		obj.position.set(newPos.x, newPos.y, newPos.z);
	},
	setScale: function (obj, newPos) {
		obj.scale.set(newPos.x, newPos.y, newPos.z);
	}
});
