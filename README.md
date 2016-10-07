# grainjs, a graphics library for javascript

A small opinionated library that makes working with html canvas easy and productive

It provides a small scene graph system of Layers and Boxes that can handle events, have z indexing, have backgrounds, and more. It also provides image loading and other utilities. So that creating small interactive graphics for the web is fun and easy.

It is opinionated. It uses the APIs you know for rendering to the canvas. It uses a system of delegation instead of inheritance. And it enhances the javascript environment with a few extras, like `[1,2,3].sum()` and `.max()` because nobody has time to wait for committees.

But that does make it productive :)

Example code, a draggable image:

```javascript
var scene = createScene(400, 400)

// create an object that can be dragged
var sun = {
    // the layer we are going to display, with a sun image as background
    layer: new Layer({x:100, y:100, width:32, height:32, backgroundImage:scene.image("sun.png")}),

    // an event handler for onmousedown/ontouchstart
    ondown: function(event) {
        // to implement dragging, follow this ondown event
        // the callback will be called for every `onmove` and finally the last `onup` event
        // we capture our start, and use the follow `event.delta` to calculate our new position
        var start = {x: sun.layer.x, y: sun.layer.y}
        event.follow(function(event) {
            sun.layer.x = start.x + event.delta.x
            sun.layer.y = start.y + event.delta.y
            if (event.last) console.log("done dragging")
        })
    },

    // this is how we can draw, {0,0} is the layer {left,top}, but otherwise g is a normal canvas 2d context
    // if any background or border was set in `style` that has already been drawn before draw is called
    // drawing outside of the layer is perfectly fine ...
    draw: function(g) {
        g.strokeStyle = "red"
        g.rect(0, 0, this.layer.width, this.layer.height)
        g.stroke()
    }
}

// add the object to the scene
// as the object has a layer, the layer is added and the object is made the delegate of the layer
scene.root.add(sun)

// if ever we wish to remove the object again, the following are equivalent:
// `scene.root.removeChild(sun)`, `scene.root.removeChild(sun.layer)` or `sun.layer.remove()`

// style the root layer, it can also be given a delegate
scene.root.style.background = "lightblue"
```
