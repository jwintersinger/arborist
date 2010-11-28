/*=======
  Grapher
  =======*/
function Grapher(graph_id, root) {
  this._root = root;
  this._canvas = document.getElementById(graph_id);

  this._radius             = 18;
  this._horizontal_spacing = 20;
  this._vertical_spacing   = 20;
  this._vertical_padding   = 2;

  this._resize_canvas();
  this._ctx = this._canvas.getContext('2d');

  this._ctx.font         = '20px sans-serif';
  this._ctx.textAlign    = 'center';
  this._ctx.textBaseline = 'middle';
}

Grapher.prototype._resize_canvas = function() {
  var max_depth = calculate_max_depth(this._root);
  var max_nodes_at_depth = Math.pow(2, max_depth - 1);

  var width = max_nodes_at_depth * 2*this._radius +
    (max_nodes_at_depth - 1) * this._horizontal_spacing;
  this._canvas.width = width;

  var height = max_depth * 2*this._radius +
    (max_depth - 1) * this._vertical_spacing + 2*this._vertical_padding;
  this._canvas.height = height;
}

Grapher.prototype.draw = function(x, y) {
  this._draw(
    this._root,
    this._canvas.width / 2,
    // Vertical padding necessary so that top of top circle isn't cut off.
    this._radius + this._vertical_padding,
    this._canvas.width / 4
  );
}

Grapher.prototype._draw = function(root, x, y, delta_x) {
  /*console.log([
    root.value,
    root.left  ? root.left.value  : undefined,
    root.right ? root.right.value : undefined
  ]);*/

  this._ctx.beginPath();
  this._ctx.arc(x, y, this._radius, 0, 2*Math.PI, false);
  this._ctx.stroke();
  this._ctx.fillText(root.value, x, y);

  this._draw_sub(root, 'left', x, y, delta_x);
  this._draw_sub(root, 'right', x, y, delta_x);
}

Grapher.prototype._draw_sub = function(root, sub, x, y, delta_x) {
  if(typeof root[sub] === 'undefined') return;

  var new_x = (sub === 'left') ? x - delta_x : x + delta_x;
  var new_y = y + 2*this._radius + this._vertical_spacing;

  this._ctx.moveTo(x, y + this._radius);
  this._ctx.lineTo(new_x, new_y - this._radius);
  this._ctx.stroke();
  this._draw(root[sub], new_x, new_y, delta_x / 2);
}



/*====
  Node
  ====*/
function Node(value, left, right) {
  this.value = value;
  this.left = left;
  this.right = right;
}



/*=======================
  Miscellaneous functions
  =======================*/
function generate_tree(levels, left_branch_prob, right_branch_prob) {
  var nodes = [], old_nodes = [];
  var total_nodes = 0;
  for(var level = levels; level > 0; level--) {
    for(var i = 0; i < Math.pow(2, level - 1); i++) {
      var node = new Node(++total_nodes);
      if(old_nodes.length >= 2) {
        if(Math.random() < left_branch_prob)  node.left  = old_nodes.pop();
        if(Math.random() < right_branch_prob) node.right = old_nodes.pop();
      }
      nodes.push(node);
    }
    old_nodes = nodes;
    nodes = [];
  }
  return old_nodes[0];
}

function calculate_max_depth(root, max) {
  if(typeof root === 'undefined') return max;
  if(typeof max === 'undefined') max = 0;

  max += 1;
  var left_depth =  calculate_max_depth(root.left,  max);
  var right_depth = calculate_max_depth(root.right, max);
  if(left_depth  > max) max = left_depth;
  if(right_depth > max) max = right_depth;
  return max;
}

function extract_params() {
  var params = window.location.search.substring(1).split(',');
  var named = {
    depth:      parseInt(params[0], 10),
    left_prob:  parseFloat(params[1]),
    right_prob: parseFloat(params[2])
  };

  if(!(named.depth >= 0)) named.depth = 3;
  if(!(named.left_prob >= 0 && named.left_prob <= 1)) named.left_prob = 1;
  if(!(named.right_prob >= 0 && named.right_prob <= 1)) named.right_prob = 1;
  return named;
}

function main() {
  var params = extract_params();
  var root = generate_tree(params.depth, params.left_prob, params.right_prob);
  var graph = new Grapher('graph', root);
  graph.draw();
}

window.addEventListener('load', main, false);
