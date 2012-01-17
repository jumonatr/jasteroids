
function FormatPage()
{
    document.body.style.padding = "0 0 0px";
    document.body.style.margin = "0px";

    var navBar = document.getElementById("navbar-iframe");
    if (!navBar)
        return;

    var game = document.getElementById("game");
    game.focus();
}