/* getElementByClass
/**********************/
var allHTMLTags = new Array();
function getElementByClass(theClass) {
//Create Array of All HTML Tags
var allHTMLTags=document.getElementsByTagName("*");
//Loop through all tags using a for loop
for (i=0; i<allHTMLTags.length; i++) {
//Get all tags with the specified class name.
if (allHTMLTags[i].className==theClass) {
//Place any code you want to apply to all
//pages with the class specified.
//In this example is to “display:none;” them
//Making them all dissapear on the page.
allHTMLTags[i].style.display='none';
}
}
}