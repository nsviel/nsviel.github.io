function Header(el)

  if el.classes:includes("website") then
    local path = el.attributes["path"]

    if path then
      el.attributes["background-iframe"] = path
      el.attributes["background-interactive"] = "true"
      el.attributes["path"] = nil
    end
  end

  return el
end
