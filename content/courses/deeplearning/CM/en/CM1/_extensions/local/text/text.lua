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
