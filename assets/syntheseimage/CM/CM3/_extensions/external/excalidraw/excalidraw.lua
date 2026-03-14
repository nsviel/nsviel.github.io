function Header(element)

  if element.level ~= 2 then return nil end

  for _,c in ipairs(element.attr.classes) do
    if c == "excalidraw" then

      local attrs = element.attr.attributes
      attrs["data-background-interactive"] = "true"
      attrs["data-background-iframe"] =
        "_extensions/external/excalidraw/excalidraw.html"

      return element
    end
  end

end
