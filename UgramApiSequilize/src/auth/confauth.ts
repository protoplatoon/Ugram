module.exports = {
    'facebookAuth': {
        'clientID': '1644441632245482', // your App ID
        'clientSecret': '260f7fcbd871a902045dd5c7b28bc0bb', // your App Secret
        'callbackURL': 'http://localhost:3000/auth/facebook/callback',
    },
    'googleAuth': {
        'clientID': '281618259546-805hibrk69l4kd0qspf035guc5q37qq6.apps.googleusercontent.com', // your App ID
        'clientSecret': 'p1Rl1Xb-bKheGaNAZj8Ltquu', // your App Secret
        'callbackURL': 'http://localhost:3000/auth/google/callback',
    },
    'BASE_URL': 'http://localhost:8080'
};

//AIzaSyAf9R5vFhBCtx9D5U-AumUktKb0pKBBAic  //api key google

//production http : 'callbackURL': 'http://ugram-team-09.us-east-1.elasticbeanstalk.com/auth/facebook/callback'

// export const UGRAM_WEBSITE = {
//     BASE_URL: 'http://localhost:8080',   
// };

//production : 'http://ec2-54-236-15-255.compute-1.amazonaws.com'