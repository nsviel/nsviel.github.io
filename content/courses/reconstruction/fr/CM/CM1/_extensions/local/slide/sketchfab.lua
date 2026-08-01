local function url_encode(str)
  if str == nil then
    return ""
  end

  str = tostring(str)
  str = str:gsub("\n", "\r\n")
  str = str:gsub("([^%w%-_%.~])", function(c)
    return string.format("%%%02X", string.byte(c))
  end)

  return str
end

local function extract_sketchfab_id(path)
  if not path or path == "" then
    return nil
  end

  return path:match("/models/([%w]+)/embed")
      or path:match("/models/([%w%-_]+)")
      or path:match("sketchfab%.com/3d%-models/[%w%-_]+%-([%w]+)")
      or path:match("^([%w]+)$")
end

function Header(el)
  if not el.classes:includes("sketchfab") then
    return el
  end

  local model = el.attributes["model"]
  local path = el.attributes["path"]
  local id = model or extract_sketchfab_id(path)

  if not id then
    return el
  end

  local embed = "https://sketchfab.com/models/" .. id .. "/embed?autostart=1&camera=0&ui_theme=dark"
  local wrapper = "_extensions/local/slide/sketchfab.html?src=" .. url_encode(embed)

  el.attributes["data-background-iframe"] = wrapper
  el.attributes["data-background-interactive"] = "true"
  el.attributes["data-background-iframe-sandbox"] = "allow-scripts"
  el.attributes["model"] = nil
  el.attributes["path"] = nil

  return el
end
