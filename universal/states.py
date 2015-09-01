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
    {"location": "Alabama", "url": "alabama.jobs"},
    {"location": "Alaska", "url": "alaska.jobs"},
    {"location": "Arizona", "url": "arizona.jobs"},
    {"location": "Arkansas", "url": "arkansas.jobs"},
    {"location": "California", "url": "california.jobs"},
    {"location": "Colorado", "url": "colorado.jobs"},
    {"location": "Connecticut", "url": "connecticut.jobs"},
    {"location": "Delaware", "url": "delaware.jobs"},
    {"location": "District Of Columbia", "url": "districtofcolumbia.jobs"},
    {"location": "Florida", "url": "florida.jobs"},
    {"location": "Georgia", "url": "georgia.jobs"},
    {"location": "Guam", "url": "guam.jobs"},
    {"location": "Hawaii", "url": "hawaii.jobs"},
    {"location": "Idaho", "url": "idaho.jobs"},
    {"location": "Illinois", "url": "illinois.jobs"},
    {"location": "Indiana", "url": "indiana.jobs"},
    {"location": "Iowa", "url": "iowa.jobs"},
    {"location": "Kansas", "url": "kansas.jobs"},
    {"location": "Kentucky", "url": "kentucky.jobs"},
    {"location": "Louisiana", "url": "louisiana.jobs"},
    {"location": "Maine", "url": "maine.jobs"},
    {"location": "Maryland", "url": "maryland.jobs"},
    {"location": "Massachusetts", "url": "massachusetts.jobs"},
    {"location": "Michigan", "url": "michigan.jobs"},
    {"location": "Minnesota", "url": "minnesota.jobs"},
    {"location": "Mississippi", "url": "mississippi.jobs"},
    {"location": "Missouri", "url": "missouri.jobs"},
    {"location": "Montana", "url": "montana.jobs"},
    {"location": "Nebraska", "url": "nebraska.jobs"},
    {"location": "Nevada", "url": "nevada.jobs"},
    {"location": "New Hampshire", "url": "newhampshire.jobs"},
    {"location": "New Jersey", "url": "newjersey.jobs"},
    {"location": "New Mexico", "url": "newmexico.jobs"},
    {"location": "New York", "url": "newyork.jobs"},
    {"location": "North Carolina", "url": "northcarolina.jobs"},
    {"location": "North Dakota", "url": "northdakota.jobs"},
    {"location": "Ohio", "url": "ohio.jobs"},
    {"location": "Oklahoma", "url": "oklahoma.jobs"},
    {"location": "Oregon", "url": "oregon.jobs"},
    {"location": "Pennsylvania", "url": "pennsylvania.jobs"},
    {"location": "Puerto Rico", "url": "puertorico.jobs"},
    {"location": "Rhode Island", "url": "rhodeisland.jobs"},
    {"location": "South Carolina", "url": "southcarolina.jobs"},
    {"location": "South Dakota", "url": "southdakota.jobs"},
    {"location": "Tennessee", "url": "tennessee.jobs"},
    {"location": "Texas", "url": "texas.jobs"},
    {"location": "Utah", "url": "utah.jobs"},
    {"location": "Vermont", "url": "vermont.jobs"},
    {"location": "Virginia", "url": "virginia.jobs"},
    {"location": "Washington", "url": "washington.jobs"},
    {"location": "West Virginia", "url": "westvirginia.jobs"},
    {"location": "Wisconsin", "url": "wisconsin.jobs"},
    {"location": "Wyoming", "url": "wyoming.jobs"}
]
