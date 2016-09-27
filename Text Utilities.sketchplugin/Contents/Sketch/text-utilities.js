// Text Utilities, by Johnnie Walker — Source code available at [GitHub](https://github.com/BohemianCoding/plugins.examples.text-utilities)
//
// This plugin illustrates a few techniques:
// - iterating over the selected layers
// - analysing the text layout (in great detail!)
// - creating new layers
// - defining multiple commands in a single plugin
//
// ## Layout Of The Plugin
//
// The first thing to do when making a Plugin is to setup the folder structure, which should
// look something like this:
//
// ```
//    MyPlugin.sketchplugin/
//      Contents/
//        Sketch/
//          manifest.json
//          script.js
//        Resources/
//          a-resource.png
//          other-resource.txt
// ```
//
// For a Plugin with bundled resources, you want to add a `Resources` folder as well
// as the normal `Sketch` folder, and you want to drop into it any resources that your
// script needs to access. These can be files of any type (but obviously keep in mind
// that they contribute to the overall size of the Plugin, so your users won't thank
// you if you put too much stuff in there).
//
// ## Manifest
//
// The Plugin needs a `manifest.json` file. This tells Sketch which menu items your Plugin supplies,
// as well as giving some general information about the Plugin such as its name, author, and so on.
//
// As this Plugin illustrates, we can supply multiple menu items, and each one can execute a different command.
//
//  ```json
// {
//   "author" : "Johnnie Walker",
//   "commands" : [
//     {
//       "script" : "text-utilities.js",
//       "handler" : "onAddBoth",
//       "name" : "Add Line Fragments & Baselines",
//       "identifier" : "fragmentsandbaselines"
//     },
//     {
//       "script" : "text-utilities.js",
//       "handler" : "onAddBaselines",
//       "name" : "Add Baselines",
//       "identifier" : "baselines"
//     },
//     {
//       "script" : "text-utilities.js",
//       "handler" : "onAddLineFragments",
//       "name" : "Add Line Fragments",
//       "identifier" : "fragments"
//     },
//     {
//       "script" : "text-utilities.js",
//       "handler" : "onUseLegacyBaselines",
//       "name" : "Use legacy typesetter",
//       "identifier" : "legacyTypesetter"
//     },
//     {
//       "script" : "text-utilities.js",
//       "handler" : "onUseConstantBaselines",
//       "name" : "Use constant baselines typesetter",
//       "identifier" : "constantBaselinesTypesetter"
//     },
//   ],
//   "menu": {
//     "items": [
//       "baselines",
//       "fragments",
//       "fragmentsandbaselines",
//       "-",
//       "legacyTypesetter",
//       "constantBaselinesTypesetter",
//     ],
//   },
//   "identifier" : "com.sketchapp.examples.text-utilities",
//   "version" : "2.0",
//   "description" : "Utilities for text layers",
//   "authorEmail" : "developer@sketchapp.com",
//   "name" : "Text Layer Utilities"
// }
// ```

// ## Code
// ### Defining The Run Handler

// In the manifest, we told Sketch that every time the "Bundled Resources Example" menu is selected,
// we want to execute a javascript handler called `onRun` in the `resources.js` file.

// So now we need to put some code into the `resources.js` file to implement that command.


var processFragments = function(sketch, container, fragments, title, action) {
    var group = container.newGroup({"name": title });
    group.moveToBack();

    var fragmentCount = fragments.count();
    for (var i=0; i<fragmentCount; i++) {
      var fragment = fragments[i];
      action(sketch, group, fragment, i);
    }

    group.adjustToFit();
}

var addBaselines = function(sketch, container, fragments) {
    processFragments(sketch, container, fragments, "Baselines", function(sketch, group, fragment, index) {
        var rect = fragment.rect;
        var baselineOffset = fragment.baselineOffset;
        var baselineRect = sketch.rectangle(
          NSMinX(rect),
          NSMaxY(rect)-baselineOffset,
          NSWidth(rect),
          0.5
        );
        var localRect = group.pageRectToLocalRect(baselineRect);
        group.newShape({"frame": localRect, fills: ["#ff000090"], borders: []});
    })
}


var addLineFragments = function(sketch, container, fragments) {
    processFragments(sketch, container, fragments, "Line Fragments", function(sketch, group, fragment, index) {
        var rect = fragment.rect;
        var fragmentRect = sketch.rectangle(rect.origin.x, rect.origin.y, rect.size.width, rect.size.height)
        var color = ( index & 1 ) ? "#00ff00ff" : "#00fff0044"
        var localRect = group.pageRectToLocalRect(fragmentRect);
        var line = group.newShape({"frame": localRect, fills: [color], borders: []});
    })
}


var onAddLineFragments = function(context) {
    var sketch = context.api()
    sketch.selectedDocument.selectedLayers.iterateWithFilter("isText", function(layer) {
        addLineFragments(sketch, layer.container, layer.fragments)
    })
};


var onAddBaselines = function(context) {
    var sketch = context.api()
    sketch.selectedDocument.selectedLayers.iterateWithFilter("isText", function(layer) {
        addBaselines(sketch, layer.container, layer.fragments)
    })
};


var onAddBoth = function(context) {
    var sketch = context.api()
    sketch.selectedDocument.selectedLayers.iterateWithFilter("isText", function(layer) {
        var lineFragments = layer.fragments
        var container = layer.container
        addBaselines(sketch, container, lineFragments)
        addLineFragments(sketch, container, lineFragments)
    })
};


var onUseLegacyBaselines = function(context) {
  var sketch = context.api()
  sketch.selectedDocument.selectedLayers.iterateWithFilter("isText", function(layer) {
    layer.useConstantBaselines = false
  })
}


var onUseConstantBaselines = function(context) {
  var sketch = context.api()
  sketch.selectedDocument.selectedLayers.iterateWithFilter("isText", function(layer) {
    layer.useConstantBaselines = true
  })
}
