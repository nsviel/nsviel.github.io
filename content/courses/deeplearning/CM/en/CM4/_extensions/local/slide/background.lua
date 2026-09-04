local colors = {
  white = "#ffffff",
  black = "#000000",
  red   = "#ff0000",
  blue  = "#0000ff",
}

function Header(el)
  for _, cls in ipairs(el.classes) do
    local name = cls:match("^slide_(.+)$")

    if name and colors[name] then
      el.attributes["data-background-color"] = colors[name]
      break
    end
  end

  for _, cls in ipairs(el.classes) do
    local name = cls:match("^text_(.+)$")

    if name and colors[name] then
      el.attributes["style"] = (el.attributes["style"] or "") .. "; color:" .. colors[name] .. " !important;"
    end
  end

  return el
end
