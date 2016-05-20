function myFunction() {
    var url = "http://f3nation.com/locations/charlotte-south-nc/feed/";
    main(url);
}
 
/* Credit: https://gist.github.com/agektmr */
function main(url) {
 
  var ss = SpreadsheetApp.getActiveSheet();
 
  var property = PropertiesService.getDocumentProperties();
  var last_update = property.getProperty('last_update');
  last_update = last_update === null ? 0 : parseFloat(last_update);
  
  var feed = UrlFetchApp.fetch(url).getContentText();
  var items = getItems(feed);
  var i = items.length - 1;
  while (i > -1) {
    var item = items[i--];
    var date = new Date(item.getChildText('pubDate'));
    if (date.getTime() > last_update) {
      insertRow(item, ss);
    }
  }
  property.setProperty('last_update', date.getTime());
}
 
function getItems(feed) {
  var doc = XmlService.parse(feed);
  var root = doc.getRootElement();
  var channel = root.getChild('channel');
  var items = channel.getChildren('item');
  return items;
}
 
function insertRow(item, sheet) {
  var title = item.getChildText('title');
  var url = item.getChildText('link');
  var author = item.getChildText('author');
  
  
  var additional = getAdditionalData(item);
  var date = new Date(item.getChildText('pubDate'));
  sheet.insertRowBefore(2);
  sheet.getRange('A2:D2').setValues([[additional.date, additional.category, additional.pax, url]]);
}

function getAdditionalData(item){
  var url = item.getChildText('link');
  var body = UrlFetchApp.fetch(url).getContentText();
  
  var paxRegex = /The PAX:<\/strong>([^<]*)<\/li>/;
	  var whenRegex = /When:<\/strong>([^<]*)<\/li>/;
    var pax = 0;
    var when = "";
    var paxMatch = paxRegex.exec(body);
  var whenMatch = whenRegex.exec(body) && whenRegex.exec(body).length > 0 ?  whenRegex.exec(body)[1].trim():'';
    if (paxMatch){
      pax = paxMatch[0].split(",").length
    }
    if(whenMatch) {
      when = whenMatch;
    }
  
  var cats = item.getChildren('category');
  
  var c = "";
  for (var i=0;i<cats.length;i++){
    c = cats[i].getText();
  }
  
  return {
    date: when,
    pax: pax,
    category: c
  };
}
 
