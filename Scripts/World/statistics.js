Statistics = {};

Statistics.Score = 0;

Statistics.AsteroidKilled = function()
{
    this.Score += 100;
}

Statistics.Refresh = function()
{
    var statistic = document.getElementById("score");
    if (statistic)
    {
        statistic.innerHTML = Statistics.Score;
    }
    
    setTimeout("Statistics.Refresh()", 1000);
}

setTimeout("Statistics.Refresh()", 1000);