local function is_html_image(el)
  return el
    and el.t == "Image"
    and el.src
    and el.src:match("%.html$")
end

local function get_dim(attr, key, default)
  local v = attr.attributes[key]
  if v and v ~= "" then
    return v
  end
  return default
end

function Para(el)
  if #el.content == 1 and is_html_image(el.content[1]) then
    local img = el.content[1]
    local src = img.src

    local width = get_dim(img.attr, "width", "100%")
    local height = get_dim(img.attr, "height", "320px")

    local html = string.format([[
<div class="html-widget-wrap" style="width:%s; height:%s; margin:auto;">
  <iframe
    src="%s"
    loading="lazy"
    scrolling="no"
    tabindex="-1"
    aria-hidden="true"
    style="width:100%%; height:100%%; border:none; display:block; pointer-events:none;"
  ></iframe>
</div>
]], width, height, src)

    return pandoc.RawBlock("html", html)
  end

  return el
end
