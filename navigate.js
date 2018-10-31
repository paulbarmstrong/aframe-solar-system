/**
	A-Frame Component/System: navigate
   
	Author: Paul
   
	Description:
		This component will use tracked-controls events to allow for navigation.
 
 
**/


AFRAME.registerSystem("navigate", {
	init: function () {
		
		// Bind functions
		this.startState = this.startState.bind(this);
		this.endState = this.endState.bind(this);
		this.setHandState = this.setHandState.bind(this);
		this.getHandState = this.getHandState.bind(this);
		this.removeHand = this.removeHand.bind(this);
		this.getOtherDrag = this.getOtherDrag.bind(this);
		
		this.target = this.el.sceneEl.querySelector("#transformations");
		
		// Scaling variables
		this.scaling = false;
		this.timeScaleEnd = 0;
		
		// Define the this.StateType Enumeration
		this.StateType = Object.freeze({"None" : 0, "Dragging" : 1, "Flying" : 2, "Scaling" : 3});
		
		// Create a map to keep track of hand states
		this.hands = new Map();
	},
	tick: function (time, deltaTime) {
		if (!this.scaling) {
			this.hands.forEach(function (state, handEl, map) {
				if (state.type == this.StateType.Dragging) {
					
					// Use the position of the controller and starting offset to find the new position
					var newPos = handEl.object3D.position.clone().add(state.offset);
				   
					// Use the difference between the position and newPos with deltaTime to determine drag velocity
					state.velocity = newPos.clone().sub(this.target.object3D.position).multiplyScalar(1000.0 / deltaTime);
				   
					// Set the new position
					this.target.object3D.position.copy(newPos);
				} else if (state.type == this.StateType.Flying) {
					
					// If flying, use the vertJoyAxis to change position over time
					state.velocity = handEl.object3D.localToWorld(new THREE.Vector3(0, 0, -state.vertJoyAxis)).sub(handEl.object3D.getWorldPosition());
					this.target.object3D.position.add(state.velocity.clone().multiplyScalar(deltaTime / 1000));
					
				}
			}.bind(this));
		} else {
			
			var midpoint = this.leftEl.object3D.position.clone().add(this.rightEl.object3D.position).multiplyScalar(0.5);
			var distance = this.leftEl.object3D.position.distanceTo(this.rightEl.object3D.position);
			
			this.target.object3D.scale.copy(this.scale0.clone().multiplyScalar(distance / this.distance0));
			this.target.object3D.position.copy(
					this.position0.clone().add(
					this.midpoint0.clone().sub(this.position0).multiplyScalar((this.distance0 - distance) / this.distance0)));
			
		}
	},
	startState: function (handEl, newState) {
		if (newState.type == this.StateType.Dragging) {
			newState.velocity = new THREE.Vector3(0,0,0);
			newState.offset = this.target.object3D.position.clone().sub(handEl.object3D.position);
			
			// If the target has a body component, set the velocity to zero
			if (this.target.hasAttribute("body")) {
				this.target.setAttribute("body", {velocity: new THREE.Vector3(0,0,0)});
			}
		} else if (newState.type == this.StateType.Flying) {
			
			handEl.addEventListener("axismove", this.getVertAxis.bind(newState));
			newState.vertJoyAxis = 0.0;
			
			// If the target has a body component, set the velocity to zero
			if (this.target.hasAttribute("body")) {
				this.target.setAttribute("body", {velocity: new THREE.Vector3(0,0,0)});
			}
		}
	},
	endState: function (handEl, oldState) {
		if (oldState.type == this.StateType.Dragging) {
			
			// If the target has a body component and scaling hasn't ended recently, set the velocity
			if (this.target.hasAttribute("body") && ((new Date()).getTime() - this.timeScaleEnd > 500)) {
				this.target.setAttribute("body", {velocity: oldState.velocity.multiplyScalar(2)});
			}
		} else if (oldState.type == this.StateType.Flying) {
			
			handEl.removeEventListener("axismove", this.getVertAxis);
			
			// If the target has a body component, set the velocity
			if (this.target.hasAttribute("body")) {
				this.target.setAttribute("body", {velocity: oldState.velocity.multiplyScalar(0.5)});
			}
		}
	},
	setHandState: function (handEl, stateType) {
		// If the new state is the same as the old state, return
		if (this.hands.has(handEl) && this.hands.get(handEl).type == stateType) {
			return;
		}

		// First check if this should initiate scaling instead of the given state type
		var otherDrag = this.getOtherDrag(handEl);
		if (stateType == this.StateType.Dragging && otherDrag != null && !this.scaling) {
			this.leftEl = otherDrag;
			this.rightEl = handEl;
			this.midpoint0 = this.leftEl.object3D.position.clone().add(this.rightEl.object3D.position).multiplyScalar(0.5);
			this.distance0 = this.leftEl.object3D.position.distanceTo(this.rightEl.object3D.position);
			this.scale0 = this.target.object3D.scale.clone();
			this.position0 = this.target.object3D.position.clone();
			
			this.scaling = true;
		} else if (stateType == this.StateType.None && this.hands.has(handEl) && this.hands.get(handEl).type == this.StateType.Dragging
				&& this.scaling) {
			
			// If the other hand is still dragging, correct the drag's offset after scaling
			if (otherDrag != null) {
				var otherState = this.hands.get(otherDrag);
				otherState.offset = this.target.object3D.position.clone().sub(otherDrag.object3D.position);
				otherState.velocity = new THREE.Vector3(0,0,0);
			}
			
			this.timeScaleEnd = (new Date()).getTime();
			
			this.scaling = false;
		}
	
		if (this.hands.has(handEl)) {
			this.endState(handEl, this.hands.get(handEl));
		}
		var newState = {type: stateType};
		if (stateType != this.StateType.None) {
			this.startState(handEl, newState);
		}
		this.hands.set(handEl, newState);
	},
	getHandState: function (handEl) {
		this.hands.get(handEl);
	},
	removeHand: function (handEl) {
		this.hands.delete(handEl);
	},
	getVertAxis: function (evt) {
		this.vertJoyAxis = evt.detail.axis[1];
	},
	getOtherDrag: function (handEl) {
		var drags = [];
		this.hands.forEach(function (value, key, map) {
			if (key != handEl && value.type == this.StateType.Dragging) {
				drags.push(key);
			}
		}.bind(this));
		if (drags.length == 1) {
			return drags[0];
		} else {
			return null;
		}
	}
}); 

