var express = require('express');
var router = express.Router();
const userModel = require("./users.js");
const passport = require('passport');
const localStrategy = require("passport-local")
const upload = require("./multer.js")
passport.use(new localStrategy(userModel.authenticate()))
// post methods
router.post("/register",(req,res)=>{
  const data = new userModel({
    username: req.body.username,
    password: req.body.password,
    email: req.body.email,
    contact: req.body.contact
  })
  userModel.register(data,req.body.password)
  .then(()=>{
    passport.authenticate("local")(req,res,function(){
      res.redirect("/login")
    })
  })
  
})

router.post("/login",passport.authenticate("local",{
  failureRedirect : "/login",
  successRedirect : "/profile",
  failureFlash: true
}))
router.post("/upload" ,isLoggedin,upload.single('image'),async(req,res,next)=>{
  const user = await userModel.findOne({username: req.session.passport.user})
  user.profileImage = req.file.filename;
  await user.save()
  res.redirect("/profile")
})


// get methods
router.get('/login', function(req, res, next) {
  res.render('login',{error: req.flash('error'),nav:false});
});
router.get('/register', function(req, res, next) {
  res.render('register',{nav:false});
});
router.get("/profile",isLoggedin,async(req,res)=>{
  const user = await userModel.findOne({
    username: req.session.passport.user
  })
  res.render('profile',{user,nav:true})
})
router.get("/logout",(req,res,next)=>{
  req.logout(function(err) {
    if (err) { return next(err); }
    res.redirect('/login');
  });

})
function isLoggedin(req,res,next){
  if(req.isAuthenticated()){
    return next()
  }
  res.redirect("/profile")
}
router.get("/add",isLoggedin,async(req,res)=>{
  res.render('add',{nav:true})
})

module.exports = router;
