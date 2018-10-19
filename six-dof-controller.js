/**
	A-Frame Component: six-dof-controller
	
	Author: Paul Armstrong
	
	Description:
		This component will determine if an oculus touch or vive controller is present,
		and will implement either oculus-touch-controls or vive-controls component.
	
	Schema:
		Either "right" or "left" depending on the controller hand

**/

AFRAME.registerComponent("six-dof-controller", {
	schema: {type: "string", default: ""},
	init: function () {
		
		this.el.addEventListener("model-loaded", this.decideController.bind(this));

		// Set both the vive-controls and oculus-touch-controls components
		this.el.setAttribute("vive-controls", "hand: "+this.data+"; buttonColor: #202020");
		this.el.setAttribute("oculus-touch-controls", "hand: "+this.data);
				
	},
	decideController: function () {
		var gamepads = navigator.getGamepads();
		if (gamepads.length > 0) {
			if (gamepads[0].id.startsWith("OpenVR")) {
				
				// If it is a vive controller, remove oculus-touch-controls
				this.el.removeAttribute("oculus-touch-controls");
				
				// Provide a .glb version of the vive model A-Frame uses because the obj loader is broken
				this.el.setAttribute("gltf-model", "url(models/vive_controller_model.glb)");
				evt.detail.model.getObjectByName("body").material.color.set("#202020");
			} else {
				
				// If it is an oculus touch controller, remove vive-controls
				this.el.removeAttribute("vive-controls");
			}
		} else {
			
			// If there is no controller, remove both components
			this.el.removeAttribute("vive-controls");
			this.el.removeAttribute("oculus-touch-controls");
		}
	}
});
