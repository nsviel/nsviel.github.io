function Header(el)

  if el.classes:includes("youtube") then
    local path = el.attributes["path"]

    if path then
      -- extraire l'id YouTube
      local id = path:match("youtu%.be/([%w%-_]+)")
              or path:match("youtube%.com/watch%?v=([%w%-_]+)")
              or path:match("youtube%.com/embed/([%w%-_]+)")

      if id then
        local embed = "https://www.youtube.com/embed/" .. id
          .. "?autoplay=1&mute=0&controls=0&rel=0"

        el.attributes["background-iframe"] = embed
        el.attributes["background-interactive"] = "true"
      end

      -- cleanup
      el.attributes["path"] = nil
    end
  end

  return el
end
