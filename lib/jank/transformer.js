var Attrs = require('./attrs-to-props');
var attrsToProps = Attrs.attrsToProps;
var normalizeProp = Attrs.normalize;

// https://developer.mozilla.org/en-US/docs/Web/API/Node/nodeType
var NodeType = {
  TEXT: 3,
  COMMENT: 8,
};

function applyArray(node, data) {
  // TODO arrays of elements must be wrapped in an outer element to keep React
  // happy upstream. For now this is the simplest approach, but it's a little
  // naive. E.g. downstream elements might be `li`s. In that case, it's invalid
  // markup to have them wrapped in a div. There are probably many more edge
  // cases, so we're biasing towards invalid markup over fixing these problems
  // at this time.
  var tag = 'div';
  var props = {};
  var content = data.map(function(d) { return apply(node, d) });
  return {tag: tag, props: props, content: content, data: data};
}

function applyText(node, data) {
  return [data];
}

function applyAttrs(props, attrs) {
  for (key in attrs) {
    if (key !== '_attrs_') props[normalizeProp(key)] = attrs[key];
  }
  return props;
}

function applyObject(node, data) {
  return Array.prototype.map.call(node.childNodes, function(child) { return transform(child, data) });
}

function apply(node, data) {
  if (Array.isArray(data)) { return applyArray(node, data) }

  var tag = node.tagName;
  var props = attrsToProps(node.attributes);

  if (isContent(data)) { var content = applyText(node, data) }
  else if (isAttrs(data)) {
    props = applyAttrs(props, data);
    var content = applyObject(node, {});
  }
  else if (isCombination(data)) {
    props = applyAttrs(props, data._attrs_);
    var content = apply(node, data._content_).content;
  }
  else { var content =  applyObject(node, data) }
  // TODO "normalize" object data to eliminate duplication ^

  return {tag: tag, props: props, content: content};
}

function isContent(data) {
  return typeof data === 'string' || typeof data === 'number'
}

function isAttrs(data) {
  return data._attrs_ === true;
}

function isCombination(data) {
  return '_content_' in data && '_attrs_' in data;
}

function getScope(attributes) {
  var attr = attributes.getNamedItem('data-prop');
  return attr && attr.value;
}

function transform(node, data) {
  if (node.nodeType == NodeType.TEXT) { return node.wholeText }
  else if (node.nodeType == NodeType.COMMENT) { return null }

  var scope = getScope(node.attributes);
  var data = scope ? data[scope] : data;

  return apply(node, data);
}

module.exports = {apply: apply, transform: transform};
