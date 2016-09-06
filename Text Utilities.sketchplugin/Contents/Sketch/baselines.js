@import "library.cocoascript";

var fillInRect = function(container, rect, color) {
  if (! color) {
    color = [MSColor colorWithRed:1.0 green:0.0 blue:0.0 alpha:0.6];
  }
  var containerRect = container.pageRectToLocalRect(rect);
  var line = container.newShape({"frame": containerRect, "color": color});
  var style = line._object.style();
  style.fill().enabled = true;
  var border = style.border();
  if (border) {border.enabled = false;}
  return line;
}


var getLineFragments = function(layer) {
  var textLayer = layer._object
  var storage = textLayer.createTextStorage();
  var layout = storage.layoutManagers().firstObject();
  var actualCharacterRangePtr = MOPointer.new();
  var charRange = NSMakeRange(0, storage.length());
  var origin = textLayer.rect().origin;

  [layout glyphRangeForCharacterRange:charRange actualCharacterRange:actualCharacterRangePtr];
  var glyphRange = actualCharacterRangePtr.value();

  var fragments = NSMutableArray.new();
  var currentLocation = 0;
  while (currentLocation < NSMaxRange(glyphRange)) {
    var effectiveRangePtr = MOPointer.new();
    var rect = [layout lineFragmentRectForGlyphAtIndex:currentLocation effectiveRange:effectiveRangePtr];
    rect = textLayer.convertRectToAbsoluteCoordinates(rect);
    var effectiveRange = effectiveRangePtr.value();
    var baselineOffset = [[layout typesetter] baselineOffsetInLayoutManager:layout glyphIndex:currentLocation];
    fragments.addObject({"rect": rect, "baselineOffset": baselineOffset, range: effectiveRange});
    currentLocation = NSMaxRange(effectiveRange)+1;
  }

  return fragments;
}


var addBaselines = function(sketch, container, fragments) {

  var group = container.newGroup({"name": "Baselines" });
  group.moveToBack();

  var fragmentCount = fragments.count();
  for (var i=0; i<fragmentCount; i++) {
    var fragment = fragments[i];
    var rect = fragment.rect;
    var baselineOffset = fragment.baselineOffset;
    var baselineRect = sketch.rectangle(
      NSMinX(rect),
      NSMaxY(rect)-baselineOffset,
      NSWidth(rect),
      0.5
    );

    fillInRect(group, baselineRect);
  }

  [group resizeToFitChildrenWithOption:0];
}


var addLineFragments = function(sketch, container, fragments) {
  var group = container.newGroup({"name": "Line Fragments" });
  group.moveToBack();

  var fragmentCount = fragments.count();
  for (var i=0; i<fragmentCount; i++) {
    var fragment = fragments[i];
    var rect = fragment.rect;
    var fragmentRect = sketch.rectangle(rect.origin.x, rect.origin.y, rect.size.width, rect.size.height)
    var alpha = ( i & 1 ) ? 0.1 : 0.25;
    var color = [MSColor colorWithRed:0.0 green:1.0 blue:0.0 alpha:alpha];
    fillInRect(group, fragmentRect, color);
  }

  [group resizeToFitChildrenWithOption:0];
}


var onAddLineFragments = function(context) {
    var sketch = context.api()
    sketch.selectedDocument.selectedLayers.iterate(function(layer) {
        if (layer.isText) {
            var lineFragments = getLineFragments(layer);
            addLineFragments(sketch, layer.container, lineFragments);
        }
    })
};

var onAddBaselines = function(context) {
    var sketch = context.api()
    sketch.selectedDocument.selectedLayers.iterate(function(layer) {
        if (layer.isText) {
            var lineFragments = getLineFragments(layer);
            addBaselines(sketch, layer.container, lineFragments);
        }
    })
};

var onAddBoth = function(context) {
    var sketch = context.api()
    sketch.selectedDocument.selectedLayers.iterate(function(layer) {
        if (layer.isText) {
            var lineFragments = getLineFragmentsNative(layer);
            var container = layer.container;
            addBaselines(sketch, container, lineFragments);
            addLineFragments(sketch, container, lineFragments);
        }
    })
};
