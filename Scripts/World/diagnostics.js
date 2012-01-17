
Debug = {}
Debug.RefreshDiagnostics = function()
{
    var statistic = document.getElementById("gameobject_count");
    if (statistic)
    {
        statistic.innerHTML = g_World == null ? "No World" : g_World.GameObjects.length;
    }
    
    statistic = document.getElementById("culled");
    if (statistic)
    {
        statistic.innerHTML = g_World == null ? "No World" : g_World.Culled;
    }
    
    statistic = document.getElementById("verts");
    if (statistic)
    {
        var count = 0;
        if (g_World != null)
        {
            for(var i = 0; i < g_World.GameObjects.length; ++i)
                count += g_World.GameObjects[i].Shape ? g_World.GameObjects[i].Shape.NumItems : 0;
        }
            
        statistic.innerHTML = count;
    }
    
    statistic = document.getElementById("fps");
    if (statistic)
    {
        statistic.innerHTML = g_World == null ? "No World" : g_World.FPS.toFixed(1);
    }

    
    Help.CallIn(500, Debug, "RefreshDiagnostics");
}

Help.CallIn(500, Debug, "RefreshDiagnostics");