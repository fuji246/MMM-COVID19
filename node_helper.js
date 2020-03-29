/* global module */

/* Magic Mirror
 * Node Helper: MMM-COVID19
 *
 * By Jose Forte
 * MIT Licensed.
 */

var NodeHelper = require('node_helper')
var request = require('request')

var byCountryUrl = 'https://coronavirus-monitor.p.rapidapi.com/coronavirus/cases_by_country.php'
var worldStatsUrl = 'https://coronavirus-monitor.p.rapidapi.com/coronavirus/worldstat.php'
var usStatsUrl = 'https://coronavirus-tracker-api.herokuapp.com/v2/locations?source=csbs&country_code=US&timelines=false'
var cnStatsUrl = 'https://c.m.163.com/ug/api/wuhan/app/data/list-total'

module.exports = NodeHelper.create({
  start: function () {
    console.log('Starting node helper for: ' + this.name)
  },
  getGlobalStats: function(key) {
    var self = this
    var options = {
      method: 'GET',
      url: worldStatsUrl,
      headers: {
        'x-rapidapi-host': 'coronavirus-monitor.p.rapidapi.com',
        'x-rapidapi-key': key
      }
    }
    request(options, function (error, response, body) {
      if (!error && response.statusCode == 200) {
        var result = JSON.parse(body)
        self.sendSocketNotification('GLOBAL_RESULT', result)
      }
    })
  },
  getStatsByCoutry: function(key) {
    var self = this
    var options = {
      method: 'GET',
      url: byCountryUrl,
      headers: {
        'x-rapidapi-host': 'coronavirus-monitor.p.rapidapi.com',
        'x-rapidapi-key': key
      }
    }
    request(options, function (error, response, body) {
      if (!error && response.statusCode == 200) {
        var result = JSON.parse(body)
        self.sendSocketNotification('BYCOUNTRY_RESULT', result)
      }
    })
  },
  getUSStats: function(key) {
    var self = this
    var options = {
      method: 'GET',
      url: usStatsUrl
    }
    request(options, function (error, response, body) {
      console.log('getUSStats statusCode ' + response.statusCode);
      if (!error && response.statusCode == 200) {
        var result = JSON.parse(body)
	console.log('US_RESULT sent')
        self.sendSocketNotification('US_RESULT', result)
      }
    })
  },
  getCNStats: function(key) {
    var self = this
    var options = {
      method: 'GET',
      url: cnStatsUrl
    }
    request(options, function (error, response, body) {
      console.log('getCNStats statusCode ' + response.statusCode);
      if (!error && response.statusCode == 200) {
        var result = JSON.parse(body)
	console.log('CN_RESULT sent')
        self.sendSocketNotification('CN_RESULT', result)
      }
    })
  },
  //Subclass socketNotificationReceived received.
  socketNotificationReceived: function(notification, payload) {
    console.log("socketNotificationReceived: " + notification)
    if (notification === 'GET_BY_COUNTRY_STATS') {
      this.getStatsByCoutry(payload)
    }
    if (notification === 'GET_GLOBAL_STATS') {
      this.getGlobalStats(payload)
    }
    if (notification === 'GET_US_STATS') {
      this.getUSStats(payload)
    }
    if (notification === 'GET_CN_STATS') {
      this.getCNStats(payload)
    }
  }
  
});
