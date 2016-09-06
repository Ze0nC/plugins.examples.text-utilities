
var setTypeSetterMode = function(context, lineSpacingBehaviour) {
    var sketch = context.api()
    sketch.selectedDocument.selectedLayers.iterate(filter = "isText", function(layer) {
        var textLayer = layer._object;
        var initialBaselineOffset = textLayer.firstBaselineOffset();
        textLayer.lineSpacingBehaviour = lineSpacingBehaviour;
        var baselineOffset = textLayer.firstBaselineOffset();

        var rect = layer.frame;
        rect.y -= (baselineOffset - initialBaselineOffset);
        layer.frame = rect;
        sketch.log("Set spacing mode for '" + layer.name + "' to " + lineSpacingBehaviour)
    })
}

var onUseLegacyBaselines = function(context) {
    setTypeSetterMode(context, 1);
}

var onUseConstantBaselines = function(context) {
    setTypeSetterMode(context, 2);
}
