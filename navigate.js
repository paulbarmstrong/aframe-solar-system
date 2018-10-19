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
		
		this.target = this.el.sceneEl.querySelector("#transformations");
		this.scaling = false;
		
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
			
			// If the target has a body component, set the velocity
			if (this.target.hasAttribute("body")) {
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
	/*	if (stateType == this.StateType.Dragging) {
			var drags = [];
			this.hands.forEach(function (key, value, map) {
				if (value == this.StateType.Dragging) {
					drags.push(key);
				}
			}.bind(this));
			if (drags.length == 1 && drags[0] != handEl) {
				this.scaling = true;
			}
		} else if (this.hands.has(handEl) && this.hands.get(handEl).type == this.StateType.Dragging
				&& stateType == this.StateType.None && this.scaling) {
			this.scaling = false;
		}
		*/


	
		if (this.hands.has(handEl)) {
			this.endState(handEl, this.hands.get(handEl));
		}
		var newState = {type: stateType};
		if (stateType != this.StateType.None) {
			this.startState(handEl, newState);
		}
		this.hands.set(handEl, newState);

		
	/*	var params = {count: 0};
		this.hands.forEach(function (key, value, map) {
			if (value == HandState.Dragging) {
				this.count++;
			}
		}.bind(params));
		if (params.count == 2) {
			this.scaling = true;
		} */
	},
	getHandState: function (handEl) {
		this.hands.get(handEl);
	},
	removeHand: function (handEl) {
		this.hands.delete(handEl);
	},
	getVertAxis: function (evt) {
		this.vertJoyAxis = evt.detail.axis[1];
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
 