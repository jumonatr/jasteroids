/*
Copyright (C) 2012 Julien Monat-Rodier
Licence in LICENCE.txt
*/


﻿Statistics = {};

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

    statistic = document.getElementById("live_asteroids");
    if (statistic)
    {
        statistic.innerHTML = g_World.Asteroids.length;
    }

    Help.CallIn(1000, Statistics, "Refresh");
}

Help.CallIn(1000, Statistics, "Refresh");
