const admin = require('firebase-admin')
const { initializeApp } = require("firebase-admin/app");
const { getMessaging } = require("firebase-admin/messaging");
//const serviceAccount1 = require('@src/config/repeach-381318-ca8698d34aa0.json')

const serviceAccount = {}




//admin.initializeApp({
initializeApp({  
  credential: admin.credential.cert(serviceAccount)
})

module.exports = {
  // registrationTokens = 디바이스 토큰값
  // payload = 푸시 메시지값
  // options = 옵션 값
  //===========================================================================
  //  여러 기기에 메시지 전송
  //  호출당 최대 1000개 토큰
  //===========================================================================
  pushMessage: (registrationTokens, payload, options) => {
    admin.messaging().sendToDevice(registrationTokens, payload, options)
      .then((response) => {
      // Response is a message ID string.
        console.log('Successfully sent message:', response)
      })
      .catch((error) => {
        console.log('Error sending message:', error)
      })
      
  },

  send: (message) => {
    admin.messaging().send(message)
    .then((response) => {
        // Response is a message ID string.
        console.log('Successfully sent message:', response);
    })
    .catch((error) => {
        console.log('Error sending message:', error);
    });  
  },

  //===========================================================================
  //  https://stackoverflow.com/questions/69546231/how-to-correctly-specify-channel-id-in-fcm-using-cloud-functions
  //  여러 기기에 메시지 전송
  //  호출당 최대 500개 토큰
  //===========================================================================
  multiSend: async (message) => {
    const pushResults = [];
    await getMessaging().sendMulticast(message)
    .then((result) => {
        // Response is a message ID string.
        //console.log('Successfully sent message:', result);
        result.responses.forEach((res, index) => {
          if (res.success) {
            //  성공
            //console.log('Successfully sent message:', res);
            pushResults.push({index: index, status: true});
          } else {
            //  실폐
            //console.log('ERROR :', res.error.errorInfo);
            pushResults.push({
              index: index, 
              status: false, 
              code: res.error.errorInfo.code,
              message: res.error.errorInfo.message,
            })
          }
          
        });
    })
    .catch((error) => {
      console.log('Error sending message:', error);
    }); 
    
    console.log('<<<<<', pushResults);
    return pushResults;
  }



}