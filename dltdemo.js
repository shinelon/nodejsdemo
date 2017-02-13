var http = require('http');			// http 网路
var cheerio = require('cheerio');	// html 解析
var fs = require("fs");				// 流
var HashMap = require('hashmap');   

//var queryHref = "http://www.lottery.gov.cn/historykj/history.jspx?_ltype=dlt"; 	// 设置被查询的目标网址
//var queryHref = "http://www.lottery.gov.cn/historykj/history_2.jspx?_ltype=dlt"; 
var queryHrefPrefix = "http://www.lottery.gov.cn/historykj/history";
var queryHerfSuffix = ".jspx?_ltype=dlt";

var frontMap = new HashMap();
var backMap = new HashMap();

function getHtmlFromDLt(startindex) {
    
    var pageData = "";
    var herf="";
    if (startindex==1) {
        herf=queryHrefPrefix+queryHerfSuffix
    }else{
        herf=queryHrefPrefix+"_"+startindex+queryHerfSuffix
    }
    
    console.info(herf);
    var req = http.get(herf, function(res) {
		res.setEncoding('utf8');
		res.on('data', function(chunk) {
			pageData += chunk;
		});

		res.on('end', function() {
            //console.info(pageData);
			$ = cheerio.load(pageData);
            var html = $('table tr');
            var pageNum = $('select option').length;
            console.info("===pageNum==="+pageNum);
            var result = [];
            var resultTmp = [];
            var resultFmt = []; 
                      
            //console.info(html.text());
			html.each(function (i, elem) {
                result[i]=$(this).html();                
            });
            
            console.info("第"+startindex+"页start");
			for (var i = 0; i < result.length; i++) {
                tdHtml=cheerio.load(result[i], {
                            ignoreWhitespace: true
                        });
                // console.info(tdHtml.text());
                tdHtml('td').each(function (j, elem) {
                    if(j<8){
                        var tmp=$(this).text()
                        resultFmt[j]=tmp;    
                    }                                     
                 });
                 
                 for(var ii=0;ii<resultFmt.length;ii++){
                     
                     if (ii>0&&ii<6) {
                         
                         var tmpIdx=resultFmt[ii];                         
                         var tmpVal=frontMap.get(tmpIdx);
                        //  console.info("1front:"+ii+"---"+resultFmt[ii]+"---"+tmpIdx+"---"+tmpVal);
                         frontMap.set(tmpIdx,++tmpVal);
                        //  console.info("2front:"+ii+"---"+resultFmt[ii]+"---"+tmpIdx+"---"+tmpVal);
                     }
                     if(ii>5&&ii<8){
                        var  tmp2Idx=resultFmt[ii];                       
                        var  tmp2Val=backMap.get(tmp2Idx);
                        // console.info("1back:"+ii+"---"+resultFmt[ii]+"---"+tmp2Idx+"---"+tmp2Val);
                        backMap.set(tmp2Idx,++tmp2Val);
                        // console.info("2back:"+ii+"---"+resultFmt[ii]+"---"+tmp2Idx+"---"+tmp2Val);
                     }
                    
                 }
                //  console.info(resultFmt.join(","));

            }
            
            console.info("第"+startindex+"页...");
            if (startindex<pageNum) {
                getHtmlFromDLt(++startindex);
            }else{
                shwoResult();
            }
		});
	});
}

function shwoResult() {

     console.log("fornt:============================");
    frontMap.forEach(function(value, key) {
      console.log("fornt:"+ key + " : " + value);
    });
     console.log("fornt.sort:=============================");
     sort(frontMap);

     console.log("back:=============================");
    backMap.forEach(function(value, key) {
      console.log("back:"+ key + " : " + value);
    });
    console.log("back.sort:=============================");
    sort(backMap);
}
function sort(parmMap) {
     var result = [];
     var keys=parmMap.keys();     
     for(var i=0; i<keys.length; i++) {
           for( var j=0; j<keys.length-1-i; j++) {
               if(parmMap.get(keys[j])<parmMap.get(keys[j+1])){
                    var  temp = keys[j];
					keys[j] = keys[j + 1];
					keys[j + 1] = temp;
               }
          }
          
    }
    for(var i=0;i<keys.length;i++){
        console.log(keys[i]+"_"+parmMap.get(keys[i]));
    }

}





var startindex = 1;		// 从多少页开始获取

function start(){
	console.log("开始...");
    for (var i = 0; i < 36 ;i++) {
        if(i<10){
            frontMap.set("0"+i,0);
        }else{
            frontMap.set(""+i,0);
        }
              
    }
    for (var i = 0; i <13 ;i++) {
        if(i<10){
            backMap.set("0"+i,0);
        }else{
            backMap.set(""+i,0);
        }
                      
    }

     
    getHtmlFromDLt(startindex);
}
start();