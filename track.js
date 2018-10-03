/**
    A-Frame Component: track
   
    Author: Paul
   
    Description:
        This component will track the target
 
**/
 
 
AFRAME.registerComponent("track", {
    schema: {
        target: {default: ""}
    },
    init: function () {
        this.target = this.el.sceneEl.querySelector("#"+this.data.target);
    },
    update: function () {
       
        // Update the target when the schema changes
        this.target = this.el.sceneEl.querySelector("#"+this.data.target);
    },
    tick: function (time, deltaTime) {
       
        // Translate this el to offset the position of the target
        if (this.target != null) {
            this.el.object3D.position.copy(this.el.object3D.worldToLocal(this.target.object3D.getWorldPosition()).multiplyScalar(-1));
        }
    }
});