function Header(el)
  if el.level ~= 2 then
    return nil
  end

  local has_class = false
  for _, c in ipairs(el.attr.classes) do
    if c == "gpgpu" then
      has_class = true
      break
    end
  end

  if not has_class then
    return nil
  end

  local attrs = el.attr.attributes
  attrs["data-background-interactive"] = "true"
  attrs["data-state"] = "hide-menubar"
  attrs["data-background-iframe"] = "_extensions/local/gpgpu/index.html"

  return el
end
