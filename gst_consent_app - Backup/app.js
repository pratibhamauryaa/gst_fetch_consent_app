var otpValue;
var userGstName;
var userId;
var count = 0;
$(document).ready(function () {
    history.pushState(null, null, document.URL);
        window.addEventListener('popstate', function () {
            history.pushState(null, null, document.URL);
        });
    var resendButton = $('#resendOtp');
    var count = 0;
    findMyState();
    clientIp();
    $('#resendOtp').on('click', function () {
        console.log("resend otp clicked B2c");
        var resendOtpMsg =$('#resend-otp-msg');
        clearTimeout(3);
        count++;
        if (count === 3) {
            clearInterval(countdown);
            resendButton.removeAttr('disabled');
            swal("error", "Resend Has been Disabled", "error")
                .then(() => {
                    return location.reload();
                });
        }
        resendOtpRequest();
        resendOtpMsg.text('');
        $('#otpsubmit').removeAttr('style');
        resendButton.attr('disabled', true);
        activeStateOTP();


    });
    $('#otpsubmit').on('click', function (event) {
        event.preventDefault();
        console.log("submit button clicked");
        var formInput = '';
        //var submitGstOtp = $('#otpGstsubmit');
        $('input').each(function() {
            formInput += $(this).val();
        });
        var myOtp = formInput;
        console.log(myOtp);
        submitOtp(myOtp);

    });
});

function findMyState() {
    const success = function (position) {
        console.log("location found");
        const latitude = position.coords.latitude;
        const longitude = position.coords.longitude;
        $("#otpContent").removeAttr("style");
        //console.log("users location coordinates: latitude=> " + latitude + " longitude=> " + longitude);
        getUserDetails();
        $('#userInfoModal').show();       
    }
    const error = () => {
        swal("error", "unable to retrive location", "error")
            .then(() => {
                showLocationGuide();

            });

    }
    navigator.geolocation.getCurrentPosition(success, error);
}
//user Details
function getUserDetails() {
    var userUrl = "https://s03wy0krk4.execute-api.ap-south-1.amazonaws.com/dev?service=userIdentification&encryptedUserId=usertest1";
    //var userUrl = "userdetails.json";
    var name = $("#user-name");
    var phone = $("#mobile-number");
    var mobile;
    var username;
    $.ajax({
        type: "GET",
        url: userUrl,
        contentType: 'application/json',
        // crossDomain:true,
        beforeSend: function (xhr) {
            xhr.setRequestHeader("x-api-key", "lGQ4ILBkogarD246r837644XwLZksx9z3XXktLdh");
        },
        success: function (resp) {
            //console.log(resp);
            if (resp.result == "success") {
                console.log("found the user details");
                userId = resp.data.userId;
                username = resp.data["userName"];
                mobile = resp.data["userMobile"];
                var maskedPhone = maskPhoneNumber(mobile);
                name.html("<b>" + username + "</b>");
                phone.html("<b>" + maskedPhone + "</b>");
                //document.getElementById("otpcontent").removeAttribute("style");
                sendOtpRequest();
                //otpPage();
                //document.getElementById("otpcontent").removeAttribute("style");
            } else if (resp.result == "failure") {
                console.log("USER NOT FOUND")
                var message = resp.errorMessage;
                swal("error", message, "error")
                    .then(() => {
                        return location.reload();
                    });

            }

        },
        error: function (xhr, status, error) {
            // console.log("Error: " + error);
            swal("error", "Something went wrong", "error")
                .then(() => {
                    return location.reload();
                });
        }
    });

}

function showLocationGuide() {

    var userAgent = navigator.userAgent;
    //var userAgent = "Android";
    if (userAgent.match(/iPhone|iPod|iPad/)) {
        console.log("iphone")
        $("#location-guide").attr('src' ,'location_guide_iphone.jpg');
      } else if (userAgent.match(/Android/)) {
        console.log("android")
        $("#location-guide").attr('src' ,'location_guide_android.avif');
      } else {
        console.log("chrome/exp")
        $("#location-guide").attr('src' ,'allow-location.png');
      }
    // var imageLocation = document.getElementById('locationAllow');
    // imageLocation.show();
    $('#locationAllow').show();
    //location.reload();
}

function clientIp() {
    $.getJSON("https://api.ipify.org?format=json", function (data) {
        console.log("user Ip Address :" + data.ip)
    })
}
//masking the mobile number
function maskPhoneNumber(phoneNumber) {

    phoneNumber = phoneNumber.toString()
    const lastFourDigits = phoneNumber.substring(phoneNumber.length - 4);
    const maskedDigits = "*".repeat(phoneNumber.length - 4);
    const maskedPhoneNumber = maskedDigits + lastFourDigits;
    return maskedPhoneNumber;
}
function resetStateOTP() {
    clearInterval(countdown);
    //const inputs = document.querySelectorAll("input");
    //expire = 10;
    // inputs.forEach((input) => {
    //     input.value = '';
    // });

}

