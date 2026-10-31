function Header(el)
  if el.level ~= 2 then
    return nil
  end

  local is_sheet = false
  for _, c in ipairs(el.attr.classes) do
    if c == "sheet" then
      is_sheet = true
      break
    end
  end

  if not is_sheet then
    return nil
  end

  local attrs = el.attr.attributes
  attrs["data-background-interactive"] = "true"
  attrs["data-state"] = "hide-menubar"
  attrs["data-background-iframe"] = "./_extensions/local/sheet/sheet.html"

  return el
end
