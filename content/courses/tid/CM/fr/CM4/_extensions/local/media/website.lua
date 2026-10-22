function Header(el)
  local path = el.attributes["website"]

  if not path and el.classes:includes("website") then
    path = el.attributes["path"]
  end

  if path then
    el.attributes["data-background-iframe"] = path
    el.attributes["data-background-interactive"] = "true"
    el.attributes["data-background-iframe-sandbox"] = "allow-scripts"
    el.attributes["website"] = nil
    el.attributes["path"] = nil
  end

  return el
end
