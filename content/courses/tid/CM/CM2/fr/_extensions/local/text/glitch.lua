local function add_glitch_text(el)
  for _, class in ipairs(el.classes) do
    if class == "glitch" then
      el.attributes["data-text"] = pandoc.utils.stringify(el.content)
      return el
    end
  end
end

function Span(el)
  return add_glitch_text(el)
end

function Div(el)
  for _, class in ipairs(el.classes) do
    if class == "glitch" then
      -- Put the duplicate text on each paragraph so multi-line blocks glitch
      -- line by line while keeping the block's layout and other classes.
      for index, block in ipairs(el.content) do
        if block.t == "Para" or block.t == "Plain" then
          local text = pandoc.utils.stringify(block.content)
          local line = pandoc.Span(block.content, pandoc.Attr("", { "glitch-line" }, {
            ["data-text"] = text
          }))
          el.content[index] = block.t == "Para"
            and pandoc.Para({ line })
            or pandoc.Plain({ line })
        end
      end
      return el
    end
  end
end
