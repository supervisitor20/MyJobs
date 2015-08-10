import json

from os import path
from bidict import bidict


def get_state_map():
    with open(path.join(path.dirname(__file__), 'jsondata/usa_regions.json')) as states:
        data_list = json.loads(states.read())['regions']
    state_map = dict([(x['name'], x['code']) for x in data_list])
    state_map['None'] = 'None'
    return state_map


# A dict that maps state names and their abbreviations to valid synonyms. For
# example, synonyms['IN'] and synonyms['Indiana'] both return ['IN',
# 'Indiana'].
synonyms = dict(
    [(key.lower(), [key, value]) for key, value in get_state_map().items()] +
    [(value.lower(), [key, value]) for key, value in get_state_map().items()])

states_with_sites = bidict({
    "Alabama": "alabama.jobs",
    "Alaska": "alaska.jobs",
    "Arizona": "arizona.jobs",
    "Arkansas": "arkansas.jobs",
    "California": "www.california.jobs",
    "Colorado": "colorado.jobs",
    "Connecticut": "connecticut.jobs",
    "Delaware": "delaware.jobs",
    "Florida": "florida.jobs",
    "Georgia": "georgia.jobs",
    "Hawaii": "hawaii.jobs",
    "Idaho": "idaho.jobs",
    "Illinois": "illinois.jobs",
    "Indiana": "indiana.jobs",
    "Iowa": "iowa.jobs",
    "Kansas": "kansas.jobs",
    "Louisiana": "louisiana.jobs",
    "Maine": "maine.jobs",
    "Maryland": "maryland.jobs",
    "Massachusetts": "massachusetts.jobs",
    "Michigan": "michigan.jobs",
    "Minnesota": "minnesota.jobs",
    "Mississippi": "mississippi.jobs",
    "Missouri": "missouri.jobs",
    "Montana": "montana.jobs",
    "Nebraska": "nebraska.jobs",
    "Nevada": "nevada.jobs",
    "New Hampshire": "newhampshire.jobs",
    "New Jersey": "newjersey.jobs",
    "New Mexico": "newmexico.jobs",
    "New York": "newyork.jobs",
    "North Carolina": "northcarolina.jobs",
    "North Dakota": "northdakota.jobs",
    "Ohio": "ohio.jobs",
    "Oklahoma": "oklahoma.jobs",
    "Oregon": "oregon.jobs",
    "Pennsylvania": "pennsylvania.jobs",
    "Rhode Island": "rhodeisland.jobs",
    "South Carolina": "southcarolina.jobs",
    "South Dakota": "southdakota.jobs",
    "Tennessee": "tennessee.jobs",
    "Texas": "texas.jobs",
    "Utah": "utah.jobs",
    "Vermont": "vermont.jobs",
    "Virginia": "virginia.jobs",
    "Washington": "washington.jobs",
    "West Virginia": "westvirginia.jobs",
    "Wisconsin": "wisconsin.jobs",
    "Wyoming": "wyoming.jobs"
})

other_locations_with_sites = bidict({
    "District of Columbia": "districtofcolumbia.jobs",
    "Guam": "guam.jobs",
    "Puerto Rico": "puertorico.jobs",
    "Virgin Islands": "usvirginislands.jobs"
})
