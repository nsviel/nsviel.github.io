function Header(el)
  local iframe = el.attributes["iframe"]

  if iframe then
    local interactive = el.attributes["iframe-interactive"]

    el.attributes["data-background-iframe"] = iframe

    if interactive == nil or interactive == "true" then
      el.attributes["data-background-interactive"] = "true"
    else
      el.attributes["data-background-interactive"] = nil
    end

    el.attributes["iframe"] = nil
    el.attributes["iframe-interactive"] = nil
  end

  return el
end
