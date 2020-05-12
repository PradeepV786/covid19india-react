import MapChart from './statelist';

import axios from 'axios';
import React, {useState} from 'react';
import * as Icon from 'react-feather';

const TrackerTable = (props) => {
  const [currentLocation, setCurrentLocation] = useState(null);
  const [currentAddress, setCurrentAddress] = useState(null);

  const getLocation = () => {
    navigator.geolocation.getCurrentPosition((position) => {
      setCurrentLocation([position.coords.latitude, position.coords.longitude]);
      getCurrentAddress(position.coords.latitude, position.coords.longitude);
    });
  };

  const getCurrentAddress = (lat, lng) => {
    try {
      axios
        .get(
          'https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=' +
            lat +
            '&longitude=' +
            lng +
            '&localityLanguage=en'
        )
        .then((response) => {
          setCurrentAddress(response.data.locality);
        });
    } catch (err) {
      console.log(err);
      setCurrentAddress('Error fetching name of your location');
    }
  };

  return (
    <div className="EssentialsNearby">
      <img
        src="/essentials_1.svg"
        className="fadeInUp"
        style={{animationDelay: '0.3s'}}
      />
      <img
        src="/essentials_2.svg"
        className="fadeInUp"
        style={{position: 'absolute', animationDelay: '0.1s'}}
      />

      {!currentLocation && (
        <button
          className="button fadeInUp"
          style={{animationDelay: '0.6s'}}
          onClick={() => getLocation()}
        >
          View essentials nearby offering special assistance
        </button>
      )}

      <div className="address fadeInUp" style={{animationDelay: '0.6s'}}>
        <h3>{currentAddress}</h3>
        {currentAddress && (
          <Icon.XCircle
            size={16}
            onClick={() => {
              setCurrentLocation(null);
              setCurrentAddress(null);
            }}
          />
        )}
      </div>

      <div className="Search">
        {currentAddress && <MapChart userLocation={currentLocation} />}
      </div>
    </div>
  );
};
export default TrackerTable;