function activeStateOTP() {
    console.log("the countdown about to start again");
    handleCountDown(10, '#resendOtp', '#resend-otp-msg', '#otpsubmit');
}
//send otp request B2c
function sendOtpRequest() {
    //var otpUrl = "otpResponse.json";
    var otpUrl = "https://s03wy0krk4.execute-api.ap-south-1.amazonaws.com/dev?service=userVerificationOTPSend";
    var data = {
        "userId": userId
    }
    // console.log(userId);
    //api call to request send otp and resp =success/failure
    $.ajax({
        type: "POST",
        url: otpUrl,
        dataType: "json",
        contentType: 'application/json',
        data: JSON.stringify(data),
        success: function (resp) {
            //console.log(resp);
            if (resp.result == "success") {
                console.log("Request is sent for the otp B2c");
                otpPage();
            } else if (resp.result == "failure" && resp.errorCode == "ER001") {
                clearTimeout(3);
                var message = resp.errorMessage;
                //console.log(message);
                swal("unable to send otp", message, "error")
                    .then(() => {
                        return location.reload();
                    });
                return resp;
            }
        },
        error: function (xhr, status, error) {
            //console.log("Error: ");
            var status = xhr.status;
            swal("error", "Page not found", "error")
                .then(() => {
                    return location.reload();
                });
        }

    });
}
//otp page 
function otpPage() {
    console.log("1 otp page")
    handleCountDown(15, '#resendOtp', '#resend-otp-msg', '#otpsubmit');
    const inputs = $("input");
    const submitButton = $('#otpsubmit');
    inputs.on("keyup", function (e) {
      const currentInput = $(this);
      const nextInput = $(this).next();
      const prevInput = $(this).prev();
  
      if (currentInput.val().length > 1) {
        currentInput.val("");
        return;
      }
  
      if (nextInput && nextInput.prop("disabled") && currentInput.val() !== "") {
        nextInput.prop("disabled", false);
        nextInput.focus();
      }
  
      if (e.key === "Backspace") {
        inputs.each(function (index) {
          if (index >= currentInput.index() && prevInput.length) {
            $(this).prop("disabled", true);
            $(this).val("");
            prevInput.focus();
          }
        });
      }
  
      inputs.each(function () {
        if ($(this).prop('disabled')) {
          submitButton.prop('disabled', true);
          return;
        } else {
          submitButton.prop('disabled', false);
        }
      });
    }); 
}
//resend otp request B2c
function resendOtpRequest() {
    var otpUrl = "https://s03wy0krk4.execute-api.ap-south-1.amazonaws.com/dev?service=userVerificationOTPResend";
    //var otpUrl = "otpResponse.json";
    var data = {
        "userId": userId
    }
    $.ajax({
        type: "POST",
        url: otpUrl,
        dataType: "json",
        contentType: 'application/json',
        data: JSON.stringify(data),
        beforeSend: function (xhr) {
            xhr.setRequestHeader("x-api-key", "lGQ4ILBkogarD246r837644XwLZksx9z3XXktLdh");
        },
        success: function (resp) {
            if (resp.result == "success") {
                console.log("Request is RE SENT  for the otp B2c");
            } else if (resp.result == "failure" && resp.errorCode == "ER001") {
                clearTimeout(3);
                var message = resp.errorMessage;
                //console.log(message);
                swal("unable to re-send the otp", message, "error")
                    .then(() => {
                        return location.reload();
                    });
            }
        },
        error: function (xhr, status, error) {
            //console.log("Error: ");
            var status = xhr.status;
            swal("Error", "Page not found", "error")
                .then(() => {
                    return location.reload();
                });
        }

    });

}
//handle the timer 
function handleCountDown(expire, resendButtonId, resendOtpMsgId, submitButtonId) {
    var expireEle = $('.expire');
    var resendButton = $(resendButtonId);
    var resendOtpMsg = $(resendOtpMsgId);
    countdown = setInterval(() => {
        expire--;
        if (expire === 0) {
            console.log('countdown has been expired');
            clearInterval(countdown);
            resendOtpMsg.text('Please click the resend button to generate another OTP');
            resendButton.removeAttr('disabled');
            $(submitButtonId).hide();
        }
        expireEle.text(expire < 10 ? '0' + expire + 's' : expire + 's');
    }, 1000);
}
//submit otp B2c
function submitOtp(myOtp) {

    var url = "https://s03wy0krk4.execute-api.ap-south-1.amazonaws.com/dev?service=userVerificationOTPSubmit";
    //var url = "otpSubmit.json";
    var data = {
        "userId": userId,
        "otp": myOtp
    }
    //console.log(myOtp)
    $.ajax({
        type: "POST", //POST
        url: url,
        dataType: "json",
        data: JSON.stringify(data), //sending the input otp
        success: function (resp) {
            if (resp.result == "success") {
                console.log("otp submitted and validated successfully");
                loadCreditConsent();
                //$("#otpcontent").load("creditConsent.html");
            } else if (resp.result == "failure" && resp.errorCode == "ER001") {
                var message = resp.errorMessage;
                clearInterval(countdown);
                swal("error", message, "error")
                    .then(() => {
                        return location.reload();
                    });

            } else if (resp.result == "failure" && resp.errorCode == "ER003") {
                var message = resp.errorMessage;
                clearInterval(countdown);
                swal("Sorry, the OTP session has been expired", message, "error")
                    .then(() => {
                        return location.reload();
                    });

            } else if (resp.result == "failure" && resp.errorCode == "ER004") {
                var message = resp.errorMessage;
                swal("You have enterd a wrong OTP", message, "error")
                    .then(() => {
                        //return location.reload();
                    });

            }
        },
        error: function (xhr, status, error) {
            //console.log("Error: ");
            var status = xhr.status;
            swal("Error", "Page not found", "error")
                .then(() => {
                    return location.reload();
                });
        }
    });
}
//loading Gst consent page
function loadCreditConsent() {

    $.ajax({
        url: "gstConsent.html",
        type: "GET",
        success: function (response) {
            clearTimeout(3);
            $('.container').html(response);
            console.log("gst consent page is loaded");
            clearInterval(countdown);
            $('#disagree').on('click', function () {
                swal("Warning", "are you sure you want to disagree?", "warning")
                    .then(() => {
                        return location.reload();
                    });

            });

        },
        error: function () {
            console.log("Error loading GST consent page");
        }
    });

}
//validating gst input username
function validateGstUsername() {
    var userGstName = $('#gst-username-input').val();
    var agreeonsent = $('#agreeConsent');
    var userGstNameI = $('#gst-username-input');
    var userGstSubmit = $('#gst-submit');
    console.log("sending the username for validation");
    //console.log(agreeonsent);
    var pattern = /[a-zA-Z]{1}[a-zA-Z0-9_.-]{1,14}$/;
    if (!pattern.test(userGstName)) {
        swal("Invalid Input", "Please enter a valid user name", "info");
    }else if(userGstName.length < 8){
        swal("Invalid Input", "Please enter a valid username", "info");
    } else if(userGstName.indexOf(' ') >= 0 ){
        swal("Invalid Input", "username cannot contain any white spaces", "info");
    }else {
        userGstSubmit.addClass('submitted');
        agreeonsent.removeAttr('disabled');
        userGstNameI.attr('disabled', true);
    }
}
//gst otp page loaded
function OtpFromGstin() {
    $.ajax({
        url: "gstOtpPage.html",
        type: "GET",
        success: function (response) {
            $('.container').html(response);
            sendGstOtpRequest();
        },
        error: function () {
            console.log("Error loading page");
        }
    });
}
//sending gst otp request
function sendGstOtpRequest() {
    var otpUrl = "https://s03wy0krk4.execute-api.ap-south-1.amazonaws.com/dev?service=gstOTPSend";
    var data = {
        "userId": userId,
    }
    //console.log(userId) 
    //api call to request send otp and resp =success/failure
    $.ajax({
        type: "POST",
        url: otpUrl,
        dataType: "json",
        contentType: 'application/json',
        data: JSON.stringify(data),
        beforeSend: function (xhr) {
            xhr.setRequestHeader("x-api-key", "lGQ4ILBkogarD246r837644XwLZksx9z3XXktLdh");
        },
        success: function (resp) {
            //console.log(resp);
            if (resp.result == "success") {
                console.log("Request is sent for the GST otp");
                gstOtpPage();
            } else if (resp.result == "failure" && resp.errorCode == "ER001") {
                clearTimeout(3);
                var message = resp.errorMessage;
                //console.log(message);
                swal("unable to send otp", message, "error")
                    .then(() => {
                        return location.reload();
                    });
                return resp;
            }
        },
        error: function (xhr, status, error) {
            //console.log("Error: ");
            var status = xhr.status;
            swal("Error", "Page not found", "error")
                .then(() => {
                    return location.reload();
                });
        }

    });

}
//gst otp val and countdown call
function gstOtpPage() {
    console.log("loaded the gst otp page")
    handleCountDown(15, '#resendGstOtp', '#resend-otp-msg', '#otpGstsubmit');
    var inputs = $('input');
    var submitButton = $('#otpGstsubmit');
    //console.log(buttons);
    inputs.on("keyup", function (e) {
        const currentInput = $(this);
        const nextInput = $(this).next();
        const prevInput = $(this).prev();
    
        if (currentInput.val().length > 1) {
          currentInput.val("");
          return;
        }
    
        if (nextInput && nextInput.prop("disabled") && currentInput.val() !== "") {
          nextInput.prop("disabled", false);
          nextInput.focus();
        }
    
        if (e.key === "Backspace") {
          inputs.each(function (index) {
            if (index >= currentInput.index() && prevInput.length) {
              $(this).prop("disabled", true);
              $(this).val("");
              prevInput.focus();
            }
          });
        }
    
        inputs.each(function () {
          if ($(this).prop('disabled')) {
            submitButton.prop('disabled', true);
            return;
          } else {
            submitButton.prop('disabled', false);
          }
        });
      }); 

}
//submit gst otp request
function submitGst(){
    var formData = '';
    //var submitGstOtp = $('#otpGstsubmit');
    $('input').each(function() {
        formData += $(this).val();
    });
    var myGstOtp = formData;
    console.log(myGstOtp +" GST");
    submitGstOtpRequest(myGstOtp);

}
// resend gst button click handler
function countResendGst() {
    console.log("resend GST otp is clicked")
    var resendButton = $('#resendGstOtp');
    var resendOtpMsg = $('#resend-otp-msg');
    clearTimeout(3);
    count++;
    if (count === 3) {
        resendButton.removeAttr('disabled');
        swal("error", "Resend Has been Disabled", "error")
            .then(() => {
                return location.reload();
            });
        clearInterval(countdown);
    }
    //function that calls the gst api
    resendGstOtp();
    resendOtpMsg.text('');
    $('#otpGstsubmit').removeAttr('style');
    resendButton.attr('disabled', true);
    clearInterval(countdown);
    handleCountDown(10, '#resendGstOtp', '#resend-otp-msg', '#otpGstsubmit');

}
//resend gst otp request
function resendGstOtp() {
    var otpUrl = "https://s03wy0krk4.execute-api.ap-south-1.amazonaws.com/dev?service=gstOTPResend";
    //var otpUrl = "otpResponse.json";
    var data = {
        "userId": userId
    }
    $.ajax({
        type: "POST",
        url: otpUrl,
        dataType: "json",
        contentType: 'application/json',
        beforeSend: function (xhr) {
            xhr.setRequestHeader("x-api-key", "lGQ4ILBkogarD246r837644XwLZksx9z3XXktLdh");
        },
        data: JSON.stringify(data),
        success: function (resp) {
            if (resp.result == "success") {
                console.log("Request is re sent for the GST otp success");
            } else if (resp.result == "failure" && resp.errorCode == "ER001") {
                clearTimeout(3);
                var message = resp.errorMessage;
                //console.log(message);
                swal("unable to re-send the otp", message, "error")
                    .then(() => {
                        return location.reload();
                    });
            }
        },
        error: function (xhr, status, error) {
            //console.log("Error: ");
            var status = xhr.status;
            swal("Error", "Page not found", "error")
                .then(() => {
                    return location.reload();
                });
        }

    });


}
//submit gst otp request
function submitGstOtpRequest(myGstOtp) {
    var gstOtpUrl = "https://s03wy0krk4.execute-api.ap-south-1.amazonaws.com/dev?service=gstOTPSubmit";
    var data = {
        'userId': userId,
        "otp": myGstOtp
    }
    $.ajax({
        type: "POST",
        url: gstOtpUrl,
        dataType: "json",
        data: JSON.stringify(data),
        beforeSend: function (xhr) {
            xhr.setRequestHeader("x-api-key", "lGQ4ILBkogarD246r837644XwLZksx9z3XXktLdh");
        },
        success: function (resp) {
            if (resp.result == "success") {
                //console.log("correct otp");
                swal("Success", "Response has been submitted", "success")
                    .then(() => {
                        return location.reload();
                    });

                //$("#otpcontent").load("creditConsent.html");
            } else if (resp.result == "failure" && resp.errorCode == "ER001") {
                var message = resp.errorMessage;
                clearInterval(countdown);
                swal("error", message, "error")
                    .then(() => {
                        return location.reload();
                    });

            } else if (resp.result == "failure" && resp.errorCode == "ER003") {
                var message = resp.errorMessage;
                clearInterval(countdown);
                swal("Sorry, the OTP session has been expired", message, "error")
                    .then(() => {
                        return location.reload();
                    });

            } else if (resp.result == "failure" && resp.errorCode == "ER004") {
                var message = resp.errorMessage;
                //clearInterval(countdown);
                swal("You have enterd a wrong OTP", message, "error")
                    .then(() => {
                        //return location.reload();
                    });

            }
        },
        error: function (xhr, status, error) {
            //console.log("Error: ");
            var status = xhr.status;
            swal("Error", "Page not found", "error")
                .then(() => {
                    return location.reload();
                });
        }
    });

}