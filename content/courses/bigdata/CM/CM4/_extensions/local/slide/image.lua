function with_base(path)
  if path:match("^/") or path:match("^https?://") then return path end
  return "content/image/" .. path
end

function split(s)
  local t = {}
  for part in (s .. "|"):gmatch("(.-)|") do table.insert(t, part) end
  return t
end

function make_image(spec)
  local p = split(spec)
  local src, x, y, w, h, idx = p[1], p[2], p[3], p[4], p[5], p[6]
  if not (src and x and y and w and h) then return nil end

  local cls = "slide-image"
  local attr = ""

  if idx and idx ~= "" then
    cls = cls .. " fragment"
    attr = string.format([[ data-fragment-index="%s"]], idx)
  end

  return pandoc.RawBlock("html", string.format(
    [[<div class="%s"%s style="position:absolute;left:%s;top:%s;width:%s;height:%s;background-image:url('%s');"></div>]],
    cls, attr, x, y, w, h, with_base(src)
  ))
end

function Header(el)
  local image = el.attributes["image"]
  if not image then return el end

  local img = make_image(image)
  el.attributes["image"] = nil

  if img then return { el, img } end

  el.attributes["data-background-image"] = with_base(image)
  el.attributes["data-background-size"] = "cover"
  return el
end
