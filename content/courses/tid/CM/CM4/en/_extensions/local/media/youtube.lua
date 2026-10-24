local function timestamp_to_seconds(timestamp)
  if not timestamp then return nil end

  if timestamp:match("^%d+$") then
    return tonumber(timestamp)
  end

  local total = 0
  local parsed = ""
  local seen = {}

  for amount, unit in timestamp:lower():gmatch("(%d+)([hms])") do
    if seen[unit] then return nil end

    seen[unit] = true
    parsed = parsed .. amount .. unit

    local multiplier = unit == "h" and 3600 or unit == "m" and 60 or 1
    total = total + tonumber(amount) * multiplier
  end

  if parsed ~= timestamp:lower() then return nil end
  return total
end

function Header(el)
  local youtube = el.attributes["youtube"]
  if not youtube then return el end

  local id, timestamp = youtube:match("^https://www%.youtube%.com/watch%?v=([%w_-]+)@(.+)$")
  if not id then
    id = youtube:match("^https://www%.youtube%.com/watch%?v=([%w_-]+)$")
  end

  if id then
    local start = timestamp_to_seconds(timestamp)
    local embed = "https://www.youtube.com/embed/" .. id
      .. "?autoplay=1&mute=0&controls=1&rel=0&cc_load_policy=0"

    if start then
      embed = embed .. "&start=" .. start
    end

    el.attributes["data-background-iframe"] = embed
    el.attributes["data-background-iframe-sandbox"] = "allow-scripts"
  end

  el.attributes["youtube"] = nil
  return el
end
