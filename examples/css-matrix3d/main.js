let prevTransform, prevAnchors = [];

let shiftDown;
document.addEventListener("keydown", (e) => {
  if (e.key == "Shift") shiftDown = true;
});

document.addEventListener("keyup", (e) => {
  if (e.key == "Shift") shiftDown = false;
});

function transform2d(elt, x1, y1, x2, y2, x3, y3, x4, y4) {
  var w = elt.offsetWidth, h = elt.offsetHeight;

  var transform;
  if (!prevTransform)
    transform = PerspT([0, 0, w, 0, 0, h, w, h], [x1, y1, x2, y2, x3, y3, x4, y4]);
  if (prevTransform)
    transform = PerspT(prevAnchors, [x1, y1, x2, y2, x3, y3, x4, y4]);

  var t = transform.coeffs;
  t = [t[0], t[3], 0, t[6],
       t[1], t[4], 0, t[7],
       0   , 0   , 1, 0   ,
       t[2], t[5], 0, t[8]];

  prevTransform = transform;
  t = "matrix3d(" + t.join(", ") + ")";
  elt.style["-webkit-transform"] = t;
  elt.style["-moz-transform"] = t;
  elt.style["-o-transform"] = t;
  elt.style.transform = t;
}

corners = [100, 100, 300, 100, 100, 300, 300, 300];

function initTransform() {
  var box = document.getElementById("box");
  transform2d(box, corners[0], corners[1], corners[2], corners[3],
                   corners[4], corners[5], corners[6], corners[7]);
  for (var i = 0; i != 8; i += 2) {
    var elt = document.getElementById("marker" + i);
    elt.style.left = corners[i] + "px";
    elt.style.top = corners[i + 1] + "px";
  }

  for (var i=0;i != 8; i += 2) {
    let inverse = prevTransform.transformInverse(corners[i], corners[i+1]);
    prevAnchors[i] = inverse[0];
    prevAnchors[i+1] = inverse[1];
  }
  // calculate anchor points in origin space
}

function update() {
  var box = document.getElementById("box");
  for (var i = 0; i != 8; i += 2) {
    var elt = document.getElementById("marker" + i);
    elt.style.left = corners[i] + "px";
    elt.style.top = corners[i + 1] + "px";
  }
  if (shiftDown) {
    // Calculate new anchors from transform inverse
    let i = currentcorner;
    let inverse = prevTransform.transformInverse(corners[i], corners[i+1]);
    prevAnchors[i] = inverse[0];
    prevAnchors[i+1] = inverse[1];
  } else {
    transform2d(box, corners[0], corners[1], corners[2], corners[3],
                     corners[4], corners[5], corners[6], corners[7]);
  }
}

function move(evnt) {
  if (currentcorner < 0) return;
  corners[currentcorner] = evnt.pageX;
  corners[currentcorner + 1] = evnt.pageY;
  update();
}

currentcorner = -1;
window.addEventListener('load', function() {
  document.documentElement.style.margin="0px";
  document.documentElement.style.padding="0px";
  document.body.style.margin="0px";
  document.body.style.padding="0px";

  // Init transform:
  initTransform();
  // update();
});
window.addEventListener('mousedown', function(evnt) {
  var x = evnt.pageX, y = evnt.pageY, dx, dy;
  var best = 400; // 20px grab radius
  currentcorner = -1;
  for (var i = 0; i != 8; i += 2) {
    dx = x - corners[i];
    dy = y - corners[i + 1];
    if (best > dx*dx + dy*dy) {
      best = dx*dx + dy*dy;
      currentcorner = i;
    }
  }
  move(evnt);
});
window.addEventListener('mouseup', function(evnt) {
  currentcorner = -1;
})
window.addEventListener('mousemove', move);
