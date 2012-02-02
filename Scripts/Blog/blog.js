/*
Copyright (C) 2012 Julien Monat-Rodier
Licence in LICENCE.txt
*/

function FormatPage()
{
    document.body.style.padding = "0 0 0px";
    document.body.style.margin = "0px";

    var game = document.getElementById("game");
    game.focus();
    
    ToggleBlog( document.getElementById("visibleToggle") );
}

function ToggleBlog(item)
{
    if (item.checked)
    {
        var blog = document.getElementById("body_container");
        blog.style.display = "block";
        
        var buttonText = document.getElementById("buttonText");
        buttonText.innerHTML = "Show Game";
    }
    else
    {
        var blog = document.getElementById("body_container");
        blog.style.display = "none";
        
        var buttonText = document.getElementById("buttonText");
        buttonText.innerHTML = "Show Blog";
    }
}