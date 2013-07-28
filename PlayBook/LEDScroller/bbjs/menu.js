function share() {
    try {
        var strSubject = "" + blackberry.app.name + " v" + blackberry.app.version;
        var strBody = "Check out the '" + blackberry.app.name + "' BlackBerry application (requires a playbook).\n\n";

        var args = new blackberry.invoke.MessageArguments("", strSubject, strBody);
        args.view = blackberry.invoke.MessageArguments.VIEW_NEW;
        blackberry.invoke.invoke(blackberry.invoke.APP_MESSAGES, args);
    } catch (e) {
        alert('exception (shareWithFriend): ' + e.name + '; ' + e.message);
    }
}

function showAbout() 
{
    try {
        var sAbout = "";
        sAbout += blackberry.app.name + " " + blackberry.app.version + "\n";
        sAbout += "By: " + blackberry.app.author + "\n";
        sAbout += "(c): " + blackberry.app.copyright + "\n";
        alert(sAbout);
    } catch (e) {
        alert('exception (showAbout): ' + e.name + '; ' + e.message);
    }
}


function addMenus() {
    try {

        //create the menu items
        var menuItem_about = new blackberry.ui.menu.MenuItem(false, 1, "About", showAbout);
        var menuItem_share = new blackberry.ui.menu.MenuItem(false, 2, "Share", share);

        blackberry.ui.menu.clearMenuItems();
        blackberry.ui.menu.addMenuItem(menuItem_about);
        blackberry.ui.menu.addMenuItem(menuItem_share);
    }
    catch (e) {
        alert('exception (addMenus): ' + e.name + '; ' + e.message);
    }
}



function initPage() {
    if (window.blackberry != null) {
		addMenus();
        header_height = 20;
    }
}