var express = require('express');
var router = express.Router();
const userModel = require("./users.js");
const postModel = require("./post.js")
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
    contact: req.body.contact,
    name: req.body.fullname
  })
  userModel.register(data,req.body.password)
  .then(()=>{
    passport.authenticate("local")(req,res,function(){
      res.redirect("/")
    })
  })
  
})

router.post("/",passport.authenticate("local",{
  failureRedirect : "/",
  successRedirect : "/profile",
  failureFlash: true
}))
router.post("/upload" ,isLoggedin,upload.single('image'),async(req,res,next)=>{
  const user = await userModel.findOne({username: req.session.passport.user})
  user.profileImage = req.file.filename;
  await user.save()
  res.redirect("/profile")
})
router.post("/createpost" ,isLoggedin,upload.single('postimage'),async(req,res,next)=>{
  const user = await userModel.findOne({username: req.session.passport.user})
  const post  = await postModel.create({
    user: user._id,
    title: req.body.title,
    content: req.body.content,
    image: req.file.filename
  })
  user.posts.push(post._id)
  await user.save()
  res.redirect("/profile")
})
// get methods
router.get('/', function(req, res, next) {
  res.render('login',{error: req.flash('error'),nav:false});
});
router.get('/register', function(req, res, next) {
  res.render('register',{nav:false});
});
router.get("/profile",isLoggedin,async(req,res)=>{
  const user = await userModel
  .findOne({ username: req.session.passport.user})
  .populate('posts')
  //console.log(user.posts[0].image)
  res.render('profile',{user,nav:true})
})
router.get("/logout",(req,res,next)=>{
  req.logout(function(err) {
    if (err) { return next(err); }
    res.redirect('/');
  });

})
router.get("/add",isLoggedin,async(req,res)=>{
  const user = await userModel.findOne({username: req.session.passport.user})
    res.render('add',{user,nav:true})
})
router.get("/show/posts",isLoggedin,async(req,res)=>{
  const user = await userModel
  .findOne({ username: req.session.passport.user})
  .populate('posts')
  res.render('show',{user,nav:true})
})
router.get("/feed",isLoggedin,async(req,res)=>{
  const user = await userModel.findOne({username: req.session.passport.user})
const posts =  await postModel.find().populate('user')
res.render('feed',{user,posts,nav:true})
   
})
function isLoggedin(req,res,next){
  if(req.isAuthenticated()){
    return next()
  }
  res.redirect("/profile")
}


module.exports = router;
