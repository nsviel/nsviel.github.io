function Header(el)
  local video = el.attributes["video"]

  if video then
    el.attributes["background-video"] = "content/video/" .. video
    el.attributes["background-video-loop"] = "true"
    el.attributes["background-video-muted"] = "true"
    el.attributes["background-size"] = "cover"

    el.attributes["video"] = nil
  end

  return el
end
