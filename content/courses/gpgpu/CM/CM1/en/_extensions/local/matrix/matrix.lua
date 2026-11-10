function Header(element)
  if not header_class(element) then
    return nil
  end

  add_parameter(element)
  add_argument(element)

  return element
end

function header_class(element)
  if element.level ~= 2 then
    return false
  end

  for _, c in ipairs(element.attr.classes) do
    if c == "matrix" then
      return true
    end
  end

  return false
end

function add_parameter(element)
  local attrs = element.attr.attributes
  attrs["data-background-interactive"] = "true"
  attrs["data-state"] = "hide-menubar"
end

function add_argument(element)
  local attrs = element.attr.attributes
  local base = "_extensions/local/matrix/matrix.html"
  local params = {}

  local speed = attrs["speed"]
  if speed ~= nil then
    table.insert(params, "speed=" .. pandoc.utils.stringify(speed))
    attrs["speed"] = nil
  end

  local fontsize = attrs["fontsize"]
  if fontsize ~= nil then
    table.insert(params, "fontsize=" .. pandoc.utils.stringify(fontsize))
    attrs["fontsize"] = nil
  end

  local iframe = base
  if #params > 0 then
    iframe = iframe .. "?" .. table.concat(params, "&")
  end

  attrs["data-background-iframe"] = iframe
end
