
// Local - 

// var webAuth = new auth0.WebAuth({
//     domain: 'roadie.auth0.com',
//     clientID: 'RwcedO9FuaceFDfE9dS2pDlSmtdiS2nF',
//     redirectUri:"http://localhost:3000/add",
//     audience: 'https://roadie.auth0.com/userinfo',
//     responseType: 'token id_token',
//     scope: 'openid'
//   });

// var webAuth = new auth0.WebAuth({
//     domain: 'app70749112.auth0.com',
//     clientID: 'zCiVXnoOy0yq58TOYCdTpB4UWDY5d8UQ',
//     redirectUri:"https://roadie2017.herokuapp.com/",
//     audience: 'https://roadie.auth0.com/userinfo',
//     responseType: 'token id_token',
//     scope: 'openid'
//   });
 
   var webAuth = new auth0.WebAuth({
    domain: 'app70749112.auth0.com',
    clientID: 'zCiVXnoOy0yq58TOYCdTpB4UWDY5d8UQ',
    redirectUri: window.location.href,
    audience: 'https://app70749112.auth0.com/userinfo',
    responseType: 'token id_token',
    scope: 'openid'
  });


  hideBeforeLoginScreen();
  handleAuthentication();
  initHandlers();

  function hideBeforeLoginScreen() {
    $("#after-login-screen").hide();
    $("#user-about-me").hide();
    $("#user-posts").hide();
    $("#survey-btns-div").hide();
  }

  function showAfterLoginScreen() {
    $("#welcome-screen").hide();
    $("#after-login-screen").show();
    $("#user-about-me").show();
    $("#user-posts").show();
    $("#survey-btns-div").show();
  }

  function initHandlers() {
    // buttons and event listeners
    $('#btn-login').click(function (event) {
      event.preventDefault();
      webAuth.authorize();
    });
    $('.btn-logout').click(logout);
    $("#submit-new-post").on("click", submitNewPost);
    $("#submit-new-about").on("click", submitAboutUser);
    $(".button-collapse").sideNav();
  }

  function setSession(authResult) {
    // Set the time that the access token will expire at
    var expiresAt = JSON.stringify(
      authResult.expiresIn * 1000 + new Date().getTime()
    );
    localStorage.setItem('access_token', authResult.accessToken);
    localStorage.setItem('id_token', authResult.idToken);
    localStorage.setItem('expires_at', expiresAt);
  }

  // return to blank screen? 
  // render a blank page 
  function logout() {
    // Remove tokens and expiry time from localStorage
    localStorage.removeItem('access_token');
    localStorage.removeItem('id_token');
    localStorage.removeItem('expires_at');
    displayButtons();
  }

  // checks to verify user is logged in? Maybe do this before any 
  // calls to the server 
  function isAuthenticated() {
    // Check whether the current time is past the
    // access token's expiry time
    var expiresAt = JSON.parse(localStorage.getItem('expires_at'));
    return new Date().getTime() < expiresAt;
  }

  function displayButtons() {
    if (isAuthenticated()) {
      $('.btn-login').css('display', 'none');
      $('.btn-logout').css('display', 'inline-block');
      $("#login-status").text('You are logged in!');
    } else {
      $('.btn-login').css('display', 'inline-block');
      $('.btn-logout').css('display', 'none');
      $("#login-status").text('Please login to continue!');
    }
  }


//   function createUserPic(user) { 
    
//     var picInfo = user.picture;
//     var imgDiv = $('<img>');
//     imgDiv.attr('src', picInfo);
//     $("#user-picture").append(imgDiv);
//   }

//   function statusUpdate(user) {
//     $('#status').removeClass('hide');
//     //animates text box
//     $('#textarea1').val('');
//     $('#textarea1').trigger(autoresize);
//     //on click to get status
//     $('#btn').on('click', function() {
//       //add to session storage?
//       console.log('status updated');
//       $('#status').addClass('hide');
//     });
//     Materialize.toast('Status Updated!', 4000);
//   }

//   function aboutMe(user) {
//     $('#aboutMe').removeClass('hide');
//     //animates text box
//     $('#textarea2').val('');
//     $('#textarea2').trigger(autoresize);
//     //on click to get status
//     $('#btn').on('click', function() {
//       //add to session storage?
//       console.log('status updated');
//       $('#aboutMe').addClass('hide');
//     });
//     Materialize.toast('About Me posted!', 4000);
    
//   }
//  handleAuthentication();


  function handleAuthentication() {
    // wrap function around this 
    webAuth.parseHash(window.location.hash, function (err, authResult) {
      if (err) {
        // amend message to screen telling user to login or re-login since their token expired!! 
        console.log(err);
        alert(
          'Error: ' + err.error + '. Check the console for further details.'
        );
      } else if (authResult && authResult.accessToken && authResult.idToken) {

        window.location.hash = '';
        setSession(authResult);
        $('.btn-login').css('display', 'none');
        // toggle showing login/logout depending on if the user is authenticated or not
        displayButtons();

        webAuth.client.userInfo(authResult.accessToken, function (err, user) {
          console.log(user);
          var newUser = {
            email: user.email,
            name: user.name,
            nickname: user.nickname,
            picture: user.picture,
            last_login: user.updated_at,
          }

          // send recieved user Object to database after authentication via auth0 
          postUserDB(newUser);

//           console.log('hi!');
//           //activate page
//           $('div').removeClass('hide');
//           createUserPic(newUser);
//           statusUpdate(newUser);
//           aboutMe(newUer);
//           //carousel
//           $(document).ready(function() {
//             $('.carousel').carousel();
//           });


          // renderUserProfile(newUser); 


        });
      }
    });
  }

  function renderUserProfile(userImage) {
    showAfterLoginScreen();
    // runs AJAX get request to get all of the logged in user's posts 
    getPosts(function (userPosts) {
      for (var i = 0; i < userPosts.length; i++) {
        var currentPost = JSON.parse(JSON.stringify(userPosts[i]));

        var newPost = $("<li>");
        newPost.attr("class", "flow-text collection-item");
        var newPostBody = currentPost["Posts.body"];
        newPost.append(newPostBody);
        $("#user-posts-here").append(newPost);
      }
      var singlePost = JSON.parse(JSON.stringify(userPosts[0]));
      var aboutUser = singlePost["about_user"];
      console.log(aboutUser);
      $('#about-user').val(aboutUser);
      $('#about-user').trigger('autoresize');
      Materialize.updateTextFields();

      var userName = $("<h5>"); 
      userName.attr("class", "current-user-name"); 
      userName.append(singlePost["name"]); 
       $("#user-name").append(userName); 
    });


    var profileImage = $("<img>");
    profileImage.attr({
      "src": userImage,
      "class": "responsive-img materialboxed"
    });
    $("#user-image").append(profileImage);

  }



   