function Header(el)
  if el.level ~= 2 or not el.classes:includes("woua") then
    return nil
  end

  el.attributes["data-background-color"] = "#000"
  el.attributes["data-background-iframe"] = "_extensions/local/slide/woua/index.html"
  el.attributes["data-state"] = "hide-menubar"

  return el
end
