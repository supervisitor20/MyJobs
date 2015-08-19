import json

from os import path

from django.conf import settings


def get_state_map():
    with open(path.join(settings.PROJ_ROOT, 'jsondata/usa_regions.json')) as states:
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

states_with_sites = [
    {"state": "Alabama",        "url": "alabama.jobs"},
    {"state": "Alaska",         "url": "alaska.jobs"},
    {"state": "Arizona",        "url": "arizona.jobs"},
    {"state": "Arkansas",       "url": "arkansas.jobs"},
    {"state": "California",     "url": "california.jobs"},
    {"state": "Colorado",       "url": "colorado.jobs"},
    {"state": "Connecticut",    "url": "connecticut.jobs"},
    {"state": "Delaware",       "url": "delaware.jobs"},
    {"state": "Florida",        "url": "florida.jobs"},
    {"state": "Georgia",        "url": "georgia.jobs"},
    {"state": "Hawaii",         "url": "hawaii.jobs"},
    {"state": "Idaho",          "url": "idaho.jobs"},
    {"state": "Illinois",       "url": "illinois.jobs"},
    {"state": "Indiana",        "url": "indiana.jobs"},
    {"state": "Iowa",           "url": "iowa.jobs"},
    {"state": "Kansas",         "url": "kansas.jobs"},
    {"state": "Kentucky",       "url": "kentucky.jobs"},
    {"state": "Louisiana",      "url": "louisiana.jobs"},
    {"state": "Maine",          "url": "maine.jobs"},
    {"state": "Maryland",       "url": "maryland.jobs"},
    {"state": "Massachusetts",  "url": "massachusetts.jobs"},
    {"state": "Michigan",       "url": "michigan.jobs"},
    {"state": "Minnesota",      "url": "minnesota.jobs"},
    {"state": "Mississippi",    "url": "mississippi.jobs"},
    {"state": "Missouri",       "url": "missouri.jobs"},
    {"state": "Montana",        "url": "montana.jobs"},
    {"state": "Nebraska",       "url": "nebraska.jobs"},
    {"state": "Nevada",         "url": "nevada.jobs"},
    {"state": "New Hampshire",  "url": "newhampshire.jobs"},
    {"state": "New Jersey",     "url": "newjersey.jobs"},
    {"state": "New Mexico",     "url": "newmexico.jobs"},
    {"state": "New York",       "url": "newyork.jobs"},
    {"state": "North Carolina", "url": "northcarolina.jobs"},
    {"state": "North Dakota",   "url": "northdakota.jobs"},
    {"state": "Ohio",           "url": "ohio.jobs"},
    {"state": "Oklahoma",       "url": "oklahoma.jobs"},
    {"state": "Oregon",         "url": "oregon.jobs"},
    {"state": "Pennsylvania",   "url": "pennsylvania.jobs"},
    {"state": "Rhode Island",   "url": "rhodeisland.jobs"},
    {"state": "South Carolina", "url": "southcarolina.jobs"},
    {"state": "South Dakota",   "url": "southdakota.jobs"},
    {"state": "Tennessee",      "url": "tennessee.jobs"},
    {"state": "Texas",          "url": "texas.jobs"},
    {"state": "Utah",           "url": "utah.jobs"},
    {"state": "Vermont",        "url": "vermont.jobs"},
    {"state": "Virginia",       "url": "virginia.jobs"},
    {"state": "Washington",     "url": "washington.jobs"},
    {"state": "West Virginia",  "url": "westvirginia.jobs"},
    {"state": "Wisconsin",      "url": "wisconsin.jobs"},
    {"state": "Wyoming",        "url": "wyoming.jobs"}
]

other_locations_with_sites = [
    {"state": "District Of Columbia",   "url": "districtofcolumbia.jobs"},
    {"state": "Guam",                   "url": "guam.jobs"},
    {"state": "Puerto Rico",            "url": "puertorico.jobs"}
]
