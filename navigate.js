/**
	A-Frame Component: navigate
	
	Author: Paul Armstrong
	
	Description:
		This component will use tracked-controls events to allow for navigation.


**/


AFRAME.registerComponent("navigate", {
	init: function () {
		
		// Bind functions
		this.onButtonDown = this.onButtonDown.bind(this);
		this.onButtonUp = this.onButtonUp.bind(this);
		this.newVector3 = this.newVector3.bind(this);
		this.setPos = this.setPos.bind(this);
		this.setScale = this.setScale.bind(this);
		
		// Set starting variables
		this.dragging = false;
		this.offset = new THREE.Vector3(0,0,0);
		this.target = this.el.sceneEl.querySelector("#solar-system");
		
		// Match events with functions
		this.el.addEventListener("buttondown", this.onButtonDown);
		this.el.addEventListener("buttonup", this.onButtonUp);
		
	},
	tick: function () {
		
		// If dragging, move the target
		if (this.dragging) {
			this.setPos(this.target.object3D, this.newVector3(this.el.object3D.position).add(this.startPos));
		}
	},
	onButtonDown: function (evt) {
		
		// If it is the trigger, start dragging
		if (evt.detail.id == 1) {
			this.startPos = this.newVector3(this.target.object3D.position).sub(this.el.object3D.position);
			this.dragging = true;
		}
	},
	onButtonUp: function (evt) {
		
		// If it is the trigger, stop dragging
		if (evt.detail.id == 1) {
			this.dragging = false;
		}
	},
	newVector3: function (v) {
		return new THREE.Vector3(v.x, v.y, v.z);
	},
	setPos: function (obj, newPos) {
		obj.position.set(newPos.x, newPos.y, newPos.z);
	},
	setScale: function (obj, newPos) {
		obj.scale.set(newPos.x, newPos.y, newPos.z);
	}
});
