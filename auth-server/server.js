// inisialisasi paket
let express = require('express')
let request = require('request')
let querystring = require('querystring')
let cors = require('cors')
let app = express()

//insialisasi variabel yang akan dikirim ke spotify
let redirect_uri_login = 'http://localhost:8888/callback'
let client_id = ''
let client_secret = ''

app.use(cors())

//login endpoint, redirect ke sopitify authorization
app.get('/login', function(req, res){
    res.redirect('https://accounts.spotify.com/authorize?' +
    querystring.stringify({
        response_type: 'code',
        client_id: client_id,
        scope: 'user-read-private-user-read-email user-library-read',
        redirect_uri: redirect_uri_login
    }))
})

//callback point jawaban authorize spotify
app.get('/callback', function(){
    let code = req.query.code || null
    let authOptions = {
        url: 'https://accounts.spotify.com/api/token',
        form: {
            code: code,
            redirect_uri: redirect_uri_login,
            grant_type: 'authorization_code'
        },
        headers: {
            'Authorization': 'Basic' + (Buffer.from(
                client_id + ':' + client_secret
            ).toString('base64'))
        },
        json: true
    }
    request.post(authOptions, function (error, response, body){
        var acces_token = body.access_token
        let uri = process.env.FRONTEND_URI || 'http://localhost:3000/playlist'
        res.redirect(uri + 'access_token' + access_token)
    })
})