Tanda = {};

var querystring = Npm.require('querystring');

OAuth.registerService('tanda', 2, null, function(query) {

  var response = getTokenResponse(query);
  var accessToken = response.accessToken;

  // include most fields from tanda
  // https://my.tanda.co/api/v2/documentation#users-user-get
  var identity = getIdentity(accessToken);

  var userData = getUserData(accessToken, identity.id);

  var serviceData = {
    accessToken: accessToken,
    expiresAt: (+new Date) + (1000 * response.expiresIn),
    refreshToken: response.refreshToken,
    id: identity.id,
    email: userData.email
  };

  return {
    serviceData: serviceData,
    options: {profile: {
      name: identity.name,
      photo: userData.photo,
      phone: userData.phone
    }}
  };
});

// checks whether a string parses as JSON
var isJSON = function (str) {
  try {
    JSON.parse(str);
    return true;
  } catch (e) {
    return false;
  }
};

// returns an object containing:
// - accessToken
// - expiresIn: lifetime of token in seconds
// - refreshToken: token used to refresh the login
var getTokenResponse = function (query) {
  var config = ServiceConfiguration.configurations.findOne({service: 'tanda'});
  if (!config)
    throw new ServiceConfiguration.ConfigError();

  var responseContent;
  try {
    // Request an access token
    responseContent = HTTP.post(
      'https://my.tanda.co/api/oauth/token', {
        headers: {
          'Cache-Control': 'no-cache'
        },
        params: {
          client_id: config.appId,
          client_secret: OAuth.openSecret(config.secret),
          code: query.code,
          redirect_uri: OAuth._redirectUri('tanda', config),
          grant_type: 'authorization_code'
        }
      }).content;
  } catch (err) {
    throw _.extend(new Error("Failed to complete OAuth handshake with Tanda." + err.message),
                   {response: err.response});
  }

  // Check if its already a JSON Object
  // If not, parse the response
  var parsedResponse;
  if (isJSON(responseContent)) {
    parsedResponse = JSON.parse(responseContent);
  } else {
    parsedResponse = querystring.parse(responseContent);
  }

  // Extract the tanda access token and expiration
  // time from the response
  var tandaAccessToken = parsedResponse.access_token;
  var tandaExpires = parsedResponse.expires_in;
  var tandaRefreshToken = parsedResponse.refresh_token;

  if (!tandaAccessToken) {
    throw new Error("Failed to complete OAuth handshake with tanda " +
                    "-- can't find access token in HTTP response. " + responseContent);
  }
  return {
    accessToken: tandaAccessToken,
    expiresIn: tandaExpires,
    refreshToken: tandaRefreshToken
  };
};

var getIdentity = function (accessToken, fields) {
  try {
    return HTTP.get('https://my.tanda.co/api/v2/users/me', {
      headers: {
        Authorization: 'bearer ' + accessToken
      }
    }).data;
  } catch (err) {
    throw _.extend(new Error("Failed to fetch identity from Tanda. " + err.message),
                   {response: err.response});
  }
};

var getUserData = function (accessToken, id) {
  try {
    return HTTP.get('https://my.tanda.co/api/v2/users/' + id, {
      headers: {
        Authorization: 'bearer ' + accessToken
      }
    }).data;
  } catch (err) {
    throw _.extend(new Error('Failed to fetch identity from Tanda. ' + err.message),
                   {response: err.response});
  }
}

Tanda.retrieveCredential = function(credentialToken, credentialSecret) {
  return OAuth.retrieveCredential(credentialToken, credentialSecret);
};
