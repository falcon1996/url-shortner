var express = require('express');
var validUrl = require('valid-url');
var shortid = require('shortid');
var mongo = require('mongodb').MongoClient;

var app = express();
app.use(express.static(__dirname + '/public'));

app.get('/', function(req, res) {                   //frontend to be done later
    res.render('index.html');			
});

var murl = 'mongodb://localhost:27017/url-shortner';

app.get('/new/:url(*)', function(req,res){
    
    var url = req.params.url
    if(validUrl.isUri(url)){
        
        var newId = shortid.generate();
        mongo.connect(murl,function(err,db){
            
            if(err) throw err;
            
            var collection = db.collect('myList');
            collection.insert({url:url, short: newId },function(err, doc){
                
                if(err) throw err;
                
                var data = {
                    
                    original_url: req.params.url,
                    short_url: 'http://'+req.headers['host']+'/'+newId
                }
                
                res.end(data);
                db.close();
            })
        })
        
    }
    else{
        res.end("Url Not Valid!");
    }
    
})

app.get('/:id', function(req,res){
    
    var id = req.params.id;
    mongo.connect(murl, function(err,db){
        
        if(err) throw err;
        
        var collection = db.collect('myList');
        collection.find({short:id}).toArray(function(err, documents){
            
            if(err) throw err;
            
            else{
                
                if(documents.length > 0){
                    
                    res.redirect(documents[0].url);
                    db.close();
                    
                }
                
                else{
                    db.close()
                    res.end("Wrong URL!");
                }
            }
        })
        
    })
    
}) 





app.listen(8080,function(){
    console.log("Example of app listning on port 8080");
});