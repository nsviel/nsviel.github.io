function Header(el)
  local iframe = el.attributes["iframe"]

  if iframe then
    el.attributes["data-background-iframe"] = iframe
    el.attributes["data-background-interactive"] = nil
    el.attributes["data-background-iframe-sandbox"] = "allow-scripts"
    el.attributes["iframe"] = nil
  end

  return el
end
