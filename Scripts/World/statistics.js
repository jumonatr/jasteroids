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
    
    Help.CallIn(1000, Statistics, "Refresh");
}

Help.CallIn(1000, Statistics, "Refresh");