/**
    A-Frame Component: navigate
   
    Author: Paul Armstrong
   
    Description:
        This component will use tracked-controls events to allow for navigation.
 
 
**/
 
 
AFRAME.registerComponent("navigate", {
    schema: {
        target: {default: "transformations"}
    },
    init: function () {
       
        // Bind functions
        this.onButtonDown = this.onButtonDown.bind(this);
        this.onButtonUp = this.onButtonUp.bind(this);
        this.onAxisMove = this.onAxisMove.bind(this);
       
        // Flag variables
        this.dragging = false;
        this.flying = false;
       
        // Fly variables
        this.vertJoyAxis = 0.0;
        this.flyVelocity = new THREE.Vector3(0,0,0);
       
        // Drag variables
        this.dragVelocity = new THREE.Vector3(0,0,0);
        this.offset = new THREE.Vector3(0,0,0);
        this.target = this.el.sceneEl.querySelector("#"+this.data.target);
       
        // Match events with functions
        this.el.addEventListener("buttondown", this.onButtonDown);
        this.el.addEventListener("buttonup", this.onButtonUp);
        this.el.addEventListener("axismove", this.onAxisMove);
       
    },
    update: function () {
       
        // Update the target when the schema changes
        this.target = this.el.sceneEl.querySelector("#"+this.data.target);
    },
    tick: function (time, deltaTime) {
       
        // If dragging, move the target
        if (this.dragging) {
           
            // Use the position of the controller and starting offset to find the new position
            var newPos = this.el.object3D.position.clone().add(this.offset);
           
            // Use the difference between the position and newPos with deltaTime to determine drag velocity
            this.dragVelocity = newPos.clone().sub(this.target.object3D.position).multiplyScalar(1000.0 / deltaTime);
           
            // Set the new position
            this.target.object3D.position.copy(newPos);
        } else if (this.flying) {
           
            // If flying, use the vertJoyAxis to change position over time
            this.flyVelocity = this.el.object3D.localToWorld(new THREE.Vector3(0, 0, -this.vertJoyAxis)).sub(this.el.object3D.getWorldPosition());
            this.target.object3D.position.add(this.flyVelocity.clone().multiplyScalar(deltaTime / 1000));
        }
    },
    onButtonDown: function (evt) {
       
        // If it is the touchpad, start flying
        if (evt.detail.id == 0) {
            if (!this.dragging) {
                this.flying = true;
               
                // If the target has a body component, set the velocity to zero
                if (this.target.hasAttribute("body")) {
                    this.target.setAttribute("body", {velocity: new THREE.Vector3(0,0,0)});
                }
            }
           
       
        // If it is the trigger, start dragging
        } else if (evt.detail.id == 1) {
            if (!this.flying) {
                this.offset = this.target.object3D.position.clone().sub(this.el.object3D.position);
                this.dragging = true;
               
                // If the target has a body component, set the velocity to zero
                if (this.target.hasAttribute("body")) {
                    this.target.setAttribute("body", {velocity: new THREE.Vector3(0,0,0)});
                }
            }
        }
    },
    onButtonUp: function (evt) {
       
        // If it is the touchpad, stop flying
        if (evt.detail.id == 0) {
            this.flying = false;
           
            // If the target has a body component, set the velocity
            if (this.target.hasAttribute("body")) {
                this.target.setAttribute("body", {velocity: this.flyVelocity.multiplyScalar(0.5)});
            }
            this.flyVelocity = new THREE.Vector3(0,0,0);
       
        // If it is the trigger, stop dragging
        } else if (evt.detail.id == 1) {
            this.dragging = false;
           
            // If the target has a body component, set the velocity
            if (this.target.hasAttribute("body")) {
                this.target.setAttribute("body", {velocity: this.dragVelocity.multiplyScalar(2)});
            }
            this.dragVelocity = new THREE.Vector3(0,0,0);
        }
    },
    onAxisMove: function (evt) {
       
        this.vertJoyAxis = evt.detail.axis[1];
    }
});
 