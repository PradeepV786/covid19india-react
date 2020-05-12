import {Label, LabelGroup, CounterLabel} from '@primer/components';
import axios from 'axios';
import L from 'leaflet';
import * as Knn from 'leaflet-knn';
import React, {useState, useEffect, useCallback} from 'react';
import 'leaflet/dist/leaflet.css';
import {ExternalLink, Phone} from 'react-feather';
import {useEffectOnce} from 'react-use';

function medFilter(feature) {
  return feature.properties.priority;
}

function othersFilter(feature) {
  return !feature.properties.priority;
}

export default function MapChart({userLocation}) {
  const [geoData, setGeoData] = useState([]);
  const [results, setResults] = useState();
  const [categories, setCategories] = useState([]);

  useEffectOnce(() => {
    getJSON();
  }, []);

  const getJSON = useCallback(() => {
    axios
      .get(
        'https://raw.githubusercontent.com/aswaathb/covid19india-react/80922c70bb451cda94cce1e809e54fa72754f05c/newResources/geoResources.json'
      )
      .then((response) => {
        setGeoData(response.data);
      })
      .catch((error) => {
        console.log(error);
      });
  }, []);

  useEffect(() => {
    let medKnn;
    let restKnn;

    const hK = 5; // K nearest hospitals/labs wrt user location
    const rK = 100; // K nearest essentials wrt user location
    const rad = 10 * 1000; // Max distance of the K points, in meters

    if (userLocation) {
      medKnn = new Knn(L.geoJSON(geoData, {filter: medFilter})).nearestLayer(
        [userLocation[1], userLocation[0]],
        hK
      );
      restKnn = new Knn(
        L.geoJSON(geoData, {filter: othersFilter})
      ).nearestLayer([userLocation[1], userLocation[0]], rK, rad);
    }

    const result = {
      name: 'NearestK-Essentials',
      type: 'FeatureCollection',
      features: [],
    };

    if (medKnn) {
      let i = 0;
      for (i = 0; i < medKnn.length; i++) {
        result.features.push({
          type: 'Feature',
          geometry: {
            type: 'Point',
            coordinates: medKnn[i].layer.feature.geometry.coordinates,
          },
          properties: {
            name: medKnn[i].layer.feature.properties.name,
            desc: medKnn[i].layer.feature.properties.desc,
            addr: medKnn[i].layer.feature.properties.addr,
            phone: medKnn[i].layer.feature.properties.phone,
            contact: medKnn[i].layer.feature.properties.contact,
            icon: medKnn[i].layer.feature.properties.icon,
            id: i + 1,
          },
        });
      }
    }

    if (restKnn) {
      let j = 0;
      for (j = 0; j < restKnn.length; j++) {
        result.features.push({
          type: 'Feature',
          geometry: {
            type: 'Point',
            coordinates: restKnn[j].layer.feature.geometry.coordinates,
          },
          properties: {
            name: restKnn[j].layer.feature.properties.name,
            desc: restKnn[j].layer.feature.properties.desc,
            addr: restKnn[j].layer.feature.properties.addr,
            phone: restKnn[j].layer.feature.properties.phone,
            contact: restKnn[j].layer.feature.properties.contact,
            icon: restKnn[j].layer.feature.properties.icon,
            id: j + 100,
          },
        });
      }
    }

    setResults(result);
  }, [geoData, userLocation]);

  useEffect(() => {
    if (results) {
      results.features
        .map(function (feature) {
          return feature?.properties?.icon;
        })
        .reduce((acc, e) => acc.set(e, (acc.get(e) || 0) + 1), new Map())
        .forEach((value, key, map) => {
          const category = (
            <Label variant="xl" key={key} className="label-item">
              {key} <CounterLabel className="counter">{value}</CounterLabel>
            </Label>
          );
          setCategories((categories) => [...categories, category]);
        });
    }
  }, [results]);

  return (
    <div className="results">
      <div className="labels">
        <LabelGroup>{categories}</LabelGroup>
      </div>

      {results?.features.map((d) => (
        <a
          key={d.properties.id}
          href={d.properties.contact}
          target="_noblank"
          className="essential-result"
        >
          <div className="result-top">
            <div className="result-top-left">
              <div className="result-name">{d.properties.name}</div>
              <div className="result-location">{d.properties.addr}</div>
            </div>
            <div className="result-category">
              {d.properties.icon}
              <ExternalLink />
            </div>
          </div>
          <div className="result-description">{d.properties.desc}</div>
          {d.properties.phone ? (
            <div className="result-contact">
              <Phone />
              <div>{d.properties.phone}</div>
            </div>
          ) : null}
        </a>
      ))}
    </div>
  );
}
