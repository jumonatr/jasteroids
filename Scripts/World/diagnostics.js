
Debug = {}
Debug.RefreshDiagnostics = function()
{
    var statistic = document.getElementById("asteroidCount");
    if (statistic)
    {
        statistic.innerHTML = g_World.GameObjects.length;
    }
    
    statistic = document.getElementById("culled");
    if (statistic)
    {
        statistic.innerHTML = g_World.Culled;
    }
    
    statistic = document.getElementById("verts");
    if (statistic)
    {
        var count = 0;
        for(var i = 0; i < g_World.GameObjects.length; ++i)
            count += g_World.GameObjects[i].LineBuffer ? g_World.GameObjects[i].LineBuffer.NumItems : 0;
            
        statistic.innerHTML = count;
    }
    
    statistic = document.getElementById("fps");
    if (statistic)
    {
        statistic.innerHTML = g_World.FPS;
    }

    
    Help.CallIn(500, Debug, "RefreshDiagnostics");
}

Help.CallIn(500, Debug, "RefreshDiagnostics");