function Header(el)
  if el.level ~= 2 then
    return nil
  end

  local has_class = false
  for _, c in ipairs(el.attr.classes) do
    if c == "pong" then
      has_class = true
      break
    end
  end

  if not has_class then
    return nil
  end

  local attrs = el.attr.attributes
    attrs["data-background-iframe"] = "_extensions/local/pong/index.html"
    attrs["data-state"] = "hide-menubar pong-bg"
    attrs["data-background-interactive"] = nil
    attrs["data-background-iframe-sandbox"] = "allow-scripts"
  return el
end
