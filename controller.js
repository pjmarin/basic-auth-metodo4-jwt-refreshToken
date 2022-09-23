// const jwt = require('json-web-token');
const jwt = require('jsonwebtoken');

// Never do this!
let users = {
    john: {password: "passwordjohn"},
    mary: {password:"passwordmary"}
}

// exports.login = function(req, res){

//     let username = req.body.username;
//     let password = req.body.password;
    
// 	console.log("username", username);
// 	console.log("password", password);
//     // Neither do this!
//     //if (!username || !password || users[username].password !== password){
//         //return res.status(401).send();
//     //}

//     //use the payload to store information about the user such as username, user role, etc.
//     let payload = {username: username};

//     //create the access token with the shorter lifespan
//     let accessToken = jwt.sign(payload, "dCYLxCAS9RVe4DHj21vowFP92UvM8mqgUbIlr4TG", {
//         algorithm: "HS256",
//         expiresIn: 20
//     });

//     //create the refresh token with the longer lifespan
//     let refreshToken = jwt.sign(payload, "N8DnxQcofOak0aJwrrSrRcKJuGqGxx38jgPYslL0", {
//         algorithm: "HS256",
//         expiresIn: 50
//     });
	
// 	console.log("users", users);
// 	console.log("users[username]", users[username]);

//     //store the refresh token in the user array
// 	if(!users[username]) {
// 		users[username] = {password}
// 	}
//     users[username].refreshToken = refreshToken;

//     //send the access token to the client inside a cookie
//     // res.cookie("jwt", accessToken, {secure: true, httpOnly: true});
//     // res.send()
	
// 	res.status(200).send({
// 		status: "login ok",
// 		accessToken,
// 		users
// 	});
// };

// exports.refresh = function (req, res){

//     // let accessToken = req.cookies.jwt;
// 	let accessTokenBearer = (req.headers['access-token'] || req.headers['authorization']);
// 	let accessToken = accessTokenBearer.replace("Bearer", "").trim();
// 	console.log('dentro del refresh - accessToken: ', accessToken);

//     if (!accessToken){
//         return res.status(403).send();
//     }

//     let payload, payload2;
//     try{
//         payload = jwt.verify(accessToken, "dCYLxCAS9RVe4DHj21vowFP92UvM8mqgUbIlr4TG");
// 		console.log('dentro del refresh - payload: ', payload);
//      }
//     catch(e){
//         console.log("error refresh: ", e);
//         // if(e.name === "TokenExpiredError" && e.message === "jwt expired") {
//         //     return res.status(200).send({
//         //         refreshToken: users[payload.username].refreshToken
//         //     });
//         // }

//         // return res.status(401).send({e});

//         if(e.name !== "TokenExpiredError" && e.message !== "jwt expired") {
//             return res.status(401).send({error: e});
//         }
//     }

//     //retrieve the refresh token from the users array
//     // let refreshToken = users[payload.username].refreshToken;
//     let refreshToken = users.john.refreshToken;

//     //verify the refresh token
//     try{
//         payload2 = jwt.verify(refreshToken, "N8DnxQcofOak0aJwrrSrRcKJuGqGxx38jgPYslL0");
//     }
//     catch(e){
//         return res.status(401).send();
//     }

//     // let newToken = jwt.sign(payload, "dCYLxCAS9RVe4DHj21vowFP92UvM8mqgUbIlr4TG",
//     let newToken = jwt.sign(payload2, "dCYLxCAS9RVe4DHj21vowFP92UvM8mqgUbIlr4TG", 
//     {
//         algorithm: "HS256",
//         expiresIn: 50
//     });

//     // res.cookie("jwt", newToken, {secure: true, httpOnly: true});
//     // res.send();
	
// 	res.status(200).send({
// 		status: "refresh token ok",
// 		newToken,
// 		users
// 	});
// };

exports.login = function(req, res){

    let username = req.body.username
    let password = req.body.password
    
    // Neither do this!
    if (!username || !password || users[username].password !== password){
        return res.status(401).send()
    }

    //use the payload to store information about the user such as username, user role, etc.
    let payload = {username: username}

    //create the access token with the shorter lifespan
    let accessToken = jwt.sign(payload, process.env.ACCESS_TOKEN_SECRET, {
        algorithm: "HS256",
        expiresIn: `${process.env.ACCESS_TOKEN_LIFE}s`
    });

    console.log("access token expiresIn: ", process.env.ACCESS_TOKEN_LIFE);

    //create the refresh token with the longer lifespan
    let refreshToken = jwt.sign(payload, process.env.REFRESH_TOKEN_SECRET, {
        algorithm: "HS256",
        expiresIn: `${process.env.REFRESH_TOKEN_LIFE}s`
    });

    console.log("refresh token expiresIn: ", process.env.REFRESH_TOKEN_LIFE);

    //store the refresh token in the user array
    users[username].refreshToken = refreshToken

    //send the access token to the client inside a cookie
    res.cookie("jwt", accessToken, {secure: true, httpOnly: true})
    res.send();
    
    // res.status(200).send({
    //     message: "status ok",
    //     accessToken,
    //     refreshToken
    // });
}

exports.refresh = function (req, res){

    let accessToken = req.cookies.jwt;
    let accessTokenTemp;
    let accessTokenAux;
    if(!accessToken) {
        accessTokenTemp = (req.headers['access-token'] || req.headers['authorization']);
        if(accessTokenTemp) {
            accessTokenAux = accessTokenTemp.replace("Bearer", "").trim();
        }
        
    }
    console.log("req.cookies", JSON.stringify(req.cookies));
    console.log("req.cookies.jwt", req.cookies.jwt);

    if (!accessToken && !accessTokenAux){
        console.log("Access token missed");
        return res.status(403).send({
            error: "Access token missed"
        })
    }

    let payload;
    let token = accessToken || accessTokenAux;

    try{
        console.log("accessToken", accessToken);
        console.log("process.env.ACCESS_TOKEN_SECRET", process.env.ACCESS_TOKEN_SECRET);
        console.log("token", token);
        console.log(payload ? payload : "Payload missed");
        payload = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
     }
    catch(e){
        return res.status(401).send({
            error: e.message === "jwt expired" ? "Accesstoken expired" : "Access token not valid"
        });
    }

    //retrieve the refresh token from the users array
    let refreshToken = users[payload.username].refreshToken;
    console.log("refreshToken", refreshToken);

    //verify the refresh token
    try{
        console.log("token", token);
        console.log("process.env.ACCESS_TOKEN_SECRET", process.env.REFRESH_TOKEN_SECRET);
        jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET)
    }
    catch(e){
        return res.status(401).send({
            error: e.message === "jwt expired" ? "Refresh expired" : "Refresh token not valid"
        })
    }

    let newToken = jwt.sign(payload, process.env.ACCESS_TOKEN_SECRET, 
    {
        algorithm: "HS256",
        expiresIn: process.env.ACCESS_TOKEN_LIFE
    })

    if (newToken) {
        console.log("newToken", newToken);
    } else {
        console.log("New token couldnt been generated");
    }

    res.cookie("jwt", newToken, {secure: true, httpOnly: true})
    res.send();

    // res.status(200).send({
    //     message: "status ok",
    //     newToken,
    //     refreshToken
    // });
}