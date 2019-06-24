const FORM_ID = 'res';

const ACTION_ASSIGN_DRIVER = 1;
const ACTION_DRAG_DRIVER = 2;

const ICON_LOCATION = 'location.png';
const ICON_LOCATION_DRIVER = 'iconadr{id}.png';
const ICON_COMPANY = 'company.png';

const BTN_CLEAR_TEXT = 'ОЧИСТИТЬ';
const BTN_CLEAR_COLOR = '#ffffff';

const LOCATION_MARKERS = {};

/**
*  Initializer
*/
DG.then(initialize);

/**
*  Initializes the Map on a page with
*  the Placemarks
*/
function initialize() {
  var map = DG.map('map', {
    center: [55.7605324, 37.6197714],
    zoom: 9
  });

  initializeLocations(map);
  initializeDrivers(map);
  initializeCompanies(map);
}

/**
*  Initializes location points on map
*  @param {Map} map Reference to the map instance
*/
function initializeLocations(map) {
  locations.forEach(location => {
    var locationMarker = DG.marker([location.lat, location.lng], {
      title: location.companyname,
    });

    changeIcon(locationMarker, ICON_LOCATION);

    locationMarker
      .bindPopup(getLocationContent(location), {
        maxWidth: 400
      })
      .addTo(map);

    LOCATION_MARKERS[location.id] = locationMarker;
  });
}

/**
*  Initializes drivers points on map
*  @param {Map} map Reference to the map instance
*/
function initializeDrivers(map) {
  drivers.forEach(d => {
    var driverMarker = DG.marker([d.lat, d.lng], {
      draggable: true
    });

    changeIcon(driverMarker, d.iconDriver, [22, 30]);

    driverMarker
      .bindPopup(d.name)
      .on('dragend', function(e) {
        var lat = e.target._latlng.lat.toFixed(12);
        var lng = e.target._latlng.lng.toFixed(12);
        updateForm(ACTION_DRAG_DRIVER, null, d.id, lat, lng);
      })
      .addTo(map);
  });
}

/**
*  Initializes logistic companies points on map
*  @param {Map} map Reference to the map instance
*/
function initializeCompanies(map) {
  companies.forEach(c => {
    var hint = document.createElement('span');
    hint.innerHTML = c.description;

    var companyMarker = DG.marker([c.lat, c.lng]);

    changeIcon(companyMarker, ICON_COMPANY, [24, 24]);

    companyMarker
      .bindPopup(hint)
      .addTo(map);
  });
}

/**
*  Builds the content for the Marker popup.
*  The popup contains info about the location point and the list
*  of drivers may be assigned to the chosen location.
*  @param {Object} location The location object
*  @return {string} HTML Content for the popup
*/
function getLocationContent(location) {
  var content = document.createElement('div');
  content.classList.add('location-content');

  var address = document.createElement('div');
  address.innerHTML = location.description;

  var driversNode = document.createElement('table');

  var clearButton = buildDriverLineInTable(location, {
    id: -1,
    color: BTN_CLEAR_COLOR,
    name: BTN_CLEAR_TEXT,
    iconDriver: ICON_LOCATION
  });
  driversNode.appendChild(clearButton);

  drivers.forEach(driver => {
    var driverNode = buildDriverLineInTable(location, driver);
    driversNode.appendChild(driverNode);
  });

  content.appendChild(address);
  content.appendChild(driversNode);

  return content.outerHTML;
}

/**
*  Builds the line for the table with information about the given driver
*  @param {Object} location The location object. Need to construct the function call
*  @param {Object} driver The driver object.
*  @return {HTMLTableRowElement} Row element for a table DOM object
*/
function buildDriverLineInTable(location, driver) {
  var driverNode = document.createElement('tr');
  driverNode.setAttribute('onclick', `changeDriver(locations[${location.id}], drivers[${driver.id}])`);

  var driverColor = document.createElement('td');
  driverColor.setAttribute('width', '5%');
  driverColor.setAttribute('bgcolor', driver.color);
  driverNode.appendChild(driverColor);

  var driverButton = document.createElement('td');
  driverButton.appendChild(document.createTextNode(driver.name));
  driverButton.classList.add('driver-name');
  driverNode.appendChild(driverButton);

  return driverNode;
}

/**
*  Changes the driver appointed to location.
*  @param {Object} location Reference to the location
*  @param {Object} driver Reference to the driver that is to appoint to the location
*/
function changeDriver(location, driver) {
  var marker = LOCATION_MARKERS[location.id];
  var newIcon = (driver == undefined) ? ICON_LOCATION : ICON_LOCATION_DRIVER.replace('{id}', driver.id);
  var driverId = (driver == undefined) ? -1 : driver.id;

  changeIcon(marker, newIcon, [12, 20]);
  updateForm(ACTION_ASSIGN_DRIVER, location.id, driverId, null, null);
}

/**
*  Changes the icon of Marker object and closes the popup
*  @param {Marker} marker Reference to the marker
*  @param {string} icon The icon file name located in 'imgs' folder
*  @param {Array} size The size of the icon in format of array [width, height]. if not provided, the default value is used [32, 32]
*/
function changeIcon(marker, icon, size) {
  var icon = DG.icon({
    iconSize: size === undefined ? [32, 32] : size,
    iconUrl: `imgs/${icon}`
  });

  marker.setIcon(icon);
  marker.closePopup();
}

/**
*  Updates the html form that is being listened by external module
*  @param {number} actionId Identifier of an action type. Required
*  @param {number} addressId Identifier of the address. Optional. Null on drag driver icon event
*  @param {number} driverId Identifier of the driver. Required. The value of -1 assigned when location is cleared of driver
*  @param {number} lat Latitude of the driver position. Optional. Null on driver assign event
*  @param {number} Lng Longitude of the driver position. Optional. Null on driver assign event
*/
function updateForm(actionId, addressId, driverId, lat, lng) {
  var form = document.forms[FORM_ID];

  form.curdata1.value = addressId;
  form.curdata2.value = driverId;
  form.lat.value = lat;
  form.lng.value = lng;
  form.curaction.value = actionId;

  console.log(form);
}
