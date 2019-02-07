'use strict'

const firebase = require('../../services/firebase');

exports.getPlugins = function(req, res) {
  let containPlugins = [];
  let plugins = firebase.admin.firestore().collection('plugins')
  
  console.log('plugins init')

  plugins.get()
    .then(function(querySnapshot) {
      querySnapshot.docs.forEach(function(doc) {
        let plugin = doc.data()
        plugin.active && containPlugins.push({
          "name": plugin.name,
          "version": "0.0.1",
          "class": plugin.name,
          "requires": [
            {
              "@twilio/flex-ui": plugin.version
            }
          ],
          "src": `${plugin.url}`
        });
      });
    })
    .catch(function(err) {
      console.log(err)
    })

    setTimeout(() => {
      res.send(containPlugins).status(200)
    }, 2000)
}