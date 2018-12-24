/**
	A-Frame Component: border-circle
	
	Author: Paul
	
	Description:
		This component will create a circle of edges using a THREE.js LineSegments Object3D
	
	Schema:
		radius - Radius of the circle in units
		segments - Number of segments in the circle's geometry


**/

AFRAME.registerComponent("border-circle", {
	schema: {
		radius: {type: "number", default: 1},
		segments: {type: "number", default: 360}
	},
	update: function () {
		
		// Create a new circle with the new schema
		this.geo = new THREE.Geometry();
		for (var i = 0; i <= this.data.segments; i++) {
			this.geo.vertices.push(
					new THREE.Vector3(Math.cos(THREE.Math.degToRad(i))*this.data.radius, Math.sin(THREE.Math.degToRad(i))*this.data.radius, 0));
		}
		var circle = new THREE.Line(this.geo, new THREE.LineBasicMaterial());
		this.el.setObject3D("circle", circle);
	}
});




