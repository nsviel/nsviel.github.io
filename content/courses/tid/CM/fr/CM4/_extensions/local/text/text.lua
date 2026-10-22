local function has_class(el, target)
  for _, class in ipairs(el.classes) do
    if class == target then
      return true
    end
  end
  return false
end

function Span(el)
  if not has_class(el, "scramble") then
    return nil
  end

  local text = pandoc.utils.stringify(el.content)
  el.attributes["data-scramble-original"] = text

  return el
end

function Div(el)
  if not has_class(el, "r-fit-text") then
    return nil
  end

  -- Reveal's fit-text sizing uses parent.clientWidth. A slide's clientWidth
  -- includes its padding, so give block fit-text elements an unpadded parent.
  local wrapper_classes = pandoc.List({ "fit-container" })
  local inner_classes = pandoc.List()

  for _, class in ipairs(el.classes) do
    if class == "fragment" then
      wrapper_classes:insert(class)
    elseif class ~= "r-fit-text" then
      wrapper_classes:insert(class)
      inner_classes:insert(class)
    else
      inner_classes:insert(class)
    end
  end

  el.classes = inner_classes

  local wrapper_attributes = {}
  for key, value in pairs(el.attributes) do
    if key:match("^data%-fragment%-") then
      wrapper_attributes[key] = value
      el.attributes[key] = nil
    end
  end

  return pandoc.Div({ el }, pandoc.Attr("", wrapper_classes, wrapper_attributes))
end
