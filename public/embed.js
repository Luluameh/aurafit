(function () {
  var script = document.currentScript;
  if (!script) {
    var scripts = document.getElementsByTagName("script");
    for (var i = scripts.length - 1; i >= 0; i--) {
      if (scripts[i].src && scripts[i].src.indexOf("/embed.js") !== -1) {
        script = scripts[i];
        break;
      }
    }
  }
  if (!script) return;

  var store = script.getAttribute("data-store") || "demo-atelier";
  var base = (script.getAttribute("data-base") || script.src.replace(/\/embed\.js.*$/, "")).replace(/\/$/, "");
  if (!base) return;

  function text(value) {
    return typeof value === "string" ? value.trim() : "";
  }

  function categoryFrom(name) {
    var value = name.toLowerCase();
    if (/dress|gown|ankara|kaftan|agbada/.test(value)) return /kaftan|agbada/.test(value) ? "outer" : "dress";
    if (/shoe|heel|sneaker|boot/.test(value)) return "shoe";
    if (/bag|tote|clutch|purse/.test(value)) return "bag";
    if (/necklace|jewel|chain|pendant/.test(value)) return "jewelry";
    if (/trouser|pant|jean|denim|skirt/.test(value)) return "bottom";
    if (/coat|jacket|blazer/.test(value)) return "outer";
    return "top";
  }

  function tryOnFrom(category) {
    if (category === "shoe") return "shoes";
    if (category === "bottom") return "lower_body";
    if (category === "dress" || category === "outer") return "full_body";
    if (category === "bag" || category === "jewelry") return "auto";
    return "upper_body";
  }

  function httpsUrl(value) {
    var url = text(value);
    return url.indexOf("https://") === 0 ? url : "";
  }

  function labeledViews(imageField) {
    var back = "";
    var side = "";
    var list = Array.isArray(imageField) ? imageField : [imageField];
    list.forEach(function (entry) {
      if (!entry || typeof entry !== "object") return;
      var label = text(entry.name || entry.caption || entry.description).toLowerCase();
      var url = httpsUrl(entry.url || entry.contentUrl);
      if (!url) return;
      if (!back && label.indexOf("back") !== -1) back = url;
      if (!side && label.indexOf("side") !== -1) side = url;
    });
    return { back: back, side: side };
  }

  function asProduct(raw) {
    if (!raw || typeof raw !== "object") return null;
    var name = text(raw.name);
    var image = raw.image;
    if (Array.isArray(image)) image = image[0];
    if (image && typeof image === "object") image = image.url || image.contentUrl;
    image = text(image);
    if (!name || image.indexOf("https://") !== 0) return null;
    var views = labeledViews(raw.image);
    var offer = raw.offers;
    if (Array.isArray(offer)) offer = offer[0];
    var price = offer && offer.price != null ? Number(offer.price) : Number(raw.price);
    var category = categoryFrom(name);
    return {
      id: text(raw.sku || raw.productID || raw.productId) || name,
      name: name,
      price: isFinite(price) ? price : 0,
      imageUrl: image,
      backImageUrl: views.back,
      sideImageUrl: views.side,
      category: category,
      tryOnCategory: tryOnFrom(category),
    };
  }

  function walk(node, found) {
    if (!node || typeof node !== "object") return;
    if (Array.isArray(node)) {
      node.forEach(function (entry) {
        walk(entry, found);
      });
      return;
    }
    if (node["@graph"]) walk(node["@graph"], found);
    var type = node["@type"];
    var types = Array.isArray(type) ? type : [type];
    if (types.indexOf("Product") !== -1) {
      var product = asProduct(node);
      if (product) found.push(product);
    }
    if (Array.isArray(node.itemListElement)) walk(node.itemListElement, found);
    if (node.item) walk(node.item, found);
  }

  function readCatalog() {
    var explicitImage = text(script.getAttribute("data-image"));
    var found = [];
    if (explicitImage.indexOf("https://") === 0) {
      var named = text(script.getAttribute("data-name")) || "This piece";
      var category = text(script.getAttribute("data-category")) || categoryFrom(named);
      found.push({
        id: text(script.getAttribute("data-product")) || named,
        name: named,
        price: Number(script.getAttribute("data-price")) || 0,
        imageUrl: explicitImage,
        backImageUrl: httpsUrl(script.getAttribute("data-back-image")),
        sideImageUrl: httpsUrl(script.getAttribute("data-side-image")),
        category: category,
        tryOnCategory: tryOnFrom(category),
      });
    }
    var blocks = document.querySelectorAll('script[type="application/ld+json"]');
    for (var i = 0; i < blocks.length; i++) {
      try {
        walk(JSON.parse(blocks[i].textContent || ""), found);
      } catch (error) {
        continue;
      }
    }
    if (!found.length) {
      var ogImage = document.querySelector('meta[property="og:image"]');
      var ogTitle = document.querySelector('meta[property="og:title"]');
      var image = ogImage && text(ogImage.getAttribute("content"));
      if (image && image.indexOf("https://") === 0) {
        var title = (ogTitle && text(ogTitle.getAttribute("content"))) || "This piece";
        var ogCategory = categoryFrom(title);
        found.push({
          id: title,
          name: title,
          price: 0,
          imageUrl: image,
          category: ogCategory,
          tryOnCategory: tryOnFrom(ogCategory),
        });
      }
    }
    var seen = {};
    return found.filter(function (item) {
      if (seen[item.imageUrl]) return false;
      seen[item.imageUrl] = true;
      return true;
    });
  }

  var brand = text(script.getAttribute("data-brand"));
  var widgetUrl = base + "/widget?store=" + encodeURIComponent(store);
  if (brand) widgetUrl += "&brand=" + encodeURIComponent(brand);

  function openPanel() {
    var catalog = readCatalog();
    var overlay = document.createElement("div");
    overlay.setAttribute("data-fsh-overlay", "1");
    overlay.style.cssText =
      "position:fixed;inset:0;z-index:2147483646;background:rgba(12,12,12,0.62);display:flex;align-items:center;justify-content:center;padding:16px;";

    var frame = document.createElement("iframe");
    frame.src = widgetUrl;
    frame.title = "FSH virtual fitting room";
    frame.style.cssText =
      "width:min(1100px,100%);height:min(860px,92vh);border:0;background:#f6f5f2;";
    frame.setAttribute("allow", "camera");

    var payload = {
      type: "fsh-product",
      store: store,
      product: catalog[0] || null,
      catalog: catalog,
    };
    function send() {
      if (frame.contentWindow) frame.contentWindow.postMessage(payload, base);
    }
    frame.addEventListener("load", send);
    function onReady(event) {
      if (event.origin !== new URL(base).origin) return;
      if (!event.data || event.data.type !== "fsh-ready") return;
      send();
    }
    window.addEventListener("message", onReady);

    overlay.appendChild(frame);
    overlay.addEventListener("click", function (event) {
      if (event.target !== overlay) return;
      window.removeEventListener("message", onReady);
      document.body.removeChild(overlay);
    });
    document.body.appendChild(overlay);
  }

  if (document.querySelector("[data-fsh-button]")) return;
  var btn = document.createElement("button");
  btn.type = "button";
  btn.setAttribute("data-fsh-button", "1");
  btn.textContent = "Virtual try-on";
  btn.style.cssText =
    "font:600 11px/1.2 system-ui,sans-serif;letter-spacing:0.14em;text-transform:uppercase;padding:14px 18px;border:0;background:#161513;color:#fff;cursor:pointer;";
  btn.addEventListener("click", openPanel);
  script.parentNode.insertBefore(btn, script.nextSibling);
})();
