import express from "express";
import bodyParser from "body-parser";
import pg from "pg";

const app = express();
const port = 3000;
const apiKey = "5cc67861";
const cover_url = `http://img.omdbapi.com/`;

let posts = [
    {
        id: 1,
        name: "Shawshank Redemption",
        rating: 10,
        image: "Shawshank_Redemption_poster.jpeg",
        review: "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.",
        author: 1,
        authorName: "Victor Nabasu",
        creationDate: new Date("2021-01-01"),
        age: "",
    },
    {
        id: 2,
        name: "The Godfather",
        rating: 8,
        image: "The_Godfather_poster.jpg",
        review: "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.",
        author: 1,
        authorName: "Victor Nabasu",
        creationDate: new Date("2021-01-03"),
        age: "",
    },
    {
        id: 3,
        name: "The Dark Knight",
        rating: 10,
        image: "The_Dark_Knight_poster.jpg",
        review: "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.",
        author: 1,
        authorName: "Victor Nabasu",
        creationDate: new Date("2021-01-12"),
        age: "",
    },
    {
        id: 4,
        name: "The Lord of The Rings: Return of the King",
        rating: 10,
        image: "LOTR_ROTK.jpeg",
        review: "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.",
        author: 2,
        authorName: "Nero Siegfried",
        creationDate: new Date("2023-06-03"),
        age: "",
    }
]

let users = [
    {
        id: 1,
        name: "Victor Nabasu",
        username: "victornabasu",
        email: "victornabasu@yahoo.com",
        password: "password",
        bio: "I don't really have much to say",
        creationDate: new Date("2021-01-01"),
    },
    {
        id: 2,
        name: "Nero Siegfried",
        username: "NeroSiegfried",
        email: "nerosiegfried@gmail.com",
        password: "password",
        bio: "I don't really have much to say either",
        creationDate: new Date("2023-06-01"),
    },
]

let newPostID = 5;
let newUserID = 3;
let currentUser = {};

currentUser = users[0];

let loggedIn = true;

const feature_id = 3;

const db = new pg.Client({
    user: "postgres",
    host: "localhost",
    database: "",
    password: "Password",
    port: 5432,
});


app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));
app.use("/post", express.static("public"));
app.use("/edit", express.static("public"));

app.get("/", (req, res) => {
    posts.forEach(post => {
        post.age = getAge(post.creationDate);
    });
    const feature_index = posts.findIndex(x => x.id == feature_id);
    if(feature_index == -1){
        res.render("index.ejs", {posts: posts, loggedIn: loggedIn, user: currentUser});
    }else{
        const feature = posts[feature_index];
        res.render("index.ejs", {posts: posts, feature: feature, loggedIn: loggedIn, user: currentUser});
    }
})

app.get("/post/:id", (req, res) => {
    const id = req.params.id;
    const post = posts[posts.findIndex(x => x.id == id)];
    const author = users[users.findIndex(x => x.id == post.author)];
    res.render("post.ejs", {post: post, loggedIn: loggedIn, user: currentUser, author: author});
});

app.get("/log-in", (req, res) => {
    res.render("login.ejs", {location: "login", loggedIn: loggedIn});
});

app.get("/profile", (req, res) => {
    res.render("profile.ejs", {location: "profile", loggedIn: loggedIn, user: currentUser});
})

app.post("/log-in", (req, res) => {
    console.log(req);
    const email = req.body.email;
    const password = req.body.password;
    const userIndex = users.findIndex( x => (x.email == email && x.password == password));
    if (userIndex == -1){
        console.log("Incorrect Email or Password");
        res.redirect("/log-in");
    }else {
        currentUser = users[userIndex];
        loggedIn = true;
        res.redirect("/");
    }
})

app.get("/logout", (req, res) => {
    currentUser = {};
    loggedIn = false;
    res.redirect("/")
})

app.get("/edit/:id", (req, res) => {
    const id = req.params.id;
    const post = posts[posts.findIndex(x => x.id == id)];
    res.render("edit.ejs", {message: "Edit", post: post, loggedIn: loggedIn, user: currentUser});
});

app.get("/create", (req, res) => {
    const post = {
        name: "",
        rating: 0,
        image: "",
        review: "",
    };
    res.render("edit.ejs", {message: "Create", post: post, loggedIn: loggedIn, user: currentUser});
});

app.post("/new", (req, res) => {
    console.log(req);
    const title = req.body.title;
    const review = req.body.review;
    const rating = req.body.rating;
    const post = {
        id: newPostID++,
        name: title,
        rating: rating,
        image: "",
        review: review,
        author: currentUser.id,
        authorName: currentUser.name,
        creationDate: new Date(),
        age: 0,
    };
    posts.push(post);
    res.redirect("/");
})

app.post("/post/:id", (req, res) => {
    const id = req.params.id;
    const index = posts.findIndex(x => x.id == id);
    const title = req.body.title;
    const review = req.body.review;
    const rating = req.body.rating;
    posts[index].name = title;
    posts[index].review = review;
    posts[index].rating = rating;
    res.redirect(`/post/${id}`);
})

app.get("/delete/:id", (req, res) => {
    const id = req.params.id;
    const index = posts.findIndex(x => x.id == id);
    console.log(id);
    //add authentication later
    if (posts[index].author == currentUser.id){
        posts.splice(index, 1);
    };
    res.redirect("/");
})

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});



const getAge = (date) => {
    const currentDate = new Date();
    const years = currentDate.getFullYear() - date.getFullYear();
    if (years) return years == 1 ? "1 year" : `${years} years`
    const seconds = currentDate.getSeconds() - date.getSeconds();
    if (seconds < 60) return `${seconds}s`;
    if (seconds < 3600) return `${Math.floor(seconds/60)}m`;
    if (seconds < 86400) return `${Math.floor(seconds/3600)}h`;
    if (seconds < 2629746) return `${Math.floor(seconds/3600)}D`;
    if (seconds < 31556952) return `${Math.floor(seconds/2629746)}M`;
}