function Header(el)
  local iscene = el.attributes["iscene"]

  if iscene then
    el.attributes["data-background-iframe"] = iscene
    el.attributes["data-background-interactive"] = "true"
    el.attributes["data-background-iframe-sandbox"] = "allow-scripts"
    el.attributes["iscene"] = nil
  end

  return el
end
