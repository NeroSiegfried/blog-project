import express from "express";
import bodyParser from "body-parser";
import pg from "pg";
import axios from "axios";

const app = express();
const port = 3000;
const apiKey = "5cc67861";
const cover_url = `http://omdbapi.com/`;

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

let loggedIn = true;

let feature_id = 3;
let currentUserID = 1;
let feature = {};

const db = new pg.Client({
    user: "postgres",
    host: "localhost",
    database: "blog",
    password: "Password",
    port: 5432,
});

let config = {
    params: {
        apikey : apiKey,
        t: '',
    },
    auth: {  
    },
}

db.connect();

const updateData = async () => {
    const query1 = await db.query("SELECT * FROM users");
    const query2 = await db.query("SELECT * FROM posts ORDER BY id");
    const query3 = await db.query("SELECT * FROM users WHERE id = $1", [currentUserID]);
    const query4 = await db.query("SELECT * FROM posts WHERE id = $1", [feature_id]);
    users = query1.rows;
    posts = query2.rows;
    currentUser = query3.rows[0];
    feature = query4.rows[0];
}

updateData();

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));
app.use("/post", express.static("public"));
app.use("/edit", express.static("public"));


app.get("/", async (req, res) => {
    posts.forEach(post => {
        updateImage(post);
    });

    updateData();

    for(var i = 0; i<posts.length; i++){
        posts[i] = {
            ...posts[i],
            age: getAge(posts[i].creation_date),
        };
    }
    
    // posts.forEach(async post => {
    //     db.query("INSERT INTO")
    // })
    
    const feature_index = posts.findIndex(x => x.id == feature_id);
    if(feature_index == -1){
        res.render("index.ejs", {posts: posts, loggedIn: loggedIn, user: currentUser});
    }else{
        const feature = posts[feature_index];
        res.render("index.ejs", {posts: posts, feature: feature, loggedIn: loggedIn, user: currentUser});
    }
})

app.get("/post/:id", async (req, res) => {
    const id = req.params.id;
    // const post = posts[posts.findIndex(x => x.id == id)];
    // const author = users[users.findIndex(x => x.id == post.author)];
    console.log(id);
    const query1 = await db.query("SELECT * FROM posts WHERE id = $1", [id]);
    const post = query1.rows[0];
    const query2 = await db.query("SELECT users.* FROM users, (SELECT * FROM posts WHERE id = $1) AS subquery WHERE subquery.author = users.id", [id]);
    const author = query2.rows[0];
    if (!post.image){
        post.image = "failure.png";
    }
    console.log(post.image);
    res.render("post.ejs", {post: post, loggedIn: loggedIn, user: currentUser, author: author});
});

app.get("/log-in", (req, res) => {
    res.render("login.ejs", {location: "login", loggedIn: loggedIn});
});

app.get("/profile", (req, res) => {
    console.log(currentUser);
    updateData();
    res.render("profile.ejs", {location: "profile", loggedIn: loggedIn, user: currentUser});
})

app.post("/log-in", async (req, res) => {
    console.log(req);
    const email = req.body.email;
    const password = req.body.password;
    //const userIndex = users.findIndex( x => (x.email == email && x.password == password));
    const request = await db.query("SELECT * FROM users WHERE email = $1 and password = $2", [email, password]);
    if (!request.rows.length){
        console.log("Incorrect Email or Password");
        res.redirect("/log-in");
    }else {
        currentUser = request.rows[0];
        loggedIn = true;
        res.redirect("/");
    }
})

app.get("/logout", (req, res) => {
    currentUser = {};
    loggedIn = false;
    res.redirect("/")
})

app.get("/edit/:id", async (req, res) => {
    const id = req.params.id;
    // const post = posts[posts.findIndex(x => x.id == id)];
    const request = await db.query("SELECT id, name, rating, review FROM posts WHERE id = $1;", [id]);
    const post = request.rows[0];
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

app.post("/new", async (req, res) => {
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
    const request = await db.query("INSERT INTO posts (name, rating, review, author) VALUES ($1, $2, $3, $4) RETURNING *", [title, rating, review, currentUser.id]);
    console.log(request);
    posts.push(post);
    updateImage(request.rows[0]);
    res.redirect("/");
})

app.post("/post/:id", async (req, res) => {
    const id = req.params.id;
    //const index = posts.findIndex(x => x.id == id);
    const title = req.body.title;
    const review = req.body.review;
    const rating = req.body.rating;
    // posts[index].name = title;
    // posts[index].review = review;
    // posts[index].rating = rating;
    const request = await db.query("UPDATE posts SET name = $1, review = $2, rating = $3, name_changed = true WHERE id = $4 RETURNING *", [title, review, rating, id]);
    updateImage(request.rows[0]);
    res.redirect(`/post/${id}`);
})

app.get("/delete/:id", async (req, res) => {
    const id = req.params.id;
    const index = posts.findIndex(x => x.id == id);
    console.log(id);
    //add authentication later
    if (posts[index].author == currentUser.id){
        posts.splice(index, 1);
        const request = await db.query("DELETE FROM posts WHERE id = $1", [id]);
    };

    res.redirect("/");
})

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});



const getAge = (oldDate) => {
    const date = new Date(oldDate);
    const currentDate = new Date();
    const years = currentDate.getFullYear() - date.getFullYear();
    if (years) return years == 1 ? "1 year" : `${years} years`
    const seconds = currentDate.getTime() - date.getTime();
    console.log(seconds);
    if (seconds < 60/1000) return `${seconds}s`;
    if (seconds < 3600/1000) return `${Math.floor(seconds/60/1000)}m`;
    if (seconds < 86400/1000) return `${Math.floor(seconds/3600/1000)}h`;
    if (seconds < 2629746/1000) return `${Math.floor(seconds/86400/1000)}D`;
    if (seconds < 31556952/1000) return `${Math.floor(seconds/2629746/1000)}M`;
}

const updateImage = async (post) => {
    if (!post.image_loaded && post.name_changed){
        config.params.t = post.name;
        await axios.get(cover_url, config).then(async (res) => {
            if (res.data.Poster){
                await db.query("UPDATE posts SET image_loaded = true, name_changed = false WHERE id = $1", [post.id])
                await db.query("UPDATE posts SET image = $1 where id = $2", [res.data.Poster, post.id]);
            }
            else{
                await db.query("UPDATE posts SET name_changed = false WHERE id = $1", [post.id])
            }
        });
        
    }
};

