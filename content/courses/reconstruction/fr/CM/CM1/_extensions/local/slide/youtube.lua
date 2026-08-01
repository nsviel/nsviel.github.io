function Header(el)
  local youtube = el.attributes["youtube"]
  if not youtube then return el end

  local id = youtube:match("^https://www%.youtube%.com/watch%?v=([%w_-]+)$")
  if id then
    el.attributes["data-background-iframe"] = "https://www.youtube.com/embed/" .. id
      .. "?autoplay=1&mute=0&controls=1&rel=0&cc_load_policy=0"
    el.attributes["data-background-iframe-sandbox"] = "allow-scripts"
  end

  el.attributes["youtube"] = nil
  return el
end
