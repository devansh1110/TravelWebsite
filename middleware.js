module.exports.isLoggedIn= (req, res, next)=>{
    if(!req.isAuthenticated()){
        req.session.redirectUrl= req.orignalUrl;
        req.flash("success", "You are required to login first!!")
        return res.redirect('/login')
    }
        next();
    
}

module.exports.saveRedirectUrl= (req, res, next)=>{
    if(req.session.redirectUrl){
        res.locals.redirectUrl= req.session.redirectUrl;
    }
    next();
}