/**
	A-Frame Component: body
	
	Author: Paul Armstrong

	Description:
		This component will treat the entity as a 3D body with a velocity
	
	Schema:
		velocity - THREE.Vector3 for the velocity of the body

**/


AFRAME.registerComponent("body", {
	schema: {
		velocity: {type: "vec3", default: new THREE.Vector3(0,0,0)},
		dampenVelocity: {type: "boolean", default: true}
	},
	init: function () {
		
		// Set starting variables
		this.enabled = true;
		
	},
	update: function () {
		// If the velocity is high enough, enable actions every tick
		if (this.vec3magnitudeSq(this.data.velocity) > 0.001) {
			this.enabled = true;
		}
	},
	tick: function (time, timeDelta) {
		
		// If enabled, perform a transformation and possibly dampen the velocity
		if (this.enabled) {
			this.el.object3D.position.add(this.vec3multiplyScalar(this.vec3ToTHREEVector3(this.data.velocity), timeDelta/1000));
			if (this.data.dampenVelocity) {
				this.vec3multiplyScalar(this.data.velocity, 0.98);
			}
			
			// If the velocity becomes low enough, disable actions every tick
			if (this.vec3magnitudeSq(this.data.velocity) < 0.001) {
				this.enabled = false;
			}
		}
	},
	
	// Function for creating a THREE.Vector3 from a vec3
	vec3ToTHREEVector3: function (v) {
		return new THREE.Vector3(v.x, v.y, v.z);
	},
	// Function for finding the squared magnitude of vec3 objects
	vec3magnitudeSq: function (v) {
		return (v.x*v.x + v.y*v.y + v.z*v.z);
	},
	// Function for multiplying vec3 objects by a scalar
	vec3multiplyScalar: function (v, num) {
		v.x *= num; v.y *= num; v.z *= num; return v;
	},
});