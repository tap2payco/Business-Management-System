
The Beem OTP API has been developed to provide a simpler way for developers and enterprises to verify customer mobile numbers using one time pins without understanding the underlying channel for sending pins. This REST based API currently supports sending and verifying one time passwords/pins (OTP) requests. The SMS channel is supported at the moment but alternative channels will be added in the future.

Obtaining & Managing Your SMS Credentials
Create a free account on https://login.beem.africa.

On completing your registration you will get a confirmation email. Click on the link or paste the link into your browser to validate the account.

Log into your account with your username & password on https://login.beem.africa.

Under Applications menu, create your application and choose the channel through which you want to receive the OTP.

The channels available are 'Multi country SMS' and 'Tanzania SMS API'. By default the Tanzania SMS API is active, to change this, visit the 'Profile' tab and click on ‘International Transactional Information, add the username and password.

For using the OTP API, visit OTP menu and click on 'API Setup'.

Click generate API Key and Secret to obtain these. Note that the Secret is only displayed once, so please store this safely.

You can visit your 'API Setup' menu again at any time to disable this API Key and regenerate a new API Key and Secret.

OTP Process Flow
alt text
Overall Logic
User enters the Phone number into the application.

Application sends the user’s phone number to Beem.

Phone number is validated.

If phone number is valid, Beem generates the PIN and PIN ID, and sends the PIN ID back to the application (Response)

Beem generates the PIN and sends it via SMS/other channel(email/ussd)

MNO delivers the SMS with the PIN code

Beem receives the Delivery report for sent message

User enters the received PIN code into the application

Application sends the verification request with the PIN and PIN ID

Beem verifies the received PIN and sends the response to the application.

REQUESTING FOR PIN
post
https://apiotp.beem.africa/v1/request
headers
Field	Type	Description
api_key	string	
Basic Authentication Username

secret_key	string	
Basic Authentication Password

Content-Type	string	
application/json (JSON REQUEST)
application/xml (XML REQUEST)

body
Field	Type	Description
appId	string	
Application ID

msisdn	number	
Mobile number in valid international number format with country code. No leading + sign. Example 255784825785

SAMPLE DATA
post
https://apiotp.beem.africa/v1/request
JSON SAMPLE
{
    "appId": 1,
    "msisdn": "255700001800"
}
SAMPLE SCRIPT
post
https://apiotp.beem.africa/v1/request
NODE-JS
PHP
GitHub
const axios = require("axios");
const https = require("https");
const btoa = require("btoa");

const content_type = "application/json";
const api_key = "<api_key>";
const secret_key = "<secret_key>";

function pin_request() {
  axios
    .post(
      "https://apiotp.beem.africa/v1/request",
      {
        appId: 1,
        msisdn: "255701000000",
      },
      {
        headers: {
          "Content-Type": content_type,
          Authorization: "Basic " + btoa(api_key + ":" + secret_key),
        },
        httpsAgent: new https.Agent({
          rejectUnauthorized: false,
        }),
      }
    )
    .then((response) => console.log("success", response.data))
    .catch((error) => console.error(error));
}

pin_request();
SAMPLE RESPONSE
post
https://apiotp.beem.africa/v1/request
Success Response
Error Response
HTTP/1.1 200 Ok
{
   "data": {
       "pinId": "cdb29912-c874-4d8b-9f02-88b904ae4eeb",
       "message": {
           "code": 100,
           "message": "SMS sent successfully"
       }
   }
 }
VERIFICATION OF PIN
post
https://apiotp.beem.africa/v1/verify
headers
Field	Type	Description
api_key	string	
Basic Authentication Username

secret_key	string	
Basic Authentication Password

Content-Type	string	
application/json (JSON REQUEST)
application/xml (XML REQUEST)

body
Field	Type	Description
pinId	string	
Pin ID

pin	number	
OTP pin to verify

SAMPLE DATA
post
https://apiotp.beem.africa/v1/verify
JSON Sample
{
       pinId: "8fa81447-4a14-4c2f-925b-78be40047c63",
       pin: "241663",
}
SAMPLE SCRIPT
post
https://apiotp.beem.africa/v1/verify
NODE-JS
PHP
GitHub
const axios = require("axios");
const https = require("https");
const btoa = require("btoa");

const api_key = "<api_key>";
const secret_key = "<secret_key>";
const content_type = "application/json";

function pin_verify() {
  axios
    .post(
      "https://apiotp.beem.africa/v1/verify",
      {
        pinId: "8fa81447-4a14-4c2f-925b-78be40047c63",
        pin: "241663",
      },
      {
        headers: {
          "Content-Type": content_type,
          Authorization: "Basic " + btoa(api_key + ":" + secret_key),
        },
        httpsAgent: new https.Agent({
          rejectUnauthorized: false,
        }),
      }
    )
    .then((response) => console.log("success", response))
    .catch((error) => console.error(error));
}

pin_verify();
SAMPLE RESPONSE
post
https://apiotp.beem.africa/v1/verify
Success Response
Error Response
HTTP/1.1 200 Valid Pin
{
   "data": {
       "message": {
           "code": 117,
           "message": "Valid Pin"
       }
   }
}
ERROR CODES
Specific error codes may be displayed within parenthesis when send or receive operations fail. The most common of these error codes are specified below

post
https://apisms.beem.africa/v1/send
Error codes
Name	Description
100	SMS sent successfully
OTP Message has been submitted.
101	Failed to send SMS
Failed to send the OTP pin generated
102	Invalid phone number
Invalid msisdn
103	Phone number missing
Msisdn parameter is missing
104	Application Id missing
Application id parameter is missing
106	Application not found
Application is not found
107	Application is inactive
Application status is inactive
108	No channel found
Channel is not set for the application
109	Placeholder not found
Template definition does not contain a placeholder
110	Username or Password missing
Credentials for sending OTP sms are missing
111	Pin missing
Pin parameter is missing
112	pinId missing
pinId parameter is missing
113	pinId not found
pinId is inactive/incorrect
114	Incorrect Pin
Pin sent is not correct
115	Pin TimeOut
Pin sent is expired
116	Attempts Exceeded
Pin attempts have exceeded
117	Valid Pin
Pin is correct
118	Duplicate Pin
Pin is used again
