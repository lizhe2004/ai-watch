var Module1 = (function(){
    

    var self = {};
     self.i = 16
    var privateFunction1 = function() {  
        console.log(self)
        return privateFunction2()
    }

    var privateFunction2 = function() {
        console.log(self)
        return  "";
    }
    
    var publicFunction = function(r){
        console.log(self)
        privateFunction1()
        return data
    }
    self.publicFunction=publicFunction
    return self;
})();

export default Module1;
