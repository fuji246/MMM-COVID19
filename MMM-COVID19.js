/* global Module */

/* Magic Mirror
 * Module: MMM-COVID19
 *
 * By Jose Forte
 * MIT Licensed.
 */

Module.register("MMM-COVID19", {
  countriesStats: {},
  usStats: {},
  cnStats: {},
  globalStats: { "total_cases": "", "total_deaths": "", "total_recovered": "" }, // beautify things at start
  defaults: {
    header: 'COVID-19',    
    countries: [ "Argentina", "Italy", "Spain", "Germany" ], // default list
    states: [ "California", "New York"],
    counties: [ "Santa Clara", "Fremont", "Alameda", "San Francisco", "Los Angeles" ],
    provinces: [ "湖北", "浙江" ],
    cities: [ "武汉", "荆州", "杭州" ],
    orderCountriesByName: false,
    lastUpdateInfo: false,
    worldStats: false,
    usStats: true,
    cnStats: true,
    delta: false,
    rapidapiKey : "", // X-RapidAPI-Key provided at https://rapidapi.com/astsiatsko/api/coronavirus-monitor
    headerRowClass: "small", // small, medium or big
    infoRowClass: "big", // small, medium or big
    updateInterval: 60 * 60 * 1000, // update interval in milliseconds
    fadeSpeed: 4000
  },

  getStyles: function() {
    return ["MMM-COVID19.css"]
  },

  getTranslations: function() {
    return {
      "en": "translations/en.json",
      "de": "translations/de.json",
      "es": "translations/es.json",
      "zh-cn": "translations/zh-cn.json"
    }
  },

  start: function() {
    this.getInfo()
    this.scheduleUpdate()
  },

  scheduleUpdate: function(delay) {
    var nextLoad = this.config.updateInterval
    if (typeof delay !== "undefined" && delay >= 0) {
      nextLoad = delay
    }
    var self = this
    setInterval(function() {
      self.getInfo()
    }, nextLoad)
  },

  getInfo: function () {
    this.sendSocketNotification('GET_BY_COUNTRY_STATS', this.config.rapidapiKey)

    if (this.config.worldStats) {
      this.sendSocketNotification('GET_GLOBAL_STATS', this.config.rapidapiKey)
    }

    if (this.config.usStats) {
      this.sendSocketNotification('GET_US_STATS', this.config.rapidapiKey)
    }

    if (this.config.cnStats) {
      this.sendSocketNotification('GET_CN_STATS', this.config.rapidapiKey)
    }
  },

  socketNotificationReceived: function(notification, payload) {
    Log.info('data ready: ' + notification)
    var self = this
    if (notification === "BYCOUNTRY_RESULT") {
      this.countriesStats = payload
      this.updateDom(self.config.fadeSpeed)
    }
    if (notification === "GLOBAL_RESULT") {
      this.globalStats = payload
      this.updateDom(self.config.fadeSpeed)
    }
    if (notification === "US_RESULT") {
      this.usStats = payload
      this.updateDom(self.config.fadeSpeed)
    }
    if (notification === "CN_RESULT") {
      this.cnStats = payload
      this.updateDom(self.config.fadeSpeed)
    }
  },

  getHeader: function() {
    return this.config.header
  },

  getDom: function() {
    var countriesList = this.config.countries
    var countiesList = this.config.counties
    var statesList = this.config.states
    var citiesList = this.config.cities
    var provincesList = this.config.provinces
    var countriesStats = this.countriesStats["countries_stat"]
    var globalStats = this.globalStats
    var usStats = this.usStats
    var cnStats = this.cnStats
    if (this.config.orderCountriesByName && countriesStats) countriesStats.sort(this.compareValues('country_name'))
    
    var wrapper = document.createElement("table")
    wrapper.className = this.config.tableClass || 'covid'

    // header row
    var headerRow = document.createElement("tr"),
        headerconfirmedCell = document.createElement("td"),
        headerNewConfirmedCell = document.createElement("td"),
        headerCountryNameCell = document.createElement("td"),
        headerrecoveredCell = document.createElement("td"),
        headerdeathsCell = document.createElement("td"),
        headerNewDeathsCell = document.createElement("td"),
        headeractiveCell = document.createElement("td")

    headerCountryNameCell.innerHTML = ''
    headerconfirmedCell.className = 'number confirmed ' + this.config.headerRowClass
    headerconfirmedCell.innerHTML = this.translate('Confirmed')
    headerNewConfirmedCell.className = 'number confirmed ' + this.config.headerRowClass
    headerNewConfirmedCell.innerHTML = this.translate('New Cases')
    headerdeathsCell.className = 'number deaths ' + this.config.headerRowClass
    headerdeathsCell.innerHTML = this.translate('Deaths')
    headerNewDeathsCell.className = 'number deaths ' + this.config.headerRowClass
    headerNewDeathsCell.innerHTML = this.translate('New Deaths')
    headerrecoveredCell.className = 'number recovered ' + this.config.headerRowClass
    headerrecoveredCell.innerHTML = this.translate('Recovered')
    headeractiveCell.className = 'number active ' + this.config.headerRowClass
    headeractiveCell.innerHTML = this.translate('Active')

    headerRow.appendChild(headerCountryNameCell)
    headerRow.appendChild(headerconfirmedCell)
    if (this.config.delta) {
      headerRow.appendChild(headerNewConfirmedCell)
    }
    headerRow.appendChild(headerdeathsCell)
    if (this.config.delta) {
      headerRow.appendChild(headerNewDeathsCell)
    }
    headerRow.appendChild(headerrecoveredCell)
    headerRow.appendChild(headeractiveCell)

    wrapper.appendChild(headerRow)

    // WorldWide row, activate it via config
    if (this.config.worldStats) {
      let worldRow = document.createElement("tr"),
          worldNameCell = document.createElement("td"),
          confirmedCell = document.createElement("td"),
          newCasesCell = document.createElement("td"),
          deathsCell = document.createElement("td"),
          newDeathsCell = document.createElement("td"),
          recoveredCell = document.createElement("td"),
          activeCell = document.createElement("td"),
          cases = globalStats["total_cases"],
          newCases = globalStats["new_cases"],
          deaths = globalStats["total_deaths"],
          newDeaths = globalStats["new_deaths"],
          totalRecovered = globalStats["total_recovered"],
          activeCases = '';

      worldNameCell.innerHTML = this.translate('Worldwide')
      worldNameCell.className = this.config.infoRowClass
      worldRow.className = 'world ' + this.config.infoRowClass
      confirmedCell.className = 'number confirmed ' + this.config.infoRowClass
      confirmedCell.innerHTML = cases
      newCasesCell.className = 'number confirmed ' + this.config.infoRowClass
      if (newCases) {
        newCasesCell.innerHTML = '+' + newCases
      }
      deathsCell.className = 'number deaths ' + this.config.infoRowClass
      deathsCell.innerHTML = deaths
      newDeathsCell.className = 'number deaths ' + this.config.infoRowClass
      if (newDeaths) {
        newDeathsCell.innerHTML = newDeaths
      }
      recoveredCell.className = 'number recovered ' + this.config.infoRowClass
      recoveredCell.innerHTML = totalRecovered
      activeCell.className = 'number active ' + this.config.infoRowClass
      activeCell.innerHTML = activeCases

      worldRow.appendChild(worldNameCell)
      worldRow.appendChild(confirmedCell)
      if (this.config.delta) {
        worldRow.appendChild(newCasesCell)
      }
      worldRow.appendChild(deathsCell)
      if (this.config.delta) {
        worldRow.appendChild(newDeathsCell)
      }
      worldRow.appendChild(recoveredCell)
      worldRow.appendChild(activeCell)
      
      wrapper.appendChild(worldRow)
    }
    // countries row, one per country listed at config => countries
    var countriesCnt = 0
    var totalCountriesCnt = 0
    if (countriesStats) {
      totalCountriesCnt = countriesStats.length
    }
    var foundCountriesCnt = 0
    var totalCountriesExpect = countriesList.length
    for (let key in countriesStats) {
      countriesCnt += 1
      let value = countriesStats[key]
      if (countriesList.indexOf(value["country_name"]) != -1) {
	foundCountriesCnt += 1
        let countryRow = document.createElement("tr"),
            countryNameCell = document.createElement("td"),
            confirmedCell = document.createElement("td"),
            newCasesCell = document.createElement("td"),
            deathsCell = document.createElement("td"),
            newDeathsCell = document.createElement("td"),
            recoveredCell = document.createElement("td"),
            activeCell = document.createElement("td"),
            countryName = value["country_name"],
            cases = value["cases"],
            deaths = value["deaths"],
            newCases = value["new_cases"],
            newDeaths = value["new_deaths"],
            totalRecovered = value["total_recovered"],
            activeCases = value["active_cases"];

        countryNameCell.innerHTML = countryName
        countryNameCell.className = this.config.infoRowClass
        confirmedCell.className = 'number confirmed ' + this.config.infoRowClass
        confirmedCell.innerHTML = cases
        newCasesCell.className = 'number confirmed ' + this.config.infoRowClass
        if (newCases) {
          newCasesCell.innerHTML = '+' + newCases
        }
        deathsCell.className = 'number deaths ' + this.config.infoRowClass
        deathsCell.innerHTML = deaths
        newDeathsCell.className = 'number deaths ' + this.config.infoRowClass
        if (newDeaths) {
          newDeathsCell.innerHTML = '+' + newDeaths
        }
        recoveredCell.className = 'number recovered ' + this.config.infoRowClass
        recoveredCell.innerHTML = totalRecovered
        activeCell.className = 'number active ' + this.config.infoRowClass
        activeCell.innerHTML = activeCases

        if (countriesCnt == totalCountriesCnt || foundCountriesCnt == totalCountriesExpect) {
          countryRow.className = 'world ' + this.config.infoRowClass
        }
        countryRow.appendChild(countryNameCell)
        countryRow.appendChild(confirmedCell)
        if (this.config.delta) {
          countryRow.appendChild(newCasesCell)
        }
        countryRow.appendChild(deathsCell)
        if (this.config.delta) {
          countryRow.appendChild(newDeathsCell)
        }
        countryRow.appendChild(recoveredCell)
        countryRow.appendChild(activeCell)
        
        wrapper.appendChild(countryRow)
      }
    }

    // US county row, active it via config
    if (this.config.usStats && "locations" in usStats) {
      let locations = usStats["locations"]
      Log.info('parsing US data, cnt = ' + locations.length + ", countiesListSize = " + countiesList.length);
      for (var idx = 0; idx < locations.length; ++idx) {
	let item = locations[idx]
	let countyName = item["county"]
	let stateName = item["province"]
        if (statesList.indexOf(stateName) == -1) {
          continue
	}
        if (countiesList.indexOf(countyName) != -1) {
          Log.info('parsing data of ' + countyName);
          let countyRow = document.createElement("tr"),
              countyNameCell = document.createElement("td"),
              confirmedCell = document.createElement("td"),
              newCasesCell = document.createElement("td"),
              deathsCell = document.createElement("td"),
              newDeathsCell = document.createElement("td"),
              recoveredCell = document.createElement("td"),
              activeCell = document.createElement("td"),
	      cases = item["latest"]["confirmed"]
	      deaths = item["latest"]["deaths"]
	      totalRecovered = item["latest"]["recovered"]
	      activeCases = cases - deaths - totalRecovered;

           countyRow.className = this.config.infoRowClass
	   countyNameCell.innerHTML = countyName
	   countyNameCell.className = this.config.infoRowClass
	   confirmedCell.innerHTML = cases
	   confirmedCell.className = 'number confirmed ' + this.config.infoRowClass
           newCasesCell.className = 'number confirmed ' + this.config.infoRowClass
           newCasesCell.innerHTML = '' // NA
           deathsCell.innerHTML = deaths
           deathsCell.className = 'number deaths ' + this.config.infoRowClass
           newDeathsCell.className = 'number deaths ' + this.config.infoRowClass
	   newDeathsCell.innerHTML = '' // NA
	   recoveredCell.innerHTML = totalRecovered
           recoveredCell.className = 'number recovered ' + this.config.infoRowClass
           activeCell.innerHTML = activeCases
           activeCell.className = 'number active ' + this.config.infoRowClass

	   countyRow.appendChild(countyNameCell)
	   countyRow.appendChild(confirmedCell)
	   if (this.config.delta) {
	     countyRow.appendChild(newCasesCell)
	   }
	   countyRow.appendChild(deathsCell)
	   if (this.config.delta) {
	     countyRow.appendChild(newDeathsCell)
	   }
	   countyRow.appendChild(recoveredCell)
	   countyRow.appendChild(activeCell)

	   wrapper.appendChild(countyRow)
        }
      }
    }

    // China city row, active it via config
    if (this.config.cnStats && "data" in cnStats) {
      let locations = cnStats["data"]["areaTree"]
      Log.info('parsing China data, cnt = ' + locations.length + ", provincesListSize = " + provincesList.length + ", citiesListSize = " + citiesList.length);
      for (var cidx = 0; cidx < locations.length; ++cidx) {
	let loc = locations[cidx ]
	let countryName = loc["name"]
	if (countryName != "中国") {
	  continue;
	}

	let subLocations = loc["children"]
	for (var subIdx = 0; subIdx < subLocations.length; ++subIdx) {
	  let provinceName = subLocations[subIdx]["name"]
          if (provincesList.indexOf(provinceName) == -1) {
            continue
	  }
	  let items = subLocations[subIdx]["children"]
	  for (var cityIdx = 0; cityIdx < items.length; ++cityIdx) {
	    let item = items[cityIdx]
	    let cityName = item["name"]
            if (citiesList.indexOf(cityName) != -1) {
              Log.info('parsing data of ' + cityName);
              let cityRow = document.createElement("tr"),
                  cityNameCell = document.createElement("td"),
                  confirmedCell = document.createElement("td"),
                  newCasesCell = document.createElement("td"),
                  deathsCell = document.createElement("td"),
                  newDeathsCell = document.createElement("td"),
                  recoveredCell = document.createElement("td"),
                  activeCell = document.createElement("td"),
                  cases = item["total"]["confirm"]
                  newCases = item["today"]["confirm"]
                  deaths = item["total"]["dead"]
                  newDeaths = item["today"]["dead"]
                  totalRecovered = item["total"]["heal"]
                  activeCases = cases - deaths - totalRecovered;

              cityRow.className = this.config.infoRowClass
              cityNameCell.innerHTML = cityName
              cityNameCell.className = this.config.infoRowClass
              confirmedCell.innerHTML = cases
              confirmedCell.className = 'number confirmed ' + this.config.infoRowClass
              newCasesCell.className = 'number confirmed ' + this.config.infoRowClass
              if (newCases > 0) {
                newCasesCell.innerHTML = '+' + newCases
              } else {
                newCasesCell.innerHTML = ''
              }
              deathsCell.innerHTML = deaths
              deathsCell.className = 'number deaths ' + this.config.infoRowClass
              newDeathsCell.className = 'number deaths ' + this.config.infoRowClass
              if (newDeaths > 0) {
                newDeathsCell.innerHTML = '+' + newDeaths
              } else {
                newDeathsCell.innerHTML = ''
              }
              recoveredCell.innerHTML = totalRecovered
              recoveredCell.className = 'number recovered ' + this.config.infoRowClass
              activeCell.innerHTML = activeCases
              activeCell.className = 'number active ' + this.config.infoRowClass

              cityRow.appendChild(cityNameCell)
              cityRow.appendChild(confirmedCell)
              if (this.config.delta) {
                cityRow.appendChild(newCasesCell)
              }
              cityRow.appendChild(deathsCell)
              if (this.config.delta) {
                cityRow.appendChild(newDeathsCell)
              }
              cityRow.appendChild(recoveredCell)
              cityRow.appendChild(activeCell)

              wrapper.appendChild(cityRow)
            }
	  }
	}
      }
    }

    if (this.config.lastUpdateInfo) {
      let statsDateRow = document.createElement("tr"),
          statsDateCell = document.createElement("td");

      statsDateCell.innerHTML = this.translate('statistic taken at ') + this.countriesStats['statistic_taken_at'] + ' (UTC)'
      statsDateCell.colSpan = "5";
      statsDateCell.className = 'last-update'

      statsDateRow.appendChild(statsDateCell)
      wrapper.appendChild(statsDateRow)
    }

    return wrapper
  },
  // sort according to some key and the order could be 'asc' or 'desc'
  compareValues: function(key, order = 'asc') {
    return function innerSort(a, b) {
      if (!a.hasOwnProperty(key) || !b.hasOwnProperty(key)) {
        // property doesn't exist on either object
        return 0
      }
  
      const varA = (typeof a[key] === 'string')
        ? a[key].toUpperCase() : a[key]
      const varB = (typeof b[key] === 'string')
        ? b[key].toUpperCase() : b[key]
  
      let comparison = 0
      if (varA > varB) {
        comparison = 1
      } else if (varA < varB) {
        comparison = -1
      }
      return (
        (order === 'desc') ? (comparison * -1) : comparison
      );
    }
  },  

})
