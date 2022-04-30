window.contentfulExtension.init(function (api) {
  function tinymceForContentful(api) {
    function tweak(param) {
      var t = param.trim();
      if (t === "false") {
        return false;
      } else if (t === "") {
        return undefined;
      } else {
        return t;
      }
    }

    var p = tweak(api.parameters.instance.plugins);
    var tb = tweak(api.parameters.instance.toolbar);
    var mb = tweak(api.parameters.instance.menubar);

    api.window.startAutoResizer();

    tinymce.init({
      selector: "#editor",
      plugins: p,
      toolbar: tb,
      menubar: mb,
      menu: {
        grid: {
          title: "Grid",
          items: "inserttable",
        },
      },
      color_map: ["D44527", "Red-01"],
      min_height: 600,
      max_height: 750,
      autoresize_bottom_margin: 15,
      resize: false,
      image_caption: true,
      default_link_target: "_blank",
      style_formats: [
        {
          title: "Headers",
          items: [
            { title: "Large Heading", block: "h1", attributes: { class: "" } },
            { title: "Medium Heading", block: "h2", attributes: { class: "" } },
            { title: "Small Heading", block: "h3", attributes: { class: "" } },
            {
              title: "Editorial",
              block: "p",
              attributes: { class: "ds-editorial" },
            },
            {
              title: "Large Body",
              block: "p",
              attributes: { class: "ds-large-body" },
            },
            { title: "Medium Body", block: "p", attributes: { class: "" } },
            {
              title: "Small Body",
              block: "p",
              attributes: { class: "ds-small-body" },
            },
          ],
        },
      ],
      content_style:
        'h1 { font-size: 1.5rem !important; font-weight: 400; }' +
        'h2 { font-size: 1.25rem !important; font-weight: 500 !important; }' +
        'h3 { font-size: 1.125rem !important; font-weight: 500 !important; }' +
        '.ds-large-body { font-size: 1.125rem !important; font-weight: 400; }' +
        '.ds-medium-body { font-size: 0.875rem !important; font-weight: 400; }' +
        '.ds-small-body { font-size: 0.625rem !important; font-weight: 400; }' +
        '.ds-editorial { font-size: 1.25rem !important; font-weight: 400; }' +
        'table { border: 1px dotted grey }' +
        'tr { border-bottom: 1px dotted grey }',
      init_instance_callback: function (editor) {
        var listening = true;

        function getEditorContent() {
          return editor.getContent() || "";
        }

        function getApiContent() {
          return api.field.getValue() || "";
        }

        function setContent(x) {
          var apiContent = x || "";
          var editorContent = getEditorContent();
          if (apiContent !== editorContent) {
            //console.log('Setting editor content to: [' + apiContent + ']');
            editor.setContent(apiContent);
          }
        }

        setContent(api.field.getValue());

        api.field.onValueChanged(function (x) {
          if (listening) {
            setContent(x);
          }
        });

        function onEditorChange() {
          var editorContent = getEditorContent();
          var apiContent = getApiContent();

          if (editorContent !== apiContent) {
            //console.log('Setting content in api to: [' + editorContent + ']');
            listening = false;
            api.field
              .setValue(editorContent)
              .then(function () {
                listening = true;
              })
              .catch(function (err) {
                console.log("Error setting content", err);
                listening = true;
              });
          }
        }

        var throttled = _.throttle(onEditorChange, 500, { leading: true });
        editor.on("change keyup setcontent blur", throttled);
      },
    });
  }

  function loadScript(src, onload) {
    var script = document.createElement("script");
    script.setAttribute("src", src);
    script.onload = onload;
    document.body.appendChild(script);
  }

  var sub =
    location.host == "contentful.staging.tiny.cloud" ? "cdn.staging" : "cdn";
  var apiKey = api.parameters.installation.apiKey;
  var channel = api.parameters.installation.channel;
  var tinymceUrl =
    "https://" +
    sub +
    ".tiny.cloud/1/" +
    apiKey +
    "/tinymce/" +
    channel +
    "/tinymce.min.js";

  loadScript(tinymceUrl, function () {
    tinymceForContentful(api);
  });
});
