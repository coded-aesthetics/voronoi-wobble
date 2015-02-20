var width = Math.max(960, innerWidth),
    height = Math.max(500, innerHeight);

var i = 0;

var movePusher = function() {
    var m = d3.mouse(this);
    pusher.x = m[0];
    pusher.y = m[1];
};

var colors = [];
function randomColors() {
    console.log("randomColors");
    colors = [];
    for (var q = 10; q--;) {
        var r = Math.floor(Math.random() * 255);
        var g = Math.floor(Math.random() * 255);
        var b = Math.floor(Math.random() * 255);
        colors.push("rgb(" + r + "," + g + "," + b + ")");
    }
}

var svg = d3.select("body").append("svg")
    .attr("width", width)
    .attr("height", height)
    .on("mousemove", movePusher)
    .on("click", randomColors);



svg.append("rect")
    .attr("width", width)
    .attr("height", height);

var pusher = {force: 240000.0, x: width / 2.0, y: height / 2.0}



var points = [];

for (;i<200; i++) {
    var x = Math.random()*width;
    var y = Math.random()*height;
/*
    var circle = svg.insert("circle", "rect")
        .attr("cx", x)
        .attr("cy", y)
        .attr("r", 2)
        .style("stroke", d3.hsl(123, 1, .5))
            .style("fill", d3.hsl(123, 1, .5))
        .style("stroke-opacity", 1);
*/
    points.push({
        x: x,
        y: y,
        dir: {
            x: 0.0,
            y: 0.0
        },
        root: {
            x: x,
            y: y
        },
        force: 0.08/*,
        elem:circle*/
    });
}



function moveYa(spring, deltaTime) {
    var root = spring.root;
    var vector = spring;

    var distVec = {x: vector.x - pusher.x, y: vector.y - pusher.y};
    var distRoot = {x: root.x - vector.x, y: root.y - vector.y};
    var dist2 = distVec.x * distVec.x + distVec.y * distVec.y;
    var dist3 = distRoot.x * distRoot.x + distRoot.y * distRoot.y;

    //if (dist2 > 120000 && Math.abs(spring.dir.x) + Math.abs(spring.dir.y) < 0.5) return spring;


    var dist4 = dist2;

    if (dist2 <= 60) dist2 = 60;

    //if (dist3 <= 1) dist3 = 1;
    var force1 = pusher.force;
    if (dist2 != 0) {
        var force1 = pusher.force /** (Math.sin(delta)+1)*/ / Math.sqrt(dist2);
    }

    var force2 = spring.force * dist3;
    var force = (force2 - force1) / 1000.0 * deltaTime;

    if (dist3 > 0) {
        distRoot.x = distRoot.x / Math.sqrt(dist3) * (force2 / 1000.0 * deltaTime);
        distRoot.y = distRoot.y / Math.sqrt(dist3) * (force2 / 1000.0 * deltaTime);
    }

    if (dist4 > 0) {
        distVec.x = distVec.x / Math.sqrt(dist4) * (force1 / 1000.0 * deltaTime);
        distVec.y = distVec.y / Math.sqrt(dist4) * (force1 / 1000.0 * deltaTime);
    }

    var dir_tmp = {
        x: spring.dir.x + distVec.x + distRoot.x,
        y: spring.dir.y + distVec.y + distRoot.y
    };
    spring.dir = dir_tmp;


    function reset() {
        spring.dir.x = 0;
        spring.dir.y = 0;
        spring.x = spring.root.x;
        spring.y = spring.root.y;
    }

    if (spring.dir.x>10000 ) {
        //console.log("dir.x", spring.dir.x, deltaTime);
        reset();
    }

    if (spring.dir.y>10000 ) {
        //console.log("dir.y", spring.dir.y, deltaTime);
        reset();
    }

    if (spring.dir.x<-10000 ) {
        //console.log("dir.x", spring.dir.x, deltaTime);
        reset();
    }
    if (spring.dir.y<-10000 ) {
        //console.log("dir.y", spring.dir.y, deltaTime);
        reset();
    }


    spring.dir.x *= 0.9;
    spring.dir.y *= 0.9;

    spring.x += spring.dir.x;
    spring.y += spring.dir.y;

    if (spring.x > 10000 ) {
        //console.log("x", spring.x, deltaTime);
        reset();
    }

    if (spring.y > 10000 ) {
        //console.log("y", spring.y, deltaTime);
        reset();
    }

    if (spring.x < -10000 ) {
        //console.log("x", spring.x, deltaTime);
        reset();
    }

    if (spring.y < -10000 ) {
        //console.log("y", spring.y, deltaTime);
        reset();
    }

    return [spring.x, spring.y];
}

var lastTime = new Date().getTime();

var path = svg.append("g").selectAll("path");

var pts = [];

function polygon(d) {
    //console.log(d[0]);
    if (!d) {
        console.log("d not defined");
        return "M0.0,0.0L0.0,0.0Z";
    }
    if (d.length < 2) {
        console.log("d too short");
        return "M0.0,0.0L0.0,0.0Z";
    }
    return "M" + d.join("L") + "Z";
}

var voronoi = d3.geom.voronoi();//.clipExtent([[0, 0], [width, height]]);

randomColors();

var aaa = setInterval(function() {
    var thisTime = new Date().getTime();
    var delta = thisTime - lastTime;
    pts = [];
    points.forEach(
        function(spring) {
            pts.push(moveYa(spring, delta));
            //var s = spring.dir.x + spring.dir.y;
            //spring.elem.attr("cx", spring.x).attr("cy", spring.y);
            //.style("stroke", d3.hsl(s, 1, .5)).style("fill", d3.hsl(s, 1, .5));
        });
    try {
        path = path.data(voronoi(pts), polygon);

        path.exit().remove();
    } catch (e) {
        console.log("caught", e);
        console.log(path);
        console.log(pts);
        console.log(voronoi(pts));
        clearInterval(aaa);
    }
    try {
        path.enter().append("path")
            .attr("style", function(d, i) {
                return "fill:" + colors[i % 5];
            })
            .attr("d", polygon);
    } catch (e) {
        console.log("caught", e);
    }
    path.order();

    lastTime = thisTime;
}, 0.01);