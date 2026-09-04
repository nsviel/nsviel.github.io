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

    -- Syntaxe compacte : ## {engine=chemin/vers/fichier}
    if element.attr.attributes["engine"] ~= nil then
        return true
    end

    -- Ancienne syntaxe conservée : ## {.engine path="chemin/vers/fichier"}
    for _, c in ipairs(element.attr.classes) do
        if c == "engine" then
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
    local base = "_extensions/local/engine/engine.html"
    local params = {}

    -- ---- Fichier à ouvrir ----
    -- Nouvelle syntaxe : {engine=chemin}; ancienne syntaxe : {.engine path=chemin}
    local obj = attrs["engine"] or attrs["path"]
    if obj ~= nil then
        table.insert(params, "path=" .. obj)
        attrs["engine"] = nil
        attrs["path"] = nil
    end

    -- ---- EDL ----
    local edl = attrs["edl"]
    if edl ~= nil then
        table.insert(params, "edl=" .. edl)
        attrs["edl"] = nil
    end



    -- Construction finale de l'URL
    local iframe = base
        if #params > 0 then
        iframe = iframe .. "?" .. table.concat(params, "&")
    end

    attrs["data-background-iframe"] = iframe

    -- ------------------
end
