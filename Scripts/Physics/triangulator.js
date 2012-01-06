//javascript port of code found here http://www.unifycommunity.com/wiki/index.php?title=Triangulator

function Triangulate(points)
{
    var indices = [];
    
    var n = points.length;
    if (n < 3)
        return indices;
    
    var V = [];
    V.length = n;

    if (Area() > 0)
    {
        for (var v = 0; v < n; v++)
            V[v] = v;
    }
    else
    {
        for (var v = 0; v < n; v++)
            V[v] = (n - 1) - v;
    }
    
    var nv = n;
    var count = 2 * nv;
    for (var m = 0, v = nv - 1; nv > 2; )
    {
        if ((count--) <= 0)
            return indices;
        
        var u = v;
        if (nv <= u)
            u = 0;
        v = u + 1;
        if (nv <= v)
            v = 0;
        var w = v + 1;
        if (nv <= w)
            w = 0;
        
        if (Snip(u, v, w, nv, V))
        {
            var a, b, c, s, t;
            a = V[u];
            b = V[v];
            c = V[w];
            indices.push(a);
            indices.push(b);
            indices.push(c);
            m++;
            for (s = v, t = v + 1; t < nv; s++, t++)
                V[s] = V[t];
            nv--;
            count = 2 * nv;
        }
    }
    
    indices.reverse();
    
    return indices;
    
    function Area()
    {
        var n = points.length;
        var A = 0.0;
        for (var p = n - 1, q = 0; q < n; p = q++)
        {
            var pval = points[p];
            var qval = points[q];
            A += pval.x * qval.y - qval.x * pval.y;
        }
        return A * 0.5;
    }
    
    function Snip(u, v, w, n, V)
    {
        var A = points[V[u]];
        var B = points[V[v]];
        var C = points[V[w]];
        if (Help.EPSILON > (((B.x - A.x) * (C.y - A.y)) - ((B.y - A.y) * (C.x - A.x))))
            return false;
        for (var p = 0; p < n; p++)
        {
            if ((p == u) || (p == v) || (p == w))
                continue;
            var P = points[V[p]];
            if (InsideTriangle(A, B, C, P))
                return false;
        }
        return true;
    }
    
    function InsideTriangle( A, B, C, P) 
    {
        var ax, ay, bx, by, cx, cy, apx, apy, bpx, bpy, cpx, cpy;
        var cCROSSap, bCROSScp, aCROSSbp;
        
        ax = C.x - B.x; ay = C.y - B.y;
        bx = A.x - C.x; by = A.y - C.y;
        cx = B.x - A.x; cy = B.y - A.y;
        apx = P.x - A.x; apy = P.y - A.y;
        bpx = P.x - B.x; bpy = P.y - B.y;
        cpx = P.x - C.x; cpy = P.y - C.y;
        
        aCROSSbp = ax * bpy - ay * bpx;
        cCROSSap = cx * apy - cy * apx;
        bCROSScp = bx * cpy - by * cpx;
        
        return ((aCROSSbp >= 0.0) && (bCROSScp >= 0.0) && (cCROSSap >= 0.0));
    }
}

