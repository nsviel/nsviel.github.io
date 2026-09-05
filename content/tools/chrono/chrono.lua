return {
  ["chrono"] = function(args, kwargs)
    local min = kwargs["min"] or "0"
    local sec = kwargs["sec"] or "30"

    local html = [[
<div class="chrono">
  <canvas class="chrono_canvas" width="1000" height="600"></canvas>

  <div class="row">
    <div class="parameter">
      <button class="chrono_play">▶</button>
      <button class="chrono_reset">↩</button>

      <label class="duration">
        <input class="chrono_min" type="number" value="]] .. min .. [[">
        <span>min</span>
        <input class="chrono_sec" type="number" value="]] .. sec .. [[">
        <span>s</span>
      </label>
    </div>
  </div>
</div>
]]

    return pandoc.RawBlock("html", html)
  end
}