AFRAME.registerComponent("navigate", {
	init: function () {
		
		// Define the this.StateType Enumeration
		this.StateType = Object.freeze({"None" : 0, "Dragging" : 1, "Flying" : 2, "Scaling" : 3});
	   
		// Bind functions
		this.onButtonDown = this.onButtonDown.bind(this);
		this.onButtonUp = this.onButtonUp.bind(this);
	   
		// Register with the system
		this.system.setHandState(this.el, this.StateType.None);

		// Match events with functions
		this.el.addEventListener("buttondown", this.onButtonDown);
		this.el.addEventListener("buttonup", this.onButtonUp);
	   
	},
	update: function () {
	   
		// Update the target when the schema changes
		this.target = this.el.sceneEl.querySelector("#"+this.data.target);
	},
	onButtonDown: function (evt) {
		if (evt.detail.id == 1) {
			this.system.setHandState(this.el, this.StateType.Dragging);
		} else if (evt.detail.id == 0) {
			this.system.setHandState(this.el, this.StateType.Flying);
		}
	},
	onButtonUp: function (evt) {
		
		if (evt.detail.id == 0 || evt.detail.id == 1) {
			this.system.setHandState(this.el, this.StateType.None);
		}
	},
	remove: function () {
		
		// Unregister with the system
		this.system.removeHand(this.el);
	}
});