"use strict"

function calc(farmers, size) {
    var totalcows = farmers.sum()
    var totalmilk = Math.max(0, Math.min(totalcows * 5, size - totalcows * 5))
    return farmers.map(cows => totalcows <= 0? 0: cows * totalmilk / totalcows)
}
assert(calc([1, 1], 50).equals([5, 5]))
assert(calc([1, 2, 3, 4], 100).equals([5, 10, 15, 20]))

// return n.toFixed(1) but slice of the ".0"
function roundText(n) {
    var s = n.toFixed(1)
    if (s.charAt(s.length - 1) === "0".charAt(0)) return s.slice(0, -2)
    return s
}

// render a cow with a color highlight around it
function maskedCow(g, color, x, y, s) {
    var width = cow.width * s
    var height = cow.height * s
    var s1 = 0.045
    var s2 = 1 + s1 * 2
    g.save()
    // cut out image
    g.globalCompositeOperation = "destination-out"
    g.drawImage(cow, x-width*s1, y-height*s1, width*s2, height*s2)
    // fill empty space with solid color
    g.globalCompositeOperation = "destination-atop"
    g.fillStyle = color
    g.rect(Math.round(x - 20), Math.round(y - 20), Math.round(width + 40), Math.round(height + 40))
    g.clip()
    g.fill()
    g.restore()
    // render image normally
    g.drawImage(cow, x, y, width, height)
}

class Farm {
    constructor(x, y, color) {
        this.layer = new Layer({x, y, width:90, height:80}, this)
        this.color = color

        this.x = this.startx = 0
        this.y = this.starty = 0
        this.cows = 0
        this.milk = 0
    }

    ondown(event) {
        this.startx = event.x
        this.starty = event.y
        event.follow((event)=> {
            this.x = event.delta.x
            this.y = event.delta.y
            if (event.last) {
                var x = event.globalx - this.startx
                var y = event.globaly - this.starty
                if (field.containsXY(x + 30, y + 30)) {
                    this.cows += 1
                    scene.root.add(new Cow(this, x, y))
                } else if (Math.abs(this.x) < 5 && Math.abs(this.y) < 5) {
                    this.cows += 1
                    scene.root.add(new Cow(this, field.x + rndint(field.width - 30), field.y + rndint(field.height - 30)))
                }
                this.x = this.startx = 0
                this.y = this.starty = 0
            }
        })
    }

    draw(g) {
        maskedCow(g, this.color, this.x, this.y, 1)
        g.fillStyle = "black"
        g.fillText("milk: "+ roundText(this.milk), -2, this.layer.height + 18)
    }
}

class Cow {
    constructor(farm, x, y) {
        this.farm = farm
        this.layer = new Layer({x, y, width:cow.width*0.75, height:cow.height*0.75, z:-1}, this)
    }

    ondown() {
        this.layer.remove()
        this.farm.cows -= 1
        assert(this.farm.cows >= 0)
    }

    draw(g) {
        maskedCow(g, this.farm.color, 0, 0, 0.75)
    }
}

var scene = createScene(700, 300, "tragedy")
var cow = scene.image("cow.png")

// data of the simulation
var size = 50
var totalcows = 0
var totalmilk = 0

// recalculate before rendering
scene.onrender = ()=>{
    var cowsperfarm = farms.map(farm => farm.cows)
    var milkperfarm = calc(cowsperfarm, size)
    farms.each((farm, n)=> farm.milk = milkperfarm[n])
    totalcows = cowsperfarm.sum()
    totalmilk = milkperfarm.sum()
}

// create graphics scene, using manual layout
scene.root.style.background = "white"

var field = new Layer({z:-2, x:113, y:3, width:400, height:280, background:"#494", borderRadius:10, border:"#272", borderWidth:2})

var total = new Layer({z:1, x:123, y:240}, (g)=>{
    g.strokeStyle = "#282"
    g.fillStyle = "white"
    var m = roundText(totalmilk)
    var s = roundText(Math.max(0, size - totalcows * 10))
    g.strokeText("grass: "+ s +", total milk: "+ m, -1, 29)
    g.fillText("grass: "+ s +", total milk: "+ m, 0, 30)

    var s = []
    if (totalcows > 0 && farms.filter(farm => farm.cows !== farms[0].cows).length === 0) s.push("fair")
    if (totalcows > size / 10) s.push("overuse")
    if (fequals(totalmilk, size/2)) s.push("max")
    if (s.length) {
        var text = s.join(", ")
        g.strokeText(text, -1, 3)
        g.fillText(text, 0, 4)
    }
})

var farms = [new Farm(10, 30, "#F77"), new Farm(525, 30, "#77F")]

// add everything to the scene
scene.root.add(farms[0], field, farms[1], total)

