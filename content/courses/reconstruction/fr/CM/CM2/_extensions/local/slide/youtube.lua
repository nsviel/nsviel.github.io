function Header(el)
  local path = el.attributes["youtube"]

  if path then
    local id = path:match("youtu%.be/([%w%-_]+)")
            or path:match("youtube%.com/watch%?v=([%w%-_]+)")
            or path:match("youtube%.com/embed/([%w%-_]+)")
            or path:match("^([%w%-_]+)$")

    if id then
      local embed = "https://www.youtube.com/embed/" .. id
        .. "?autoplay=1&mute=0&controls=0&rel=0"

      el.attributes["data-background-iframe"] = embed
      el.attributes["data-background-iframe-sandbox"] = "allow-scripts"
    end

    el.attributes["youtube"] = nil
  end

  return el
end
