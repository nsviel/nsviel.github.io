-- Filter called for each header
function Header(element)
    -- ------------------
   
    -- Check class
    if not header_class(element) then return nil; end

    -- Parameter
    add_parameter(element)

    -- argument
    add_argument(element)

    -- ------------------
    return element
end

function header_class(element)
    -- ------------------

    -- lvl2 uniquement
    if element.level ~= 2 then return false end

    -- doit contenir la classe "engine"
    for _, c in ipairs(element.attr.classes) do
        if c == "particle" then
            return true
        end
    end

    return false

    -- ------------------
end

function add_parameter(element)
    -- ------------------

    local attribut = element.attr.attributes
    attribut["data-background-interactive"] = "true"
    attribut["data-state"] = "hide-menubar"

    -- ------------------
end

function add_argument(element)
    -- ------------------

    local attrs = element.attr.attributes
    local base = "_extensions/local/particle/particle.html"
    local params = {}

    -- ---- Autres futurs paramètres ici ----
    -- local grid = attrs["grid"]
    -- if grid ~= nil then
    --   table.insert(params, "grid=" .. grid)
    --   attrs["grid"] = nil
    -- end

    -- Construction finale de l'URL
    local iframe = base
        if #params > 0 then
        iframe = iframe .. "?" .. table.concat(params, "&")
    end

    attrs["data-background-iframe"] = iframe

    -- ------------------
end
